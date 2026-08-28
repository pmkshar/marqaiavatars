import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { getAgent } from '@/lib/agents';
import { transliterateToRoman } from '@/lib/transliterate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Indic languages need transliteration to Roman for the Z.ai TTS (Chinese/English voices)
const INDIC_LANGUAGES = new Set(['hi', 'ta', 'te', 'kn']);

/**
 * Split text into chunks at sentence boundaries. The TTS API is
 * empirically unstable for long text (esp. with Devanagari / Indic
 * scripts) — 500s start appearing around 250+ chars. We keep chunks
 * small (<= 180 chars) for safety.
 */
function splitText(text: string, maxLen = 180): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  // Split on sentence boundaries (Latin + Indic)
  const sentences = clean.match(/[^.!?।॥]+[.!?।॥]+|\S+$/g) || [clean];
  let cur = '';
  for (const s of sentences) {
    const sTrim = s.trim();
    if (!sTrim) continue;
    // If a single sentence is longer than maxLen, hard-split it on commas
    // (or words as a last resort).
    if (sTrim.length > maxLen) {
      if (cur) {
        chunks.push(cur.trim());
        cur = '';
      }
      const sub = hardSplit(sTrim, maxLen);
      for (let i = 0; i < sub.length; i++) {
        if (i < sub.length - 1) chunks.push(sub[i]);
        else cur = sub[i];
      }
      continue;
    }
    if ((cur + ' ' + sTrim).trim().length <= maxLen) {
      cur = (cur + ' ' + sTrim).trim();
    } else {
      if (cur) chunks.push(cur);
      cur = sTrim;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(Boolean);
}

function hardSplit(text: string, maxLen: number): string[] {
  const out: string[] = [];
  // First try commas / semicolons / dashes
  let parts = text.split(/[,;—–]|\s-\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    let cur = '';
    for (const p of parts) {
      if ((cur + ', ' + p).length <= maxLen) {
        cur = cur ? cur + ', ' + p : p;
      } else {
        if (cur) out.push(cur);
        cur = p.length <= maxLen ? p : p.slice(0, maxLen);
      }
    }
    if (cur) out.push(cur);
  } else {
    // Last resort: word-boundary hard split
    const words = text.split(' ');
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length <= maxLen) {
        cur = (cur + ' ' + w).trim();
      } else {
        if (cur) out.push(cur);
        cur = w.length <= maxLen ? w : w.slice(0, maxLen);
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

/**
 * Re-build a clean WAV file from a possibly-non-standard input.
 *
 * The TTS provider returns WAV files with a non-standard `AIGC` metadata
 * chunk between `fmt ` and `data`. Most browsers reject WAV files with
 * unknown chunks (the audio element throws "no supported source found").
 * This function extracts the `fmt ` and `data` chunks and rebuilds a
 * clean WAV with ONLY those two chunks, in the order browsers expect.
 */
function rebuildCleanWav(buf: Buffer): Buffer | null {
  if (buf.length < 44) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buf.toString('ascii', 8, 12) !== 'WAVE') return null;

  let fmtChunk: Buffer | null = null;
  let dataPcm: Buffer | null = null;

  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const chunkData = buf.subarray(offset + 8, offset + 8 + size);
    if (id === 'fmt ') {
      fmtChunk = chunkData;
    } else if (id === 'data') {
      dataPcm = chunkData;
    }
    // Skip unknown chunks (AIGC, LIST, fact, etc.)
    offset += 8 + size + (size % 2 === 1 ? 1 : 0);
  }

  if (!fmtChunk || !dataPcm) return null;

  // Build: RIFF<size>WAVE + fmt <size><fmtData> + data<size><pcm>
  const fmtChunkSize = fmtChunk.length;
  const dataChunkSize = dataPcm.length;
  const totalSize = 4 + (8 + fmtChunkSize) + (8 + dataChunkSize);
  const out = Buffer.alloc(8 + totalSize);
  let w = 0;
  out.write('RIFF', w); w += 4;
  out.writeUInt32LE(totalSize, w); w += 4;
  out.write('WAVE', w); w += 4;
  out.write('fmt ', w); w += 4;
  out.writeUInt32LE(fmtChunkSize, w); w += 4;
  fmtChunk.copy(out, w); w += fmtChunkSize;
  if (fmtChunkSize % 2 === 1) {
    out.writeUInt8(0, w); w += 1;
  }
  out.write('data', w); w += 4;
  out.writeUInt32LE(dataChunkSize, w); w += 4;
  dataPcm.copy(out, w); w += dataChunkSize;
  return out;
}

function parseWav(buf: Buffer): { header: Buffer; pcm: Buffer } | null {
  if (buf.length < 44) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buf.toString('ascii', 8, 12) !== 'WAVE') return null;
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
  const first = blobs[0];
  const out = Buffer.alloc(first.length + totalPcm - parsed[0].pcm.length);
  first.copy(out, 0);
  const fmtSize = first.readUInt32LE(16);
  const dataChunkStart = 12 + 8 + fmtSize + (fmtSize % 2 === 1 ? 1 : 0);
  out.writeUInt32LE(out.length - 8, 4);
  out.writeUInt32LE(totalPcm, dataChunkStart + 4);
  let writeOffset = dataChunkStart + 8;
  for (const p of parsed) {
    p.pcm.copy(out, writeOffset);
    writeOffset += p.pcm.length;
  }
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateChunkWithRetry(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  chunk: string,
  voice: string,
  speed: number,
  retries = 3
): Promise<Buffer> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await zai.audio.tts.create({
        input: chunk,
        voice,
        speed,
        response_format: 'wav',
        stream: false,
      });
      const arrayBuffer = await response.arrayBuffer();
      const buf = Buffer.from(new Uint8Array(arrayBuffer));
      if (buf.length < 44) throw new Error('Empty audio response');
      return buf;
    } catch (err) {
      lastErr = err;
      // Exponential backoff: 500ms, 1000ms, 2000ms
      if (attempt < retries) {
        await sleep(500 * Math.pow(2, attempt - 1));
      }
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  try {
    const { text, agentId, voice, speed, languageId } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const agent = getAgent(agentId);
    // For Indic languages, use the English `jam` voice with transliterated text
    // (Z.ai TTS has no Indian voices — Chinese voices mispronounce Indic script)
    const isIndic = languageId && INDIC_LANGUAGES.has(languageId);
    const finalVoice = isIndic ? 'jam' : (voice || agent.voice);
    const finalSpeed = isIndic ? 0.95 : (typeof speed === 'number' ? speed : agent.speed);

    // Transliterate Indic script to Roman for the Z.ai fallback
    const ttsText = isIndic ? transliterateToRoman(text, languageId) : text;

    const zai = await ZAI.create();

    const chunks = splitText(ttsText, 180);
    const blobs: Buffer[] = [];
    const failedChunks: number[] = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const buf = await generateChunkWithRetry(zai, chunks[i], finalVoice, finalSpeed, 3);
        blobs.push(buf);
      } catch (err) {
        // If a single chunk fails after retries, skip it and continue
        // so the user gets partial audio instead of nothing.
        console.error(`[/api/tts] chunk ${i} failed, skipping:`, chunks[i].slice(0, 50), err);
        failedChunks.push(i);
      }
    }

    if (blobs.length === 0) {
      // Every chunk failed — surface a clearer error
      return NextResponse.json(
        {
          error:
            'Voice generation is temporarily unavailable for this text. Try again or shorten your message.',
        },
        { status: 503 }
      );
    }

    // Strip non-standard chunks (AIGC, etc.) from each blob so browsers
    // can decode the WAV. The TTS provider adds an AIGC watermark chunk
    // that most browsers reject with "no supported source found".
    const cleanedBlobs = blobs
      .map((b) => rebuildCleanWav(b) || b);

    // Merge if multiple chunks, then clean the merged output too (since
    // mergeWav copies the first blob's header which may still have the
    // AIGC chunk).
    let merged: Buffer;
    if (cleanedBlobs.length === 1) {
      merged = cleanedBlobs[0];
    } else {
      merged = mergeWav(cleanedBlobs);
      const reCleaned = rebuildCleanWav(merged);
      if (reCleaned) merged = reCleaned;
    }

    return new NextResponse(merged, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': merged.length.toString(),
        'Cache-Control': 'no-store',
        'X-Chunks-Total': String(chunks.length),
        'X-Chunks-Ok': String(blobs.length),
        'X-Chunks-Failed': String(failedChunks.length),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'TTS failed';
    console.error('[/api/tts] error', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
