import { z } from 'zod';

/*
 * Variáveis de ambiente (configuradas no painel do Render).
 * Segredos NUNCA vão para o código nem para o Git — veja .env.example.
 */
const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  LOG_LEVEL: z.string().default('info'),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),

  MONGO_URI: z.string().min(1, 'MONGO_URI é obrigatória'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET precisa ter 32+ caracteres'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET precisa ter 32+ caracteres'),
  ADMIN_JWT_SECRET: z.string().min(32, 'ADMIN_JWT_SECRET precisa ter 32+ caracteres'),
  SETTINGS_ENCRYPTION_KEY: z.string().min(32, 'SETTINGS_ENCRYPTION_KEY precisa ter 32+ caracteres'),
  ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(3600),
  REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),

  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_INITIAL_PASSWORD: optional,
  ADMIN_FORCE_RESET: z
    .string()
    .optional()
    .transform((v) => v === 'true'),

  PUBLIC_BASE_URL: z.string().url().default('http://localhost:8000'),
  CORS_ORIGINS: z.string().default(''),

  BREVO_API_KEY: optional,
  MAIL_FROM_EMAIL: optional,
  MAIL_FROM_NAME: z.string().default('Obra Fácil'),
  SUPPORT_EMAIL: z.string().default('r2m.tec.adm@gmail.com'),

  MP_ACCESS_TOKEN: optional,
  MP_WEBHOOK_SECRET: optional,

  /** Só para testes sem Brevo: grava os códigos de e-mail no log do Render. */
  MAIL_LOG_CODES: z
    .string()
    .optional()
    .transform((v) => v === 'true'),

  DISABLE_JOBS: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

function load() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const list = parsed.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Variáveis de ambiente inválidas:\n${list}`);
  }
  const env = parsed.data;
  env.isProd = env.NODE_ENV === 'production';
  env.isTest = env.NODE_ENV === 'test';
  env.corsOrigins = env.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  env.PUBLIC_BASE_URL = env.PUBLIC_BASE_URL.replace(/\/+$/, '');
  return env;
}

let cached;

/** Lido sob demanda para que os testes possam definir process.env antes. */
export function getEnv() {
  cached ??= load();
  return cached;
}

export function resetEnvCache() {
  cached = undefined;
}
