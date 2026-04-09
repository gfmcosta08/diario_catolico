import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'teste@agendacatolica.com';
  const password = 'teste123';
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hash,
      profile: { create: { displayName: 'Usuário Teste' } },
    },
  });

  console.log('Usuário de teste criado:', user.email);
  console.log('Email:    ', email);
  console.log('Senha:    ', password);
}

main().catch(console.error).finally(() => prisma.$disconnect());
