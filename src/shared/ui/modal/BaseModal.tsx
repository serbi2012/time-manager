/**
 * 애니메이션이 통합된 기본 모달 컴포넌트
 *
 * animation/config/presets.ts의 MODAL 프리셋을 사용하여
 * 일관된 애니메이션 효과를 제공
 *
 * @example
 * <BaseModal
 *   title="설정"
 *   open={isOpen}
 *   onCancel={handleClose}
 * >
 *   <Content />
 * </BaseModal>
 */

import type { ReactNode } from "react";
import { Modal, type ModalProps } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimationConfig } from "../animation/hooks/useAnimationConfig";
import { MODAL } from "../animation/config/presets";

export interface BaseModalProps extends ModalProps {
    children: ReactNode;
}

/**
 * 애니메이션이 통합된 기본 모달
 */
export function BaseModal({ children, open, ...props }: BaseModalProps) {
    const { enabled } = useAnimationConfig();

    // 애니메이션 비활성화 시 일반 Modal 사용
    if (!enabled) {
        return (
            <Modal open={open} {...props}>
                {children}
            </Modal>
        );
    }

    return (
        <Modal
            open={open}
            {...props}
            modalRender={(node) => (
                <AnimatePresence mode="wait">
                    {open && (
                        <motion.div
                            initial={MODAL.content.initial}
                            animate={MODAL.content.animate}
                            exit={MODAL.content.exit}
                            transition={MODAL.content.transition}
                        >
                            {node}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        >
            {children}
        </Modal>
    );
}

export default BaseModal;
