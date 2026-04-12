import { MembershipRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { signToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const apiRouter = Router();

function routeParam(req: any, key: string): string {
  const value = req.params?.[key];
  if (Array.isArray(value)) return value[0] ?? '';
  return typeof value === 'string' ? value : '';
}

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildResetLink(token: string) {
  const appUrl = process.env.APP_URL || process.env.CLIENT_ORIGIN?.split(',')[0] || 'http://localhost:8081';
  return `${appUrl.replace(/\/$/, '')}/(auth)/reset-password?token=${token}`;
}
function badRequest(res: any, error: unknown) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: error.issues[0]?.message ?? 'Dados inválidos' });
  }
  return res.status(400).json({ error: 'Dados inválidos' });
}

async function getMembershipRole(ministryId: string, userId: string) {
  const m = await prisma.ministryMember.findUnique({
    where: { ministryId_userId: { ministryId, userId } },
    select: { role: true },
  });
  return m?.role ?? null;
}

async function requireAdmin(ministryId: string, userId: string) {
  const role = await getMembershipRole(ministryId, userId);
  return role === MembershipRole.owner || role === MembershipRole.sub_admin;
}

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true });
});

apiRouter.post('/auth/signup', async (req, res) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    const email = body.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: { create: {} },
      },
      select: { id: true, email: true },
    });

    const token = signToken({ userId: user.id, email: user.email });
    return res.status(201).json({ token, user });
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const email = body.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = signToken({ userId: user.id, email: user.email });
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/auth/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    select: { id: true, email: true, profile: { select: { displayName: true } } },
  });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  return res.json(user);
});

apiRouter.post('/auth/password/request', async (req, res) => {
  try {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const email = body.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const link = buildResetLink(rawToken);
      console.log(`[password-reset] ${email}: ${link}`);

      if (process.env.NODE_ENV !== 'production') {
        return res.json({ ok: true, debugToken: rawToken, expiresAt: expiresAt.toISOString() });
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.post('/auth/password/reset', async (req, res) => {
  try {
    const body = z.object({ token: z.string().min(10), newPassword: z.string().min(6) }).parse(req.body);
    const tokenHash = hashResetToken(body.token);

    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true } } },
    });

    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    ]);

    return res.json({ ok: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/profile', requireAuth, async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { id: req.auth!.userId } });
  return res.json(profile ?? { id: req.auth!.userId, displayName: null });
});

