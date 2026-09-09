module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.japps.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'No text provided' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are helping a client polish their review of a software development service called Japps.ai. Fix grammar, improve clarity, and make it sound confident and professional — but keep it in their own voice and do not add anything they did not say. Do not add fake details, superlatives, or anything that was not in the original. Return only the improved review text with no explanation, no quotes, no preamble.\n\nOriginal review:\n${text.trim()}`
        }]
      })
    });

    const data = await response.json();
    const polished = data.content?.[0]?.text?.trim();

    if (!polished) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    return res.status(200).json({ polished });

  } catch (err) {
    console.error('Polish review error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}