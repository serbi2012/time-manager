/**
 * 주간 일정 플랫폼 스위칭 진입점
 */

import { useResponsive } from "@/hooks/useResponsive";
import { DesktopWeeklySchedule } from "../Desktop/DesktopWeeklySchedule";
import { MobileWeeklySchedule } from "../Mobile/MobileWeeklySchedule";

export function WeeklySchedule() {
    const { is_mobile } = useResponsive();

    if (is_mobile) {
        return <MobileWeeklySchedule />;
    }

    return <DesktopWeeklySchedule />;
}