apiRouter.put('/profile', requireAuth, async (req, res) => {
  try {
    const body = z.object({ displayName: z.string().trim().max(80).nullable() }).parse(req.body);
    const profile = await prisma.profile.upsert({
      where: { id: req.auth!.userId },
      create: { id: req.auth!.userId, displayName: body.displayName },
      update: { displayName: body.displayName },
    });
    return res.json(profile);
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/progress/bible', requireAuth, async (req, res) => {
  const rows = await prisma.bibleReadingProgress.findMany({
    where: { userId: req.auth!.userId },
    orderBy: { dayIndex: 'asc' },
    select: { dayIndex: true },
  });
  return res.json({ checkedDays: rows.map((r) => r.dayIndex) });
});

apiRouter.post('/progress/bible/toggle', requireAuth, async (req, res) => {
  try {
    const body = z.object({ day: z.number().int().min(1).max(365), done: z.boolean() }).parse(req.body);
    if (body.done) {
      await prisma.bibleReadingProgress.upsert({
        where: { userId_dayIndex: { userId: req.auth!.userId, dayIndex: body.day } },
        update: { completedAt: new Date() },
        create: { userId: req.auth!.userId, dayIndex: body.day },
      });
    } else {
      await prisma.bibleReadingProgress.deleteMany({ where: { userId: req.auth!.userId, dayIndex: body.day } });
    }
    return res.json({ ok: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/progress/rosary/:mode', requireAuth, async (req, res) => {
  const mode = routeParam(req, 'mode');
  const row = await prisma.rosaryProgress.findUnique({
    where: { userId_mode: { userId: req.auth!.userId, mode } },
  });
  return res.json({ checkedIds: (row?.payload as any)?.checkedIds ?? [] });
});

apiRouter.put('/progress/rosary/:mode', requireAuth, async (req, res) => {
  try {
    const body = z.object({ checkedIds: z.array(z.string()) }).parse(req.body);
    const mode = routeParam(req, 'mode');
    await prisma.rosaryProgress.upsert({
      where: { userId_mode: { userId: req.auth!.userId, mode } },
      update: { payload: { checkedIds: body.checkedIds }, updatedAt: new Date() },
      create: { userId: req.auth!.userId, mode, payload: { checkedIds: body.checkedIds } },
    });
    return res.json({ ok: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/ministries/my', requireAuth, async (req, res) => {
  const rows = await prisma.ministryMember.findMany({
    where: { userId: req.auth!.userId },
    include: { ministry: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(rows.map((r) => ({ role: r.role, ministry: r.ministry })));
});

apiRouter.post('/ministries', requireAuth, async (req, res) => {
  try {
    const body = z.object({ slug: z.string().min(2), name: z.string().min(2), description: z.string().optional() }).parse(req.body);
    const ministry = await prisma.ministry.create({
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description ?? '',
        createdBy: req.auth!.userId,
        members: { create: { userId: req.auth!.userId, role: MembershipRole.owner } },
      },
      select: { id: true },
    });
    return res.status(201).json(ministry);
  } catch (error: any) {
    if (String(error?.code) === 'P2002') return res.status(409).json({ error: 'Slug já existe' });
    return badRequest(res, error);
  }
});

apiRouter.get('/ministries/by-slug/:slug', async (req, res) => {
  const m = await prisma.ministry.findUnique({
    where: { slug: routeParam(req, 'slug') },
    select: { id: true, slug: true, name: true, description: true },
  });
  return res.json(m);
});

apiRouter.get('/ministries/:id', requireAuth, async (req, res) => {
  const m = await prisma.ministry.findUnique({
    where: { id: routeParam(req, 'id') },
    select: { id: true, slug: true, name: true, description: true },
  });
  return res.json(m);
});

apiRouter.delete('/ministries/:id', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (role !== MembershipRole.owner) {
    return res.status(403).json({ error: 'Apenas o dono pode excluir o ministério' });
  }

  try {
    await prisma.ministry.delete({ where: { id: ministryId } });
    return res.json({ ok: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/ministries/:id/membership', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const row = await prisma.ministryMember.findUnique({
    where: { ministryId_userId: { ministryId, userId: req.auth!.userId } },
    select: { role: true },
  });
  return res.json(row);
});

apiRouter.get('/ministries/:id/join-request', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const row = await prisma.ministryJoinRequest.findUnique({
    where: { ministryId_userId: { ministryId, userId: req.auth!.userId } },
    select: { id: true, status: true },
  });
  return res.json(row);
});

apiRouter.post('/ministries/:id/join-request', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  try {
    const reqRow = await prisma.ministryJoinRequest.upsert({
      where: { ministryId_userId: { ministryId, userId: req.auth!.userId } },
      update: { status: 'pending' },
      create: { ministryId, userId: req.auth!.userId, status: 'pending' },
      select: { id: true, status: true },
    });
    return res.status(201).json(reqRow);
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/ministries/:id/join-requests', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const isAdmin = await requireAdmin(ministryId, req.auth!.userId);
  if (!isAdmin) return res.status(403).json({ error: 'Sem permissão' });

  const rows = await prisma.ministryJoinRequest.findMany({
    where: { ministryId, status: 'pending' },
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(rows.map((r) => ({ id: r.id, userId: r.userId, displayName: r.user.profile?.displayName ?? null, email: r.user.email })));
});

apiRouter.post('/ministries/:id/join-requests/:requestId/approve', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const requestId = routeParam(req, 'requestId');
  const isAdmin = await requireAdmin(ministryId, req.auth!.userId);
  if (!isAdmin) return res.status(403).json({ error: 'Sem permissão' });

  const reqRow = await prisma.ministryJoinRequest.findUnique({ where: { id: requestId } });
  if (!reqRow || reqRow.ministryId !== ministryId) return res.status(404).json({ error: 'Pedido não encontrado' });

  await prisma.$transaction([
    prisma.ministryJoinRequest.update({ where: { id: requestId }, data: { status: 'approved' } }),
    prisma.ministryMember.upsert({
      where: { ministryId_userId: { ministryId, userId: reqRow.userId } },
      update: {},
      create: { ministryId, userId: reqRow.userId, role: MembershipRole.member },
    }),
  ]);

  return res.json({ ok: true });
});

apiRouter.post('/ministries/:id/join-requests/:requestId/reject', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const requestId = routeParam(req, 'requestId');
  const isAdmin = await requireAdmin(ministryId, req.auth!.userId);
  if (!isAdmin) return res.status(403).json({ error: 'Sem permissão' });

  await prisma.ministryJoinRequest.update({ where: { id: requestId }, data: { status: 'rejected' } });
  return res.json({ ok: true });
});

apiRouter.get('/ministries/:id/members', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (!role) return res.status(403).json({ error: 'Sem acesso' });

  const rows = await prisma.ministryMember.findMany({
    where: { ministryId },
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(rows.map((r) => ({ userId: r.userId, role: r.role, displayName: r.user.profile?.displayName ?? null, email: r.user.email })));
});

apiRouter.post('/ministries/:id/members/:userId/promote-sub-admin', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const userId = routeParam(req, 'userId');
  const isAdmin = await requireAdmin(ministryId, req.auth!.userId);
  if (!isAdmin) return res.status(403).json({ error: 'Sem permissão' });

  await prisma.ministryMember.update({
    where: { ministryId_userId: { ministryId, userId } },
    data: { role: MembershipRole.sub_admin },
  });

  return res.json({ ok: true });
});

apiRouter.get('/ministries/:id/posts', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (!role) return res.status(403).json({ error: 'Sem acesso' });

  const posts = await prisma.ministryPost.findMany({
    where: { ministryId },
    include: { author: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(posts.map((p) => ({
    id: p.id,
    ministryId: p.ministryId,
    authorId: p.authorId,
    authorName: p.author.profile?.displayName || p.author.email,
    content: p.content,
    parentId: p.parentId,
    createdAt: p.createdAt,
  })));
});

apiRouter.post('/ministries/:id/posts', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (!role) return res.status(403).json({ error: 'Sem acesso' });

  try {
    const body = z.object({ content: z.string().min(1), parentId: z.string().uuid().optional().nullable() }).parse(req.body);
    const post = await prisma.ministryPost.create({
      data: {
        ministryId,
        authorId: req.auth!.userId,
        content: body.content,
        parentId: body.parentId ?? null,
      },
      select: { id: true },
    });
    return res.status(201).json(post);
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.delete('/ministries/:id/posts/:postId', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const postId = routeParam(req, 'postId');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (!role) return res.status(403).json({ error: 'Sem acesso' });

  const post = await prisma.ministryPost.findUnique({ where: { id: postId } });
  if (!post || post.ministryId !== ministryId) {
    return res.status(404).json({ error: 'Post não encontrado' });
  }

  const isAdmin = role === MembershipRole.owner || role === MembershipRole.sub_admin;
  if (!isAdmin && post.authorId !== req.auth!.userId) {
    return res.status(403).json({ error: 'Sem permissão para excluir esta postagem' });
  }

  try {
    await prisma.ministryPost.delete({ where: { id: postId } });
    return res.json({ ok: true });
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/ministries/:id/events', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (!role) return res.status(403).json({ error: 'Sem acesso' });

  const events = await prisma.ministryEvent.findMany({
    where: { ministryId },
    orderBy: { startsAt: 'asc' },
  });
  return res.json(events);
});

apiRouter.post('/ministries/:id/events', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const isAdmin = await requireAdmin(ministryId, req.auth!.userId);
  if (!isAdmin) return res.status(403).json({ error: 'Sem permissão' });

  try {
    const body = z.object({ title: z.string().min(2), startsAt: z.string(), notes: z.string().optional() }).parse(req.body);
    const event = await prisma.ministryEvent.create({
      data: {
        ministryId,
        title: body.title,
        startsAt: new Date(body.startsAt),
        notes: body.notes ?? '',
        createdBy: req.auth!.userId,
      },
      select: { id: true },
    });
    return res.status(201).json(event);
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/ministries/:id/event-roles', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (!role) return res.status(403).json({ error: 'Sem acesso' });

  const rows = await prisma.ministryEventRole.findMany({
    where: { event: { ministryId } },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(rows);
});

apiRouter.post('/ministries/:id/event-roles', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const isAdmin = await requireAdmin(ministryId, req.auth!.userId);
  if (!isAdmin) return res.status(403).json({ error: 'Sem permissão' });

  try {
    const body = z.object({ eventId: z.string().uuid(), title: z.string().min(1), capacity: z.number().int().min(1).max(50) }).parse(req.body);

    const event = await prisma.ministryEvent.findUnique({ where: { id: body.eventId }, select: { ministryId: true } });
    if (!event || event.ministryId !== ministryId) return res.status(400).json({ error: 'Evento inválido' });

    const row = await prisma.ministryEventRole.create({
      data: { eventId: body.eventId, title: body.title, capacity: body.capacity },
      select: { id: true },
    });

    return res.status(201).json(row);
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.get('/ministries/:id/assignments', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (!role) return res.status(403).json({ error: 'Sem acesso' });

  const rows = await prisma.ministryEventAssignment.findMany({
    where: { role: { event: { ministryId } } },
    include: { role: true, user: { include: { profile: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return res.json(rows.map((r) => ({
    id: r.id,
    roleId: r.roleId,
    userId: r.userId,
    userName: r.user.profile?.displayName || r.user.email,
  })));
});

apiRouter.post('/ministries/:id/assignments', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const memberRole = await getMembershipRole(ministryId, req.auth!.userId);
  if (!memberRole) return res.status(403).json({ error: 'Sem acesso' });

  try {
    const body = z.object({ roleId: z.string().uuid() }).parse(req.body);

    const role = await prisma.ministryEventRole.findUnique({
      where: { id: body.roleId },
      include: { event: true, assignments: true },
    });
    if (!role || role.event.ministryId !== ministryId) return res.status(400).json({ error: 'Cargo inválido' });

    if (role.assignments.length >= role.capacity) return res.status(409).json({ error: 'Vaga já preenchida' });

    const mineInSameEvent = await prisma.ministryEventAssignment.findFirst({
      where: { userId: req.auth!.userId, role: { eventId: role.eventId } },
      select: { id: true },
    });
    if (mineInSameEvent) return res.status(409).json({ error: 'Você já está escalado neste evento' });

    const assignment = await prisma.ministryEventAssignment.create({
      data: { roleId: body.roleId, userId: req.auth!.userId },
      select: { id: true },
    });
    return res.status(201).json(assignment);
  } catch (error) {
    return badRequest(res, error);
  }
});

apiRouter.delete('/ministries/:id/assignments/:assignmentId', requireAuth, async (req, res) => {
  const ministryId = routeParam(req, 'id');
  const assignmentId = routeParam(req, 'assignmentId');
  const role = await getMembershipRole(ministryId, req.auth!.userId);
  if (!role) return res.status(403).json({ error: 'Sem acesso' });

  const assignment = await prisma.ministryEventAssignment.findUnique({
    where: { id: assignmentId },
    include: { role: { include: { event: true } } },
  });
  if (!assignment || assignment.role.event.ministryId !== ministryId) {
    return res.status(404).json({ error: 'Escala não encontrada' });
  }

  const isAdmin = role === MembershipRole.owner || role === MembershipRole.sub_admin;
  if (!isAdmin && assignment.userId !== req.auth!.userId) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  await prisma.ministryEventAssignment.delete({ where: { id: assignmentId } });
  return res.json({ ok: true });
});



