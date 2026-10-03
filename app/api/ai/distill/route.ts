import { NextRequest, NextResponse } from 'next/server';
import {
  buildDistillPrompt,
  getMockDistill,
  DistillInput,
  DistillResponse,
} from '@/lib/prompts';
import { Memory } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: DistillInput = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL_HEAVY || 'claude-sonnet-5';

    const todayDate = new Date().toISOString().split('T')[0];
    const generatedId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 未配置 API Key 时使用本地高质量 Mock 数据，保证永远可运行
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      const mockResult = getMockDistill(body);
      const memory: Memory = {
        id: generatedId,
        sessionId: body.sessionId,
        date: todayDate,
        moodBefore: body.moodBefore,
        moodAfter: body.moodAfter,
        ...mockResult,
      };

      return NextResponse.json({
        success: true,
        source: 'mock',
        data: memory,
      });
    }

    const prompt = buildDistillPrompt(body);

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
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Anthropic API 请求异常，降级为本地提炼:', errorText);
      const fallback = getMockDistill(body);
      const memory: Memory = {
        id: generatedId,
        sessionId: body.sessionId,
        date: todayDate,
        moodBefore: body.moodBefore,
        moodAfter: body.moodAfter,
        ...fallback,
      };
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        data: memory,
      });
    }

    const data = await response.json();
    const rawContent = data.content?.[0]?.text || '';

    // 解析 JSON 输出
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: DistillResponse = JSON.parse(jsonMatch[0]);
        const memory: Memory = {
          id: generatedId,
          sessionId: body.sessionId,
          date: todayDate,
          moodBefore: body.moodBefore,
          moodAfter: body.moodAfter,
          ...parsed,
        };
        return NextResponse.json({
          success: true,
          source: 'claude',
          data: memory,
        });
      }
    } catch (parseErr) {
      console.warn('提炼结果 JSON 解析异常，降级为 Mock:', parseErr, rawContent);
    }

    // 兜底返回
    const fallback = getMockDistill(body);
    const memory: Memory = {
      id: generatedId,
      sessionId: body.sessionId,
      date: todayDate,
      moodBefore: body.moodBefore,
      moodAfter: body.moodAfter,
      ...fallback,
    };
    return NextResponse.json({
      success: true,
      source: 'mock_fallback',
      data: memory,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Distill route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Distill service error' },
      { status: 500 }
    );
  }
}
