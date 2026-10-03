import { NextRequest, NextResponse } from 'next/server';
import {
  buildRoundtablePrompt,
  getMockRoundtable,
  RoundtableInput,
  RoundtableResponse,
} from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const body: RoundtableInput = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL_HEAVY || 'claude-sonnet-5';

    // 如果未配置 API Key，直接无缝走本地高质量 Mock 数据，保障应用开箱即用
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      const mockResult = getMockRoundtable(body);
      return NextResponse.json({
        success: true,
        source: 'mock',
        data: mockResult,
      });
    }

    const prompt = buildRoundtablePrompt(body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Anthropic API 请求非200，降级为 Mock 数据:', errorText);
      const fallback = getMockRoundtable(body);
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        data: fallback,
        warning: '风太大了没听清，森林精灵们为你带来了暖心回应',
      });
    }

    const data = await response.json();
    const rawContent = data.content?.[0]?.text || '';

    // 解析 JSON 输出
    try {
      // 提取 JSON 块
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: RoundtableResponse = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          success: true,
          source: 'claude',
          data: parsed,
        });
      }
    } catch (parseErr) {
      console.warn('JSON 解析失败，降级为 Mock:', parseErr, rawContent);
    }

    // 解析失败兜底
    const fallback = getMockRoundtable(body);
    return NextResponse.json({
      success: true,
      source: 'mock_fallback',
      data: fallback,
    });
  } catch (err: unknown) {
    console.error('Roundtable API Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: '风太大了没听清，能再说一次吗？',
      },
      { status: 500 }
    );
  }
}
