/**
 * 푸터 액션 버튼
 *
 * 기본 상태에서도 버튼임을 인지할 수 있도록
 * 배경색/언더라인/아이콘 애니메이션으로 인터랙션 어포던스 제공
 */

import type { ReactNode } from "react";
import { motion } from "../../../../shared/ui/animation";

const SPRING_TRANSITION = {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
};

interface FooterActionButtonProps {
    icon: ReactNode;
    label: string;
    onClick: () => void;
}

export function FooterActionButton({
    icon,
    label,
    onClick,
}: FooterActionButtonProps) {
    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={SPRING_TRANSITION}
            className="group relative h-8 px-md rounded-md flex items-center gap-sm bg-transparent border border-border-light text-sm text-text-secondary cursor-pointer transition-all duration-200 hover:bg-bg-grey hover:border-border-dark hover:text-text-primary hover:shadow-sm"
            onClick={onClick}
        >
            <span className="transition-transform duration-200 ease-out group-hover:scale-125">
                {icon}
            </span>
            <span>{label}</span>
            <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gray-300 transition-all duration-300 ease-out group-hover:w-4/5" />
        </motion.button>
    );
}
