declare global {
  // React checks this flag before enabling the stricter act() semantics in tests.
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

class ResizeObserverMock implements ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverMock;
}

export {};
