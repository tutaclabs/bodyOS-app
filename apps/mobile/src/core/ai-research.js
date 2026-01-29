export async function askResearchQuestion(question, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!question || !question.trim()) {
    throw new Error('Question cannot be empty');
  }

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
          content: 'You are a biohacking research assistant specializing in peptides, compounds, and longevity protocols. Provide evidence-based, concise answers. Always emphasize safety considerations and cite general research findings when relevant. Keep responses under 300 words.'
        },
        {
          role: 'user',
          content: question.trim()
        }
      ],
      max_tokens: 400,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'API request failed' } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
