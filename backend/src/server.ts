import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import helmet from 'helmet';
import path from 'node:path';
import { apiRouter } from './routes/api.js';

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || '*';
app.use(
  cors({
    origin: clientOrigin === '*' ? true : clientOrigin.split(','),
    credentials: true,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRouter);

const distPath = path.resolve(process.cwd(), '..', 'dist');
const hasWebBuild = fs.existsSync(path.join(distPath, 'index.html'));

if (hasWebBuild) {
  app.use(
    express.static(distPath, {
      etag: false,
      lastModified: false,
      maxAge: 0,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
      },
    })
  );
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({ ok: true, service: 'leia-biblia-365-backend' });
  });
}

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(
    `Server running on http://${host}:${port} | web=${hasWebBuild ? 'enabled' : 'disabled'}`
  );
});
