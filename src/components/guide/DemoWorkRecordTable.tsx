/**
 * 작업 기록 테이블 데모
 */

import { Table, Tag, Button, Card, Space, Typography, Tooltip } from "antd";
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    RollbackOutlined,
    PlusOutlined,
    LeftOutlined,
    RightOutlined,
    EllipsisOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useShortcutStore } from "../../store/useShortcutStore";
import { formatShortcutKeyForPlatform } from "../../hooks/useShortcuts";
import { formatDuration } from "../../shared/lib/time";
import { DEMO_RECORDS, getCategoryColor, type DemoRecord } from "./demo_data";

const { Text } = Typography;

export function DemoWorkRecordTable() {
    const new_work_shortcut = useShortcutStore((state) =>
        state.shortcuts.find((s) => s.id === "new-work")
    );
    const new_work_keys = new_work_shortcut?.keys || "Alt+N";

    const columns: ColumnsType<DemoRecord> = [
        {
            title: "",
            key: "timer_action",
            width: 50,
            align: "center",
            render: (_, record) => (
                <Tooltip title={record.is_running ? "정지" : "시작"}>
                    <Button
                        type={record.is_running ? "primary" : "default"}
                        danger={record.is_running}
                        shape="circle"
                        size="small"
                        icon={
                            record.is_running ? (
                                <PauseCircleOutlined />
                            ) : (
                                <PlayCircleOutlined />
                            )
                        }
                    />
                </Tooltip>
            ),
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            width: 200,
            render: (text: string, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        {record.is_completed && (
                            <CheckOutlined className="text-success" />
                        )}
                        <Text
                            strong
                            className={
                                record.is_running
                                    ? "text-primary"
                                    : record.is_completed
                                    ? "text-text-disabled line-through"
                                    : undefined
                            }
                        >
                            {text || record.work_name}
                        </Text>
                        {record.is_running && (
                            <Tag color="processing" className="ml-xs">
                                00:45
                            </Tag>
                        )}
                    </Space>
                </Space>
            ),
        },
        {
            title: "작업명",
            dataIndex: "work_name",
            key: "work_name",
            width: 120,
            render: (text: string) => (
                <Tag color="blue" className="text-xs">
                    {text}
                </Tag>
            ),
        },
        {
            title: "업무명",
            dataIndex: "task_name",
            key: "task_name",
            width: 80,
            render: (text: string) =>
                text ? <Tag color="cyan">{text}</Tag> : "-",
        },
        {
            title: "카테고리",
            dataIndex: "category_name",
            key: "category_name",
            width: 90,
            render: (text: string) =>
                text ? <Tag color={getCategoryColor(text)}>{text}</Tag> : "-",
        },
        {
            title: "시간",
            key: "duration",
            width: 60,
            align: "center",
            render: (_, record) => (
                <Text
                    className={
                        record.is_running
                            ? "font-mono text-primary"
                            : "font-mono"
                    }
                >
                    {formatDuration(record.duration_minutes)}
                </Text>
            ),
        },
        {
            title: "시작-종료",
            key: "time_range",
            width: 120,
            render: (_, record) => (
                <Text type="secondary" className="text-sm">
                    {record.end_time
                        ? `${record.start_time} ~ ${record.end_time}`
                        : `${record.start_time} ~`}
                </Text>
            ),
        },
        {
            title: "날짜",
            dataIndex: "date",
            key: "date",
            width: 90,
            render: (text: string) => (
                <Text type="secondary" className="text-sm">
                    {text?.slice(5)}
                </Text>
            ),
        },
        {
            title: "",
            key: "action",
            width: 120,
            align: "center",
            render: (_, record) => (
                <Space size={4}>
                    {!record.is_running && !record.is_completed && (
                        <Tooltip title="완료">
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckOutlined />}
                                className="text-success"
                            />
                        </Tooltip>
                    )}
                    {record.is_completed && (
                        <Tooltip title="완료 취소">
                            <Button
                                type="text"
                                size="small"
                                icon={<RollbackOutlined />}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="수정">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                    {!record.is_running && (
                        <Tooltip title="삭제">
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="demo-component">
            <Card size="small">
                <div className="flex items-center justify-between flex-wrap gap-sm mb-md">
                    <Space>
                        <Button size="small" icon={<LeftOutlined />} disabled />
                        <Text strong>2월 11일 화요일</Text>
                        <Button
                            size="small"
                            icon={<RightOutlined />}
                            disabled
                        />
                        <Tag color="processing" className="text-xs">
                            오늘
                        </Tag>
                    </Space>
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            disabled
                        >
                            새 작업{" "}
                            <span className="text-xs opacity-85 ml-xs px-xs rounded-xs bg-white/20">
                                {formatShortcutKeyForPlatform(new_work_keys)}
                            </span>
                        </Button>
                        <Button
                            size="small"
                            icon={<EllipsisOutlined />}
                            disabled
                        />
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={DEMO_RECORDS}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    rowClassName={(record) =>
                        record.is_running
                            ? "demo-row-running"
                            : record.is_completed
                            ? "demo-row-completed"
                            : ""
                    }
                    footer={() => (
                        <Text type="secondary" className="text-sm">
                            총 {DEMO_RECORDS.length}건
                        </Text>
                    )}
                />
            </Card>
        </div>
    );
}
