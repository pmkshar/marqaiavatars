/**
 * Cloud TTS for ALL languages (English + Indian languages).
 * Calls our /api/cloud-tts proxy which fetches audio from Google
 * Translate's TTS endpoint server-side (bypassing CORS).
 * Returns MP3 audio with native pronunciation for Hindi, Tamil,
 * Telugu, Kannada, and English.
 */
const SUPPORTED_LANGS = new Set(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa']);

export async function fetchCloudTTS(text: string, languageId: string): Promise<Blob> {
  if (!SUPPORTED_LANGS.has(languageId)) {
    throw new Error(`Cloud TTS not supported for language: ${languageId}`);
  }
  const res = await fetch('/api/cloud-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, languageId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Cloud TTS failed (${res.status})`);
  }
  const blob = await res.blob();
  if (!blob.type.startsWith('audio/') && blob.size < 1000) {
    const text = await blob.text();
    throw new Error(text.slice(0, 100) || 'Invalid audio response');
  }
  return blob;
}
