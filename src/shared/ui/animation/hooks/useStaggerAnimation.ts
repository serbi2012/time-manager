/**
 * useStaggerAnimation - 순차 애니메이션 훅
 */
import { useMemo } from "react";
import type { Variants } from "framer-motion";
import { useAnimationConfig } from "./useAnimationConfig";
import { STAGGER } from "../config/timing";
import { SPRING } from "../config/easing";

interface StaggerOptions {
    /** 아이템 간 딜레이 (ms) */
    stagger?: number;
    /** 첫 아이템 시작 전 딜레이 (ms) */
    delayChildren?: number;
    /** Y축 이동 거리 */
    y?: number;
    /** X축 이동 거리 */
    x?: number;
}

interface StaggerAnimationResult {
    /** 컨테이너에 적용할 variants */
    containerVariants: Variants;
    /** 아이템에 적용할 variants */
    itemVariants: Variants;
    /** 애니메이션 활성화 여부 */
    enabled: boolean;
}

/**
 * 순차 애니메이션을 위한 variants 생성
 *
 * @example
 * const { containerVariants, itemVariants } = useStaggerAnimation();
 *
 * <motion.ul variants={containerVariants} initial="initial" animate="animate">
 *   {items.map(item => (
 *     <motion.li key={item.id} variants={itemVariants}>
 *       {item.name}
 *     </motion.li>
 *   ))}
 * </motion.ul>
 */
export function useStaggerAnimation(
    options: StaggerOptions = {}
): StaggerAnimationResult {
    const { enabled, getDelay } = useAnimationConfig();

    const {
        stagger = STAGGER.normal,
        delayChildren = 0,
        y = 10,
        x = 0,
    } = options;

    const containerVariants = useMemo<Variants>(
        () => ({
            initial: {},
            animate: {
                transition: {
                    staggerChildren: enabled ? getDelay(stagger) / 1000 : 0,
                    delayChildren: enabled ? getDelay(delayChildren) / 1000 : 0,
                },
            },
        }),
        [enabled, stagger, delayChildren, getDelay]
    );

    const itemVariants = useMemo<Variants>(
        () => ({
            initial: enabled ? { opacity: 0, y, x } : {},
            animate: enabled
                ? {
                      opacity: 1,
                      y: 0,
                      x: 0,
                      transition: SPRING.gentle,
                  }
                : {},
        }),
        [enabled, y, x]
    );

    return { containerVariants, itemVariants, enabled };
}

/**
 * 페이드 인 순차 애니메이션
 */
export function useFadeStagger(
    stagger = STAGGER.normal
): StaggerAnimationResult {
    return useStaggerAnimation({ stagger, y: 0 });
}

/**
 * 슬라이드 업 순차 애니메이션
 */
export function useSlideUpStagger(
    stagger = STAGGER.normal
): StaggerAnimationResult {
    return useStaggerAnimation({ stagger, y: 20 });
}

/**
 * 슬라이드 레프트 순차 애니메이션
 */
export function useSlideLeftStagger(
    stagger = STAGGER.normal
): StaggerAnimationResult {
    return useStaggerAnimation({ stagger, x: 20, y: 0 });
}
