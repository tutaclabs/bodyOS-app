import type { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma.js';

const SITE_LOCATIONS = [
  'left_deltoid',
  'right_deltoid',
  'abdomen_upper_left',
  'abdomen_upper_right',
  'abdomen_lower_left',
  'abdomen_lower_right',
  'left_thigh',
  'right_thigh',
  'left_glute',
  'right_glute',
] as const;

export async function injectionSiteRoutes(app: FastifyInstance) {
  app.get('/v2/injection-sites', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const sites = await (prisma as any).injectionSite.findMany({
      where: { userId },
      orderBy: { lastUsedDate: 'desc' },
    });
    return { sites };
  });

  app.post('/v2/injection-sites', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const body = request.body as {
      siteLocation?: string;
      notes?: string;
    };

    if (!body.siteLocation || !SITE_LOCATIONS.includes(body.siteLocation as any)) {
      return reply.code(400).send({ error: 'invalid_site_location' });
    }

    const existing = await (prisma as any).injectionSite.findFirst({
      where: {
        userId,
        siteLocation: body.siteLocation,
      },
    });

    const now = new Date();
    let site;

    if (existing) {
      site = await (prisma as any).injectionSite.update({
        where: { id: existing.id },
        data: {
          lastUsedDate: now,
          usageCount: { increment: 1 },
          notes: body.notes || existing.notes,
        },
      });
    } else {
      site = await (prisma as any).injectionSite.create({
        data: {
          userId,
          siteLocation: body.siteLocation,
          lastUsedDate: now,
          usageCount: 1,
          notes: body.notes,
        },
      });
    }

    return { site };
  });

  app.put('/v2/injection-sites/:id', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const params = request.params as { id?: string };
    const body = request.body as { notes?: string };

    if (!params.id) {
      return reply.code(400).send({ error: 'invalid_id' });
    }

    const site = await (prisma as any).injectionSite.findFirst({
      where: { id: params.id, userId },
    });

    if (!site) {
      return reply.code(404).send({ error: 'not_found' });
    }

    const updated = await (prisma as any).injectionSite.update({
      where: { id: params.id },
      data: { notes: body.notes },
    });

    return { site: updated };
  });

  app.get('/v2/injection-sites/suggest', { preHandler: app.authenticate }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const sites = await (prisma as any).injectionSite.findMany({
      where: { userId },
    });

    const now = new Date();
    type SiteType = { siteLocation: string; lastUsedDate: Date | null; usageCount: number };
    const siteMap = new Map<string, SiteType>();
    sites.forEach((s: SiteType) => siteMap.set(s.siteLocation, s));

    const suggestions = SITE_LOCATIONS.map((location) => {
      const site = siteMap.get(location);
      if (!site || !site.lastUsedDate) {
        return { location, daysSinceUse: Infinity, usageCount: 0, priority: 1 };
      }

      const daysSinceUse = Math.floor(
        (now.getTime() - site.lastUsedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let priority = 3;
      if (daysSinceUse >= 7) priority = 1;
      else if (daysSinceUse >= 3) priority = 2;

      return {
        location,
        daysSinceUse,
        usageCount: site.usageCount,
        priority,
        lastUsedDate: site.lastUsedDate,
      };
    });

    suggestions.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.daysSinceUse - a.daysSinceUse;
    });

    const recommended = suggestions[0];
    const recentSites = sites
      .filter((s: SiteType) => s.lastUsedDate)
      .sort((a: SiteType, b: SiteType) => {
        if (!a.lastUsedDate || !b.lastUsedDate) return 0;
        return b.lastUsedDate.getTime() - a.lastUsedDate.getTime();
      })
      .slice(0, 3)
      .map((s: SiteType) => s.siteLocation);

    const needsRotation = recentSites.length >= 3 && new Set(recentSites).size === 1;

    return {
      recommended: recommended.location,
      suggestions: suggestions.slice(0, 5),
      needsRotation,
      recentSites,
    };
  });
}
