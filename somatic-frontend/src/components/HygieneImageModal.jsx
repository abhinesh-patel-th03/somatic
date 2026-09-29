import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, CheckCircle2, ImagePlus, Trash2, X } from "lucide-react";

import { normalizeLang } from "../i18n/languages";

/* ------------------------------------------------------------------ */
/*  Text in all four languages (English, Hindi, Marathi, Telugu)       */
/* ------------------------------------------------------------------ */
const TEXT = {
  en: {
    title: "Add Farm Photo and Cattle Feed",
    subtitle: (n) => `Take or upload 2 clear photos (${n}/2 added).`,
    slotFarm: "Farm Photo",
    slotFeed: "Cattle Feed",
    capture: (slot) => `Capture: ${slot}`,
    openCamera: "Open camera",
    upload: "Upload from device",
    skip: "Skip for now",
    save: "Save photos",
    saving: "Saving...",
    successTitle: "Photos saved",
    successMsg: "Farm photo and cattle feed photo have been saved successfully.",
    done: "Done",
    camUnavailable: "Camera is not available in this browser. Please use 'Upload from device'.",
    camDenied: "Could not open the camera. Please allow camera permission, or use 'Upload from device'.",
    remove: "Remove photo",
    close: "Close",
  },
  hi: {
    title: "फार्म की फोटो और पशु आहार जोड़ें",
    subtitle: (n) => `2 साफ़ फोटो लें या अपलोड करें (${n}/2 जोड़ी गईं)।`,
    slotFarm: "फार्म की फोटो",
    slotFeed: "पशु आहार",
    capture: (slot) => `फोटो खींचें: ${slot}`,
    openCamera: "कैमरा खोलें",
    upload: "डिवाइस से अपलोड करें",
    skip: "अभी छोड़ें",
    save: "फोटो सहेजें",
    saving: "सहेज रहे हैं...",
    successTitle: "फोटो सहेज ली गईं",
    successMsg: "फार्म की फोटो और पशु आहार की फोटो सफलतापूर्वक सहेज ली गईं।",
    done: "पूर्ण",
    camUnavailable: "इस ब्राउज़र में कैमरा उपलब्ध नहीं है। कृपया 'डिवाइस से अपलोड करें' का उपयोग करें।",
    camDenied: "कैमरा नहीं खुल सका। कृपया कैमरे की अनुमति दें या 'डिवाइस से अपलोड करें' का उपयोग करें।",
    remove: "फोटो हटाएँ",
    close: "बंद करें",
  },
  mr: {
    title: "फार्मचा फोटो आणि जनावरांचा चारा जोडा",
    subtitle: (n) => `2 स्पष्ट फोटो घ्या किंवा अपलोड करा (${n}/2 जोडले).`,
    slotFarm: "फार्मचा फोटो",
    slotFeed: "जनावरांचा चारा",
    capture: (slot) => `फोटो काढा: ${slot}`,
    openCamera: "कॅमेरा उघडा",
    upload: "डिव्हाइसमधून अपलोड करा",
    skip: "आत्ता वगळा",
    save: "फोटो जतन करा",
    saving: "जतन करत आहे...",
    successTitle: "फोटो जतन केले",
    successMsg: "फार्मचा फोटो आणि जनावरांच्या चाऱ्याचा फोटो यशस्वीरित्या जतन केले.",
    done: "पूर्ण",
    camUnavailable: "या ब्राउझरमध्ये कॅमेरा उपलब्ध नाही. कृपया 'डिव्हाइसमधून अपलोड करा' वापरा.",
    camDenied: "कॅमेरा उघडता आला नाही. कृपया कॅमेरा परवानगी द्या किंवा 'डिव्हाइसमधून अपलोड करा' वापरा.",
    remove: "फोटो काढून टाका",
    close: "बंद करा",
  },
  te: {
    title: "ఫార్మ్ ఫోటో మరియు పశువుల మేత జోడించండి",
    subtitle: (n) => `2 స్పష్టమైన ఫోటోలు తీయండి లేదా అప్‌లోడ్ చేయండి (${n}/2 జోడించబడ్డాయి).`,
    slotFarm: "ఫార్మ్ ఫోటో",
    slotFeed: "పశువుల మేత",
    capture: (slot) => `ఫోటో తీయండి: ${slot}`,
    openCamera: "కెమెరా తెరవండి",
    upload: "పరికరం నుండి అప్‌లోడ్ చేయండి",
    skip: "ఇప్పుడు వద్దు",
    save: "ఫోటోలను సేవ్ చేయండి",
    saving: "సేవ్ అవుతోంది...",
    successTitle: "ఫోటోలు సేవ్ అయ్యాయి",
    successMsg: "ఫార్మ్ ఫోటో మరియు పశువుల మేత ఫోటో విజయవంతంగా సేవ్ చేయబడ్డాయి.",
    done: "పూర్తయింది",
    camUnavailable: "ఈ బ్రౌజర్‌లో కెమెరా అందుబాటులో లేదు. దయచేసి 'పరికరం నుండి అప్‌లోడ్ చేయండి' ఉపయోగించండి.",
    camDenied: "కెమెరా తెరవడం సాధ్యం కాలేదు. దయచేసి కెమెరా అనుమతి ఇవ్వండి లేదా 'పరికరం నుండి అప్‌లోడ్ చేయండి' ఉపయోగించండి.",
    remove: "ఫోటోను తొలగించండి",
    close: "మూసివేయండి",
  },
};

