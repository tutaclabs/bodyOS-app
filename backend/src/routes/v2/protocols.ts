import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma.js';

export async function protocolRoutes(app: FastifyInstance) {
  app.put('/v2/protocols/:id/expiration', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const params = request.params as { id?: string };
    const body = request.body as {
      reconstitutionDate?: string;
      expirationDate?: string;
      expirationDays?: number;
    };

    if (!params.id) {
      return reply.code(400).send({ error: 'invalid_id' });
    }

    const state = await prisma.userState.findUnique({
      where: { userId },
      select: { protocols: true },
    });

    if (!state) {
      return reply.code(404).send({ error: 'user_state_not_found' });
    }

    const protocols = (state.protocols as any[]) || [];
    const protocolIndex = protocols.findIndex((p: any) => p.id === params.id);

    if (protocolIndex === -1) {
      return reply.code(404).send({ error: 'protocol_not_found' });
    }

    const protocol = protocols[protocolIndex];
    const updated = {
      ...protocol,
      reconstitutionDate: body.reconstitutionDate || protocol.reconstitutionDate,
      expirationDate: body.expirationDate || protocol.expirationDate,
      expirationDays: body.expirationDays ?? protocol.expirationDays ?? 30,
    };

    if (updated.reconstitutionDate && !updated.expirationDate) {
      const reconDate = new Date(updated.reconstitutionDate);
      reconDate.setDate(reconDate.getDate() + (updated.expirationDays || 30));
      updated.expirationDate = reconDate.toISOString().split('T')[0];
    }

    protocols[protocolIndex] = updated;

    await prisma.userState.update({
      where: { userId },
      data: { protocols: protocols as any },
    });

    return { protocol: updated };
  });

  app.get('/v2/protocols/expiring', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const state = await prisma.userState.findUnique({
      where: { userId },
      select: { protocols: true },
    });

    if (!state) {
      return { expiring: [], expired: [] };
    }

    const protocols = (state.protocols as any[]) || [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiring: any[] = [];
    const expired: any[] = [];

    protocols.forEach((protocol: any) => {
      if (!protocol.expirationDate) return;

      const expDate = new Date(protocol.expirationDate);
      const daysUntilExpiry = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        expired.push({ ...protocol, daysUntilExpiry });
      } else if (daysUntilExpiry <= 7) {
        expiring.push({ ...protocol, daysUntilExpiry });
      }
    });

    expiring.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    expired.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    return { expiring, expired };
  });
}
