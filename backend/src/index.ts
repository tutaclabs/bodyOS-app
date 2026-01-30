import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { env } from './env.js';
import { registerAuth } from './auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { stateRoutes } from './routes/state.js';
import { aiRoutes } from './routes/ai.js';
import { injectionSiteRoutes } from './routes/v2/injection-sites.js';
import { protocolRoutes } from './routes/v2/protocols.js';
import { sideEffectRoutes } from './routes/v2/side-effects.js';

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (env.corsOrigins.length === 0) return cb(null, true);
    return cb(null, env.corsOrigins.includes(origin));
  },
  credentials: true,
});

await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });

await app.register(jwt, { secret: env.jwtSecret });
registerAuth(app);

await app.register(healthRoutes);
await app.register(authRoutes);
await app.register(stateRoutes);
await app.register(aiRoutes);
await app.register(injectionSiteRoutes);
await app.register(protocolRoutes);
await app.register(sideEffectRoutes);

app.get('/', async () => ({ ok: true, name: 'bodyos-api' }));

await app.listen({ port: env.port, host: '0.0.0.0' });

