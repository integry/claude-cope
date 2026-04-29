declare global {
  // React checks this flag before enabling the stricter act() semantics in tests.
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export {};
