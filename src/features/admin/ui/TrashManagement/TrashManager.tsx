/**
 * 삭제된 데이터 관리 컴포넌트
 */

import { useState, useMemo } from "react";
import {
    Table,
    Button,
    Space,
    Tag,
    Popconfirm,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Input,
    DatePicker,
    Empty,
    Alert,
} from "antd";
import {
    DeleteOutlined,
    UndoOutlined,
    WarningOutlined,
    SearchOutlined,
    ClearOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { WorkRecord } from "../../../../shared/types";
import { SUCCESS_MESSAGES } from "../../../../shared/constants";
import { formatDuration, type TimeDisplayFormat } from "../../lib/statistics";
import {
    TABLE_COL_DEAL_NAME,
    TABLE_COL_WORK_NAME,
    TABLE_COL_TIME,
    TABLE_COL_SESSIONS,
    DELETE,
    CANCEL,
    TRASH_LABEL,
    EXPLORER_LABEL,
} from "../../constants";

const { RangePicker } = DatePicker;

interface TrashManagerProps {
    records: WorkRecord[];
    on_restore: (record_id: string) => void;
    on_permanent_delete: (record_id: string) => void;
    on_restore_all?: () => void;
    on_empty_trash?: () => void;
    time_format?: TimeDisplayFormat;
}

export function TrashManager({
    records,
    on_restore,
    on_permanent_delete,
    on_restore_all: _on_restore_all,
    on_empty_trash,
    time_format = "hours",
}: TrashManagerProps) {
    const [selected_ids, setSelectedIds] = useState<string[]>([]);
    const [search_text, setSearchText] = useState("");
    const [date_range, setDateRange] = useState<
        [dayjs.Dayjs, dayjs.Dayjs] | null
    >(null);

    // 삭제된 레코드만 필터링
    const deleted_records = useMemo(() => {
        let result = records.filter((r) => r.is_deleted);

        // 날짜 범위 필터
        if (date_range) {
            const [start, end] = date_range;
            result = result.filter((r) => {
                if (!r.deleted_at) return true;
                const deleted_date = dayjs(r.deleted_at);
                return (
                    deleted_date.isAfter(start.subtract(1, "day")) &&
                    deleted_date.isBefore(end.add(1, "day"))
                );
            });
        }

        // 텍스트 검색
        if (search_text.trim()) {
            const search_lower = search_text.toLowerCase().trim();
            result = result.filter((r) => {
                return (
                    r.work_name?.toLowerCase().includes(search_lower) ||
                    r.deal_name?.toLowerCase().includes(search_lower) ||
                    r.project_code?.toLowerCase().includes(search_lower)
                );
            });
        }

        // 삭제일 기준 내림차순 정렬
        return result.sort((a, b) => {
            const date_a = a.deleted_at || "";
            const date_b = b.deleted_at || "";
            return date_b.localeCompare(date_a);
        });
    }, [records, search_text, date_range]);

    // 통계
    const stats = useMemo(() => {
        const total_minutes = deleted_records.reduce(
            (sum, r) => sum + (r.duration_minutes || 0),
            0
        );
        const total_sessions = deleted_records.reduce(
            (sum, r) => sum + r.sessions.length,
            0
        );
        return {
            count: deleted_records.length,
            total_minutes,
            total_sessions,
        };
    }, [deleted_records]);

    // 일괄 복원
    const handleBatchRestore = () => {
        selected_ids.forEach((id) => on_restore(id));
        setSelectedIds([]);
        message.success(SUCCESS_MESSAGES.itemsRestored(selected_ids.length));
    };

    // 일괄 삭제
    const handleBatchDelete = () => {
        selected_ids.forEach((id) => on_permanent_delete(id));
        setSelectedIds([]);
        message.success(
            SUCCESS_MESSAGES.itemsPermanentlyDeleted(selected_ids.length)
        );
    };

    // 휴지통 비우기
    const handleEmptyTrash = () => {
        if (on_empty_trash) {
            on_empty_trash();
        } else {
            deleted_records.forEach((r) => on_permanent_delete(r.id));
        }
        setSelectedIds([]);
        message.success(SUCCESS_MESSAGES.trashEmptied);
    };

    const columns: ColumnsType<WorkRecord> = [
        {
            title: TRASH_LABEL.deletedDate,
            key: "deleted_at",
            width: 150,
            sorter: (a, b) =>
                (a.deleted_at || "").localeCompare(b.deleted_at || ""),
            render: (_, record) =>
                record.deleted_at
                    ? dayjs(record.deleted_at).format("YYYY-MM-DD HH:mm")
                    : "-",
        },
        {
            title: TRASH_LABEL.originalDate,
            dataIndex: "date",
            key: "date",
            width: 110,
            sorter: (a, b) => a.date.localeCompare(b.date),
        },
        {
            title: TABLE_COL_DEAL_NAME,
            dataIndex: "deal_name",
            key: "deal_name",
            ellipsis: true,
        },
        {
            title: TABLE_COL_WORK_NAME,
            dataIndex: "work_name",
            key: "work_name",
            width: 150,
            ellipsis: true,
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: TABLE_COL_TIME,
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            width: 100,
            render: (mins: number) => formatDuration(mins || 0, time_format),
        },
        {
            title: TABLE_COL_SESSIONS,
            key: "sessions",
            width: 70,
            render: (_, record) =>
                `${record.sessions.length}${EXPLORER_LABEL.unit_count}`,
        },
        {
            title: "",
            key: "action",
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<UndoOutlined />}
                        onClick={() => {
                            on_restore(record.id);
                            message.success(SUCCESS_MESSAGES.restored);
                        }}
                    >
                        {TRASH_LABEL.restore}
                    </Button>
                    <Popconfirm
                        title={TRASH_LABEL.permanentDelete}
                        description={TRASH_LABEL.permanentDeleteConfirm}
                        onConfirm={() => {
                            on_permanent_delete(record.id);
                            message.success(
                                SUCCESS_MESSAGES.recordPermanentlyDeletedAdmin
                            );
                        }}
                        okText={DELETE}
                        cancelText={CANCEL}
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            {DELETE}
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys: selected_ids,
        onChange: (keys: React.Key[]) => setSelectedIds(keys as string[]),
    };

    if (deleted_records.length === 0 && !search_text && !date_range) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={TRASH_LABEL.trashEmpty}
            />
        );
    }

    return (
        <div>
            {/* 필터 영역 */}
            <Card size="small" className="!mb-lg">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder={TRASH_LABEL.searchPlaceholder}
                            prefix={<SearchOutlined />}
                            value={search_text}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <RangePicker
                            value={date_range}
                            onChange={(dates) =>
                                setDateRange(
                                    dates as [dayjs.Dayjs, dayjs.Dayjs] | null
                                )
                            }
                            className="!w-full"
                            placeholder={[
                                TRASH_LABEL.deleteStartDate,
                                TRASH_LABEL.deleteEndDate,
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <Button
                            onClick={() => {
                                setSearchText("");
                                setDateRange(null);
                            }}
                        >
                            {TRASH_LABEL.filterReset}
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* 통계 */}
            <Row gutter={16} className="!mb-lg">
                <Col span={8}>
                    <Card size="small">
                        <Statistic
                            title={TRASH_LABEL.deletedRecords}
                            value={stats.count}
                            valueStyle={{ color: "#ff4d4f" }}
                            suffix={EXPLORER_LABEL.unit_record}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small">
                        <Statistic
                            title={TRASH_LABEL.totalSessions}
                            value={stats.total_sessions}
                            suffix={EXPLORER_LABEL.unit_count}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small">
                        <Statistic
                            title={TRASH_LABEL.totalTime}
                            value={formatDuration(
                                stats.total_minutes,
                                time_format
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 일괄 작업 버튼 */}
            <Space className="!mb-lg">
                <Button
                    icon={<UndoOutlined />}
                    onClick={handleBatchRestore}
                    disabled={selected_ids.length === 0}
                >
                    {TRASH_LABEL.restoreSelected} ({selected_ids.length})
                </Button>
                <Popconfirm
                    title={TRASH_LABEL.permanentDeleteSelected}
                    description={TRASH_LABEL.permanentDeleteSelectedConfirm(
                        selected_ids.length
                    )}
                    onConfirm={handleBatchDelete}
                    okText={DELETE}
                    cancelText={CANCEL}
                    okButtonProps={{ danger: true }}
                    disabled={selected_ids.length === 0}
                >
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={selected_ids.length === 0}
                    >
                        {TRASH_LABEL.deleteSelectedBtn} ({selected_ids.length})
                    </Button>
                </Popconfirm>
                <Popconfirm
                    title={TRASH_LABEL.emptyTrash}
                    description={
                        <Alert
                            type="warning"
                            message={TRASH_LABEL.emptyTrashConfirm(
                                deleted_records.length
                            )}
                            icon={<WarningOutlined />}
                            showIcon
                        />
                    }
                    onConfirm={handleEmptyTrash}
                    okText={TRASH_LABEL.emptyTrashBtn}
                    cancelText={CANCEL}
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<ClearOutlined />}>
                        {TRASH_LABEL.emptyTrash}
                    </Button>
                </Popconfirm>
            </Space>

            {/* 테이블 */}
            <Table
                dataSource={deleted_records}
                columns={columns}
                rowKey="id"
                size="small"
                rowSelection={rowSelection}
                pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) =>
                        EXPLORER_LABEL.paginationTotalRecords(total),
                }}
                scroll={{ x: 900 }}
            />
        </div>
    );
}

export default TrashManager;
