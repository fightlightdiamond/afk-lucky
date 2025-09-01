import { useState, useEffect } from "react";

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  userAgent: string;
  platform: string;
  orientation: "portrait" | "landscape";
}

/**
 * Hook to detect device type and capabilities
 */
export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        userAgent: "",
        platform: "",
        orientation: "landscape",
      };
    }

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Mobile detection
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileUA = mobileRegex.test(userAgent);

    // Tablet detection (more specific)
    const tabletRegex = /iPad|Android(?=.*Mobile)|Tablet/i;
    const isTabletUA =
      tabletRegex.test(userAgent) ||
      (isTouchDevice && window.innerWidth >= 768 && window.innerWidth <= 1024);

    // Screen size based detection
    const screenWidth = window.innerWidth;
    const isMobileScreen = screenWidth < 768;
    const isTabletScreen = screenWidth >= 768 && screenWidth < 1024;

    // Combine UA and screen size detection
    const isMobile = isMobileUA || (isMobileScreen && !isTabletUA);
    const isTablet = isTabletUA || (isTabletScreen && isTouchDevice);
    const isDesktop = !isMobile && !isTablet;

    const orientation =
      window.innerHeight > window.innerWidth ? "portrait" : "landscape";

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      userAgent,
      platform,
      orientation,
    };
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // Mobile detection
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(userAgent);

      // Tablet detection
      const tabletRegex = /iPad|Android(?=.*Mobile)|Tablet/i;
      const isTabletUA =
        tabletRegex.test(userAgent) ||
        (isTouchDevice &&
          window.innerWidth >= 768 &&
          window.innerWidth <= 1024);

      // Screen size based detection
      const screenWidth = window.innerWidth;
      const isMobileScreen = screenWidth < 768;
      const isTabletScreen = screenWidth >= 768 && screenWidth < 1024;

      // Combine UA and screen size detection
      const isMobile = isMobileUA || (isMobileScreen && !isTabletUA);
      const isTablet = isTabletUA || (isTabletScreen && isTouchDevice);
      const isDesktop = !isMobile && !isTablet;

      const orientation =
        window.innerHeight > window.innerWidth ? "portrait" : "landscape";

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        userAgent,
        platform,
        orientation,
      });
    };

    // Update on resize and orientation change
    const handleResize = () => updateDeviceInfo();
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect user's color scheme preference
 */
export function useColorScheme(): "light" | "dark" | null {
  const [colorScheme, setColorScheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setColorScheme(mediaQuery.matches ? "dark" : "light");

    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return colorScheme;
}
