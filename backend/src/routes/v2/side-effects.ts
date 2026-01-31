import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma.js';

export async function sideEffectRoutes(app: FastifyInstance) {
  app.get('/v2/side-effects', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const query = request.query as {
      startDate?: string;
      endDate?: string;
      protocolId?: string;
      minSeverity?: string;
    };

    const where: any = { userId };

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    if (query.protocolId) {
      where.protocolId = query.protocolId;
    }

    if (query.minSeverity) {
      where.severity = { gte: parseInt(query.minSeverity, 10) };
    }

    const sideEffects = await (prisma as any).sideEffect.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return { sideEffects };
  });

  app.post('/v2/side-effects', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as {
      protocolId?: string;
      date?: string;
      symptom?: string;
      severity?: number;
      duration?: string;
      notes?: string;
    };

    if (!body.symptom || !body.severity) {
      return reply.code(400).send({ error: 'missing_required_fields' });
    }

    if (body.severity < 1 || body.severity > 10) {
      return reply.code(400).send({ error: 'invalid_severity' });
    }

    const sideEffect = await (prisma as any).sideEffect.create({
      data: {
        userId,
        protocolId: body.protocolId || null,
        date: body.date ? new Date(body.date) : new Date(),
        symptom: body.symptom,
        severity: body.severity,
        duration: body.duration || null,
        notes: body.notes || null,
      },
    });

    return { sideEffect };
  });

  app.put('/v2/side-effects/:id', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const params = request.params as { id?: string };
    const body = request.body as {
      symptom?: string;
      severity?: number;
      duration?: string;
      notes?: string;
      date?: string;
    };

    if (!params.id) {
      return reply.code(400).send({ error: 'invalid_id' });
    }

    const existing = await (prisma as any).sideEffect.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return reply.code(404).send({ error: 'not_found' });
    }

    if (body.severity !== undefined && (body.severity < 1 || body.severity > 10)) {
      return reply.code(400).send({ error: 'invalid_severity' });
    }

    const updated = await (prisma as any).sideEffect.update({
      where: { id: params.id },
      data: {
        symptom: body.symptom ?? existing.symptom,
        severity: body.severity ?? existing.severity,
        duration: body.duration ?? existing.duration,
        notes: body.notes ?? existing.notes,
        date: body.date ? new Date(body.date) : existing.date,
      },
    });

    return { sideEffect: updated };
  });

  app.delete('/v2/side-effects/:id', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const params = request.params as { id?: string };

    if (!params.id) {
      return reply.code(400).send({ error: 'invalid_id' });
    }

    const existing = await (prisma as any).sideEffect.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return reply.code(404).send({ error: 'not_found' });
    }

    await (prisma as any).sideEffect.delete({
      where: { id: params.id },
    });

    return { ok: true };
  });

  app.get('/v2/side-effects/timeline', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const query = request.query as {
      startDate?: string;
      endDate?: string;
    };

    const where: any = { userId };

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    const sideEffects = await (prisma as any).sideEffect.findMany({
      where,
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        symptom: true,
        severity: true,
        protocolId: true,
      },
    });

    const state = await prisma.userState.findUnique({
      where: { userId },
      select: { protocols: true },
    });

    const protocols = Array.isArray(state?.protocols) ? (state.protocols as any[]) : [];
    const protocolMap = new Map(protocols.map((p: any) => [p.id, p]));

    type SideEffectType = { id: string; date: Date; symptom: string; severity: number; protocolId: string | null };
    const timeline = sideEffects.map((se: SideEffectType) => ({
      date: se.date.toISOString().split('T')[0],
      symptom: se.symptom,
      severity: se.severity,
      protocol: se.protocolId ? protocolMap.get(se.protocolId) : null,
    }));

    return { timeline };
  });
}
