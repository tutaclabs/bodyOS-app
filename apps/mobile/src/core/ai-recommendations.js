import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';
import { AsyncStorageAdapter } from './storage';
import { STORAGE_KEYS } from './keys';

const storage = new AsyncStorageAdapter();

export async function getPersonalizedRecommendations(apiKey, language = 'en') {
  if (isBackendConfigured()) {
    const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
    const protocols = await storage.load(STORAGE_KEYS.PROTOCOLS, []);

    const body = {
      goals: settings.goals || [],
      experienceLevel: settings.experienceLevel || 'beginner',
      lifestyle: settings.lifestyle || {},
      currentProtocols: protocols,
      language,
    };

    try {
      const res = await apiFetch('/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `API error: ${res.status}`);
      return {
        recommendations: Array.isArray(json?.recommendations) ? json.recommendations : [],
        warnings: Array.isArray(json?.warnings) ? json.warnings : [],
        considerations: Array.isArray(json?.considerations) ? json.considerations : [],
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get recommendations');
    }
  }

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
  const protocols = await storage.load(STORAGE_KEYS.PROTOCOLS, []);

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
    goals: settings.goals || [],
    experienceLevel: settings.experienceLevel || 'beginner',
    lifestyle: settings.lifestyle || {},
    currentProtocols: protocols.map((p) => ({
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Suggest compounds for this user profile: ${JSON.stringify(userProfile)}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'API request failed' } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  const parsed = JSON.parse(result.choices[0].message.content);

  return {
    recommendations: Array.isArray(parsed?.recommendations) ? parsed.recommendations : [],
    warnings: Array.isArray(parsed?.warnings) ? parsed.warnings : [],
    considerations: Array.isArray(parsed?.considerations) ? parsed.considerations : [],
  };
}
