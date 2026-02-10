/**
 * Session edit panel (Toss-style card list)
 * 3-1: Panel expand animation (handled by parent)
 * 3-2: Session card stagger entrance
 * 3-3: Session delete slide animation
 * 6-1: Inline success on update
 * 6-2: Error shake on invalid time
 */

import { useCallback, useState } from "react";
import { Popconfirm } from "antd";
import { message } from "@/shared/lib/message";
import { DeleteOutlined, HistoryOutlined } from "@ant-design/icons";

import { useWorkStore } from "../../../../store/useWorkStore";
import type { WorkSession } from "../../../../shared/types";
import { TimeInput, DateInput } from "../../../../shared/ui";
import { formatDuration } from "../../../../shared/lib/time";
import { getSessionMinutes } from "../../../../shared/lib/session";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../../shared/constants";
import {
    motion,
    AnimatePresence,
    SPRING,
    STAGGER,
    InlineSuccess,
    ErrorShake,
} from "../../../../shared/ui/animation";

const SESSION_HEADER_LABEL = "세션 이력";
const SESSION_UNIT = "개";
const SESSION_IN_PROGRESS = "진행 중";
const SESSION_FIRST_START = "첫 시작";
const SESSION_LAST_END = "마지막 종료";
const SESSION_TOTAL_PREFIX = "총";
const SESSION_DELETE_TITLE = "세션 삭제";
const SESSION_DELETE_DESC = "이 세션을 삭제할까요?";
const SESSION_DELETE_OK = "삭제";
const SESSION_DELETE_CANCEL = "취소";

const TOSS_INPUT_STYLE: React.CSSProperties = {
    border: "none",
    background: "var(--color-bg-grey)",
    borderRadius: 4,
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 500,
    color: "var(--color-text-primary)",
    boxShadow: "none",
    padding: "2px 8px",
    height: "auto",
    lineHeight: "1.5",
};

const TOSS_DATE_INPUT_STYLE: React.CSSProperties = {
    ...TOSS_INPUT_STYLE,
    fontSize: 13,
    color: "var(--color-text-secondary)",
};

const card_variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: {
        opacity: 0,
        x: -30,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.2 },
    },
};

interface SessionEditTableProps {
    record_id: string;
}

