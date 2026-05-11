declare global {
  // React checks this flag before enabling the stricter act() semantics in tests.
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
  var __triggerResizeObserver: (() => void) | undefined;
}

class ResizeObserverMock implements ResizeObserver {
  private static instances = new Set<ResizeObserverMock>();
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.add(this);
  }

  observe() {}

  unobserve() {}

  disconnect() {
    ResizeObserverMock.instances.delete(this);
  }

  static trigger() {
    for (const instance of ResizeObserverMock.instances) {
      instance.callback([], instance as unknown as ResizeObserver);
    }
  }
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__triggerResizeObserver = () => {
  ResizeObserverMock.trigger();
};

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverMock;
}

export {};
