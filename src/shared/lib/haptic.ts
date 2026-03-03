const DEFAULT_DURATION_MS = 10;

export function triggerHaptic(duration_ms = DEFAULT_DURATION_MS): void {
    navigator.vibrate?.(duration_ms);
}
