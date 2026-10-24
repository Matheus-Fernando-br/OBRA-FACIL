import pino from 'pino';

/*
 * Logs em JSON (o Render exibe e permite busca). Campos sensíveis são
 * removidos antes de qualquer gravação.
 */
export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-signature"]',
  'res.headers["set-cookie"]',
  '*.senha',
  '*.senhaAtual',
  '*.novaSenha',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.codigo',
  '*.botToken',
  '*.CPF',
  '*.CNPJ',
];

const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL || 'info',
  base: { service: 'obra-facil-api' },
  redact: { paths: REDACT_PATHS, censor: '[oculto]' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
