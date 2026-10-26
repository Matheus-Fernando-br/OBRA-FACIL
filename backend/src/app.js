import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { pinoHttp } from 'pino-http';
import { getEnv } from './config/env.js';
import logger from './config/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimits.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import obraRoutes from './routes/obras.js';
import orcamentoRoutes from './routes/orcamentos.js';
import produtoRoutes from './routes/produtos.js';
import { plansRouter, subscriptionRouter } from './routes/subscription.js';
import userRoutes from './routes/user.js';
import webhookRoutes from './routes/webhooks.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const VERSION = require('../package.json').version;

export function createApp() {
  const env = getEnv();
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // App nativo não envia Origin. No navegador: origens configuradas e o
  // Expo web local (localhost). A API usa token no cabeçalho, não cookie.
  const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || LOCALHOST.test(origin) || env.corsOrigins.includes(origin)),
      allowedHeaders: ['Authorization', 'Content-Type', 'X-Platform'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      maxAge: 600,
    }),
  );

  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/health' },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url.split('?')[0] }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    const db = mongoose.connection.readyState === 1;
    res.status(db ? 200 : 503).json({ status: db ? 'ok' : 'degradado', db, versao: VERSION });
  });

  app.get('/', (_req, res) => res.json({ servico: 'Obra Fácil API', versao: VERSION, status: 'ok' }));

  // Webhooks antes do limitador geral (têm limite próprio).
  app.use('/webhooks', webhookRoutes);

  // Painel administrativo: API + interface estática.
  app.use('/admin/api', adminRoutes);
  const chartJs = path.join(path.dirname(require.resolve('chart.js')), 'chart.umd.min.js');
  app.get('/admin/vendor/chart.umd.js', (_req, res) => res.sendFile(chartJs, { maxAge: '7d' }));
  app.use('/admin', express.static(path.join(here, '../public/admin'), { index: 'index.html', maxAge: '1h' }));

  // Página web de assinatura (Mercado Pago).
  app.use('/assinar', express.static(path.join(here, '../public/assinar'), { index: 'index.html', extensions: ['html'], maxAge: '1h' }));

  app.use(apiLimiter);
  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);
  app.use('/client', clientRoutes);
  app.use('/produto', produtoRoutes);
  app.use('/orcamento', orcamentoRoutes);
  app.use('/obra', obraRoutes);
  app.use('/plans', plansRouter);
  app.use('/subscription', subscriptionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
