/**
 * 간트차트 데모 (간소화된 버전)
 */

import { Tag, Button, Card, Space, Typography } from "antd";
import {
    LeftOutlined,
    RightOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { formatDuration } from "../../shared/lib/time";
import { DEMO_GANTT_LABELS, DEMO_DATA_LABELS } from "@/features/guide/constants";
import { DEMO_RECORDS } from "./demo_data";

const { Text } = Typography;

const GANTT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const GANTT_BARS = [
    {
        label: DEMO_DATA_LABELS.componentDev,
        left: "0%",
        width: "18.75%",
        color: "var(--color-primary)",
        is_running: false,
    },
    {
        label: DEMO_GANTT_LABELS.apiIntegration,
        left: "18.75%",
        width: "12.5%",
        color: "var(--color-primary)",
        is_running: true,
    },
    {
        label: DEMO_DATA_LABELS.weeklyMeeting,
        left: "62.5%",
        width: "6.25%",
        color: "var(--color-warning)",
        is_running: false,
    },
];

export function DemoDailyGanttChart() {
    const total_minutes = DEMO_RECORDS.reduce(
        (sum, r) => sum + r.duration_minutes,
        0
    );

    return (
        <div className="demo-component">
            <Card size="small">
                <div className="flex items-center justify-between mb-md">
                    <Space>
                        <Text strong className="text-md">
                            {DEMO_GANTT_LABELS.timelineTitle}
                        </Text>
                        <Button size="small" icon={<LeftOutlined />} disabled />
                        <Text type="secondary" className="text-sm">
                            {DEMO_GANTT_LABELS.demoDateFull}
                        </Text>
                        <Button
                            size="small"
                            icon={<RightOutlined />}
                            disabled
                        />
                    </Space>
                    <Space>
                        <Tag icon={<ClockCircleOutlined />} color="processing">
                            {formatDuration(total_minutes)}
                        </Tag>
                    </Space>
                </div>

                <div className="demo-gantt-container">
                    <div className="demo-gantt-header">
                        {GANTT_HOURS.map((hour) => (
                            <div key={hour} className="demo-gantt-hour">
                                {hour}:00
                            </div>
                        ))}
                    </div>
                    <div className="demo-gantt-rows">
                        {GANTT_BARS.map((bar) => (
                            <div key={bar.label} className="demo-gantt-row">
                                <div className="demo-gantt-label">
                                    {bar.label}
                                </div>
                                <div className="demo-gantt-bars">
                                    <div
                                        className={`demo-gantt-bar${
                                            bar.is_running
                                                ? " demo-gantt-bar-running"
                                                : ""
                                        }`}
                                        style={{
                                            left: bar.left,
                                            width: bar.width,
                                            background: bar.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div
                        className="demo-gantt-lunch"
                        style={{
                            left: "31.25%",
                            width: "12.5%",
                        }}
                    />
                </div>
                <Text type="secondary" className="text-xs mt-sm block">
                    {DEMO_GANTT_LABELS.dragHint}
                </Text>
            </Card>
        </div>
    );
}
