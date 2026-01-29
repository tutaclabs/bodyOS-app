import { prisma } from '../prisma.js';
import { hashPassword, verifyPassword } from '../security.js';
import { issueTokens, revokeRefreshToken, rotateRefreshToken } from '../auth.js';
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
export async function authRoutes(app) {
    app.post('/auth/register', async (request, reply) => {
        const body = request.body;
        const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
        const password = typeof body.password === 'string' ? body.password : '';
        if (!email || !password || password.length < 6) {
            return reply.code(400).send({ error: 'invalid_input' });
        }
        const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (existing)
            return reply.code(409).send({ error: 'email_taken' });
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: await hashPassword(password),
                state: { create: {} },
            },
            select: { id: true, email: true, createdAt: true },
        });
        const tokens = await issueTokens(app, { id: user.id, email: user.email });
        return reply.send({ user, tokens });
    });
    app.post('/auth/login', async (request, reply) => {
        const body = request.body;
        const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
        const password = typeof body.password === 'string' ? body.password : '';
        if (!email || !password)
            return reply.code(400).send({ error: 'invalid_input' });
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, passwordHash: true, createdAt: true },
        });
        if (!user)
            return reply.code(401).send({ error: 'invalid_credentials' });
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok)
            return reply.code(401).send({ error: 'invalid_credentials' });
        const tokens = await issueTokens(app, { id: user.id, email: user.email });
        return reply.send({
            user: { id: user.id, email: user.email, createdAt: user.createdAt },
            tokens,
        });
    });
    app.post('/auth/refresh', async (request, reply) => {
        const body = request.body;
        const refreshToken = typeof body.refreshToken === 'string' ? body.refreshToken : '';
        if (!refreshToken)
            return reply.code(400).send({ error: 'invalid_input' });
        const tokens = await rotateRefreshToken(app, refreshToken);
        if (!tokens)
            return reply.code(401).send({ error: 'invalid_refresh' });
        return reply.send({ tokens });
    });
    app.post('/auth/logout', async (request, reply) => {
        const body = request.body;
        const refreshToken = typeof body.refreshToken === 'string' ? body.refreshToken : '';
        if (refreshToken)
            await revokeRefreshToken(refreshToken);
        return reply.send({ ok: true });
    });
    app.get('/me', { preHandler: app.authenticate }, async (request) => {
        const userId = request.user.sub;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true },
        });
        return { user };
    });
}
