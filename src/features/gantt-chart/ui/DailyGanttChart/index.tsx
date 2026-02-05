/**
 * 일간 간트 차트 - 플랫폼 스위칭
 */

import { useResponsive } from "../../../../hooks/useResponsive";
import { DesktopDailyGanttChart } from "./DesktopDailyGanttChart";
import { MobileDailyGanttChart } from "./MobileDailyGanttChart";

export function DailyGanttChart() {
    const { is_mobile } = useResponsive();

    if (is_mobile) {
        return <MobileDailyGanttChart />;
    }

    return <DesktopDailyGanttChart />;
}
