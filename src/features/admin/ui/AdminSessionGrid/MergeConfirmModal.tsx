/**
 * 레코드 병합 확인 모달
 */

import { Modal, Space, Alert, Descriptions, Card, Table, Tag } from "antd";
import { MergeCellsOutlined } from "@ant-design/icons";
import type { DuplicateGroup } from "../../lib/duplicate_finder";
import { formatDuration } from "../../lib/statistics";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";
import {
    MERGE_MODAL_TITLE,
    MERGE_MODAL_WARNING,
    MERGE_MODAL_DESC_RECORDS,
    MERGE_MODAL_DESC_FIRST,
    MERGE_MODAL_RECORDS_LIST,
    MERGE_MODAL_LABEL_BASE,
    MERGE_MODAL_LABEL_WORK,
    MERGE_MODAL_LABEL_DEAL,
    MERGE_MODAL_LABEL_TARGET,
    MERGE_MODAL_LABEL_TOTAL_SESSIONS,
    MERGE_MODAL_LABEL_TOTAL_DURATION,
    MERGE_MODAL_LABEL_DATE_RANGE,
    MERGE_EXECUTE,
    CANCEL,
    MERGE_MODAL_COMPLETED,
    MERGE_MODAL_INCOMPLETE,
} from "../../constants";

interface MergeConfirmModalProps {
    open: boolean;
    group: DuplicateGroup | null;
    time_format: TimeDisplayFormat;
    on_confirm: () => void;
    on_cancel: () => void;
}

export function MergeConfirmModal({
    open,
    group,
    time_format,
    on_confirm,
    on_cancel,
}: MergeConfirmModalProps) {
    if (!group) return null;

    return (
        <Modal
            title={
                <Space>
                    <MergeCellsOutlined />
                    <span>{MERGE_MODAL_TITLE}</span>
                </Space>
            }
            open={open}
            onCancel={on_cancel}
            onOk={on_confirm}
            okText={MERGE_EXECUTE}
            okButtonProps={{ danger: true }}
            cancelText={CANCEL}
            width={900}
        >
            <Space direction="vertical" size="middle" className="!w-full">
                <Alert
                    type="warning"
                    message={MERGE_MODAL_WARNING}
                    description={
                        <>
                            <p>
                                <strong>{group.records.length}</strong>{" "}
                                {MERGE_MODAL_DESC_RECORDS}
                            </p>
                            <p>{MERGE_MODAL_DESC_FIRST}</p>
                        </>
                    }
                    showIcon
                />

                <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label={MERGE_MODAL_LABEL_WORK} span={2}>
                        {group.work_name}
                    </Descriptions.Item>
                    <Descriptions.Item label={MERGE_MODAL_LABEL_DEAL} span={2}>
                        {group.deal_name}
                    </Descriptions.Item>
                    <Descriptions.Item label={MERGE_MODAL_LABEL_TARGET}>
                        {group.records.length}개
                    </Descriptions.Item>
                    <Descriptions.Item label={MERGE_MODAL_LABEL_TOTAL_SESSIONS}>
                        {group.total_sessions}개
                    </Descriptions.Item>
                    <Descriptions.Item label={MERGE_MODAL_LABEL_TOTAL_DURATION}>
                        {formatDuration(group.total_duration || 0, time_format)}
                    </Descriptions.Item>
                    <Descriptions.Item label={MERGE_MODAL_LABEL_DATE_RANGE}>
                        {group.date_range}
                    </Descriptions.Item>
                </Descriptions>

                <Card size="small" title={MERGE_MODAL_RECORDS_LIST}>
                    <Table
                        columns={[
                            {
                                title: "#",
                                width: 50,
                                render: (_, __, idx) => (
                                    <Tag
                                        color={idx === 0 ? "green" : "default"}
                                    >
                                        {idx === 0
                                            ? MERGE_MODAL_LABEL_BASE
                                            : idx + 1}
                                    </Tag>
                                ),
                            },
                            { title: "날짜", dataIndex: "date", width: 110 },
                            {
                                title: "프로젝트",
                                dataIndex: "project_code",
                                width: 120,
                            },
                            {
                                title: "세션",
                                width: 70,
                                render: (_, r) =>
                                    `${r.sessions?.length || 0}개`,
                            },
                            {
                                title: "소요시간",
                                dataIndex: "duration_minutes",
                                width: 90,
                                render: (mins: number) =>
                                    formatDuration(mins || 0, time_format),
                            },
                            {
                                title: "시간",
                                width: 130,
                                render: (_, r) =>
                                    `${r.start_time || "-"} ~ ${
                                        r.end_time || "-"
                                    }`,
                            },
                            {
                                title: "상태",
                                width: 80,
                                render: (_, r) =>
                                    r.is_completed ? (
                                        <Tag color="green">
                                            {MERGE_MODAL_COMPLETED}
                                        </Tag>
                                    ) : (
                                        <Tag>{MERGE_MODAL_INCOMPLETE}</Tag>
                                    ),
                            },
                        ]}
                        dataSource={group.records}
                        rowKey="id"
                        size="small"
                        pagination={false}
                    />
                </Card>
            </Space>
        </Modal>
    );
}
