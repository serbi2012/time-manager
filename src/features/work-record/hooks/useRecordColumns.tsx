/**
 * 데스크탑 작업 기록 테이블의 컬럼 정의 훅
 */

import { useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import type { WorkRecord } from "../../../types";
import {
    TimerActionColumn,
    DealNameColumn,
    WorkNameColumn,
    TaskNameColumn,
    CategoryColumn,
    DurationColumn,
    TimeRangeColumn,
    DateColumn,
    ActionsColumn,
} from "../ui/RecordColumns";
import { RECORD_TABLE_COLUMN, RECORD_COLUMN_WIDTH } from "../constants";

interface UseRecordColumnsParams {
    active_record_id: string | null;
    is_timer_running: boolean;
    theme_color: string;
    selected_date: string;
    getElapsedSeconds: () => number;
    onToggle: (record: WorkRecord) => void;
    onComplete: (record: WorkRecord) => void;
    onUncomplete: (record: WorkRecord) => void;
    onEdit: (record: WorkRecord) => void;
    onDelete: (record_id: string) => void;
}

export function useRecordColumns({
    active_record_id,
    is_timer_running,
    theme_color,
    selected_date,
    getElapsedSeconds,
    onToggle,
    onComplete,
    onUncomplete,
    onEdit,
    onDelete,
}: UseRecordColumnsParams): ColumnsType<WorkRecord> {
    return useMemo(
        () => [
            {
                title: "",
                key: "timer_action",
                width: RECORD_COLUMN_WIDTH.TIMER_ACTION,
                align: "center",
                render: (_: unknown, record: WorkRecord) => (
                    <TimerActionColumn
                        record={record}
                        is_active={active_record_id === record.id}
                        is_timer_running={is_timer_running}
                        onToggle={onToggle}
                    />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.DEAL_NAME,
                dataIndex: "deal_name",
                key: "deal_name",
                width: RECORD_COLUMN_WIDTH.DEAL_NAME,
                render: (_: unknown, record: WorkRecord) => (
                    <DealNameColumn
                        record={record}
                        is_active={active_record_id === record.id}
                        is_completed={record.is_completed}
                        theme_color={theme_color}
                        elapsed_seconds={getElapsedSeconds()}
                    />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.WORK_NAME,
                dataIndex: "work_name",
                key: "work_name",
                width: RECORD_COLUMN_WIDTH.WORK_NAME,
                render: (_: unknown, record: WorkRecord) => (
                    <WorkNameColumn
                        record={record}
                        is_active={active_record_id === record.id}
                    />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.TASK_NAME,
                dataIndex: "task_name",
                key: "task_name",
                width: RECORD_COLUMN_WIDTH.TASK_NAME,
                render: (_: unknown, record: WorkRecord) => (
                    <TaskNameColumn record={record} />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.CATEGORY,
                dataIndex: "category_name",
                key: "category_name",
                width: RECORD_COLUMN_WIDTH.CATEGORY,
                render: (_: unknown, record: WorkRecord) => (
                    <CategoryColumn record={record} />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.TIME,
                dataIndex: "duration_minutes",
                key: "duration_minutes",
                width: RECORD_COLUMN_WIDTH.DURATION,
                align: "center",
                render: (_: unknown, record: WorkRecord) => (
                    <DurationColumn
                        record={record}
                        selected_date={selected_date}
                    />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.TIME_RANGE,
                key: "time_range",
                width: RECORD_COLUMN_WIDTH.TIME_RANGE,
                render: (_: unknown, record: WorkRecord) => (
                    <TimeRangeColumn
                        record={record}
                        selected_date={selected_date}
                    />
                ),
            },
            {
                title: RECORD_TABLE_COLUMN.DATE,
                dataIndex: "date",
                key: "date",
                width: RECORD_COLUMN_WIDTH.DATE,
                render: (date: string) => <DateColumn date={date} />,
            },
            {
                title: "",
                key: "action",
                width: RECORD_COLUMN_WIDTH.ACTIONS,
                render: (_: unknown, record: WorkRecord) => (
                    <ActionsColumn
                        record={record}
                        is_active={record.id === active_record_id}
                        onComplete={onComplete}
                        onUncomplete={onUncomplete}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ),
            },
        ],
        [
            active_record_id,
            is_timer_running,
            theme_color,
            getElapsedSeconds,
            selected_date,
            onToggle,
            onComplete,
            onUncomplete,
            onEdit,
            onDelete,
        ]
    );
}
