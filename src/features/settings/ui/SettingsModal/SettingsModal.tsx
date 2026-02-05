/**
 * 설정 모달 (플랫폼 스위칭 진입점)
 *
 * Phase 9 플랫폼 분리:
 * - Desktop/Mobile 완전 분리
 * - is_mobile 조건문 제거
 */

import { useResponsive } from "@/hooks/useResponsive";
import { DesktopSettingsModal } from "../Desktop/DesktopSettingsModal";
import { MobileSettingsModal } from "../Mobile/MobileSettingsModal";

export interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
}

export function SettingsModal(props: SettingsModalProps) {
    const { is_mobile } = useResponsive();

    if (is_mobile) {
        return <MobileSettingsModal {...props} />;
    }

    return <DesktopSettingsModal {...props} />;
}
