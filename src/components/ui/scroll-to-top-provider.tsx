"use client";

import React, { useEffect, useState } from "react";
import { TopButton } from "./top-button";

type Mode = "vh" | "px";

interface ScrollToTopProviderProps {
  /** Nếu mode="vh": số “màn hình” (vd 1 = 100% viewport height).
   *  Nếu mode="px": số pixel. */
  threshold?: number;
  mode?: Mode;
  enabled?: boolean;
  className?: string;
}

export function ScrollToTopProvider({
                                      threshold = 1,       // hiện sau khi cuộn qua ~1 màn hình
                                      mode = "vh",
                                      enabled = true,
                                      className,
                                    }: ScrollToTopProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  // Tránh mismatch SSR/hydrate
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    let ticking = false;

    const compute = () => {
      const scrollTop =
          window.scrollY || document.documentElement.scrollTop || 0;
      const vh =
          window.innerHeight || document.documentElement.clientHeight || 0;

      const thresholdPx = mode === "px" ? threshold : threshold * vh;
      setShow(scrollTop > thresholdPx);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        compute();
        ticking = false;
      });
    };

    // trạng thái ban đầu
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, threshold, mode]);

  const scrollToTop = () => {
    const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  if (!enabled || !mounted || !show) return null;

  return (
      <TopButton
          onClick={scrollToTop}
          className={className}
          aria-label="Cuộn lên đầu trang"
      />
  );
}


