import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pause, Play, Square } from "lucide-react";

import { LANGUAGES, normalizeLang, speechLocale } from "../i18n/languages";
import { getUiText } from "../data/riskReports";
import doctorImg from "../assets/doctor-assistant.png";
// Marathi has few TTS voices; Hindi (same Devanagari script) is the closest stand-in.
const FALLBACK_LOCALES = { mr: "hi-IN" };

function voiceScore(voice, locale) {
  const vl = String(voice.lang || "").replace("_", "-").toLowerCase();
  const target = locale.toLowerCase();
  const base = target.split("-")[0];

  let score = -1;
  if (vl === target) score = 100;
  else if (base === "en" && /india/i.test(voice.name || "")) score = 90;
  else if (vl.split("-")[0] === base) score = 40;
  if (score < 0) return -1;

  // Prefer the higher-quality neural / online voices when there is a choice.
  if (/natural|online|neural/i.test(voice.name || "")) score += 10;
  if (/google/i.test(voice.name || "")) score += 5;
  return score;
}

function bestVoice(voices, locale) {
  let best = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = voiceScore(v, locale);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return { voice: best, score: bestScore };
}

// Returns { voice, exact }. `exact` is false when we had to fall back.
function pickVoice(voices, lang) {
  const locale = speechLocale(lang);
  const isEnglish = lang === "en";
  const primary = bestVoice(voices, locale);

  // English: only an Indian-English voice counts as "exact" (score >= 90).
  // Other languages: any voice for that language counts.
  const exactThreshold = isEnglish ? 90 : 40;
  if (primary.voice && primary.score >= exactThreshold) {
    return { voice: primary.voice, exact: true };
  }

  const fallbackLocale = FALLBACK_LOCALES[lang];
  if (fallbackLocale) {
    const fb = bestVoice(voices, fallbackLocale);
    if (fb.voice) return { voice: fb.voice, exact: false };
  }

  if (primary.voice) return { voice: primary.voice, exact: false };
  return { voice: null, exact: false };
}

function AssistantLogo() {
  return <img src={doctorImg} alt="" className="va-avatar" aria-hidden="true" />;
}

const canSpeak = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

export default function VoiceAssistant({ chunks = [] }) {
  const { i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);
  const locale = speechLocale(lang);
  const ui = getUiText(lang);
  const langName = (LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]).name;

  const [supported] = useState(canSpeak);
  const [status, setStatus] = useState("idle"); // idle | speaking | paused
  const [current, setCurrent] = useState(-1);
  const [voiceInfo, setVoiceInfo] = useState({ name: "", exact: true });

  const sessionRef = useRef(0);   // bumps every play/stop so stale callbacks can be ignored
  const utterRef = useRef(null);  // keeps the active utterance alive (Chrome GC bug)
  const chunksRef = useRef(chunks);
  chunksRef.current = chunks;

  // Ask the browser to load its voice list early (it loads asynchronously).
  useEffect(() => {
    if (!supported) return undefined;
    const synth = window.speechSynthesis;
    const warm = () => synth.getVoices();
    warm();
    synth.addEventListener?.("voiceschanged", warm);
    return () => synth.removeEventListener?.("voiceschanged", warm);
  }, [supported]);

  const cancelSpeech = useCallback(() => {
    sessionRef.current += 1;
    if (canSpeak()) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume?.();
    }
  }, []);

  const stop = useCallback(() => {
    cancelSpeech();
    setStatus("idle");
    setCurrent(-1);
  }, [cancelSpeech]);

  // Language changed while talking -> stop, so the next play uses the new language.
  useEffect(() => {
    stop();
  }, [lang, stop]);

  // Leaving the page -> stop talking.
  useEffect(() => cancelSpeech, [cancelSpeech]);

  const play = useCallback(() => {
    if (!supported) return;
    const list = chunksRef.current;
    if (!list || list.length === 0) return;

    const synth = window.speechSynthesis;
    cancelSpeech();
    const session = sessionRef.current;

    const { voice, exact } = pickVoice(synth.getVoices(), lang);
    setVoiceInfo({ name: voice ? voice.name : "", exact });
    setStatus("speaking");
    setCurrent(0);

    const speakAt = (i) => {
      if (session !== sessionRef.current) return;
      if (i >= list.length) {
        setStatus("idle");
        setCurrent(-1);
        return;
      }

      const u = new SpeechSynthesisUtterance(list[i]);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = locale;
      }
      u.rate = 0.92;
      u.pitch = 1;
      u.volume = 1;

      u.onstart = () => {
        if (session === sessionRef.current) setCurrent(i);
      };
      u.onend = () => speakAt(i + 1);
      u.onerror = (e) => {
        if (session !== sessionRef.current) return;
        if (e && (e.error === "interrupted" || e.error === "canceled")) return;
        setStatus("idle");
        setCurrent(-1);
      };

      utterRef.current = u;
      synth.speak(u);
    };

    // Small delay: Chrome can drop speak() called immediately after cancel().
    window.setTimeout(() => speakAt(0), 80);
  }, [supported, lang, locale, cancelSpeech]);

  const togglePause = useCallback(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (status === "speaking") {
      synth.pause();
      setStatus("paused");
    } else if (status === "paused") {
      synth.resume();
      setStatus("speaking");
    }
  }, [supported, status]);

  const onOrbClick = () => {
    if (status === "idle") play();
    else togglePause();
  };

  const active = status !== "idle";
  const list = chunksRef.current || [];
  const progress = current >= 0 && list.length ? Math.round(((current + 1) / list.length) * 100) : 0;
  const orbLabel = !supported
    ? ui.unsupported
    : status === "idle"
    ? ui.hint
    : status === "speaking"
    ? ui.pause
    : ui.resume;

  return (
    <div className="va-root" role="complementary" aria-label={ui.assistantName}>
      {active && (
        <div className="va-card">
          <div className="va-card-head">
            <strong>{ui.assistantName}</strong>
            <span className="va-status" aria-live="polite">
              {status === "paused" ? ui.paused : ui.speaking}
            </span>
          </div>

          <p className="va-line">{current >= 0 ? list[current] : ""}</p>

          <div className="va-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="va-controls">
            <button type="button" className="va-btn" onClick={togglePause}>
              {status === "paused" ? <Play size={14} /> : <Pause size={14} />}
              {status === "paused" ? ui.resume : ui.pause}
            </button>
            <button type="button" className="va-btn" onClick={stop}>
              <Square size={14} />
              {ui.stop}
            </button>
          </div>

          <small className="va-meta">
            {ui.voiceLabel}: {voiceInfo.name || "default"} · {langName}
          </small>
          {!voiceInfo.exact && <small className="va-warn">{ui.noVoice}</small>}
        </div>
      )}

      <div className="va-row">
        <button
          type="button"
          className={`va-orb ${status === "speaking" ? "is-speaking" : ""}`}
          onClick={onOrbClick}
          disabled={!supported}
          title={orbLabel}
          aria-label={orbLabel}
        >
          <span className="va-ring" />
          <span className="va-ring" />
          <span className="va-ring" />
          <AssistantLogo />
        </button>

        {!active && <span className="va-hint">{supported ? ui.hint : ui.unsupported}</span>}
      </div>
    </div>
  );
}

