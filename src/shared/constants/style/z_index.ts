/**
 * z-index 상수
 *
 * 레이어 우선순위를 체계적으로 관리합니다.
 */

export const Z_INDEX = {
    /** 기본 레이어 */
    base: 1,

    /** 드롭다운/팝오버 */
    dropdown: 10,

    /** 스티키 요소 */
    sticky: 20,

    /** 고정 요소 */
    fixed: 30,

    /** 모달 백드롭 */
    modalBackdrop: 100,

    /** 모달 */
    modal: 1000,

    /** 토스트/알림 */
    toast: 1100,

    /** 툴팁 */
    tooltip: 1200,

    /** 최상위 (로딩 오버레이 등) */
    top: 9999,
} as const;

export type ZIndexLevel = keyof typeof Z_INDEX;
