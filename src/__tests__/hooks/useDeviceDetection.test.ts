import { renderHook } from "@testing-library/react";
import {
  useDeviceDetection,
  useReducedMotion,
  useColorScheme,
} from "@/hooks/useDeviceDetection";

// Mock navigator
const mockNavigator = (
  userAgent: string,
  platform: string,
  maxTouchPoints = 0
) => {
  Object.defineProperty(window, "navigator", {
    writable: true,
    configurable: true,
    value: {
      userAgent,
      platform,
      maxTouchPoints,
    },
  });
};

// Mock window properties
const mockWindow = (width: number, height: number, touchSupport = false) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });

  if (touchSupport) {
    Object.defineProperty(window, "ontouchstart", {
      writable: true,
      configurable: true,
      value: {},
    });
  } else {
    delete (window as any).ontouchstart;
  }
};

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe("useDeviceDetection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should detect mobile device correctly", () => {
    mockNavigator(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      "iPhone",
      5
    );
    mockWindow(375, 667, true);

    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.orientation).toBe("portrait");
  });

  it("should detect tablet device correctly", () => {
    mockNavigator("Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)", "iPad", 5);
    mockWindow(768, 1024, true);

    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.orientation).toBe("portrait");
  });

  it("should detect desktop device correctly", () => {
    mockNavigator(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Win32",
      0
    );
    mockWindow(1920, 1080, false);

    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTouchDevice).toBe(false);
    expect(result.current.orientation).toBe("landscape");
  });

  it("should detect landscape orientation correctly", () => {
    mockNavigator(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      "iPhone",
      5
    );
    mockWindow(667, 375, true); // Landscape iPhone

    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.orientation).toBe("landscape");
  });

  it("should detect Android device correctly", () => {
    mockNavigator(
      "Mozilla/5.0 (Linux; Android 10; SM-G975F)",
      "Linux armv8l",
      5
    );
    mockWindow(360, 640, true);

    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.userAgent).toContain("Android");
  });
});

describe("useReducedMotion", () => {
  it("should return true when user prefers reduced motion", () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)"
    );
  });

  it("should return false when user does not prefer reduced motion", () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });
});

describe("useColorScheme", () => {
  it("should return dark when user prefers dark mode", () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe("dark");
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)"
    );
  });

  it("should return light when user prefers light mode", () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe("light");
  });
});
