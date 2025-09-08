"use client";

import { useState, useEffect } from "react";

interface ClickToSpeakProps {
  text: string;
}

const VIETNAMESE_DIACRITIC_REGEX = /[\u00E0-\u00E3\u1EA1\u1EA3\u00E2\u1EA5\u1EA7\u1EAD\u1EA9\u1EAB\u0103\u1EAF\u1EB1\u1EB7\u1EB3\u1EB5\u00E8-\u00EB\u1EB9\u1EBB\u00EA\u1EBF\u1EC1\u1EC7\u1EC3\u1EC5\u00EC-\u00EF\u1EC9\u0129\u00F2-\u00F5\u1ECD\u1ECF\u00F4\u1ED1\u1ED3\u1ED9\u1ED5\u1ED7\u01A1\u1EDB\u1EDD\u1EE3\u1EDF\u1EE1\u00F9-\u00FB\u1EE5\u1EE7\u01B0\u1EEB\u1EED\u1EF1\u1EEF\u1EF3-\u1EF9\u0111]/i;

function hasVietnameseDiacritics(word: string) {
  return VIETNAMESE_DIACRITIC_REGEX.test(word);
}

export default function ClickToSpeak({ text }: ClickToSpeakProps) {
  const [supported, setSupported] = useState(true);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const tokens = text.split(/(\s+)/);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  const speakWord = (word: string) => {
    if (!supported) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = hasVietnameseDiacritics(word) ? "vi-VN" : "en-US";
    utterance.rate = rate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const playAll = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    const utterances = tokens
      .filter((w) => w.trim())
      .map((w) => {
        const u = new SpeechSynthesisUtterance(w);
        u.lang = hasVietnameseDiacritics(w) ? "vi-VN" : "en-US";
        u.rate = rate;
        return u;
      });
    if (utterances.length > 0) {
      utterances[utterances.length - 1].onend = () => setIsPlaying(false);
    } else {
      setIsPlaying(false);
    }
    utterances.forEach((u) => window.speechSynthesis.speak(u));
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!supported) {
    return (
      <>
        {text}
        <p className="mt-2 text-sm text-gray-500">
          ⚠️ Trình duyệt của bạn không hỗ trợ Web Speech API.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-2 flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={playAll}
          disabled={isPlaying}
          className="rounded bg-blue-600 px-2 py-1 text-white disabled:bg-gray-400"
        >
          Play all
        </button>
        <button
          type="button"
          onClick={stop}
          className="rounded bg-red-600 px-2 py-1 text-white"
        >
          Stop
        </button>
        <label className="flex items-center gap-1">
          Speed:
          <select
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="rounded border px-1 py-0.5"
          >
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </label>
      </div>
      <div className="whitespace-pre-line">
        {tokens.map((token, i) =>
          token.trim() === "" ? (
            token
          ) : (
            <span
              key={i}
              onClick={() => speakWord(token.replace(/[.,!?;:'"()]/g, ""))}
              className="cursor-pointer hover:bg-yellow-100"
            >
              {token}
            </span>
          )
        )}
      </div>
    </>
  );
}

