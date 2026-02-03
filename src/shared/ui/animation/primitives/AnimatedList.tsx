/**
 * AnimatedList - 리스트 아이템 애니메이션
 * 리스트 아이템이 추가/삭제될 때 순차적으로 애니메이션 적용
 */
import type { ReactNode } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { LIST_ITEM, LIST_ITEM_SLIDE } from "../config/presets";
import { STAGGER, SPRING } from "../config";

export type ListAnimationType = "slideUp" | "slideLeft" | "fade";

interface AnimatedListProps<T> {
    /** 렌더링할 아이템 배열 */
    items: T[];
    /** 아이템의 고유 키를 추출하는 함수 */
    keyExtractor: (item: T, index: number) => string;
    /** 아이템 렌더링 함수 */
    renderItem: (item: T, index: number) => ReactNode;
    /** 순차 애니메이션 딜레이 (ms) */
    stagger?: number;
    /** 애니메이션 타입 */
    type?: ListAnimationType;
    /** 컨테이너 CSS 클래스명 */
    className?: string;
    /** 컨테이너 스타일 */
    style?: React.CSSProperties;
    /** 아이템 래퍼 CSS 클래스명 */
    itemClassName?: string;
    /** 애니메이션 비활성화 */
    disabled?: boolean;
}

const TYPE_TO_VARIANTS: Record<ListAnimationType, Variants> = {
    slideUp: LIST_ITEM,
    slideLeft: LIST_ITEM_SLIDE,
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
};

export function AnimatedList<T>({
    items,
    keyExtractor,
    renderItem,
    stagger = STAGGER.normal,
    type = "slideUp",
    className,
    style,
    itemClassName,
    disabled = false,
}: AnimatedListProps<T>) {
    const variants = TYPE_TO_VARIANTS[type];

    // 애니메이션 비활성화 시
    if (disabled) {
        return (
            <div className={className} style={style}>
                {items.map((item, index) => (
                    <div
                        key={keyExtractor(item, index)}
                        className={itemClassName}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div className={className} style={style}>
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                    <motion.div
                        key={keyExtractor(item, index)}
                        layout
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={variants}
                        transition={{
                            ...SPRING.gentle,
                            delay: index * (stagger / 1000),
                        }}
                        className={itemClassName}
                    >
                        {renderItem(item, index)}
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}

// ============================================================================
// 순차 애니메이션 컨테이너
// ============================================================================

interface StaggerContainerProps {
    children: ReactNode;
    /** 순차 딜레이 (ms) */
    stagger?: number;
    /** 초기 딜레이 (ms) */
    delayChildren?: number;
    className?: string;
    style?: React.CSSProperties;
}

// Note: containerVariants below is not used directly but kept for reference
// const _containerVariantsRef: Variants = { ... };

const itemVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
};

/**
 * 자식 요소들에 순차 애니메이션을 적용하는 컨테이너
 * 자식에 motion.div를 사용하고 variants={itemVariants}를 적용해야 함
 */
export function StaggerContainer({
    children,
    stagger = STAGGER.normal,
    delayChildren = 0,
    className,
    style,
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={{
                initial: {},
                animate: {
                    transition: {
                        staggerChildren: stagger / 1000,
                        delayChildren: delayChildren / 1000,
                    },
                },
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

/** StaggerContainer 내부에서 사용할 아이템 variants */
export { itemVariants as staggerItemVariants };
