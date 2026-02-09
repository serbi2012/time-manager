/**
 * 주간 일정 작업 항목: 작업 헤더 + 거래 목록
 */

import { Typography, Input, Divider } from "antd";
import { Space } from "antd";
import { formatDurationAsTime } from "@/shared/lib/time";
import type { WorkGroup } from "../../lib/week_grouper";
import { WEEKLY_LABELS } from "../../constants";

const { Text } = Typography;

export interface WorkItemProps {
    work: WorkGroup;
    on_status_change: (work_name: string, value: string) => void;
    show_divider: boolean;
}

export function WorkItem({
    work,
    on_status_change,
    show_divider,
}: WorkItemProps) {
    return (
        <div className="work-item">
            <div className="work-header">
                <Space wrap>
                    <Text>[{work.project_code}]</Text>
                    <Text strong>{work.work_name}</Text>
                    <Text type="secondary">{WEEKLY_LABELS.statusLabel}</Text>
                    <Input
                        size="small"
                        value={work.status}
                        onChange={(e) =>
                            on_status_change(work.work_name, e.target.value)
                        }
                        className="!w-[80px]"
                    />
                    <Text type="secondary">
                        , {WEEKLY_LABELS.startDateLabel} {work.start_date},{" "}
                        {WEEKLY_LABELS.cumulativeTimeLabel}{" "}
                        {formatDurationAsTime(work.total_minutes)})
                    </Text>
                </Space>
            </div>

            <div className="deal-list">
                {work.deals.map((deal, deal_idx) => (
                    <div key={deal_idx} className="deal-item">
                        <Text type="secondary">&gt; </Text>
                        <Text>{deal.deal_name}</Text>
                        <Text type="secondary">
                            {" "}
                            ({WEEKLY_LABELS.dealCumulativeLabel}{" "}
                            {formatDurationAsTime(deal.total_minutes)})
                        </Text>
                    </div>
                ))}
            </div>

            {show_divider && <Divider className="!my-sm" />}
        </div>
    );
}
