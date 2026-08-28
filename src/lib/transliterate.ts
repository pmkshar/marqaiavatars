/**
 * Transliteration for Indic scripts → Romanized Latin.
 * Used by the Z.ai TTS fallback (which only has Chinese/English voices).
 * The cloud TTS (Google Translate) handles Indic script directly, so
 * this is only needed when cloud TTS fails and we fall back to Z.ai.
 */

const DEVANAGARI_CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy',
};
const DEVANAGARI_VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
};
const DEVANAGARI_MATRAS: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ॉ': 'o', 'ां': 'aan', 'ाः': 'aah',
};
const DEVANAGARI_VIRAMA = '्';
const DEVANAGARI_ANUSVARA: Record<string, string> = { 'ं': 'n', 'ँ': 'n', 'ः': 'h' };
const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};
const DEVANAGARI_PUNCT: Record<string, string> = { '।': '.', '॥': '.', '॰': '.' };

const TAMIL_CONSONANTS: Record<string, string> = {
  'க': 'k', 'ங': 'ng', 'ச': 'ch', 'ஞ': 'ny',
  'ட': 't', 'ண': 'n', 'த': 'th', 'ந': 'n', 'ன': 'n',
  'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r', 'ல': 'l',
  'வ': 'v', 'ழ': 'zh', 'ள': 'l', 'ற': 'r',
  'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h', 'க்ஷ': 'ksh',
};
const TAMIL_VOWELS: Record<string, string> = {
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
  'எ': 'e', 'ஏ': 'e', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'o', 'ஔ': 'au',
};
const TAMIL_MATRAS: Record<string, string> = {
  'ா': 'aa', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
  'ெ': 'e', 'ே': 'e', 'ை': 'ai', 'ொ': 'o', 'ோ': 'o', 'ௌ': 'au',
};
const TAMIL_VIRAMA = '்';
const TAMIL_SPECIAL: Record<string, string> = { 'ஃ': 'h', 'ம்': 'm' };

const TELUGU_CONSONANTS: Record<string, string> = {
  'క': 'k', 'ఖ': 'kh', 'గ': 'g', 'ఘ': 'gh', 'ఙ': 'ng',
  'చ': 'ch', 'ఛ': 'chh', 'జ': 'j', 'ఝ': 'jh', 'ఞ': 'ny',
  'ట': 't', 'ఠ': 'th', 'డ': 'd', 'ఢ': 'dh', 'ణ': 'n',
  'త': 'th', 'థ': 'th', 'ద': 'd', 'ధ': 'dh', 'న': 'n',
  'ప': 'p', 'ఫ': 'ph', 'బ': 'b', 'భ': 'bh', 'మ': 'm',
  'య': 'y', 'ర': 'r', 'ల': 'l', 'వ': 'v',
  'శ': 'sh', 'ష': 'sh', 'స': 's', 'హ': 'h',
  'ళ': 'l', 'క్ష': 'ksh', 'ఱ': 'r',
};
const TELUGU_VOWELS: Record<string, string> = {
  'అ': 'a', 'ఆ': 'aa', 'ఇ': 'i', 'ఈ': 'ee', 'ఉ': 'u', 'ఊ': 'oo',
  'ఋ': 'ru', 'ఎ': 'e', 'ఏ': 'e', 'ఐ': 'ai', 'ఒ': 'o', 'ఓ': 'o', 'ఔ': 'au',
};
const TELUGU_MATRAS: Record<string, string> = {
  'ా': 'aa', 'ి': 'i', 'ీ': 'ee', 'ు': 'u', 'ూ': 'oo',
  'ృ': 'ru', 'ె': 'e', 'ే': 'e', 'ై': 'ai',
  'ొ': 'o', 'ో': 'o', 'ౌ': 'au',
};
const TELUGU_VIRAMA = '్';
const TELUGU_ANUSVARA: Record<string, string> = { 'ం': 'n', 'ః': 'h' };

