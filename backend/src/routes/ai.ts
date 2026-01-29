import type { FastifyInstance } from 'fastify';
import { env } from '../env.js';
import { prisma } from '../prisma.js';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function openaiChatJson({
  messages,
  maxTokens,
  temperature,
  responseFormat,
}: {
  messages: ChatMessage[];
  maxTokens: number;
  temperature: number;
  responseFormat?: { type: 'json_object' };
}) {
  if (!env.openaiApiKey) throw new Error('missing_openai_key');
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      messages,
      max_tokens: maxTokens,
      temperature,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text.slice(0, 300) || 'openai_error');
  }
  return resp.json();
}

export async function aiRoutes(app: FastifyInstance) {
  app.post('/ai/bodyos-chat', { preHandler: app.authenticate }, async (request, reply) => {
    if (!env.aiEnabled) return reply.code(503).send({ error: 'ai_disabled' });

    const userId = (request.user as { sub: string }).sub;
    const body = request.body as { message?: string; language?: string; history?: ChatMessage[] };
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const language = typeof body.language === 'string' ? body.language : 'en';
    const history = Array.isArray(body.history) ? (body.history as ChatMessage[]) : [];

    if (!message) return reply.code(400).send({ error: 'invalid_input' });

    const system: ChatMessage = {
      role: 'system',
      content:
        `You are BodyOS Intelligence, a health and biohacking assistant. ` +
        `Be safe, avoid medical diagnosis, and recommend seeing a clinician for emergencies. ` +
        `Reply in ${language}.`,
    };

    const messages: ChatMessage[] = [
      system,
      ...history.filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant')),
      { role: 'user', content: message },
    ];

    let json: any;
    try {
      json = await openaiChatJson({ messages, maxTokens: 400, temperature: 0.3 });
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
      if (msg === 'missing_openai_key') return reply.code(500).send({ error: 'missing_openai_key' });
      return reply.code(502).send({ error: 'openai_error', detail: msg });
    }
    const assistantMessage = json?.choices?.[0]?.message?.content?.trim?.() ?? '';
    if (!assistantMessage) return reply.code(502).send({ error: 'openai_empty' });

    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: assistantMessage },
    ];

    await prisma.userState.upsert({
      where: { userId },
      create: { userId, chatHistory: updatedHistory as any },
      update: { chatHistory: updatedHistory as any },
      select: { id: true },
    });

    return { assistantMessage, updatedHistory };
  });

  app.post('/ai/research', { preHandler: app.authenticate }, async (request, reply) => {
    if (!env.aiEnabled) return reply.code(503).send({ error: 'ai_disabled' });
    const body = request.body as { question?: string };
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (!question) return reply.code(400).send({ error: 'invalid_input' });

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a biohacking research assistant specializing in peptides, compounds, and longevity protocols. ' +
          'Provide evidence-based, concise answers. Always emphasize safety considerations and cite general research findings when relevant. ' +
          'Keep responses under 300 words.',
      },
      { role: 'user', content: question },
    ];

    try {
      const json: any = await openaiChatJson({ messages, maxTokens: 400, temperature: 0.7 });
      const answer = json?.choices?.[0]?.message?.content ?? '';
      return { answer };
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
      if (msg === 'missing_openai_key') return reply.code(500).send({ error: 'missing_openai_key' });
      return reply.code(502).send({ error: 'openai_error', detail: msg });
    }
  });

  app.post('/ai/insights', { preHandler: app.authenticate }, async (request, reply) => {
    if (!env.aiEnabled) return reply.code(503).send({ error: 'ai_disabled' });
    const body = request.body as { protocols?: unknown; nutritionFloors?: unknown };

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a biohacking insights assistant. Analyze user data (protocols and nutrition) and provide 2-3 concise, actionable insights. ' +
          'Return ONLY valid JSON: {"insights": ["insight1", "insight2", "insight3"]}. Be specific, helpful, and focus on patterns, gaps, or optimization opportunities.',
      },
      {
        role: 'user',
        content: `Analyze this biohacking data and provide insights: ${JSON.stringify({
          protocolCount: Array.isArray(body.protocols) ? body.protocols.length : 0,
          protocols: Array.isArray(body.protocols) ? body.protocols : [],
          nutrition: body.nutritionFloors ?? null,
        })}`,
      },
    ];

    try {
      const json: any = await openaiChatJson({
        messages,
        maxTokens: 300,
        temperature: 0.7,
        responseFormat: { type: 'json_object' },
      });
      const raw = json?.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      return { insights: Array.isArray(parsed?.insights) ? parsed.insights : [] };
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
      if (msg === 'missing_openai_key') return reply.code(500).send({ error: 'missing_openai_key' });
      return reply.code(502).send({ error: 'openai_error', detail: msg });
    }
  });

  app.post('/ai/safety', { preHandler: app.authenticate }, async (request, reply) => {
    if (!env.aiEnabled) return reply.code(503).send({ error: 'ai_disabled' });
    const body = request.body as { protocols?: unknown };
    const protocols = Array.isArray(body.protocols) ? body.protocols : [];

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a biohacking safety advisor. Analyze protocols for potential interactions, contraindications, and safety concerns. ' +
          'Return ONLY valid JSON with this structure: {"safe": boolean, "warnings": ["warning1", "warning2"], "recommendations": ["rec1", "rec2"]}. Be concise and specific.',
      },
      { role: 'user', content: `Analyze these biohacking protocols for safety: ${JSON.stringify(protocols)}` },
    ];

    try {
      const json: any = await openaiChatJson({
        messages,
        maxTokens: 500,
        temperature: 0.3,
        responseFormat: { type: 'json_object' },
      });
      const raw = json?.choices?.[0]?.message?.content ?? '{}';
      const result = JSON.parse(raw);
      return {
        safe: result?.safe !== false,
        warnings: Array.isArray(result?.warnings) ? result.warnings : [],
        recommendations: Array.isArray(result?.recommendations) ? result.recommendations : [],
      };
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
      if (msg === 'missing_openai_key') return reply.code(500).send({ error: 'missing_openai_key' });
      return reply.code(502).send({ error: 'openai_error', detail: msg });
    }
  });

  app.post('/ai/protocol-parser', { preHandler: app.authenticate }, async (request, reply) => {
    if (!env.aiEnabled) return reply.code(503).send({ error: 'ai_disabled' });
    const body = request.body as { text?: string };
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) return reply.code(400).send({ error: 'invalid_input' });

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a protocol parser for a biohacking app. Extract protocol details from natural language. ' +
          'Return ONLY valid JSON: {"name": "string", "cycleOn": number, "cycleOff": number}. If information is missing, use defaults: cycleOn=5, cycleOff=2. ' +
          'Extract the compound/protocol name and cycle days from text.',
      },
      { role: 'user', content: `Parse this protocol description: "${text}"` },
    ];

    try {
      const json: any = await openaiChatJson({
        messages,
        maxTokens: 200,
        temperature: 0.3,
        responseFormat: { type: 'json_object' },
      });
      const raw = json?.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      return {
        name: parsed?.name || 'Unknown Protocol',
        cycleOn: Number(parsed?.cycleOn) || 5,
        cycleOff: Number(parsed?.cycleOff) || 2,
      };
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
      if (msg === 'missing_openai_key') return reply.code(500).send({ error: 'missing_openai_key' });
      return reply.code(502).send({ error: 'openai_error', detail: msg });
    }
  });
}
