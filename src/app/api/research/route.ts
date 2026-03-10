import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface ResearchRequest {
  query: string;
  model: string;
  provider: string;
  apiKey: string;
}

interface PerplexityMessage {
  role: string;
  content: string;
}

interface PerplexityChoice {
  message: PerplexityMessage;
  finish_reason: string;
}

interface PerplexityResponse {
  choices: PerplexityChoice[];
  citations?: string[];
}

interface OpenAIMessage {
  role: string;
  content: string;
}

interface OpenAIChoice {
  message: OpenAIMessage;
  finish_reason: string;
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}

interface GeminiContent {
  parts: { text: string }[];
  role: string;
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string;
  groundingMetadata?: {
    webSearchQueries?: string[];
    searchEntryPoint?: { renderedContent: string };
  };
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
}

async function queryPerplexity(query: string, model: string, apiKey: string): Promise<{ answer: string; citations: string[] }> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional research assistant specializing in financial and business data. Provide accurate, data-driven, and well-cited answers. Format your response clearly with key findings, relevant statistics, and actionable insights.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      return_citations: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as PerplexityResponse;
  return {
    answer: data.choices[0]?.message?.content || '',
    citations: data.citations || [],
  };
}

async function queryOpenAI(query: string, model: string, apiKey: string): Promise<{ answer: string; citations: string[] }> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a professional research assistant specializing in financial and business data. Provide accurate, data-driven answers with specific statistics, sources, and actionable insights.',
      },
      {
        role: 'user',
        content: query,
      },
    ],
  };

  if (model === 'gpt-4o-search-preview') {
    // web_search_options enables live web search; empty object uses default search settings
    body.web_search_options = {};
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as OpenAIResponse;
  return {
    answer: data.choices[0]?.message?.content || '',
    citations: [],
  };
}

async function queryGemini(query: string, model: string, apiKey: string): Promise<{ answer: string; citations: string[] }> {
  const body: Record<string, unknown> = {
    contents: [
      {
        role: 'user',
        parts: [{ text: query }],
      },
    ],
    systemInstruction: {
      parts: [{ text: 'You are a professional research assistant specializing in financial and business data. Provide accurate, data-driven answers with specific statistics and actionable insights.' }],
    },
    tools: [{ googleSearch: {} }],
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as GeminiResponse;
  const candidate = data.candidates?.[0];
  const answer = candidate?.content?.parts?.map((p) => p.text).join('') || '';
  const queries = candidate?.groundingMetadata?.webSearchQueries || [];

  return { answer, citations: queries };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: ResearchRequest;

  try {
    body = await request.json() as ResearchRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { query, model, provider, apiKey } = body;

  if (!query || !model || !provider || !apiKey) {
    return NextResponse.json({ error: 'Missing required fields: query, model, provider, apiKey' }, { status: 400 });
  }

  if (query.length > 2000) {
    return NextResponse.json({ error: 'Query too long. Maximum 2000 characters.' }, { status: 400 });
  }

  try {
    let result: { answer: string; citations: string[] };

    if (provider === 'perplexity') {
      result = await queryPerplexity(query, model, apiKey);
    } else if (provider === 'openai') {
      result = await queryOpenAI(query, model, apiKey);
    } else if (provider === 'google') {
      result = await queryGemini(query, model, apiKey);
    } else {
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
