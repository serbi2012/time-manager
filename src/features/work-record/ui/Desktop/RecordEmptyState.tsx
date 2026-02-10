/**
 * Toss-style empty state for work record table
 * 4-1: Icon scale bounce
 * 4-2: Text stagger fade
 * 4-3: CTA button pulse attention
 */

import { ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
    motion,
    SPRING,
    SCALE_BOUNCE,
    STAGGER,
} from "../../../../shared/ui/animation";

const EMPTY_TITLE = "아직 기록이 없어요";
const EMPTY_DESCRIPTION = "새 작업을 추가해 오늘의 업무를 시작해 보세요";
const EMPTY_CTA = "새 작업 추가";

const stagger_container = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: STAGGER.normal / 1000,
            delayChildren: 0.1,
        },
    },
};

const stagger_item = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

interface RecordEmptyStateProps {
    onAddNew: () => void;
}

export function RecordEmptyState({ onAddNew }: RecordEmptyStateProps) {
    return (
        <motion.div
            variants={stagger_container}
            initial="initial"
            animate="animate"
            className="flex items-center justify-center py-section pb-[64px]"
        >
            <div className="text-center">
                {/* 4-1: Icon scale bounce */}
                <motion.div
                    initial={SCALE_BOUNCE.initial}
                    animate={SCALE_BOUNCE.animate}
                    transition={SCALE_BOUNCE.transition}
                    className="w-16 h-16 rounded-2xl bg-bg-grey flex items-center justify-center mx-auto mb-lg"
                >
                    <ClockCircleOutlined
                        style={{
                            fontSize: 28,
                            color: "var(--color-text-hint)",
                        }}
                    />
                </motion.div>

                {/* 4-2: Text stagger fade */}
                <motion.p
                    variants={stagger_item}
                    transition={SPRING.toss}
                    className="text-lg font-semibold text-text-primary mb-xs"
                >
                    {EMPTY_TITLE}
                </motion.p>
                <motion.p
                    variants={stagger_item}
                    transition={SPRING.toss}
                    className="text-md text-text-secondary mb-xl"
                >
                    {EMPTY_DESCRIPTION}
                </motion.p>

                {/* 4-3: CTA button with pulse attention */}
                <motion.button
                    variants={stagger_item}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    animate={{
                        scale: [1, 1.03, 1],
                        transition: {
                            delay: 0.8,
                            duration: 0.4,
                            repeat: 1,
                        },
                    }}
                    transition={SPRING.snappy}
                    className="h-10 px-xl border-0 bg-primary text-white rounded-md text-md font-semibold inline-flex items-center gap-sm hover:bg-primary-dark cursor-pointer"
                    onClick={onAddNew}
                >
                    <PlusOutlined style={{ fontSize: 14 }} />
                    {EMPTY_CTA}
                </motion.button>
            </div>
        </motion.div>
    );
}
