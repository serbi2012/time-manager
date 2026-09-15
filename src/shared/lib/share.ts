export type ShareResult = "shared" | "copied" | "cancelled";

export interface ShareTextOptions {
    title: string;
    text: string;
}

function isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
}

/**
 * 공유 시트를 띄우고, 쓸 수 없으면 클립보드에 복사한다
 * 사용자가 공유를 취소하면 복사하지 않는다
 */
export async function shareOrCopyText({
    title,
    text,
}: ShareTextOptions): Promise<ShareResult> {
    if (typeof navigator.share === "function") {
        try {
            await navigator.share({ title, text });
            return "shared";
        } catch (error) {
            if (isAbortError(error)) return "cancelled";
        }
    }

    await navigator.clipboard.writeText(text);
    return "copied";
}
