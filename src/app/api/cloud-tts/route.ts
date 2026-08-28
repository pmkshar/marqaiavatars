import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cloud TTS proxy — fetches audio from Google Translate's TTS endpoint
 * server-side (bypassing CORS) and returns MP3 to the browser.
 * Supports all Indian languages with native pronunciation.
 */

const MAX_LEN = 180;

function chunkText(text: string, maxLen: number): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return [clean];
  const chunks: string[] = [];
  const sentences = clean.match(/[^.!?।॥]+[.!?।॥]+|\S+$/g) || [clean];
  let cur = '';
  for (const s of sentences) {
    const sTrim = s.trim();
    if (!sTrim) continue;
    if (sTrim.length > maxLen) {
      if (cur) { chunks.push(cur.trim()); cur = ''; }
      const words = sTrim.split(' ');
      for (const w of words) {
        if ((cur + ' ' + w).trim().length <= maxLen) cur = (cur + ' ' + w).trim();
        else { if (cur) chunks.push(cur.trim()); cur = w; }
      }
      continue;
    }
    if ((cur + ' ' + sTrim).trim().length <= maxLen) cur = (cur + ' ' + sTrim).trim();
    else { if (cur) chunks.push(cur.trim()); cur = sTrim; }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(Boolean);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchChunk(text: string, lang: string, retries = 3): Promise<Buffer> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'audio/mpeg, audio/*;q=0.9, */*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://translate.google.com/',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buf = Buffer.from(new Uint8Array(arrayBuffer));
      if (buf.length < 100) throw new Error('Empty audio response');
      return buf;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(500 * Math.pow(2, attempt - 1));
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  try {
    const { text, languageId } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (!languageId) {
      return NextResponse.json({ error: 'languageId is required' }, { status: 400 });
    }
    const chunks = chunkText(text, MAX_LEN);
    const buffers: Buffer[] = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const buf = await fetchChunk(chunks[i], languageId, 3);
        buffers.push(buf);
      } catch (err) {
        console.error(`[/api/cloud-tts] chunk ${i} failed:`, chunks[i].slice(0, 50), err);
      }
      if (i < chunks.length - 1) await sleep(200);
    }
    if (buffers.length === 0) {
      return NextResponse.json({ error: 'Cloud TTS failed for all chunks' }, { status: 503 });
    }
    const merged = buffers.length === 1 ? buffers[0] : Buffer.concat(buffers);
    return new NextResponse(merged, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': merged.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cloud TTS failed';
    console.error('[/api/cloud-tts] error', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
