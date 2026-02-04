/**
 * 레코드 분석 탭
 */

import {
    Space,
    Card,
    Table,
    Button,
    Popconfirm,
    Typography,
    Tag,
    Tooltip,
    Alert,
} from "antd";
import {
    DatabaseOutlined,
    WarningOutlined,
    FileTextOutlined,
    CopyOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { WorkRecord } from "../../../../shared/types";
import type { DuplicateGroup } from "../../lib/duplicate_finder";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";
import { formatDuration } from "../../lib/statistics";
import { DuplicatesView } from "../RecordsTab";
import {
    RECORDS_TAB_ALL_RECORDS,
    RECORDS_TAB_DUPLICATE_GROUPS,
    RECORDS_TAB_DUPLICATE_RECORDS,
    RECORDS_TAB_DUPLICATE_GROUP_TITLE,
    RECORDS_TAB_DUPLICATE_GROUP_HINT,
    RECORDS_TAB_GROUPS_COUNT,
    RECORDS_TAB_ALL_RECORDS_TITLE,
    BULK_DELETE,
    CONFIRM_BULK_DELETE_RECORDS,
    DELETE,
    CANCEL,
    SELECT_COPY_RECORDS,
    TABLE_COL_DATE,
    TABLE_COL_WORK_NAME,
    TABLE_COL_DEAL_NAME,
    TABLE_COL_PROJECT,
    TABLE_LABEL_TASK,
    TABLE_LABEL_CATEGORY,
    TABLE_COL_SESSIONS,
    TABLE_COL_DURATION,
    TABLE_COL_TIME,
    TABLE_COL_STATE,
    TABLE_COL_ACTION,
    TABLE_VIEW_DETAIL,
    TABLE_COPY_DATA,
    MERGE_MODAL_COMPLETED,
    TABLE_TAG_NO_SESSIONS,
    PAGINATION_TOTAL,
} from "../../constants";
import {
    ADMIN_STATS_ROW_STYLE,
    ADMIN_STAT_CARD_MIN_WIDTH,
} from "../../constants/styles";
import { BORDER_COLOR_CONFLICT } from "../../constants/styles";

interface RecordsTabProps {
    all_records: WorkRecord[];
    duplicate_groups: DuplicateGroup[];
    time_format: TimeDisplayFormat;
    selected_record_keys: React.Key[];
    set_selected_record_keys: (keys: React.Key[]) => void;
    on_copy: (record_ids: React.Key[]) => void;
    on_bulk_delete: (record_ids: React.Key[]) => void;
    on_open_detail: (record: WorkRecord) => void;
    on_open_merge: (group: DuplicateGroup) => void;
}

const { Text, Title } = Typography;

export function RecordsTab({
    all_records,
    duplicate_groups,
    time_format,
    selected_record_keys,
    set_selected_record_keys,
    on_copy,
    on_bulk_delete,
    on_open_detail,
    on_open_merge,
}: RecordsTabProps) {
    const record_columns: ColumnsType<WorkRecord> = [
        {
            title: TABLE_COL_DATE,
            dataIndex: "date",
            width: 110,
            sorter: (a, b) => a.date.localeCompare(b.date),
        },
        {
            title: TABLE_COL_WORK_NAME,
            dataIndex: "work_name",
            ellipsis: true,
            width: 200,
        },
        { title: TABLE_COL_DEAL_NAME, dataIndex: "deal_name", ellipsis: true },
        { title: TABLE_COL_PROJECT, dataIndex: "project_code", width: 120 },
        { title: TABLE_LABEL_TASK, dataIndex: "task_name", width: 80 },
        { title: TABLE_LABEL_CATEGORY, dataIndex: "category_name", width: 90 },
        {
            title: TABLE_COL_SESSIONS,
            width: 70,
            align: "center",
            render: (_, record) => (
                <Tag color="blue">{record.sessions?.length || 0}개</Tag>
            ),
        },
        {
            title: TABLE_COL_DURATION,
            dataIndex: "duration_minutes",
            width: 90,
            align: "right",
            render: (mins: number) => formatDuration(mins || 0, time_format),
            sorter: (a, b) =>
                (a.duration_minutes || 0) - (b.duration_minutes || 0),
        },
        {
            title: TABLE_COL_TIME,
            width: 120,
            render: (_, record) => (
                <Text style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {record.start_time || "-"} ~ {record.end_time || "-"}
                </Text>
            ),
        },
        {
            title: TABLE_COL_STATE,
            width: 100,
            render: (_, record) => (
                <Space size={4}>
                    {record.is_completed && (
                        <Tag color="green">{MERGE_MODAL_COMPLETED}</Tag>
                    )}
                    {!record.sessions?.length && (
                        <Tag color="orange">{TABLE_TAG_NO_SESSIONS}</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: TABLE_COL_ACTION,
            width: 100,
            fixed: "right",
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title={TABLE_VIEW_DETAIL}>
                        <Button
                            type="text"
                            size="small"
                            icon={<FileTextOutlined />}
                            onClick={() => on_open_detail(record)}
                        />
                    </Tooltip>
                    <Tooltip title={TABLE_COPY_DATA}>
                        <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => on_copy([record.id])}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={ADMIN_STATS_ROW_STYLE}>
                <Card size="small" style={ADMIN_STAT_CARD_MIN_WIDTH}>
                    <Text type="secondary">{RECORDS_TAB_ALL_RECORDS}</Text>
                    <Title level={4} style={{ margin: 0 }}>
                        {all_records.length}개
                    </Title>
                </Card>
                <Card
                    size="small"
                    style={{
                        ...ADMIN_STAT_CARD_MIN_WIDTH,
                        borderColor:
                            duplicate_groups.length > 0
                                ? BORDER_COLOR_CONFLICT
                                : undefined,
                    }}
                >
                    <Text type="secondary">{RECORDS_TAB_DUPLICATE_GROUPS}</Text>
                    <Title
                        level={4}
                        style={{
                            margin: 0,
                            color:
                                duplicate_groups.length > 0
                                    ? BORDER_COLOR_CONFLICT
                                    : undefined,
                        }}
                    >
                        {duplicate_groups.length}개
                    </Title>
                </Card>
                <Card size="small" style={ADMIN_STAT_CARD_MIN_WIDTH}>
                    <Text type="secondary">
                        {RECORDS_TAB_DUPLICATE_RECORDS}
                    </Text>
                    <Title level={4} style={{ margin: 0 }}>
                        {duplicate_groups.reduce(
                            (sum, g) => sum + g.records.length,
                            0
                        )}
                        개
                    </Title>
                </Card>
            </div>

            {duplicate_groups.length > 0 && (
                <Card
                    size="small"
                    title={
                        <Space>
                            <WarningOutlined
                                style={{ color: BORDER_COLOR_CONFLICT }}
                            />
                            <span>{RECORDS_TAB_DUPLICATE_GROUP_TITLE}</span>
                            <Tag color="red">
                                {duplicate_groups.length}
                                {RECORDS_TAB_GROUPS_COUNT}
                            </Tag>
                        </Space>
                    }
                    style={{ borderColor: "#ffccc7" }}
                >
                    <Alert
                        type="warning"
                        message={RECORDS_TAB_DUPLICATE_GROUP_HINT}
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <DuplicatesView
                        duplicates={duplicate_groups}
                        on_merge={(records) => {
                            const g = duplicate_groups.find(
                                (gr) => gr.records[0]?.id === records[0]?.id
                            );
                            if (g) on_open_merge(g);
                        }}
                    />
                </Card>
            )}

            <Card
                size="small"
                title={
                    <Space>
                        <DatabaseOutlined />
                        <span>{RECORDS_TAB_ALL_RECORDS_TITLE}</span>
                    </Space>
                }
                extra={
                    <Space>
                        {selected_record_keys.length > 0 && (
                            <>
                                <Button
                                    icon={<CopyOutlined />}
                                    onClick={() =>
                                        on_copy(selected_record_keys)
                                    }
                                >
                                    {SELECT_COPY_RECORDS} (
                                    {selected_record_keys.length})
                                </Button>
                                <Popconfirm
                                    title={BULK_DELETE}
                                    description={`${selected_record_keys.length}${CONFIRM_BULK_DELETE_RECORDS}`}
                                    onConfirm={() =>
                                        on_bulk_delete(selected_record_keys)
                                    }
                                    okText={DELETE}
                                    cancelText={CANCEL}
                                >
                                    <Button icon={<DeleteOutlined />} danger>
                                        {BULK_DELETE}
                                    </Button>
                                </Popconfirm>
                            </>
                        )}
                    </Space>
                }
            >
                <Table
                    columns={record_columns}
                    dataSource={all_records}
                    rowKey="id"
                    size="small"
                    pagination={{
                        pageSize: 50,
                        showSizeChanger: true,
                        pageSizeOptions: ["20", "50", "100"],
                        showTotal: (total, range) =>
                            PAGINATION_TOTAL(range[0], range[1], total),
                    }}
                    rowSelection={{
                        selectedRowKeys: selected_record_keys,
                        onChange: (keys) =>
                            set_selected_record_keys(keys || []),
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>
        </Space>
    );
}
