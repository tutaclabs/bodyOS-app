export async function checkProtocolSafety(protocols, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!protocols || !Array.isArray(protocols) || protocols.length === 0) {
    return { safe: true, warnings: [], recommendations: [] };
  }

  const sanitized = protocols.map(p => ({
    name: p.name || 'Unknown',
    cycleOn: p.cycleOn || 0,
    cycleOff: p.cycleOff || 0
  }));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a biohacking safety advisor. Analyze protocols for potential interactions, contraindications, and safety concerns. Return ONLY valid JSON with this structure: {"safe": boolean, "warnings": ["warning1", "warning2"], "recommendations": ["rec1", "rec2"]}. Be concise and specific.'
        },
        {
          role: 'user',
          content: `Analyze these biohacking protocols for safety: ${JSON.stringify(sanitized)}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'API request failed' } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return {
    safe: result.safe !== false,
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
    recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
  };
}
