export function detectRedFlags(message) {
  const redFlagKeywords = [
    'pregnancy',
    'pregnant',
    'chronic disease',
    'chronic illness',
    'severe symptoms',
    'severe pain',
    'emergency',
    'heart attack',
    'stroke',
  ];

  const lowerMessage = message.toLowerCase();
  return redFlagKeywords.some((keyword) => lowerMessage.includes(keyword));
}

export function detectBlockedRequests(message) {
  const blockedKeywords = [
    'personalized dose',
    'personalized dosing',
    'prescribe',
    'prescription',
    'treatment for',
    'cure for',
    'dose for me',
    'how much should i take',
    'recommend a dose',
  ];

  const lowerMessage = message.toLowerCase();
  return blockedKeywords.some((keyword) => lowerMessage.includes(keyword));
}

export async function chatWithBodyOS(message, apiKey, language = 'en') {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!message || !message.trim()) {
    throw new Error('Message cannot be empty');
  }

  if (detectRedFlags(message)) {
    return language === 'pt'
      ? 'Certos suplementos ou peptídeos podem não ser apropriados. Consulte um profissional de saúde qualificado.'
      : 'Certain supplements or peptides may not be appropriate. Please consult a qualified healthcare professional.';
  }

  if (detectBlockedRequests(message)) {
    return language === 'pt'
      ? 'Posso compartilhar informações educacionais gerais, mas não posso fornecer aconselhamento médico ou dosagem personalizada.'
      : "I can share general educational information, but I can't provide medical advice or personalized dosing.";
  }

  const systemPrompt =
    language === 'pt'
      ? 'Você é um Assistente de Educação em Bem-estar. Você fornece informações gerais e não médicas. Você NÃO diagnostica, prescreve ou recomenda dosagem personalizada. Mantenha as respostas educacionais, baseadas em evidências e concisas (máximo 300 palavras).'
      : 'You are a Wellness Education Assistant. You provide general, non-medical information. You do NOT diagnose, prescribe, or recommend personalized dosing. Keep responses educational, evidence-based, and concise (max 300 words).';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message.trim(),
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: 'API request failed' },
    }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
