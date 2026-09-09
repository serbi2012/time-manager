import {
    canReceiveFocus,
    findInitialFocusTarget,
    findTopmostModalBody,
} from "./focusable";

export interface FocusLayerEntry {
    id: string;
    /** 레이어를 열기 직전에 포커스를 갖고 있던 요소 */
    origin: HTMLElement | null;
    restore: boolean;
}

let focus_stack: FocusLayerEntry[] = [];
let layer_seq = 0;

function getActiveElement(): HTMLElement | null {
    const active = document.activeElement;
    return active instanceof HTMLElement ? active : null;
}

export interface PushFocusLayerOptions {
    /** 닫을 때 이전 포커스로 되돌릴지 (기본 true) */
    restore?: boolean;
}

/**
 * 포커스 레이어 열기
 *
 * 현재 포커스를 기억해 두었다가, 닫을 때 되돌린다.
 *
 * @returns 레이어를 닫는 함수
 */
export function pushFocusLayer(
    options: PushFocusLayerOptions = {}
): () => void {
    layer_seq += 1;
    const entry: FocusLayerEntry = {
        id: `focus-${layer_seq}`,
        origin: getActiveElement(),
        restore: options.restore ?? true,
    };

    focus_stack = [...focus_stack, entry];

    return () => {
        focus_stack = focus_stack.filter((item) => item.id !== entry.id);

        if (!entry.restore) return;
        if (!canReceiveFocus(entry.origin)) return;

        entry.origin.focus({ preventScroll: true });
    };
}

/**
 * 컨테이너 안의 적절한 요소로 포커스를 옮긴다
 *
 * 컨테이너를 넘기지 않으면 화면 최상단 모달의 본문에서 찾는다.
 *
 * @param preferred 우선 포커스할 요소 (없거나 포커스 불가면 자동 선택)
 * @returns 실제로 포커스한 요소
 */
export function focusInto(
    container: HTMLElement | null,
    preferred?: HTMLElement | null
): HTMLElement | null {
    if (preferred && canReceiveFocus(preferred)) {
        preferred.focus({ preventScroll: true });
        return preferred;
    }

    const scope = container ?? findTopmostModalBody();
    if (!scope) return null;

    const target = findInitialFocusTarget(scope);
    if (!target) return null;

    target.focus({ preventScroll: true });
    return target;
}

export function getFocusStackDepth(): number {
    return focus_stack.length;
}

/**
 * 테스트용 초기화
 */
export function resetFocusManager(): void {
    focus_stack = [];
    layer_seq = 0;
}
