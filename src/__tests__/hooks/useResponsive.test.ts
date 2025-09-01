import { renderHook, act } from "@testing-library/react";
import { useResponsive, BREAKPOINTS } from "@/hooks/useResponsive";

// Mock window.innerWidth and window.innerHeight
const mockWindowSize = (width: number, height: number) => {
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
};

// Mock window.addEventListener and removeEventListener
const mockEventListener = () => {
  const listeners: { [key: string]: EventListener[] } = {};

  window.addEventListener = jest.fn(
    (event: string, listener: EventListener) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(listener);
    }
  );

  window.removeEventListener = jest.fn(
    (event: string, listener: EventListener) => {
      if (listeners[event]) {
        const index = listeners[event].indexOf(listener);
        if (index > -1) listeners[event].splice(index, 1);
      }
    }
  );

  return {
    trigger: (event: string) => {
      if (listeners[event]) {
        listeners[event].forEach((listener) => listener(new Event(event)));
      }
    },
  };
};

describe("useResponsive", () => {
  let eventMock: ReturnType<typeof mockEventListener>;

  beforeEach(() => {
    eventMock = mockEventListener();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return correct initial values for mobile screen", () => {
    mockWindowSize(375, 667); // iPhone size

    const { result } = renderHook(() => useResponsive());

    expect(result.current.screenSize).toEqual({ width: 375, height: 667 });
    expect(result.current.currentBreakpoint).toBe("xs");
    expect(result.current.isXs).toBe(true);
    expect(result.current.isSm).toBe(false);
    expect(result.current.isSmUp).toBe(false);
    expect(result.current.isSmDown).toBe(true);
  });

  it("should return correct values for tablet screen", () => {
    mockWindowSize(768, 1024); // iPad size

    const { result } = renderHook(() => useResponsive());

    expect(result.current.screenSize).toEqual({ width: 768, height: 1024 });
    expect(result.current.currentBreakpoint).toBe("md");
    expect(result.current.isMd).toBe(true);
    expect(result.current.isMdUp).toBe(true);
    expect(result.current.isMdDown).toBe(false);
  });

  it("should return correct values for desktop screen", () => {
    mockWindowSize(1920, 1080); // Desktop size

    const { result } = renderHook(() => useResponsive());

    expect(result.current.screenSize).toEqual({ width: 1920, height: 1080 });
    expect(result.current.currentBreakpoint).toBe("2xl");
    expect(result.current.is2Xl).toBe(true);
    expect(result.current.is2XlUp).toBe(true);
    expect(result.current.isLgUp).toBe(true);
  });

  it("should update values when window is resized", () => {
    mockWindowSize(375, 667); // Start with mobile

    const { result } = renderHook(() => useResponsive());

    expect(result.current.currentBreakpoint).toBe("xs");

    // Resize to desktop
    act(() => {
      mockWindowSize(1200, 800);
      eventMock.trigger("resize");
    });

    expect(result.current.screenSize).toEqual({ width: 1200, height: 800 });
    expect(result.current.currentBreakpoint).toBe("xl");
    expect(result.current.isXl).toBe(true);
  });

  it("should handle all breakpoints correctly", () => {
    const testCases = [
      { width: 400, expected: "xs" },
      { width: 640, expected: "sm" },
      { width: 768, expected: "md" },
      { width: 1024, expected: "lg" },
      { width: 1280, expected: "xl" },
      { width: 1536, expected: "2xl" },
    ];

    testCases.forEach(({ width, expected }) => {
      mockWindowSize(width, 800);

      const { result } = renderHook(() => useResponsive());

      expect(result.current.currentBreakpoint).toBe(expected);
    });
  });

  it("should clean up event listeners on unmount", () => {
    const { unmount } = renderHook(() => useResponsive());

    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });
});
