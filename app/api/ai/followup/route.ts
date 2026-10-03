import { NextRequest, NextResponse } from 'next/server';
import {
  buildFollowupPrompt,
  getMockFollowup,
  FollowupInput,
} from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const body: FollowupInput = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL_HEAVY || 'claude-sonnet-5';

    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      const mockResult = getMockFollowup(body);
      return NextResponse.json({
        success: true,
        source: 'mock',
        reply: mockResult,
      });
    }

    const prompt = buildFollowupPrompt(body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.warn('Followup API error, fallback to mock');
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        reply: getMockFollowup(body),
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text?.trim() || getMockFollowup(body);

    return NextResponse.json({
      success: true,
      source: 'claude',
      reply,
    });
  } catch (err: unknown) {
    console.error('Followup API Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: '风太大了没听清，能再说一次吗？',
      },
      { status: 500 }
    );
  }
}
