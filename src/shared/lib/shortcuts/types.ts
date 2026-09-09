/**
 * 단축키 스코프
 *
 * - global: 앱 전역. 레이어(모달)가 하나라도 열려 있으면 동작하지 않는다.
 * - layer: 모달/오버레이 전용. 최상단 레이어의 바인딩만 동작한다.
 */
export type ShortcutScope = "global" | "layer";

/**
 * 입력 요소에 포커스가 있을 때의 동작 정책
 *
 * - block: 입력 중에는 동작하지 않는다 (수식어 없는 단일 키의 기본값)
 * - allow: 입력 중에도 동작한다 (F8 저장 등)
 */
export type ShortcutInputPolicy = "block" | "allow";

export interface ShortcutBinding {
    /** 등록 식별자 (중복 등록 시 마지막 것이 우선) */
    id: string;
    /** 정규화된 키 조합 (예: "Alt+N", "F8") */
    keys: string;
    scope: ShortcutScope;
    /** layer 스코프일 때 소속 레이어 id */
    layer_id?: string;
    input_policy: ShortcutInputPolicy;
    /** false면 등록되어 있어도 무시 */
    enabled: boolean;
    /** 같은 키가 겹칠 때 높은 값이 먼저 (기본 0) */
    priority: number;
    handler: (event: KeyboardEvent) => void;
    /** 실행 후 기본 동작을 막을지 (기본 true) */
    prevent_default: boolean;
}

export type ShortcutBindingInput = Omit<
    ShortcutBinding,
    "scope" | "input_policy" | "enabled" | "priority" | "prevent_default"
> &
    Partial<
        Pick<
            ShortcutBinding,
            | "scope"
            | "input_policy"
            | "enabled"
            | "priority"
            | "prevent_default"
        >
    >;
