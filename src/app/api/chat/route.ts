import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { getAgent, resolveSystemPrompt } from '@/lib/agents';
import { getLanguage } from '@/lib/languages';

// In-memory conversation store keyed by sessionId.
// Each session keeps the last N messages per agent so the avatar can
// hold a coherent conversation in any persona.
type Msg = { role: 'user' | 'assistant'; content: string };
const sessions = new Map<string, Record<string, Msg[]>>();
const MAX_MESSAGES = 12;

function getHistory(sessionId: string, key: string): Msg[] {
  if (!sessions.has(sessionId)) sessions.set(sessionId, {});
  const byKey = sessions.get(sessionId)!;
  if (!byKey[key]) byKey[key] = [];
  return byKey[key];
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, agentId, avatarName, languageId, message } = await req.json();

    if (!sessionId || !agentId || !message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'sessionId, agentId, and message are required.' },
        { status: 400 }
      );
    }

    const agent = getAgent(agentId);
    const displayName = (typeof avatarName === 'string' && avatarName.trim()) || 'the assistant';
    const language = getLanguage(languageId);

    // Build the system prompt: agent persona + name + language instruction.
    // The language instruction tells the model to respond in the selected
    // language using the appropriate script.
    const systemPrompt = `${resolveSystemPrompt(agent, displayName)}

LANGUAGE: ${language.instruction}`;

    const zai = await ZAI.create();

    // Conversation history is keyed by `${agent.id}:${language.id}` so
    // switching language starts a fresh context but switching avatar doesn't.
    const history = getHistory(sessionId, `${agent.id}:${language.id}`);

    // Build messages: system prompt as assistant bootstrap, then history, then new user msg
    const messages: { role: 'assistant' | 'user'; content: string }[] = [
      { role: 'assistant', content: systemPrompt },
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
      agent: { id: agent.id, role: agent.role, voice: agent.voice, speed: agent.speed },
      language: { id: language.id, native: language.native },
      reply,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Chat failed';
    console.error('[/api/chat] error', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
