/**
 * 사용 가이드 플랫폼 스위칭 진입점
 */

import { useResponsive } from "@/hooks/useResponsive";
import { DesktopGuideBook } from "../Desktop/DesktopGuideBook";
import { MobileGuideBook } from "../Mobile/MobileGuideBook";

export function GuideBook() {
    const { is_mobile } = useResponsive();

    if (is_mobile) {
        return <MobileGuideBook />;
    }

    return <DesktopGuideBook />;
}
