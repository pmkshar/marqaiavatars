/**
 * Supported conversation languages.
 * The TTS pipeline handles UTF-8 input directly, so we just pass the
 * assistant's text through. The LLM is instructed (via the chat API)
 * to respond in the selected language using the appropriate script.
 */

export type LanguageId = 'en' | 'hi' | 'te' | 'kn' | 'ta';

export interface Language {
  id: LanguageId;
  /** English name shown in the picker */
  label: string;
  /** Native name + script, shown as a secondary label */
  native: string;
  /** BCP-47 code */
  code: string;
  /** Script name (used in the system-prompt instruction) */
  script: string;
  /** Short instruction appended to the agent's system prompt */
  instruction: string;
  /** Lucide icon flag-style emoji for the chip */
  flag: string;
}

export const LANGUAGES: Language[] = [
  {
    id: 'en',
    label: 'English',
    native: 'English',
    code: 'en',
    script: 'Latin',
    instruction: 'Respond in clear, natural English.',
    flag: '🇬🇧',
  },
  {
    id: 'hi',
    label: 'Hindi',
    native: 'हिन्दी',
    code: 'hi',
    script: 'Devanagari',
    instruction:
      'हिन्दी में पूरी तरह से जवाब दें। देवनागरी लिपि का उपयोग करें। अगर उपयोगकर्ता अंग्रेज़ी में पूछे, तो भी हिन्दी में ही जवाब दें, लेकिन तकनीकी शब्दों के लिए अंग्रेज़ी का उपयोग कर सकते हैं।',
    flag: '🇮🇳',
  },
  {
    id: 'te',
    label: 'Telugu',
    native: 'తెలుగు',
    code: 'te',
    script: 'Telugu',
    instruction:
      'తెలుగులో పూర్తిగా సమాధానం ఇవ్వండి. తెలుగు లిపిని ఉపయోగించండి. వినియోగదారు ఇంగ్లీషులో అడిగినా, తెలుగులోనే సమాధానం ఇవ్వండి, కానీ సాంకేతిక పదాల కోసం ఇంగ్లీషును ఉపయోగించవచ్చు.',
    flag: '🇮🇳',
  },
  {
    id: 'kn',
    label: 'Kannada',
    native: 'ಕನ್ನಡ',
    code: 'kn',
    script: 'Kannada',
    instruction:
      'ಕನ್ನಡದಲ್ಲಿ ಸಂಪೂರ್ಣವಾಗಿ ಉತ್ತರಿಸಿ. ಕನ್ನಡ ಲಿಪಿಯನ್ನು ಬಳಸಿ. ಬಳಕೆದಾರ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಕೇಳಿದರೂ, ಕನ್ನಡದಲ್ಲಿಯೇ ಉತ್ತರಿಸಿ, ಆದರೆ ತಾಂತ್ರಿಕ ಪದಗಳಿಗಾಗಿ ಇಂಗ್ಲಿಷ್ ಅನ್ನು ಬಳಸಬಹುದು.',
    flag: '🇮🇳',
  },
  {
    id: 'ta',
    label: 'Tamil',
    native: 'தமிழ்',
    code: 'ta',
    script: 'Tamil',
    instruction:
      'தமிழில் முழுமையாக பதிலளியுங்கள். தமிழ் எழுத்துக்களைப் பயன்படுத்துங்கள். பயனர் ஆங்கிலத்தில் கேட்டாலும், தமிழிலேயே பதிலளியுங்கள், ஆனால் தொழில்நுட்ப சொற்களுக்கு ஆங்கிலத்தைப் பயன்படுத்தலாம்.',
    flag: '🇮🇳',
  },
];

export const DEFAULT_LANGUAGE_ID: LanguageId = 'en';

export function getLanguage(id: LanguageId | string | undefined): Language {
  return LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
}
