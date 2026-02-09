/**
 * 세션 편집 테이블 컴포넌트
 *
 * 레코드의 세션 목록을 표시하고 편집할 수 있는 테이블
 * 타이머 리렌더링과 독립적으로 동작
 */

import { useState, useCallback } from "react";
import { Table, Button, Popconfirm, Space, Typography, message } from "antd";
import { DeleteOutlined, HistoryOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useWorkStore } from "../../../../store/useWorkStore";
import type { WorkSession } from "../../../../shared/types";
import { TimeInput, DateInput } from "../../../../shared/ui";
import { formatDuration } from "../../../../shared/lib/time";
import { getSessionMinutes } from "../../../../shared/lib/session";
import { APP_THEME_COLORS } from "../../../../shared/config";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../../shared/constants";

const { Text } = Typography;

interface SessionEditTableProps {
    record_id: string;
}

/**
 * 세션 편집 테이블 컴포넌트
 * record_id만 받고 직접 스토어에서 레코드를 구독하여 불필요한 리렌더링 방지
 */
export function SessionEditTable({ record_id }: SessionEditTableProps) {
    // 직접 스토어에서 레코드와 액션 구독
    const record = useWorkStore((state) =>
        state.records.find((r) => r.id === record_id)
    );
    const updateSession = useWorkStore((state) => state.updateSession);
    const deleteSession = useWorkStore((state) => state.deleteSession);
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    // 선택 삭제를 위한 상태
    const [selected_session_keys, setSelectedSessionKeys] = useState<
        React.Key[]
    >([]);

    // 시간 변경 핸들러
    const handleUpdateTime = useCallback(
        (session_id: string, new_start: string, new_end: string) => {
            const result = updateSession(
                record_id,
                session_id,
                new_start,
                new_end
            );
            if (result.success) {
                if (result.adjusted) {
                    message.warning(
                        result.message || "시간이 자동 조정되었습니다."
                    );
                } else {
                    message.success(SUCCESS_MESSAGES.sessionUpdated);
                }
            } else {
                message.error(
                    result.message || ERROR_MESSAGES.timeUpdateFailed
                );
            }
        },
        [record_id, updateSession]
    );

    // 날짜 변경 핸들러
    const handleUpdateDate = useCallback(
        (session: WorkSession, new_date: string) => {
            const result = updateSession(
                record_id,
                session.id,
                session.start_time,
                session.end_time,
                new_date
            );
            if (result.success) {
                message.success(SUCCESS_MESSAGES.dateUpdated);
            } else {
                message.error(
                    result.message || ERROR_MESSAGES.dateUpdateFailed
                );
            }
        },
        [record_id, updateSession]
    );

    // 세션 삭제 핸들러
    const handleDeleteSession = useCallback(
        (session_id: string) => {
            deleteSession(record_id, session_id);
            message.success(SUCCESS_MESSAGES.sessionDeleted);
        },
        [record_id, deleteSession]
    );

    // 선택된 세션 일괄 삭제
    const handleBulkDelete = useCallback(() => {
        selected_session_keys.forEach((key) => {
            deleteSession(record_id, key as string);
        });
        setSelectedSessionKeys([]);
        message.success(
            SUCCESS_MESSAGES.sessionsDeleted(selected_session_keys.length)
        );
    }, [record_id, deleteSession, selected_session_keys]);

    if (!record) return null;

    const sessions = record.sessions || [];

    const columns: ColumnsType<WorkSession> = [
        {
            title: "날짜",
            dataIndex: "date",
            key: "date",
            width: 120,
            render: (_, session) => (
                <DateInput
                    value={session.date || record.date}
                    onSave={(new_date) => handleUpdateDate(session, new_date)}
                />
            ),
        },
        {
            title: "시작",
            dataIndex: "start_time",
            key: "start_time",
            width: 90,
            render: (_, session) => (
                <TimeInput
                    value={session.start_time}
                    onSave={(new_time) =>
                        handleUpdateTime(session.id, new_time, session.end_time)
                    }
                />
            ),
        },
        {
            title: "종료",
            dataIndex: "end_time",
            key: "end_time",
            width: 90,
            render: (_, session) =>
                session.end_time === "" ? (
                    <Text type="warning">진행 중</Text>
                ) : (
                    <TimeInput
                        value={session.end_time}
                        onSave={(new_time) =>
                            handleUpdateTime(
                                session.id,
                                session.start_time,
                                new_time
                            )
                        }
                    />
                ),
        },
        {
            title: "소요",
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            width: 80,
            render: (_, session) => (
                <Text type="secondary">
                    {session.end_time === ""
                        ? "-"
                        : formatDuration(getSessionMinutes(session))}
                </Text>
            ),
        },
        {
            title: "",
            key: "action",
            width: 50,
            render: (_, session) =>
                session.end_time !== "" && (
                    <Popconfirm
                        title="세션 삭제"
                        description="이 세션을 삭제하시겠습니까?"
                        onConfirm={() => handleDeleteSession(session.id)}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true, autoFocus: true }}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                ),
        },
    ];

    const row_selection = {
        selectedRowKeys: selected_session_keys,
        onChange: (keys: React.Key[]) => setSelectedSessionKeys(keys),
        getCheckboxProps: (session: WorkSession) => ({
            disabled: session.end_time === "", // 진행 중인 세션은 선택 불가
        }),
    };

    return (
        <div className="session-history">
            <div className="session-header">
                <HistoryOutlined
                    style={{ marginRight: 8, color: theme_color }}
                />
                <Text strong>세션 이력 ({sessions.length}개)</Text>
                {selected_session_keys.length > 0 && (
                    <Popconfirm
                        title="선택 삭제"
                        description={`선택한 ${selected_session_keys.length}개 세션을 삭제하시겠습니까?`}
                        onConfirm={handleBulkDelete}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            danger
                            size="small"
                            className="!ml-lg"
                        >
                            선택 삭제 ({selected_session_keys.length})
                        </Button>
                    </Popconfirm>
                )}
            </div>

            <Table
                dataSource={sessions}
                columns={columns}
                rowKey="id"
                size="small"
                pagination={false}
                rowSelection={row_selection}
            />

            <div className="session-summary">
                <Space split={<span className="text-gray-300">|</span>}>
                    <Text type="secondary">첫 시작: {record.start_time}</Text>
                    <Text type="secondary">마지막 종료: {record.end_time}</Text>
                    <Text strong style={{ color: theme_color }}>
                        총{" "}
                        {formatDuration(
                            sessions.reduce(
                                (sum, s) => sum + getSessionMinutes(s),
                                0
                            )
                        )}
                    </Text>
                </Space>
            </div>

            <style>{`
                .session-history { padding: var(--spacing-lg) var(--spacing-xl); background: var(--color-bg-light); border-radius: var(--radius-lg); }
                .session-header { display: flex; align-items: center; margin-bottom: 8px; }
                .session-summary { margin-top: var(--spacing-lg); padding-top: var(--spacing-md); border-top: 1px dashed var(--color-border-default); }
            `}</style>
        </div>
    );
}

export default SessionEditTable;
