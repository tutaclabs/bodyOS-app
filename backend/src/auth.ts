import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from './prisma.js';
import { env } from './env.js';
import { randomToken, sha256 } from './security.js';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_DAYS = 30;

export type JwtPayload = {
  sub: string;
  email: string;
};

export async function issueTokens(app: FastifyInstance, user: { id: string; email: string }) {
  const accessToken = await app.jwt.sign(
    { sub: user.id, email: user.email } satisfies JwtPayload,
    { expiresIn: ACCESS_TTL_SECONDS }
  );

  const refreshToken = randomToken();
  const refreshTokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: { userId: user.id, refreshTokenHash, expiresAt },
    select: { id: true, expiresAt: true },
  });

  return { accessToken, refreshToken, refreshExpiresAt: session.expiresAt };
}

export async function rotateRefreshToken(app: FastifyInstance, refreshToken: string) {
  const refreshTokenHash = sha256(refreshToken);
  const session = await prisma.session.findFirst({
    where: { refreshTokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, userId: true, user: { select: { id: true, email: true } } },
  });
  if (!session) return null;

  await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  const tokens = await issueTokens(app, { id: session.user.id, email: session.user.email });
  return tokens;
}

export async function revokeRefreshToken(refreshToken: string) {
  const refreshTokenHash = sha256(refreshToken);
  await prisma.session.updateMany({
    where: { refreshTokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify<JwtPayload>();
  } catch {
    reply.code(401).send({ error: 'unauthorized' });
    return;
  }
}

export function registerAuth(app: FastifyInstance) {
  app.decorate('authenticate', (req: FastifyRequest, rep: FastifyReply) =>
    authenticate(req, rep)
  );
}

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

