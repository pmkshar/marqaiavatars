import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { getAgent } from '@/lib/agents';

export const runtime = 'nodejs';
// Always regenerate speech — never cache a stale audio blob
export const dynamic = 'force-dynamic';

// Split long text into <=900 char chunks at sentence boundaries so we stay
// well under the 1024-char TTS limit per request, then concatenate the
// resulting WAV blobs.
function splitText(text: string, maxLen = 900): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  const sentences = clean.match(/[^.!?。！？]+[.!?。！？]+|\S+$/g) || [clean];
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length <= maxLen) {
      cur += s;
    } else {
      if (cur) chunks.push(cur.trim());
      cur = s.length > maxLen ? s.slice(0, maxLen) : s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

// Minimal WAV header parser — we only need to merge PCM payloads that share
// the same format. Stratus TTS returns 24kHz 16-bit mono WAV.
function parseWav(buf: Buffer): { header: Buffer; pcm: Buffer } | null {
  if (buf.length < 44) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buf.toString('ascii', 8, 12) !== 'WAVE') return null;
  // Find the "data" chunk
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'data') {
      const header = buf.subarray(0, offset + 8);
      const pcm = buf.subarray(offset + 8, offset + 8 + size);
      return { header, pcm };
    }
    offset += 8 + size + (size % 2 === 1 ? 1 : 0);
  }
  return null;
}

function mergeWav(blobs: Buffer[]): Buffer {
  if (blobs.length === 1) return blobs[0];
  const parsed = blobs.map(parseWav).filter(Boolean) as { header: Buffer; pcm: Buffer }[];
  if (parsed.length === 0) return blobs[0];
  const totalPcm = parsed.reduce((sum, p) => sum + p.pcm.length, 0);
  // Reuse the first blob's RIFF/fmt header, rewrite the sizes
  const first = blobs[0];
  const out = Buffer.alloc(first.length + totalPcm - parsed[0].pcm.length);
  first.copy(out, 0);
  // RIFF chunk size = 4 + (8 + fmt_chunk_size) + (8 + data_size)
  const fmtSize = first.readUInt32LE(16);
  const dataChunkStart = 12 + 8 + fmtSize + (fmtSize % 2 === 1 ? 1 : 0);
  out.writeUInt32LE(out.length - 8, 4); // RIFF size
  out.writeUInt32LE(totalPcm, dataChunkStart + 4); // data size
  let writeOffset = dataChunkStart + 8;
  for (const p of parsed) {
    p.pcm.copy(out, writeOffset);
    writeOffset += p.pcm.length;
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const { text, agentId, voice, speed } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const agent = getAgent(agentId);
    const finalVoice = voice || agent.voice;
    const finalSpeed = typeof speed === 'number' ? speed : agent.speed;

    const zai = await ZAI.create();

    const chunks = splitText(text, 900);
    const blobs: Buffer[] = [];

    for (const chunk of chunks) {
      const response = await zai.audio.tts.create({
        input: chunk,
        voice: finalVoice,
        speed: finalSpeed,
        response_format: 'wav',
        stream: false,
      });
      const arrayBuffer = await response.arrayBuffer();
      blobs.push(Buffer.from(new Uint8Array(arrayBuffer)));
    }

    const merged = blobs.length === 1 ? blobs[0] : mergeWav(blobs);

    return new NextResponse(merged, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': merged.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'TTS failed';
    console.error('[/api/tts] error', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
