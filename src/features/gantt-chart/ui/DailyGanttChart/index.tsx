/**
 * 일간 간트 차트 (데스크탑 진입점)
 *
 * 모바일은 MobileDailyHeader가 세그먼트 바와 작업 카드를 직접 구성한다.
 */

import { DesktopDailyGanttChart } from "./DesktopDailyGanttChart";

export function DailyGanttChart() {
    return <DesktopDailyGanttChart />;
}
