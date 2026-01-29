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
  console.log('[AUTH-DEBUG] authenticate called', { hasAuth: !!request.headers.authorization, url: request.url });
  // #region agent log
  const logData = {location:'auth.ts:54',message:'authenticate entry',data:{hasAuthHeader:!!request.headers.authorization,authHeaderPrefix:request.headers.authorization?.substring(0,20)||'none',requestUser:request.user||null,url:request.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'};
  fetch('http://127.0.0.1:7244/ingest/ea561df3-ab07-4044-a42c-811fd3e6974d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch((e)=>console.error('[AUTH-DEBUG] fetch failed',e));
  // #endregion
  try {
    await request.jwtVerify<JwtPayload>();
    console.log('[AUTH-DEBUG] jwtVerify succeeded', { user: request.user });
    // #region agent log
    const logData2 = {location:'auth.ts:60',message:'jwtVerify succeeded',data:{requestUser:request.user||null,userSub:(request.user as any)?.sub||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'};
    fetch('http://127.0.0.1:7244/ingest/ea561df3-ab07-4044-a42c-811fd3e6974d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch((e)=>console.error('[AUTH-DEBUG] fetch2 failed',e));
    // #endregion
  } catch (err: any) {
    console.log('[AUTH-DEBUG] jwtVerify failed', { error: err?.message, type: err?.constructor?.name });
    // #region agent log
    const logData3 = {location:'auth.ts:65',message:'jwtVerify failed',data:{errorType:err?.constructor?.name||'unknown',errorMessage:err?.message||'unknown',requestUser:request.user||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'};
    fetch('http://127.0.0.1:7244/ingest/ea561df3-ab07-4044-a42c-811fd3e6974d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch((e)=>console.error('[AUTH-DEBUG] fetch3 failed',e));
    // #endregion
    reply.code(401).send({ error: 'unauthorized' });
    console.log('[AUTH-DEBUG] sent 401, returning', { replySent: reply.sent });
    // #region agent log
    const logData4 = {location:'auth.ts:69',message:'sending 401 and returning',data:{replySent:reply.sent},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'};
    fetch('http://127.0.0.1:7244/ingest/ea561df3-ab07-4044-a42c-811fd3e6974d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch((e)=>console.error('[AUTH-DEBUG] fetch4 failed',e));
    // #endregion
    return;
  }
  console.log('[AUTH-DEBUG] authenticate exit (success)', { user: request.user });
  // #region agent log
  const logData5 = {location:'auth.ts:73',message:'authenticate exit (success path)',data:{requestUser:request.user||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'};
  fetch('http://127.0.0.1:7244/ingest/ea561df3-ab07-4044-a42c-811fd3e6974d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData5)}).catch((e)=>console.error('[AUTH-DEBUG] fetch5 failed',e));
  // #endregion
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

