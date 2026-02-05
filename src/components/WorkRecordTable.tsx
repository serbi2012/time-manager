/**
 * 작업 레코드 테이블 컴포넌트 (플랫폼 스위칭 진입점)
 *
 * Phase 9 플랫폼 분리:
 * - Desktop/Mobile 완전 분리
 * - is_mobile 조건문 제거
 */

import { useResponsive } from "../hooks/useResponsive";
import { DesktopWorkRecordTable } from "../features/work-record/ui/Desktop/DesktopWorkRecordTable";
import { MobileWorkRecordTable } from "../features/work-record/ui/Mobile/MobileWorkRecordTable";

export default function WorkRecordTable() {
    const { is_mobile } = useResponsive();

    if (is_mobile) {
        return <MobileWorkRecordTable />;
    }

    return <DesktopWorkRecordTable />;
}
