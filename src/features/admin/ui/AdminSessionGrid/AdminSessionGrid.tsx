/**
 * 관리자 세션 그리드 (메인 컴포넌트 - 슬림)
 */

import { useState } from "react";
import { Layout, Card, Tabs, Empty, Badge } from "antd";
import { message } from "@/shared/lib/message";
import {
    CalendarOutlined,
    DatabaseOutlined,
    SearchOutlined,
    BarChartOutlined,
    DeleteOutlined,
    ExportOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../../firebase/useAuth";
import { useWorkStore } from "../../../../store/useWorkStore";
import { SUCCESS_MESSAGES } from "../../../../shared/constants";
import type { WorkRecord, WorkSession } from "../../../../shared/types";
import { useAdminData } from "../../hooks/useAdminData";
import { useAdminFilters } from "../../hooks/useAdminFilters";
import { useAdminTabs } from "../../hooks/useAdminTabs";
import { ADMIN_EMAIL } from "../../constants";
import { ADMIN_ACCESS_REQUIRED } from "../../constants";
import { AdminGridHeader } from "./AdminGridHeader";
import {
    SessionsTab,
    RecordsTab,
    ExplorerTab,
    StatisticsTab,
    TrashTab,
    ExportTab,
    IntegrityTab,
} from "../AdminTabs";
import { RecordDetailModal } from "./RecordDetailModal";
import { MergeConfirmModal } from "./MergeConfirmModal";
import type { DuplicateGroup } from "../../lib/duplicate_finder";
import type { AdminTab } from "../../lib/types";
import {
    TAB_SESSIONS,
    TAB_RECORDS,
    TAB_EXPLORER,
    TAB_STATISTICS,
    TAB_TRASH,
    TAB_EXPORT,
    TAB_INTEGRITY,
} from "../../constants";

const { Content } = Layout;

function AdminSessionGridContent() {
    const {
        records,
        all_sessions,
        conflicts,
        problem_sessions,
        duplicate_groups,
        all_records,
    } = useAdminData();

    const filters = useAdminFilters();
    const tabs = useAdminTabs();

    const deleteSession = useWorkStore((state) => state.deleteSession);
    const updateRecord = useWorkStore((state) => state.updateRecord);
    const deleteRecord = useWorkStore((state) => state.deleteRecord);
    const permanentlyDeleteRecord = useWorkStore(
        (state) => state.permanentlyDeleteRecord
    );

    const [selected_row_keys, set_selected_row_keys] = useState<React.Key[]>(
        []
    );
    const [selected_record_keys, set_selected_record_keys] = useState<
        React.Key[]
    >([]);
    const [detail_modal_record, set_detail_modal_record] =
        useState<WorkRecord | null>(null);
    const [merge_modal_open, set_merge_modal_open] = useState(false);
    const [merge_target_group, set_merge_target_group] =
        useState<DuplicateGroup | null>(null);

    const handle_copy_records = (record_ids: React.Key[]) => {
        const selected = records.filter((r) => record_ids.includes(r.id));
        const json_data = JSON.stringify(selected, null, 2);
        navigator.clipboard.writeText(json_data);
        message.success(
            SUCCESS_MESSAGES.recordsCopiedToClipboard(selected.length)
        );
    };

    const handle_merge_records = () => {
        if (!merge_target_group || merge_target_group.records.length < 2)
            return;
        const sorted = [...merge_target_group.records].sort((a, b) => {
            const dc = a.date.localeCompare(b.date);
            if (dc !== 0) return dc;
            return (a.start_time || "").localeCompare(b.start_time || "");
        });
        const base = sorted[0];
        const others = sorted.slice(1);
        const all_sessions_list: WorkSession[] = [...(base.sessions || [])];
        const ids = new Set(all_sessions_list.map((s) => s.id));
        others.forEach((r) => {
            (r.sessions || []).forEach((s) => {
                if (!ids.has(s.id)) {
                    all_sessions_list.push(s);
                    ids.add(s.id);
                }
            });
        });
        all_sessions_list.sort((a, b) => {
            const da = (a.date || base.date).localeCompare(b.date || base.date);
            if (da !== 0) return da;
            return (a.start_time || "").localeCompare(b.start_time || "");
        });
        const total_duration = all_sessions_list.reduce(
            (sum, s) => sum + (s.duration_minutes || 0),
            0
        );
        const first = all_sessions_list[0];
        const last = all_sessions_list[all_sessions_list.length - 1];
        updateRecord(base.id, {
            sessions: all_sessions_list,
            duration_minutes: total_duration,
            start_time: first?.start_time || base.start_time,
            end_time: last?.end_time || base.end_time,
            date: all_sessions_list[0]?.date || base.date,
        });
        others.forEach((r) => deleteRecord(r.id));
        message.success(
            SUCCESS_MESSAGES.recordsMergedDetail(
                merge_target_group.records.length,
                all_sessions_list.length,
                total_duration
            )
        );
        set_merge_modal_open(false);
        set_merge_target_group(null);
    };

    const handle_bulk_delete_sessions = () => {
        if (selected_row_keys.length === 0) return;
        selected_row_keys.forEach((session_id) => {
            const session = all_sessions.find((s) => s.id === session_id);
            if (session) deleteSession(session.record_id, session.id);
        });
        message.success(
            SUCCESS_MESSAGES.sessionsDeleted(selected_row_keys.length)
        );
        set_selected_row_keys([]);
    };

    const handle_bulk_delete_records = (keys: React.Key[]) => {
        keys.forEach((id) => deleteRecord(id as string));
        message.success(SUCCESS_MESSAGES.recordsDeleted(keys.length));
        set_selected_record_keys([]);
    };

    const tab_items: {
        key: AdminTab;
        label: React.ReactNode;
        children: React.ReactNode;
    }[] = [
        {
            key: "sessions",
            label: (
                <span>
                    <CalendarOutlined /> {TAB_SESSIONS}
                </span>
            ),
            children: (
                <SessionsTab
                    all_sessions={all_sessions}
                    conflicts={conflicts}
                    problem_sessions={problem_sessions}
                    date_range={filters.date_range}
                    set_date_range={filters.set_date_range}
                    view_mode={filters.view_mode}
                    set_view_mode={filters.set_view_mode}
                    time_format={filters.time_format}
                    search_date={filters.search_date}
                    set_search_date={filters.set_search_date}
                    search_time={filters.search_time}
                    set_search_time={filters.set_search_time}
                    selected_row_keys={selected_row_keys}
                    set_selected_row_keys={set_selected_row_keys}
                    on_bulk_delete={handle_bulk_delete_sessions}
                />
            ),
        },
        {
            key: "records",
            label:
                duplicate_groups.length > 0 ? (
                    <span>
                        <DatabaseOutlined /> {TAB_RECORDS}{" "}
                        <Badge count={duplicate_groups.length} size="small" />
                    </span>
                ) : (
                    <span>
                        <DatabaseOutlined /> {TAB_RECORDS}
                    </span>
                ),
            children: (
                <RecordsTab
                    all_records={all_records}
                    duplicate_groups={duplicate_groups}
                    time_format={filters.time_format}
                    selected_record_keys={selected_record_keys}
                    set_selected_record_keys={set_selected_record_keys}
                    on_copy={handle_copy_records}
                    on_bulk_delete={handle_bulk_delete_records}
                    on_open_detail={set_detail_modal_record}
                    on_open_merge={(g) => {
                        set_merge_target_group(g);
                        set_merge_modal_open(true);
                    }}
                />
            ),
        },
        {
            key: "explorer",
            label: (
                <span>
                    <SearchOutlined /> {TAB_EXPLORER}
                </span>
            ),
            children: (
                <ExplorerTab
                    records={records}
                    time_format={filters.time_format}
                />
            ),
        },
        {
            key: "statistics",
            label: (
                <span>
                    <BarChartOutlined /> {TAB_STATISTICS}
                </span>
            ),
            children: (
                <StatisticsTab
                    records={records}
                    time_format={filters.time_format}
                />
            ),
        },
        {
            key: "trash",
            label: (() => {
                const deleted_count = records.filter(
                    (r) => r.is_deleted
                ).length;
                return deleted_count > 0 ? (
                    <span>
                        <DeleteOutlined /> {TAB_TRASH}{" "}
                        <Badge count={deleted_count} size="small" />
                    </span>
                ) : (
                    <span>
                        <DeleteOutlined /> {TAB_TRASH}
                    </span>
                );
            })(),
            children: (
                <TrashTab
                    records={records}
                    time_format={filters.time_format}
                    on_restore={(id) =>
                        updateRecord(id, {
                            is_deleted: false,
                            deleted_at: undefined,
                        })
                    }
                    on_permanent_delete={permanentlyDeleteRecord}
                />
            ),
        },
        {
            key: "export",
            label: (
                <span>
                    <ExportOutlined /> {TAB_EXPORT}
                </span>
            ),
            children: (
                <ExportTab
                    records={records}
                    time_format={filters.time_format}
                />
            ),
        },
        {
            key: "integrity",
            label: (
                <span>
                    <SafetyCertificateOutlined /> {TAB_INTEGRITY}
                </span>
            ),
            children: (
                <IntegrityTab
                    records={records}
                    on_fix_time_mismatch={(id, duration) =>
                        updateRecord(id, { duration_minutes: duration })
                    }
                    on_delete_session={deleteSession}
                />
            ),
        },
    ];

    return (
        <Layout className="app-body !p-0">
            <Content className="!p-xl">
                <Card
                    title={
                        <AdminGridHeader
                            time_format={filters.time_format}
                            on_time_format_change={filters.set_time_format}
                        />
                    }
                >
                    <Tabs
                        activeKey={tabs.active_key}
                        onChange={(k) => tabs.set_active_key(k as AdminTab)}
                        items={tab_items.map(({ key, label, children }) => ({
                            key,
                            label,
                            children,
                        }))}
                    />
                </Card>

                <RecordDetailModal
                    open={!!detail_modal_record}
                    record={detail_modal_record}
                    time_format={filters.time_format}
                    on_close={() => set_detail_modal_record(null)}
                    on_copy={(id) => handle_copy_records([id])}
                />

                <MergeConfirmModal
                    open={merge_modal_open}
                    group={merge_target_group}
                    time_format={filters.time_format}
                    on_confirm={handle_merge_records}
                    on_cancel={() => {
                        set_merge_modal_open(false);
                        set_merge_target_group(null);
                    }}
                />
            </Content>
        </Layout>
    );
}

export default function AdminSessionGrid() {
    const { user } = useAuth();

    if (user?.email !== ADMIN_EMAIL) {
        return (
            <Layout className="app-body !p-xl">
                <Content className="!max-w-[800px] !mx-auto">
                    <Card>
                        <Empty
                            description={ADMIN_ACCESS_REQUIRED}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                </Content>
            </Layout>
        );
    }

    return <AdminSessionGridContent />;
}
