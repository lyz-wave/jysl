import {
  buildRoundtablePrompt,
  getMockRoundtable,
  buildDistillPrompt,
  getMockDistill,
  buildFollowupPrompt,
  getMockFollowup,
  buildSafetyPrompt,
  RoundtableInput,
  DistillInput,
  FollowupInput,
} from '../lib/prompts';
import { Memory, SafetyCheckResult } from '../lib/types';

export interface Env {
  ASSETS: { fetch: typeof fetch };
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL_HEAVY?: string;
  ANTHROPIC_MODEL_LIGHT?: string;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      // OPTIONS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      // 1. 安全检查 API
      if (url.pathname === '/api/ai/safety' && request.method === 'POST') {
        try {
          const { userInput } = (await request.json().catch(() => ({}))) as { userInput?: string };
        if (!userInput || typeof userInput !== 'string') {
          return jsonResponse({ level: 'none' });
        }

        const crisisKeywords = [
          '自杀', '自残', '割腕', '跳楼', '不想活了',
          '结束生命', '服毒', '去死', '杀人', '家暴被打'
        ];
        if (crisisKeywords.some((kw) => userInput.includes(kw))) {
          return jsonResponse({
            level: 'crisis',
            reason: '检测到紧急安全与自伤自杀危机信号',
            suggestHotline: true,
          });
        }

        const apiKey = env.ANTHROPIC_API_KEY;
        if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
          return jsonResponse({ level: 'none' });
        }

        const prompt = buildSafetyPrompt(userInput);
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: env.ANTHROPIC_MODEL_LIGHT || 'claude-haiku-4-5-20251001',
            max_tokens: 150,
            temperature: 0,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!resp.ok) return jsonResponse({ level: 'none' });
        const data = (await resp.json()) as { content?: Array<{ text?: string }> };
        const raw = data.content?.[0]?.text || '';
        const match = raw.match(/\{[\s\S]*\}/);
        const parsed: SafetyCheckResult = match ? JSON.parse(match[0]) : { level: 'none' };
        return jsonResponse(parsed);
      } catch (e) {
        return jsonResponse({ level: 'none' });
      }
    }

    // 2. 动物圆桌讨论 API
    if (url.pathname === '/api/ai/roundtable' && request.method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as RoundtableInput;
        const apiKey = env.ANTHROPIC_API_KEY;
        const model = env.ANTHROPIC_MODEL_HEAVY || 'claude-sonnet-5';

        if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
          return jsonResponse({
            success: true,
            source: 'mock',
            data: getMockRoundtable(body),
          });
        }

        const prompt = buildRoundtablePrompt(body);
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
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

        if (!resp.ok) {
          return jsonResponse({
            success: true,
            source: 'mock_fallback',
            data: getMockRoundtable(body),
          });
        }

        const data = (await resp.json()) as { content?: Array<{ text?: string }> };
        const raw = data.content?.[0]?.text || '';
        const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : getMockRoundtable(body);
        return jsonResponse({
          success: true,
          source: 'claude',
          data: parsed,
        });
      } catch (e) {
        return jsonResponse({
          success: true,
          source: 'mock_fallback',
          data: getMockRoundtable(),
        });
      }
    }

    // 3. 追问对话 API
    if (url.pathname === '/api/ai/followup' && request.method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as FollowupInput;
        const apiKey = env.ANTHROPIC_API_KEY;
        const model = env.ANTHROPIC_MODEL_HEAVY || 'claude-sonnet-5';

        if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
          return jsonResponse({
            success: true,
            source: 'mock',
            reply: getMockFollowup(body),
          });
        }

        const prompt = buildFollowupPrompt(body);
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
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

        if (!resp.ok) {
          return jsonResponse({
            success: true,
            source: 'mock_fallback',
            reply: getMockFollowup(body),
          });
        }

        const data = (await resp.json()) as { content?: Array<{ text?: string }> };
        const reply = data.content?.[0]?.text?.trim() || getMockFollowup(body);
        return jsonResponse({
          success: true,
          source: 'claude',
          reply,
        });
      } catch (e) {
        return jsonResponse({
          success: true,
          source: 'mock_fallback',
          reply: '我一直在你身边，静静听你说...',
        });
      }
    }

    // 4. 成长年轮提炼 API
    if (url.pathname === '/api/ai/distill' && request.method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as DistillInput;
        const apiKey = env.ANTHROPIC_API_KEY;
        const model = env.ANTHROPIC_MODEL_HEAVY || 'claude-sonnet-5';
        const todayDate = new Date().toISOString().split('T')[0];
        const generatedId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
          const mockResult = getMockDistill(body);
          const memory: Memory = {
            id: generatedId,
            sessionId: body.sessionId || 'session',
            date: todayDate,
            moodBefore: body.moodBefore,
            moodAfter: body.moodAfter,
            ...mockResult,
          };
          return jsonResponse({
            success: true,
            source: 'mock',
            data: memory,
          });
        }

        const prompt = buildDistillPrompt(body);
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
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

        if (!resp.ok) {
          const fallback = getMockDistill(body);
          const memory: Memory = {
            id: generatedId,
            sessionId: body.sessionId || 'session',
            date: todayDate,
            moodBefore: body.moodBefore,
            moodAfter: body.moodAfter,
            ...fallback,
          };
          return jsonResponse({
            success: true,
            source: 'mock_fallback',
            data: memory,
          });
        }

        const data = (await resp.json()) as { content?: Array<{ text?: string }> };
        const raw = data.content?.[0]?.text || '';
        const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : getMockDistill(body);
        const memory: Memory = {
          id: generatedId,
          sessionId: body.sessionId || 'session',
          date: todayDate,
          moodBefore: body.moodBefore,
          moodAfter: body.moodAfter,
          ...parsed,
        };
        return jsonResponse({
          success: true,
          source: 'claude',
          data: memory,
        });
      } catch (e) {
        return jsonResponse({
          success: true,
          source: 'mock_fallback',
          data: {
            id: `mem_${Date.now()}`,
            sessionId: 'error',
            date: new Date().toISOString().split('T')[0],
            ...getMockDistill(),
          },
        });
      }
    }

    // 所有其他请求直接交付 Cloudflare Static Assets 全球 CDN 加速
    return env.ASSETS.fetch(request);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(`Worker Internal Error: ${errorMsg}`, { status: 500 });
  }
  },
};
