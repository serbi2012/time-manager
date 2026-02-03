/**
 * 이징 함수 및 스프링 프리셋
 * 토스 스타일의 탄성 있는 애니메이션을 위한 설정
 */

/** 베지어 커브 이징 함수 */
export const EASING = {
    /** 선형 */
    linear: [0, 0, 1, 1] as const,

    /** Ease In - 느리게 시작 */
    easeIn: [0.4, 0, 1, 1] as const,

    /** Ease Out - 느리게 끝 (가장 자연스러움) */
    easeOut: [0, 0, 0.2, 1] as const,

    /** Ease In Out - 느리게 시작하고 끝 */
    easeInOut: [0.4, 0, 0.2, 1] as const,

    /** 토스 스프링 - 부드러운 탄성 */
    tossSpring: [0.22, 1, 0.36, 1] as const,

    /** 토스 이즈 - 기본 토스 스타일 */
    tossEase: [0.33, 1, 0.68, 1] as const,

    /** 토스 바운스 - 약간의 오버슈트 */
    tossBounce: [0.34, 1.56, 0.64, 1] as const,

    /** 예비 동작 - 반대 방향으로 약간 움직인 후 */
    anticipate: [0.68, -0.6, 0.32, 1.6] as const,

    /** 오버슈트 - 목표를 넘어갔다 돌아옴 */
    overshoot: [0.34, 1.56, 0.64, 1] as const,

    /** 백 인 - 뒤로 갔다가 앞으로 */
    backIn: [0.6, -0.28, 0.735, 0.045] as const,

    /** 백 아웃 - 오버슈트 후 정착 */
    backOut: [0.175, 0.885, 0.32, 1.275] as const,
} as const;

/** framer-motion 스프링 프리셋 */
export const SPRING = {
    /** 부드러운 스프링 - 기본 */
    gentle: {
        type: "spring" as const,
        stiffness: 120,
        damping: 14,
    },

    /** 빠른 스프링 - 버튼, 작은 요소 */
    snappy: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
    },

    /** 탄성 스프링 - 바운스 효과 */
    bouncy: {
        type: "spring" as const,
        stiffness: 300,
        damping: 10,
    },

    /** 토스 스타일 - 메인 애니메이션 */
    toss: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        mass: 0.8,
    },

    /** 무거운 느낌 - 큰 요소, 모달 */
    heavy: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        mass: 1.5,
    },

    /** 가벼운 느낌 - 작은 요소, 아이콘 */
    light: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        mass: 0.5,
    },

    /** 우아한 느낌 - 페이지 전환 */
    elegant: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
        mass: 1,
    },
} as const;

export type EasingType = keyof typeof EASING;
export type SpringType = keyof typeof SPRING;
