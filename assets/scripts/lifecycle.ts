export type Cleanup = () => void;

const cleanups: Cleanup[] = [];

export function register(cleanup: Cleanup): void {
  cleanups.push(cleanup);
}

export function cleanupPage(): void {
  while (cleanups.length > 0) {
    const cleanup = cleanups.pop();
    try {
      cleanup?.();
    } catch {
      // A single failing cleanup must not block the others.
    }
  }
}
