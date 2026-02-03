/**
 * AnimatedNumber - 숫자 카운팅 애니메이션
 * 토스 스타일의 부드러운 숫자 변화 효과
 */
import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, MotionValue } from "framer-motion";

interface AnimatedNumberProps {
    /** 표시할 숫자 값 */
    value: number;
    /** 애니메이션 지속 시간 (ms) */
    duration?: number;
    /** 숫자 포맷 옵션 */
    formatOptions?: Intl.NumberFormatOptions;
    /** 로케일 (기본: ko-KR) */
    locale?: string;
    /** CSS 클래스명 */
    className?: string;
    /** 스타일 */
    style?: React.CSSProperties;
    /** 애니메이션 비활성화 */
    disabled?: boolean;
    /** 접두사 (예: "₩") */
    prefix?: string;
    /** 접미사 (예: "원", "분") */
    suffix?: string;
}

export function AnimatedNumber({
    value,
    duration = 500,
    formatOptions,
    locale = "ko-KR",
    className,
    style,
    disabled = false,
    prefix = "",
    suffix = "",
}: AnimatedNumberProps) {
    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: duration,
    });

    const display = useTransform(spring, (current) => {
        const formatted = new Intl.NumberFormat(locale, formatOptions).format(
            Math.round(current)
        );
        return `${prefix}${formatted}${suffix}`;
    });

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    // 애니메이션 비활성화 시
    if (disabled) {
        const formatted = new Intl.NumberFormat(locale, formatOptions).format(
            value
        );
        return (
            <span className={className} style={style}>
                {prefix}
                {formatted}
                {suffix}
            </span>
        );
    }

    return (
        <motion.span className={className} style={style}>
            {display}
        </motion.span>
    );
}

// ============================================================================
// 특화 컴포넌트
// ============================================================================

interface AnimatedDurationProps {
    /** 분 단위 값 */
    minutes: number;
    /** 시간:분 형식 사용 여부 */
    useHourFormat?: boolean;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

/**
 * 소요 시간 애니메이션 (분 → "N시간 M분" 형식)
 */
export function AnimatedDuration({
    minutes,
    useHourFormat = true,
    className,
    style,
    disabled = false,
}: AnimatedDurationProps) {
    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
    });

    const display = useTransform(spring, (current) => {
        const m = Math.round(current);
        if (!useHourFormat || m < 60) {
            return `${m}분`;
        }
        const hours = Math.floor(m / 60);
        const mins = m % 60;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    });

    useEffect(() => {
        spring.set(minutes);
    }, [spring, minutes]);

    if (disabled) {
        if (!useHourFormat || minutes < 60) {
            return (
                <span className={className} style={style}>
                    {minutes}분
                </span>
            );
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return (
            <span className={className} style={style}>
                {mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`}
            </span>
        );
    }

    return (
        <motion.span className={className} style={style}>
            {display}
        </motion.span>
    );
}

interface AnimatedPercentProps {
    /** 퍼센트 값 (0-100) */
    value: number;
    /** 소수점 자릿수 */
    decimals?: number;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

/**
 * 퍼센트 애니메이션
 */
export function AnimatedPercent({
    value,
    decimals = 0,
    className,
    style,
    disabled = false,
}: AnimatedPercentProps) {
    return (
        <AnimatedNumber
            value={value}
            formatOptions={{
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }}
            suffix="%"
            className={className}
            style={style}
            disabled={disabled}
        />
    );
}

interface AnimatedCurrencyProps {
    /** 금액 */
    value: number;
    /** 통화 (기본: KRW) */
    currency?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

/**
 * 통화 애니메이션
 */
export function AnimatedCurrency({
    value,
    currency = "KRW",
    className,
    style,
    disabled = false,
}: AnimatedCurrencyProps) {
    return (
        <AnimatedNumber
            value={value}
            formatOptions={{ style: "currency", currency }}
            className={className}
            style={style}
            disabled={disabled}
        />
    );
}
