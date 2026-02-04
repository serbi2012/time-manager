/**
 * 세션 분석 테이블 (컬럼 정의는 return 내부로 한정)
 */

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SessionWithMeta } from "../../lib/conflict_finder";
import type { ProblemInfo } from "../../lib/problem_detector";
import { formatDuration } from "../../lib/statistics";
import {
    SessionDateCell,
    SessionTimeCell,
    SessionConflictCell,
    SessionProblemCell,
    SessionGanttCell,
} from "./SessionTableCells";
import {
    TABLE_COL_DATE,
    TABLE_COL_TIME,
    TABLE_COL_WORK_NAME,
    TABLE_COL_DEAL_NAME,
    TABLE_COL_PROJECT,
    TABLE_COL_DURATION,
    TABLE_COL_CONFLICT,
    TABLE_COL_PROBLEM,
    TABLE_COL_GANTT,
    TABLE_FILTER_CONFLICT_YES,
    TABLE_FILTER_CONFLICT_NO,
    TABLE_FILTER_PROBLEM_YES,
    TABLE_FILTER_PROBLEM_NO,
    TABLE_FILTER_ZERO,
    TABLE_FILTER_MISSING,
    TABLE_FILTER_GANTT_VISIBLE,
    TABLE_FILTER_GANTT_INVISIBLE,
    PAGINATION_TOTAL,
} from "../../constants";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";

interface SessionTableProps {
    data_source: SessionWithMeta[];
    unique_dates: string[];
    all_sessions: SessionWithMeta[];
    conflict_pairs: Map<string, SessionWithMeta[]>;
    conflict_session_ids: Set<string>;
    problem_sessions: Map<string, ProblemInfo[]>;
    problem_session_ids: Set<string>;
    invisible_session_ids: Set<string>;
    time_format: TimeDisplayFormat;
    selected_row_keys: React.Key[];
    on_selection_change: (keys: React.Key[]) => void;
}

export function SessionTable({
    data_source,
    unique_dates,
    all_sessions,
    conflict_pairs,
    conflict_session_ids,
    problem_sessions,
    problem_session_ids,
    invisible_session_ids,
    time_format,
    selected_row_keys,
    on_selection_change,
}: SessionTableProps) {
    const work_names = Array.from(new Set(all_sessions.map((s) => s.work_name)))
        .slice(0, 20)
        .map((name) => ({ text: name, value: name }));

    const columns: ColumnsType<SessionWithMeta> = [
        {
            title: TABLE_COL_DATE,
            dataIndex: "date",
            width: 120,
            filters: unique_dates
                .slice(0, 30)
                .map((d) => ({ text: d, value: d })),
            onFilter: (value, record) => record.date === value,
            sorter: (a, b) => a.date.localeCompare(b.date),
            render: (date: string) => <SessionDateCell date={date} />,
        },
        {
            title: TABLE_COL_TIME,
            width: 150,
            render: (_, record) => <SessionTimeCell record={record} />,
            sorter: (a, b) =>
                (a.start_time || "").localeCompare(b.start_time || ""),
        },
        {
            title: TABLE_COL_WORK_NAME,
            dataIndex: "work_name",
            ellipsis: true,
            filters: work_names,
            onFilter: (value, record) => record.work_name === value,
        },
        {
            title: TABLE_COL_DEAL_NAME,
            dataIndex: "deal_name",
            ellipsis: true,
        },
        {
            title: TABLE_COL_PROJECT,
            dataIndex: "project_code",
            width: 120,
            ellipsis: true,
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
            title: TABLE_COL_CONFLICT,
            width: 80,
            align: "center",
            render: (_, record) => (
                <SessionConflictCell
                    record={record}
                    conflict_pairs={conflict_pairs}
                />
            ),
            filters: [
                { text: TABLE_FILTER_CONFLICT_YES, value: "conflict" },
                { text: TABLE_FILTER_CONFLICT_NO, value: "no-conflict" },
            ],
            onFilter: (value, record) => {
                const has = conflict_session_ids.has(record.id);
                return value === "conflict" ? has : !has;
            },
        },
        {
            title: TABLE_COL_PROBLEM,
            width: 120,
            align: "center",
            render: (_, record) => (
                <SessionProblemCell
                    record={record}
                    problems={problem_sessions}
                />
            ),
            filters: [
                { text: TABLE_FILTER_PROBLEM_YES, value: "problem" },
                { text: TABLE_FILTER_PROBLEM_NO, value: "no-problem" },
                { text: TABLE_FILTER_ZERO, value: "zero_duration" },
                { text: TABLE_FILTER_MISSING, value: "missing_time" },
            ],
            onFilter: (value, record) => {
                const problems = problem_sessions.get(record.id);
                const has = problems && problems.length > 0;
                if (value === "problem") return has ?? false;
                if (value === "no-problem") return !has;
                if (value === "zero_duration")
                    return (
                        problems?.some((p) => p.type === "zero_duration") ??
                        false
                    );
                if (value === "missing_time")
                    return (
                        problems?.some((p) => p.type === "missing_time") ??
                        false
                    );
                return false;
            },
        },
        {
            title: TABLE_COL_GANTT,
            width: 80,
            align: "center",
            render: (_, record) => (
                <SessionGanttCell
                    record={record}
                    invisible_ids={invisible_session_ids}
                />
            ),
            filters: [
                { text: TABLE_FILTER_GANTT_VISIBLE, value: "visible" },
                { text: TABLE_FILTER_GANTT_INVISIBLE, value: "invisible" },
            ],
            onFilter: (value, record) => {
                const inv = invisible_session_ids.has(record.id);
                return value === "invisible" ? inv : !inv;
            },
        },
    ];

    return (
        <Table<SessionWithMeta>
            columns={columns}
            dataSource={data_source}
            rowKey="id"
            size="small"
            pagination={{
                pageSize: 50,
                showSizeChanger: true,
                pageSizeOptions: ["20", "50", "100", "200"],
                showTotal: (total, range) =>
                    PAGINATION_TOTAL(range[0], range[1], total),
            }}
            rowSelection={{
                selectedRowKeys: selected_row_keys,
                onChange: (keys) => on_selection_change(keys || []),
            }}
            rowClassName={(record) => {
                if (conflict_session_ids.has(record.id))
                    return "admin-conflict-row";
                if (problem_session_ids.has(record.id))
                    return "admin-problem-row";
                if (invisible_session_ids.has(record.id))
                    return "admin-invisible-row";
                return "";
            }}
            scroll={{ x: 900 }}
        />
    );
}
