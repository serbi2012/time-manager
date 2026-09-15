/**
 * 작업 레코드 테이블 (데스크탑 진입점)
 *
 * 모바일은 MobileDailyPage가 자체 화면을 구성한다.
 */

import { DesktopWorkRecordTable } from "../features/work-record/ui/Desktop/DesktopWorkRecordTable";

export default function WorkRecordTable() {
    return <DesktopWorkRecordTable />;
}
