// Single source of truth for the languages the app (and the voice assistant) supports.
// `speech` is the BCP-47 locale handed to the browser's text-to-speech engine.

export const LANGUAGES = [
  { code: "en", name: "English", speech: "en-IN" },
  { code: "hi", name: "हिन्दी", speech: "hi-IN" },
  { code: "mr", name: "मराठी", speech: "mr-IN" },
  { code: "te", name: "తెలుగు", speech: "te-IN" },
];

export const SUPPORTED_CODES = LANGUAGES.map((l) => l.code);

// "hi-IN" -> "hi". Anything unknown falls back to English.
export function normalizeLang(code) {
  const base = String(code || "en").split("-")[0].toLowerCase();
  return SUPPORTED_CODES.includes(base) ? base : "en";
}

export function speechLocale(code) {
  const lang = LANGUAGES.find((l) => l.code === normalizeLang(code));
  return lang ? lang.speech : "en-IN";
}
