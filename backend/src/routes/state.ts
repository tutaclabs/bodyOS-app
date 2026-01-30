import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';

export async function stateRoutes(app: FastifyInstance) {
  app.get('/state', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const state = await prisma.userState.findUnique({
      where: { userId },
      select: { protocols: true, nutritionFloors: true, wellnessMetrics: true, chatHistory: true, notifications: true, updatedAt: true } as any,
    });
    return {
      state:
        state ?? {
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
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as { protocols?: unknown };
    if (body.protocols === undefined) return reply.code(400).send({ error: 'invalid_input' });
    const updated = await prisma.userState.upsert({
      where: { userId },
      create: { userId, protocols: body.protocols as any },
      update: { protocols: body.protocols as any },
      select: { updatedAt: true },
    });
    return { ok: true, updatedAt: updated.updatedAt };
  });

  app.put('/state/wellness-metrics', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as { wellnessMetrics?: unknown };
    if (body.wellnessMetrics === undefined) return reply.code(400).send({ error: 'invalid_input' });
    const updated = await prisma.userState.upsert({
      where: { userId },
      create: { userId, wellnessMetrics: body.wellnessMetrics as any },
      update: { wellnessMetrics: body.wellnessMetrics as any },
      select: { updatedAt: true },
    });
    return { ok: true, updatedAt: updated.updatedAt };
  });

  app.put('/state/nutrition-floors', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as { nutritionFloors?: unknown };
    if (body.nutritionFloors === undefined) return reply.code(400).send({ error: 'invalid_input' });
    const updated = await prisma.userState.upsert({
      where: { userId },
      create: { userId, nutritionFloors: body.nutritionFloors as any },
      update: { nutritionFloors: body.nutritionFloors as any },
      select: { updatedAt: true },
    });
    return { ok: true, updatedAt: updated.updatedAt };
  });

  app.put('/state/chat-history', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as { chatHistory?: unknown };
    if (body.chatHistory === undefined) return reply.code(400).send({ error: 'invalid_input' });
    const updated = await prisma.userState.upsert({
      where: { userId },
      create: { userId, chatHistory: body.chatHistory as any },
      update: { chatHistory: body.chatHistory as any },
      select: { updatedAt: true },
    });
    return { ok: true, updatedAt: updated.updatedAt };
  });

  app.put('/state/notifications', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as { notifications?: unknown };
    if (body.notifications === undefined) return reply.code(400).send({ error: 'invalid_input' });
    const updated = await prisma.userState.upsert({
      where: { userId },
      create: { userId, notifications: body.notifications as any } as any,
      update: { notifications: body.notifications as any } as any,
      select: { updatedAt: true },
    });
    return { ok: true, updatedAt: updated.updatedAt };
  });
}
