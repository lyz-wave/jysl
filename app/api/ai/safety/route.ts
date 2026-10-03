import { NextRequest, NextResponse } from 'next/server';
import { buildSafetyPrompt } from '@/lib/prompts';
import { SafetyCheckResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json<SafetyCheckResult>({ level: 'none' });
    }

    // 本地关键词硬规则前置极速检测（自杀自残暴力）
    const crisisKeywords = [
      '自杀',
      '自残',
      '割腕',
      '跳楼',
      '不想活了',
      '结束生命',
      '服毒',
      '去死',
      '杀人',
      '家暴被打',
    ];
    const hasCrisis = crisisKeywords.some((kw) => userInput.includes(kw));
    if (hasCrisis) {
      return NextResponse.json<SafetyCheckResult>({
        level: 'crisis',
        reason: '检测到紧急安全与自伤自杀危机信号',
        suggestHotline: true,
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model =
      process.env.ANTHROPIC_MODEL_LIGHT || 'claude-haiku-4-5-20251001';

    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      // 离线/开发模式下，基于规则兜底
      return NextResponse.json<SafetyCheckResult>({ level: 'none' });
    }

    const prompt = buildSafetyPrompt(userInput);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 150,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json<SafetyCheckResult>({ level: 'none' });
    }

    const data = await response.json();
    const rawContent = data.content?.[0]?.text || '';
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed: SafetyCheckResult = JSON.parse(jsonMatch[0]);
      return NextResponse.json<SafetyCheckResult>(parsed);
    }

    return NextResponse.json<SafetyCheckResult>({ level: 'none' });
  } catch (err: unknown) {
    console.error('Safety Check Error:', err);
    return NextResponse.json<SafetyCheckResult>({ level: 'none' });
  }
}