// Used by the Dashboard button so its label follows the selected language.
export function getFarmPhotoText(lang) {
  return TEXT[normalizeLang(lang)] || TEXT.en;
}

const SLOTS = 2; // slot 0 = Farm Photo, slot 1 = Cattle Feed
const EMPTY = () => Array(SLOTS).fill(null);

/**
 * HygieneImageModal  -  "Add Farm Photo and Cattle Feed"
 * ---------------------------------------------------------------------------
 * DEMO ONLY: photos are kept in React state while the popup is open and are
 * thrown away when it closes. Nothing is uploaded or stored anywhere; the
 * "saved" message is only to show the flow.
 * ---------------------------------------------------------------------------
 */
export default function HygieneImageModal({ open, onClose }) {
  const { i18n } = useTranslation();
  const tx = getFarmPhotoText(i18n.language);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const [images, setImages] = useState(EMPTY);   // [farmPhoto, cattleFeed] as data-URLs (memory only)
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState("");   // "" | "camUnavailable" | "camDenied"
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const slotNames = [tx.slotFarm, tx.slotFeed];
  const count = images.filter(Boolean).length;
  const nextEmpty = images.findIndex((x) => !x);
  const ready = count === SLOTS;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }, []);

  const startCamera = async () => {
    setCamError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("camUnavailable");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setCamError("camDenied");
    }
  };

  // Attach the stream once the <video> element exists.
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOn]);

  // Reset everything each time the popup closes.
  useEffect(() => {
    if (!open) {
      stopCamera();
      setImages(EMPTY());
      setCamError("");
      setSaving(false);
      setSaved(false);
    }
  }, [open, stopCamera]);

  // Always release the camera when leaving the page.
  useEffect(() => stopCamera, [stopCamera]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || nextEmpty === -1) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const shot = canvas.toDataURL("image/jpeg", 0.85);

    const next = [...images];
    next[nextEmpty] = shot;
    setImages(next);
    if (next.every(Boolean)) stopCamera();
  };

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setImages((prev) => {
          const idx = prev.findIndex((x) => !x);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = reader.result;
          return next;
        });
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (i) =>
    setImages((prev) => prev.map((img, idx) => (idx === i ? null : img)));

  // FAKE save: just waits a moment, then shows the success message.
  const fakeSave = () => {
    setSaving(true);
    stopCamera();
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 900);
  };

  if (!open) return null;

  return (
    <div className="hy-overlay" role="dialog" aria-modal="true" aria-label={tx.title}>
      <div className="hy-modal">
        <button type="button" className="hy-close" onClick={onClose} aria-label={tx.close}>
          <X size={18} />
        </button>

        {saved ? (
          <div className="hy-success">
            <CheckCircle2 size={56} />
            <h2>{tx.successTitle}</h2>
            <p>{tx.successMsg}</p>
            <button type="button" className="primary-btn" onClick={onClose}>{tx.done}</button>
          </div>
        ) : (
          <>
            <h2 className="hy-title">{tx.title}</h2>
            <p className="hy-sub">{tx.subtitle(count)}</p>

            {cameraOn && (
              <div className="hy-camera">
                <video ref={videoRef} playsInline muted />
                {nextEmpty !== -1 && (
                  <button type="button" className="primary-btn hy-shutter" onClick={capture}>
                    <Camera size={16} /> {tx.capture(slotNames[nextEmpty])}
                  </button>
                )}
              </div>
            )}

            {camError && <div className="error-box">{tx[camError]}</div>}

            <div className="hy-slots">
              {images.map((img, i) => (
                <div className="hy-slot-wrap" key={i}>
                  <div className="hy-slot">
                    {img ? (
                      <>
                        <img src={img} alt={slotNames[i]} />
                        <button
                          type="button"
                          className="hy-remove"
                          onClick={() => removeImage(i)}
                          aria-label={`${tx.remove}: ${slotNames[i]}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <span>{slotNames[i]}</span>
                    )}
                  </div>
                  <small className="hy-slot-label">{slotNames[i]}</small>
                </div>
              ))}
            </div>

            {!ready && !cameraOn && (
              <div className="hy-actions">
                <button type="button" className="secondary-btn" onClick={startCamera}>
                  <Camera size={16} /> {tx.openCamera}
                </button>
                <button type="button" className="secondary-btn" onClick={() => fileRef.current?.click()}>
                  <ImagePlus size={16} /> {tx.upload}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={onFiles}
                />
              </div>
            )}

            <div className="hy-footer">
              <button type="button" className="secondary-btn" onClick={onClose}>{tx.skip}</button>
              <button type="button" className="primary-btn" disabled={!ready || saving} onClick={fakeSave}>
                {saving ? tx.saving : tx.save}
              </button>
            </div>
          </>
        )}

        <canvas ref={canvasRef} hidden />
      </div>
    </div>
  );
}
