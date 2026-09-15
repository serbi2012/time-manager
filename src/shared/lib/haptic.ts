/**
 * 햅틱 피드백
 *
 * Android 무음 모드에서는 브라우저가 진동을 호출하지 않고,
 * iOS Safari는 Vibration API 자체가 없다.
 * 따라서 진동은 보조 수단이며, 호출 지점에는 항상 시각 피드백을 함께 둔다.
 */

export type HapticKind = "selection" | "impact" | "success" | "warning";

/** 너무 짧은 진동은 기기에 따라 느껴지지 않아 15ms 이상으로 둔다 */
const HAPTIC_PATTERNS: Record<HapticKind, number | number[]> = {
    selection: 15,
    impact: 25,
    success: [15, 40, 15],
    warning: [25, 40, 25],
};

let is_enabled = true;

/** 설정값을 반영한다 (앱 진입점에서 호출) */
export function setHapticsEnabled(enabled: boolean): void {
    is_enabled = enabled;
}

export function isHapticsEnabled(): boolean {
    return is_enabled;
}

export function haptic(kind: HapticKind = "selection"): void {
    if (!is_enabled) return;

    navigator.vibrate?.(HAPTIC_PATTERNS[kind]);
}

export { HAPTIC_PATTERNS };
