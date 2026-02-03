/**
 * useAnimationConfig - 애니메이션 설정 컨텍스트 및 훅
 * 전역 애니메이션 설정을 관리
 */
import {
    createContext,
    useContext,
    useMemo,
    useState,
    useEffect,
    type ReactNode,
} from "react";

// ============================================================================
// 타입 정의
// ============================================================================

export type TransitionSpeed = "slow" | "normal" | "fast";

export interface AnimationConfig {
    /** 애니메이션 활성화 여부 */
    enabled: boolean;
    /** 시스템의 모션 감소 설정 */
    reducedMotion: boolean;
    /** 애니메이션 속도 */
    speed: TransitionSpeed;
    /** 기본 지속 시간에 속도를 적용한 값 반환 */
    getDuration: (baseDuration: number) => number;
    /** 기본 딜레이에 속도를 적용한 값 반환 */
    getDelay: (baseDelay: number) => number;
}

// ============================================================================
// 컨텍스트
// ============================================================================

const AnimationConfigContext = createContext<AnimationConfig | null>(null);

// ============================================================================
// 시스템 설정 감지 훅
// ============================================================================

/**
 * 시스템의 모션 감소 설정 감지
 */
function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );
        const handler = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    return prefersReducedMotion;
}

// ============================================================================
// Provider
// ============================================================================

interface AnimationConfigProviderProps {
    children: ReactNode;
    /** 애니메이션 활성화 여부 (기본: true) */
    enabled?: boolean;
    /** 애니메이션 속도 (기본: normal) */
    speed?: TransitionSpeed;
}

const SPEED_MULTIPLIER: Record<TransitionSpeed, number> = {
    slow: 1.5,
    normal: 1,
    fast: 0.7,
};

export function AnimationConfigProvider({
    children,
    enabled = true,
    speed = "normal",
}: AnimationConfigProviderProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    const config = useMemo<AnimationConfig>(() => {
        const multiplier = SPEED_MULTIPLIER[speed];
        const effectivelyEnabled = enabled && !prefersReducedMotion;

        return {
            enabled: effectivelyEnabled,
            reducedMotion: prefersReducedMotion,
            speed,
            getDuration: (baseDuration: number) => {
                if (!effectivelyEnabled) return 0;
                return baseDuration * multiplier;
            },
            getDelay: (baseDelay: number) => {
                if (!effectivelyEnabled) return 0;
                return baseDelay * multiplier;
            },
        };
    }, [enabled, speed, prefersReducedMotion]);

    return (
        <AnimationConfigContext.Provider value={config}>
            {children}
        </AnimationConfigContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * 애니메이션 설정 사용
 */
export function useAnimationConfig(): AnimationConfig {
    const context = useContext(AnimationConfigContext);

    // Provider 없이 사용 시 기본값 반환
    if (!context) {
        return {
            enabled: true,
            reducedMotion: false,
            speed: "normal",
            getDuration: (d) => d,
            getDelay: (d) => d,
        };
    }

    return context;
}

/**
 * 애니메이션 활성화 여부만 간단히 확인
 */
export function useAnimationEnabled(): boolean {
    const { enabled } = useAnimationConfig();
    return enabled;
}
