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
            title: "삭제일",
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
            title: "원본 날짜",
            dataIndex: "date",
            key: "date",
            width: 110,
            sorter: (a, b) => a.date.localeCompare(b.date),
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            ellipsis: true,
        },
        {
            title: "작업명",
            dataIndex: "work_name",
            key: "work_name",
            width: 150,
            ellipsis: true,
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: "시간",
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            width: 100,
            render: (mins: number) => formatDuration(mins || 0, time_format),
        },
        {
            title: "세션",
            key: "sessions",
            width: 70,
            render: (_, record) => `${record.sessions.length}개`,
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
                        복원
                    </Button>
                    <Popconfirm
                        title="영구 삭제"
                        description="이 항목을 영구 삭제하시겠습니까? 복구할 수 없습니다."
                        onConfirm={() => {
                            on_permanent_delete(record.id);
                            message.success(
                                SUCCESS_MESSAGES.recordPermanentlyDeletedAdmin
                            );
                        }}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            삭제
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
                description="휴지통이 비어있습니다"
            />
        );
    }

    return (
        <div>
            {/* 필터 영역 */}
            <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="검색 (거래명, 작업명, 프로젝트 코드)"
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
                            style={{ width: "100%" }}
                            placeholder={["삭제 시작일", "삭제 종료일"]}
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <Button
                            onClick={() => {
                                setSearchText("");
                                setDateRange(null);
                            }}
                        >
                            필터 초기화
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* 통계 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card size="small">
                        <Statistic
                            title="삭제된 레코드"
                            value={stats.count}
                            valueStyle={{ color: "#ff4d4f" }}
                            suffix="건"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small">
                        <Statistic
                            title="총 세션"
                            value={stats.total_sessions}
                            suffix="개"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card size="small">
                        <Statistic
                            title="총 시간"
                            value={formatDuration(
                                stats.total_minutes,
                                time_format
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 일괄 작업 버튼 */}
            <Space style={{ marginBottom: 16 }}>
                <Button
                    icon={<UndoOutlined />}
                    onClick={handleBatchRestore}
                    disabled={selected_ids.length === 0}
                >
                    선택 항목 복원 ({selected_ids.length})
                </Button>
                <Popconfirm
                    title="선택 항목 영구 삭제"
                    description={`${selected_ids.length}개 항목을 영구 삭제하시겠습니까?`}
                    onConfirm={handleBatchDelete}
                    okText="삭제"
                    cancelText="취소"
                    okButtonProps={{ danger: true }}
                    disabled={selected_ids.length === 0}
                >
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={selected_ids.length === 0}
                    >
                        선택 항목 삭제 ({selected_ids.length})
                    </Button>
                </Popconfirm>
                <Popconfirm
                    title="휴지통 비우기"
                    description={
                        <Alert
                            type="warning"
                            message={`${deleted_records.length}개의 모든 항목이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
                            icon={<WarningOutlined />}
                            showIcon
                        />
                    }
                    onConfirm={handleEmptyTrash}
                    okText="비우기"
                    cancelText="취소"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<ClearOutlined />}>
                        휴지통 비우기
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
                    showTotal: (total) => `총 ${total}건`,
                }}
                scroll={{ x: 900 }}
            />
        </div>
    );
}

export default TrashManager;
