import { prisma } from '../prisma.js';
export async function stateRoutes(app) {
    app.get('/state', { preHandler: app.authenticate }, async (request) => {
        const userId = request.user.sub;
        const state = await prisma.userState.findUnique({
            where: { userId },
            select: { protocols: true, nutritionFloors: true, wellnessMetrics: true, chatHistory: true, notifications: true, updatedAt: true },
        });
        return {
            state: state ?? {
                protocols: [],
                nutritionFloors: {},
                wellnessMetrics: {},
                chatHistory: [],
                notifications: [],
                updatedAt: null,
            },
        };
    });
    app.put('/state/protocols', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.sub;
        const body = request.body;
        if (body.protocols === undefined)
            return reply.code(400).send({ error: 'invalid_input' });
        const updated = await prisma.userState.upsert({
            where: { userId },
            create: { userId, protocols: body.protocols },
            update: { protocols: body.protocols },
            select: { updatedAt: true },
        });
        return { ok: true, updatedAt: updated.updatedAt };
    });
    app.put('/state/wellness-metrics', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.sub;
        const body = request.body;
        if (body.wellnessMetrics === undefined)
            return reply.code(400).send({ error: 'invalid_input' });
        const updated = await prisma.userState.upsert({
            where: { userId },
            create: { userId, wellnessMetrics: body.wellnessMetrics },
            update: { wellnessMetrics: body.wellnessMetrics },
            select: { updatedAt: true },
        });
        return { ok: true, updatedAt: updated.updatedAt };
    });
    app.put('/state/nutrition-floors', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.sub;
        const body = request.body;
        if (body.nutritionFloors === undefined)
            return reply.code(400).send({ error: 'invalid_input' });
        const updated = await prisma.userState.upsert({
            where: { userId },
            create: { userId, nutritionFloors: body.nutritionFloors },
            update: { nutritionFloors: body.nutritionFloors },
            select: { updatedAt: true },
        });
        return { ok: true, updatedAt: updated.updatedAt };
    });
    app.put('/state/chat-history', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.sub;
        const body = request.body;
        if (body.chatHistory === undefined)
            return reply.code(400).send({ error: 'invalid_input' });
        const updated = await prisma.userState.upsert({
            where: { userId },
            create: { userId, chatHistory: body.chatHistory },
            update: { chatHistory: body.chatHistory },
            select: { updatedAt: true },
        });
        return { ok: true, updatedAt: updated.updatedAt };
    });
    app.put('/state/notifications', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.sub;
        const body = request.body;
        if (body.notifications === undefined)
            return reply.code(400).send({ error: 'invalid_input' });
        const updated = await prisma.userState.upsert({
            where: { userId },
            create: { userId, notifications: body.notifications },
            update: { notifications: body.notifications },
            select: { updatedAt: true },
        });
        return { ok: true, updatedAt: updated.updatedAt };
    });
}
