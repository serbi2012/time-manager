/**
 * 주간 일정 복사 텍스트 생성 (기존 형식 1 / 구분선 형식 2)
 */

import { formatDurationAsTime } from "@/shared/lib/time";
import type { DayGroup } from "./week_grouper";
import { WEEKLY_SCHEDULE_CONFIG } from "../constants/config";

function formatMonthDay(date_str: string): string {
    const d = new Date(date_str + "T12:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * 형식 1: 기존 형식 (날짜 + 작업 + deal 목록)
 */
function formatCopyFormat1(day_groups: DayGroup[]): string {
    let text = "";
    day_groups.forEach((day_group) => {
        const date_str = formatMonthDay(day_group.date);
        text += `${date_str} (${day_group.day_name})\n`;

        day_group.works.forEach((work) => {
            text += `[${work.project_code}] ${work.work_name} (진행상태: ${
                work.status
            }, 시작일자: ${work.start_date}, 누적시간: ${formatDurationAsTime(
                work.total_minutes
            )})\n`;

            work.deals.forEach((deal) => {
                text += `> ${deal.deal_name} (누적시간: ${formatDurationAsTime(
                    deal.total_minutes
                )})\n`;
            });
        });
    });
    return text;
}

/**
 * 형식 2: 구분선 형식
 */
function formatCopyFormat2(day_groups: DayGroup[]): string {
    const separator = WEEKLY_SCHEDULE_CONFIG.copySeparator;
    let text = "";

    day_groups.forEach((day_group) => {
        const date_str = formatMonthDay(day_group.date);
        text += `${separator}\n`;
        text += `■ ${date_str} (${day_group.day_name})\n`;
        text += `${separator}\n`;

        day_group.works.forEach((work) => {
            text += `[${work.project_code}] ${work.work_name} (진행상태: ${
                work.status
            }, 시작일자: ${work.start_date}, 누적시간: ${formatDurationAsTime(
                work.total_minutes
            )})\n`;

            work.deals.forEach((deal) => {
                text += `  · ${
                    deal.deal_name
                } (누적시간: ${formatDurationAsTime(deal.total_minutes)})\n`;
            });

            text += "\n";
        });
    });

    return text;
}

/**
 * 선택한 복사 형식으로 주간 일정 텍스트 생성
 */
export function generateWeeklyCopyText(
    day_groups: DayGroup[],
    copy_format: 1 | 2
): string {
    if (copy_format === 1) {
        return formatCopyFormat1(day_groups);
    }
    return formatCopyFormat2(day_groups);
}