export function SessionEditTable({ record_id }: SessionEditTableProps) {
    const record = useWorkStore((state) =>
        state.records.find((r) => r.id === record_id)
    );
    const updateSession = useWorkStore((state) => state.updateSession);
    const deleteSession = useWorkStore((state) => state.deleteSession);

    const [success_id, setSuccessId] = useState<string | null>(null);
    const [error_id, setErrorId] = useState<string | null>(null);

    const handleUpdateTime = useCallback(
        (session_id: string, new_start: string, new_end: string) => {
            const result = updateSession(
                record_id,
                session_id,
                new_start,
                new_end
            );
            if (result.success) {
                // 6-1: Success feedback
                setSuccessId(session_id);
                setTimeout(() => setSuccessId(null), 1500);
                if (result.adjusted) {
                    message.warning(
                        result.message || "시간이 자동 조정되었습니다."
                    );
                } else {
                    message.success(SUCCESS_MESSAGES.sessionUpdated);
                }
            } else {
                // 6-2: Error shake
                setErrorId(session_id);
                setTimeout(() => setErrorId(null), 500);
                message.error(
                    result.message || ERROR_MESSAGES.timeUpdateFailed
                );
            }
        },
        [record_id, updateSession]
    );

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
                setSuccessId(session.id);
                setTimeout(() => setSuccessId(null), 1500);
                message.success(SUCCESS_MESSAGES.dateUpdated);
            } else {
                setErrorId(session.id);
                setTimeout(() => setErrorId(null), 500);
                message.error(
                    result.message || ERROR_MESSAGES.dateUpdateFailed
                );
            }
        },
        [record_id, updateSession]
    );

    const handleDeleteSession = useCallback(
        (session_id: string) => {
            deleteSession(record_id, session_id);
            message.success(SUCCESS_MESSAGES.sessionDeleted);
        },
        [record_id, deleteSession]
    );

    if (!record) return null;

    const sessions = record.sessions || [];
    const total_minutes = sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );

    return (
        <div className="toss-session-panel p-lg bg-bg-light rounded-lg">
            {/* Header */}
            <div className="flex items-center gap-sm mb-md">
                <HistoryOutlined
                    className="text-primary"
                    style={{ fontSize: 14 }}
                />
                <span className="text-sm font-semibold text-text-primary">
                    {SESSION_HEADER_LABEL} ({sessions.length}
                    {SESSION_UNIT})
                </span>
            </div>

            {/* 3-2: Session cards with stagger + 3-3: delete animation */}
            <div className="flex flex-col gap-sm">
                <AnimatePresence mode="popLayout">
                    {sessions.map((session, idx) => (
                        <motion.div
                            key={session.id}
                            layout
                            variants={card_variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{
                                ...SPRING.gentle,
                                delay: idx * (STAGGER.fast / 1000),
                            }}
                        >
                            <SessionCard
                                session={session}
                                index={idx}
                                record_date={record.date}
                                onUpdateTime={handleUpdateTime}
                                onUpdateDate={handleUpdateDate}
                                onDelete={handleDeleteSession}
                                show_success={success_id === session.id}
                                show_error={error_id === session.id}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Summary */}
            <div
                className="flex items-center gap-md mt-md pt-md text-sm"
                style={{
                    borderTop: "1px dashed var(--color-border-default)",
                }}
            >
                <span className="text-text-secondary">
                    {SESSION_FIRST_START} {record.start_time}
                </span>
                <span className="text-border-dark">|</span>
                <span className="text-text-secondary">
                    {SESSION_LAST_END} {record.end_time}
                </span>
                <span className="font-semibold text-primary ml-auto">
                    {SESSION_TOTAL_PREFIX} {formatDuration(total_minutes)}
                </span>
            </div>
        </div>
    );
}

// ============================================
// SessionCard sub-component
// ============================================

interface SessionCardProps {
    session: WorkSession;
    index: number;
    record_date: string;
    onUpdateTime: (
        session_id: string,
        new_start: string,
        new_end: string
    ) => void;
    onUpdateDate: (session: WorkSession, new_date: string) => void;
    onDelete: (session_id: string) => void;
    show_success: boolean;
    show_error: boolean;
}

function SessionCard({
    session,
    index,
    record_date,
    onUpdateTime,
    onUpdateDate,
    onDelete,
    show_success,
    show_error,
}: SessionCardProps) {
    const is_running = session.end_time === "";
    const duration = is_running ? 0 : getSessionMinutes(session);

    return (
        <ErrorShake trigger={show_error} intensity={6}>
            <div className="flex items-center gap-lg py-sm px-md bg-white rounded-md border border-border-light">
                {/* Index */}
                <span className="text-sm text-text-secondary w-5 text-center flex-shrink-0">
                    {index + 1}
                </span>

                {/* Date */}
                <div className="flex-shrink-0">
                    <DateInput
                        value={session.date || record_date}
                        onSave={(new_date) => onUpdateDate(session, new_date)}
                        width={90}
                        style={TOSS_DATE_INPUT_STYLE}
                    />
                </div>

                {/* Time inputs */}
                <div className="flex items-center gap-sm">
                    <div className="flex-shrink-0">
                        <TimeInput
                            value={session.start_time}
                            onSave={(new_time) =>
                                onUpdateTime(
                                    session.id,
                                    new_time,
                                    session.end_time
                                )
                            }
                            width={60}
                            style={TOSS_INPUT_STYLE}
                        />
                    </div>

                    <span className="text-text-disabled text-sm">→</span>

                    <div className="flex-shrink-0">
                        {is_running ? (
                            <span className="text-sm text-warning font-medium">
                                {SESSION_IN_PROGRESS}
                            </span>
                        ) : (
                            <TimeInput
                                value={session.end_time}
                                onSave={(new_time) =>
                                    onUpdateTime(
                                        session.id,
                                        session.start_time,
                                        new_time
                                    )
                                }
                                width={60}
                                style={TOSS_INPUT_STYLE}
                            />
                        )}
                    </div>
                </div>

                {/* Duration + inline success */}
                <div className="flex items-center gap-xs ml-auto">
                    <InlineSuccess
                        show={show_success}
                        size={14}
                        color="var(--color-success)"
                    />
                    <span className="text-sm text-text-secondary">
                        {is_running ? "-" : formatDuration(duration)}
                    </span>
                </div>

                {/* Delete */}
                {!is_running && (
                    <Popconfirm
                        title={SESSION_DELETE_TITLE}
                        description={SESSION_DELETE_DESC}
                        onConfirm={() => onDelete(session.id)}
                        okText={SESSION_DELETE_OK}
                        cancelText={SESSION_DELETE_CANCEL}
                        okButtonProps={{ danger: true, autoFocus: true }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            className="w-6 h-6 border-0 bg-transparent rounded flex items-center justify-center text-text-disabled hover:bg-red-50 hover:text-error transition-colors cursor-pointer flex-shrink-0"
                        >
                            <DeleteOutlined style={{ fontSize: 12 }} />
                        </motion.button>
                    </Popconfirm>
                )}
            </div>
        </ErrorShake>
    );
}

export default SessionEditTable;
