/**
 * 페이지 트랜지션 상태 관리 훅
 */

import { useMemo } from "react";
import { TRANSITION_CONFIG, PAGE_TRANSITION_DELAYS } from "./transition_config";

interface UsePageTransitionReturn {
    /** 트랜지션 표시 준비 완료 여부 */
    is_ready: boolean;
    /** 순서에 따른 딜레이 계산 (초) */
    getDelay: (order: number) => number;
}

/**
 * 페이지 트랜지션 상태 관리 훅
 *
 * @param is_ready - 데이터 로딩 완료 등 트랜지션 시작 조건
 * @returns 트랜지션 상태 및 딜레이 계산 함수
 *
 * @example
 * const { is_ready, getDelay } = usePageTransition(initial_load_done);
 *
 * <SlideIn show={is_ready} delay={getDelay(0)} direction="top">
 *   <Header />
 * </SlideIn>
 */
export function usePageTransition(is_ready: boolean): UsePageTransitionReturn {
    const getDelay = useMemo(
        () => (order: number) => order * TRANSITION_CONFIG.stagger,
        []
    );

    return {
        is_ready,
        getDelay,
    };
}

/** 데스크탑 일간 페이지용 트랜지션 딜레이 */
export const DESKTOP_DAILY_DELAYS = PAGE_TRANSITION_DELAYS.desktop_daily;

/** 모바일 일간 페이지용 트랜지션 딜레이 */
export const MOBILE_DAILY_DELAYS = PAGE_TRANSITION_DELAYS.mobile_daily;

export default usePageTransition;
