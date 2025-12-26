export const withLatencyLoggingSync = <T>(fn: () => T, onLatency: (latency: number) => void) => {
  const start = performance.now();
  const result = fn();
  onLatency(performance.now() - start);
  return result;
};
