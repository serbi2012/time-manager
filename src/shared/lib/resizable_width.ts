export interface WidthBounds {
    min: number;
    max: number;
}

export function clampWidth(width: number, bounds: WidthBounds): number {
    return Math.min(bounds.max, Math.max(bounds.min, Math.round(width)));
}

export function parseStoredWidth(
    raw: string | null,
    fallback: number,
    bounds: WidthBounds
): number {
    if (raw === null || raw.trim() === "") return fallback;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return fallback;

    return clampWidth(parsed, bounds);
}
