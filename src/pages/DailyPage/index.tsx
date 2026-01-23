/**
 * 일간 페이지 - 플랫폼별 선택 렌더링
 */

import { useResponsive } from "../../hooks/useResponsive";
import { DesktopDailyPage } from "./DesktopDailyPage";
import { MobileDailyPage } from "./MobileDailyPage";

/**
 * 일간 페이지
 * 플랫폼에 따라 데스크탑/모바일 컴포넌트 선택
 */
export function DailyPage() {
    const { is_mobile } = useResponsive();

    // 완전히 별도의 컴포넌트 트리 사용
    if (is_mobile) {
        return <MobileDailyPage />;
    }

    return <DesktopDailyPage />;
}

// Re-exports
export { DesktopDailyPage } from "./DesktopDailyPage";
export { MobileDailyPage } from "./MobileDailyPage";
export default DailyPage;
