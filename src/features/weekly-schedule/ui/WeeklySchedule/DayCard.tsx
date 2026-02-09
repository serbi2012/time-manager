/**
 * 주간 일정 일자 카드: 날짜 제목 + 작업 목록
 */

import { Card, Typography } from "antd";
import dayjs from "dayjs";
import type { DayGroup } from "../../lib/week_grouper";
import { WorkItem } from "./WorkItem";

const { Text } = Typography;

export interface DayCardProps {
    day_group: DayGroup;
    on_status_change: (work_name: string, value: string) => void;
}

export function DayCard({ day_group, on_status_change }: DayCardProps) {
    const title = (
        <Text strong className="!text-lg">
            {dayjs(day_group.date).format("M/D")} ({day_group.day_name})
        </Text>
    );

    return (
        <Card key={day_group.date} className="day-card" title={title}>
            {day_group.works.map((work, work_idx) => (
                <WorkItem
                    key={work_idx}
                    work={work}
                    on_status_change={on_status_change}
                    show_divider={work_idx < day_group.works.length - 1}
                />
            ))}
        </Card>
    );
}
