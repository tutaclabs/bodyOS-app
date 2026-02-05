import { env } from '../env.js';
import { prisma } from '../prisma.js';
async function openaiChatJson({ messages, maxTokens, temperature, responseFormat, }) {
    if (!env.openaiApiKey)
        throw new Error('missing_openai_key');
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
export async function aiRoutes(app) {
    app.post('/ai/bodyos-chat', { preHandler: app.authenticate }, async (request, reply) => {
        if (!env.aiEnabled)
            return reply.code(503).send({ error: 'ai_disabled' });
        const userId = request.user.sub;
        const body = request.body;
        const message = typeof body.message === 'string' ? body.message.trim() : '';
        const language = typeof body.language === 'string' ? body.language : 'en';
        const history = Array.isArray(body.history) ? body.history : [];
        if (!message)
            return reply.code(400).send({ error: 'invalid_input' });
        const system = {
            role: 'system',
            content: `You are BodyOS Intelligence, a health and biohacking assistant. ` +
                `Be safe, avoid medical diagnosis, and recommend seeing a clinician for emergencies. ` +
                `Reply in ${language}.`,
        };
        const messages = [
            system,
            ...history.filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant')),
            { role: 'user', content: message },
        ];
        let json;
        try {
            json = await openaiChatJson({ messages, maxTokens: 400, temperature: 0.3 });
        }
        catch (e) {
            const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
            if (msg === 'missing_openai_key')
                return reply.code(500).send({ error: 'missing_openai_key' });
            return reply.code(502).send({ error: 'openai_error', detail: msg });
        }
        const assistantMessage = json?.choices?.[0]?.message?.content?.trim?.() ?? '';
        if (!assistantMessage)
            return reply.code(502).send({ error: 'openai_empty' });
        const updatedHistory = [
            ...history,
            { role: 'user', content: message },
            { role: 'assistant', content: assistantMessage },
        ];
        await prisma.userState.upsert({
            where: { userId },
            create: { userId, chatHistory: updatedHistory },
            update: { chatHistory: updatedHistory },
            select: { id: true },
        });
        return { assistantMessage, updatedHistory };
    });
    app.post('/ai/research', { preHandler: app.authenticate }, async (request, reply) => {
        if (!env.aiEnabled)
            return reply.code(503).send({ error: 'ai_disabled' });
        const body = request.body;
        const question = typeof body.question === 'string' ? body.question.trim() : '';
        if (!question)
            return reply.code(400).send({ error: 'invalid_input' });
        const messages = [
            {
                role: 'system',
                content: 'You are a biohacking research assistant specializing in peptides, compounds, and longevity protocols. ' +
                    'Provide evidence-based, concise answers. Always emphasize safety considerations and cite general research findings when relevant. ' +
                    'Keep responses under 300 words.',
            },
            { role: 'user', content: question },
        ];
        try {
            const json = await openaiChatJson({ messages, maxTokens: 400, temperature: 0.7 });
            const answer = json?.choices?.[0]?.message?.content ?? '';
            return { answer };
        }
        catch (e) {
            const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
            if (msg === 'missing_openai_key')
                return reply.code(500).send({ error: 'missing_openai_key' });
            return reply.code(502).send({ error: 'openai_error', detail: msg });
        }
    });
    app.post('/ai/insights', { preHandler: app.authenticate }, async (request, reply) => {
        if (!env.aiEnabled)
            return reply.code(503).send({ error: 'ai_disabled' });
        const body = request.body;
        const messages = [
            {
                role: 'system',
                content: 'You are a biohacking insights assistant. Analyze user data (protocols and nutrition) and provide 2-3 concise, actionable insights. ' +
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
            const json = await openaiChatJson({
                messages,
                maxTokens: 300,
                temperature: 0.7,
                responseFormat: { type: 'json_object' },
            });
            const raw = json?.choices?.[0]?.message?.content ?? '{}';
            const parsed = JSON.parse(raw);
            return { insights: Array.isArray(parsed?.insights) ? parsed.insights : [] };
        }
        catch (e) {
            const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
            if (msg === 'missing_openai_key')
                return reply.code(500).send({ error: 'missing_openai_key' });
            return reply.code(502).send({ error: 'openai_error', detail: msg });
        }
    });
    app.post('/ai/safety', { preHandler: app.authenticate }, async (request, reply) => {
        if (!env.aiEnabled)
            return reply.code(503).send({ error: 'ai_disabled' });
        const body = request.body;
        const protocols = Array.isArray(body.protocols) ? body.protocols : [];
        const language = typeof body.language === 'string' ? body.language : 'en';
        const systemPrompt = language === 'pt'
            ? 'Você é um consultor de segurança em biohacking. Analise protocolos para interações potenciais, contraindicações e preocupações de segurança. Retorne APENAS JSON válido com esta estrutura: {"safe": boolean, "warnings": ["aviso1", "aviso2"], "recommendations": ["rec1", "rec2"]}. Seja conciso e específico.'
            : 'You are a biohacking safety advisor. Analyze protocols for potential interactions, contraindications, and safety concerns. Return ONLY valid JSON with this structure: {"safe": boolean, "warnings": ["warning1", "warning2"], "recommendations": ["rec1", "rec2"]}. Be concise and specific.';
        const messages = [
            {
                role: 'system',
                content: systemPrompt,
            },
            { role: 'user', content: `Analyze these biohacking protocols for safety: ${JSON.stringify(protocols)}` },
        ];
        try {
            const json = await openaiChatJson({
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
        }
        catch (e) {
            const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
            if (msg === 'missing_openai_key')
                return reply.code(500).send({ error: 'missing_openai_key' });
            return reply.code(502).send({ error: 'openai_error', detail: msg });
        }
    });
    app.post('/ai/protocol-parser', { preHandler: app.authenticate }, async (request, reply) => {
        if (!env.aiEnabled)
            return reply.code(503).send({ error: 'ai_disabled' });
        const body = request.body;
        const text = typeof body.text === 'string' ? body.text.trim() : '';
        if (!text)
            return reply.code(400).send({ error: 'invalid_input' });
        const messages = [
            {
                role: 'system',
                content: 'You are a Bio-OS Protocol Extractor. Parse unstructured text into structured JSON protocol.\n\n' +
                    'Rules:\n' +
                    '1. Default units: mg for vials, ml for water, mcg for doses unless specified.\n' +
                    '2. If frequency is missing, assume "Once Daily" (daily).\n' +
                    '3. If days are mentioned (e.g., "5 on 2 off"), calculate the schedule accordingly.\n' +
                    '4. Calculate estimatedVialDays based on vialSizeMg, reconstitutionMl, doseMcg, and frequency.\n' +
                    '5. Output ONLY valid JSON.\n\n' +
                    'Target JSON Structure:\n' +
                    '{\n' +
                    '  "compoundName": string,\n' +
                    '  "vialSizeMg": number,\n' +
                    '  "reconstitutionMl": number,\n' +
                    '  "doseMcg": number,\n' +
                    '  "frequency": "daily" | "twice_daily" | "weekly",\n' +
                    '  "schedule": { "onDays": number, "offDays": number },\n' +
                    '  "estimatedVialDays": number\n' +
                    '}',
            },
            { role: 'user', content: `Parse this protocol description: "${text}"` },
        ];
        try {
            const json = await openaiChatJson({
                messages,
                maxTokens: 300,
                temperature: 0.3,
                responseFormat: { type: 'json_object' },
            });
            const raw = json?.choices?.[0]?.message?.content ?? '{}';
            const parsed = JSON.parse(raw);
            const frequency = parsed?.frequency === 'twice_daily' || parsed?.frequency === 'weekly'
                ? parsed.frequency
                : 'daily';
            const onDays = Number(parsed?.schedule?.onDays) || Number(parsed?.onDays) || 5;
            const offDays = Number(parsed?.schedule?.offDays) || Number(parsed?.offDays) || 2;
            const vialSizeMg = Number(parsed?.vialSizeMg) || 0;
            const reconstitutionMl = Number(parsed?.reconstitutionMl) || 0;
            const doseMcg = Number(parsed?.doseMcg) || 0;
            let estimatedVialDays = Number(parsed?.estimatedVialDays) || 0;
            if (estimatedVialDays === 0 && vialSizeMg > 0 && reconstitutionMl > 0 && doseMcg > 0) {
                const totalMcg = (vialSizeMg * 1000);
                const concentrationMcgPerMl = totalMcg / reconstitutionMl;
                const dailyDoseMl = frequency === 'twice_daily'
                    ? (doseMcg * 2) / concentrationMcgPerMl
                    : frequency === 'weekly'
                        ? doseMcg / (concentrationMcgPerMl * 7)
                        : doseMcg / concentrationMcgPerMl;
                estimatedVialDays = Math.floor(reconstitutionMl / dailyDoseMl);
            }
            return {
                compoundName: parsed?.compoundName || parsed?.name || 'Unknown Protocol',
                vialSizeMg,
                reconstitutionMl,
                doseMcg,
                frequency,
                schedule: { onDays, offDays },
                estimatedVialDays: estimatedVialDays || 0,
            };
        }
        catch (e) {
            const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
            if (msg === 'missing_openai_key')
                return reply.code(500).send({ error: 'missing_openai_key' });
            return reply.code(502).send({ error: 'openai_error', detail: msg });
        }
    });
    app.post('/ai/recommendations', { preHandler: app.authenticate }, async (request, reply) => {
        if (!env.aiEnabled)
            return reply.code(503).send({ error: 'ai_disabled' });
        const body = request.body;
        const language = typeof body.language === 'string' ? body.language : 'en';
        const goals = Array.isArray(body.goals) ? body.goals : [];
        const experienceLevel = typeof body.experienceLevel === 'string' ? body.experienceLevel : 'beginner';
        const lifestyle = body.lifestyle || {};
        const currentProtocols = Array.isArray(body.currentProtocols) ? body.currentProtocols : [];
        const libraryItemsPlaceholder = [
            {
                id: 'bpc157',
                name: 'BPC-157',
                category: 'Peptide',
                wellnessUses: ['Tissue repair support', 'Gut health optimization', 'Recovery enhancement'],
                evidenceLevel: 'Moderate',
            },
            {
                id: 'ghkcu',
                name: 'GHK-Cu',
                category: 'Peptide',
                wellnessUses: ['Skin health and appearance', 'Hair follicle support', 'Anti-inflammatory support'],
                evidenceLevel: 'Moderate',
            },
            {
                id: 'tb500',
                name: 'TB-500',
                category: 'Peptide',
                wellnessUses: ['Recovery and repair support', 'Mobility enhancement', 'Tissue healing support'],
                evidenceLevel: 'Low to Moderate',
            },
            {
                id: 'vitamind',
                name: 'Vitamin D3',
                category: 'Vitamin',
                wellnessUses: ['Immune system support', 'Bone health', 'Mood and cognitive function'],
                evidenceLevel: 'Strong',
            },
            {
                id: 'magnesium',
                name: 'Magnesium',
                category: 'Mineral',
                wellnessUses: ['Muscle function and recovery', 'Sleep quality', 'Stress management'],
                evidenceLevel: 'Strong',
            },
            {
                id: 'omega3',
                name: 'Omega-3 Fatty Acids',
                category: 'Fatty Acid',
                wellnessUses: ['Cardiovascular health', 'Cognitive function', 'Inflammatory balance'],
                evidenceLevel: 'Strong',
            },
        ];
        const userProfile = {
            goals,
            experienceLevel,
            lifestyle,
            currentProtocols: currentProtocols.map((p) => ({
                name: p?.name || 'Unknown',
                cycleOn: p?.cycleOn || 0,
                cycleOff: p?.cycleOff || 0,
            })),
        };
        const systemPrompt = language === 'pt'
            ? `Você é um assistente de educação em biohacking. Com base nos objetivos e perfil do usuário, sugira peptídeos e vitaminas relevantes da biblioteca fornecida.

      Compostos disponíveis: ${JSON.stringify(libraryItemsPlaceholder)}

      Regras:
      - Forneça apenas sugestões EDUCACIONAIS, não conselhos médicos
      - Inclua intervalos de dosagem gerais (ex: "tipicamente 200-500mcg diariamente")
      - Considere o nível de experiência do usuário (iniciante/intermediário/avançado)
      - Verifique interações com protocolos atuais
      - Priorize segurança e nível de evidência
      - Retorne APENAS JSON válido com esta estrutura:
      {
        "recommendations": [
          {
            "compoundId": "string",
            "compoundName": "string",
            "category": "Peptide|Vitamin|Mineral|Fatty Acid",
            "rationale": "por que isso corresponde aos objetivos deles",
            "dosageRange": "intervalo de dosagem educacional",
            "timing": "quando/como tomar",
            "cycleOn": number,
            "cycleOff": number,
            "safetyNotes": ["nota1", "nota2"]
          }
        ],
        "warnings": ["aviso1", "aviso2"],
        "considerations": ["consideração1", "consideração2"]
      }`
            : `You are a biohacking education assistant. Based on user goals and profile, suggest relevant peptides and vitamins from the provided library.

      Available compounds: ${JSON.stringify(libraryItemsPlaceholder)}

      Rules:
      - Provide EDUCATIONAL suggestions only, not medical advice
      - Include general dosage ranges (e.g., "typically 200-500mcg daily")
      - Consider user experience level (beginner/intermediate/advanced)
      - Check for interactions with current protocols
      - Prioritize safety and evidence level
      - Return ONLY valid JSON with this structure:
      {
        "recommendations": [
          {
            "compoundId": "string",
            "compoundName": "string",
            "category": "Peptide|Vitamin|Mineral|Fatty Acid",
            "rationale": "why this matches their goals",
            "dosageRange": "educational dosage range",
            "timing": "when/how to take",
            "cycleOn": number,
            "cycleOff": number,
            "safetyNotes": ["note1", "note2"]
          }
        ],
        "warnings": ["warning1", "warning2"],
        "considerations": ["consideration1", "consideration2"]
      }`;
        const messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: `Suggest compounds for this user profile: ${JSON.stringify(userProfile)}`,
            },
        ];
        try {
            const json = await openaiChatJson({
                messages,
                maxTokens: 1200,
                temperature: 0.4,
                responseFormat: { type: 'json_object' },
            });
            const raw = json?.choices?.[0]?.message?.content ?? '{}';
            const parsed = JSON.parse(raw);
            return {
                recommendations: Array.isArray(parsed?.recommendations) ? parsed.recommendations : [],
                warnings: Array.isArray(parsed?.warnings) ? parsed.warnings : [],
                considerations: Array.isArray(parsed?.considerations) ? parsed.considerations : [],
            };
        }
        catch (e) {
            const msg = typeof e?.message === 'string' ? e.message : 'openai_error';
            if (msg === 'missing_openai_key')
                return reply.code(500).send({ error: 'missing_openai_key' });
            return reply.code(502).send({ error: 'openai_error', detail: msg });
        }
    });
}
