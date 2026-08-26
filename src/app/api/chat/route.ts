import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { getAgent } from '@/lib/agents';

// In-memory conversation store keyed by sessionId.
// Each session keeps the last N messages per agent so the avatar can
// hold a coherent conversation in any persona.
type Msg = { role: 'user' | 'assistant'; content: string };
const sessions = new Map<string, Record<string, Msg[]>>();
const MAX_MESSAGES = 12;

function getHistory(sessionId: string, agentId: string): Msg[] {
  if (!sessions.has(sessionId)) sessions.set(sessionId, {});
  const byAgent = sessions.get(sessionId)!;
  if (!byAgent[agentId]) byAgent[agentId] = [];
  return byAgent[agentId];
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, agentId, message } = await req.json();

    if (!sessionId || !agentId || !message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'sessionId, agentId, and message are required.' },
        { status: 400 }
      );
    }

    const agent = getAgent(agentId);

    const zai = await ZAI.create();

    const history = getHistory(sessionId, agent.id);

    // Build messages: system prompt as assistant bootstrap, then history, then new user msg
    const messages: { role: 'assistant' | 'user'; content: string }[] = [
      { role: 'assistant', content: agent.systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      'I\u2019m here \u2014 could you rephrase that?';

    // Save the exchange in history (trim to last MAX_MESSAGES pairs)
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: reply });
    if (history.length > MAX_MESSAGES * 2) {
      history.splice(0, history.length - MAX_MESSAGES * 2);
    }

    return NextResponse.json({
      agent: { id: agent.id, name: agent.name, role: agent.role, voice: agent.voice, speed: agent.speed },
      reply,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Chat failed';
    console.error('[/api/chat] error', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