const KANNADA_CONSONANTS: Record<string, string> = {
  'ಕ': 'k', 'ಖ': 'kh', 'ಗ': 'g', 'ಘ': 'gh', 'ಙ': 'ng',
  'ಚ': 'ch', 'ಛ': 'chh', 'ಜ': 'j', 'ಝ': 'jh', 'ಞ': 'ny',
  'ಟ': 't', 'ಠ': 'th', 'ಡ': 'd', 'ಢ': 'dh', 'ಣ': 'n',
  'ತ': 'th', 'ಥ': 'th', 'ದ': 'd', 'ಧ': 'dh', 'ನ': 'n',
  'ಪ': 'p', 'ಫ': 'ph', 'ಬ': 'b', 'ಭ': 'bh', 'ಮ': 'm',
  'ಯ': 'y', 'ರ': 'r', 'ಲ': 'l', 'ವ': 'v',
  'ಶ': 'sh', 'ಷ': 'sh', 'ಸ': 's', 'ಹ': 'h',
  'ಳ': 'l', 'ಕ್ಷ': 'ksh',
};
const KANNADA_VOWELS: Record<string, string> = {
  'ಅ': 'a', 'ಆ': 'aa', 'ಇ': 'i', 'ಈ': 'ee', 'ಉ': 'u', 'ಊ': 'oo',
  'ಋ': 'ru', 'ಎ': 'e', 'ಏ': 'e', 'ಐ': 'ai', 'ಒ': 'o', 'ಓ': 'o', 'ಔ': 'au',
};
const KANNADA_MATRAS: Record<string, string> = {
  'ಾ': 'aa', 'ಿ': 'i', 'ೀ': 'ee', 'ು': 'u', 'ೂ': 'oo',
  'ೃ': 'ru', 'ೆ': 'e', 'ೇ': 'e', 'ೈ': 'ai',
  'ೊ': 'o', 'ೋ': 'o', 'ೌ': 'au',
};
const KANNADA_VIRAMA = '್';
const KANNADA_ANUSVARA: Record<string, string> = { 'ಂ': 'n', 'ಃ': 'h' };

interface ScriptConfig {
  consonants: Record<string, string>;
  vowels: Record<string, string>;
  matras: Record<string, string>;
  virama: string;
  special?: Record<string, string>;
  digits?: Record<string, string>;
  punct?: Record<string, string>;
}

const SCRIPTS: Record<string, ScriptConfig> = {
  hi: { consonants: DEVANAGARI_CONSONANTS, vowels: DEVANAGARI_VOWELS, matras: DEVANAGARI_MATRAS, virama: DEVANAGARI_VIRAMA, special: DEVANAGARI_ANUSVARA, digits: DEVANAGARI_DIGITS, punct: DEVANAGARI_PUNCT },
  ta: { consonants: TAMIL_CONSONANTS, vowels: TAMIL_VOWELS, matras: TAMIL_MATRAS, virama: TAMIL_VIRAMA, special: TAMIL_SPECIAL },
  te: { consonants: TELUGU_CONSONANTS, vowels: TELUGU_VOWELS, matras: TELUGU_MATRAS, virama: TELUGU_VIRAMA, special: TELUGU_ANUSVARA },
  kn: { consonants: KANNADA_CONSONANTS, vowels: KANNADA_VOWELS, matras: KANNADA_MATRAS, virama: KANNADA_VIRAMA, special: KANNADA_ANUSVARA },
};

export function transliterateToRoman(text: string, languageId: string): string {
  const cfg = SCRIPTS[languageId];
  if (!cfg) return text;
  const allMaps = [cfg.consonants, cfg.vowels, cfg.matras, cfg.special || {}, cfg.digits || {}, cfg.punct || {}];
  const merged: Record<string, string> = {};
  for (const m of allMaps) Object.assign(merged, m);
  const keys = Object.keys(merged).sort((a, b) => b.length - a.length);
  let result = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const key of keys) {
      if (text.startsWith(key, i)) {
        const val = merged[key];
        if (cfg.consonants[key]) {
          result += val;
          i += key.length;
          if (i < text.length) {
            const next = text[i];
            if (next === cfg.virama) { i++; }
            else if (cfg.matras[next]) { result += cfg.matras[next]; i++; }
            else { result += 'a'; }
          } else { result += 'a'; }
          matched = true;
          break;
        }
        result += val;
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) { result += text[i]; i++; }
  }
  return result.replace(/\s+/g, ' ').replace(/([a-zA-Z])\1{3,}/g, '$1$1').trim();
}
