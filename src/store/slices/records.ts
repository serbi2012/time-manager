/**
 * Records Slice
 *
 * 레코드 상태 및 액션
 * - CRUD 작업
 * - 세션 관리 (추가/수정/삭제)
 * - 완료/삭제 상태 관리
 */

import type { StateCreator } from "zustand";
import { create } from "mutative";
import type { RecordsSlice, WorkStore, WorkRecord } from "../types";
import { syncRecord, syncDeleteRecord } from "@/firebase/syncService";
import {
    calculateDurationExcludingLunch,
    timeToMinutes,
    validateAndAdjustSessionTime,
    recalculateRecordFromSessions,
} from "../lib";
import { getEffectiveEndMinutes } from "@/shared/lib/time";

/**
 * Find existing non-deleted record with same work_name + deal_name.
 * Prefers incomplete records; falls back to completed ones.
 */
function findDuplicateRecord(
    records: WorkRecord[],
    work_name: string,
    deal_name: string
): WorkRecord | undefined {
    return records.find(
        (r) =>
            !r.is_deleted &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );
}

/** sync 후 변경된 레코드를 Firebase에 전파 */
function syncRecordById(get: () => WorkStore, id: string): void {
    const record = get().records.find((r) => r.id === id);
    if (record) {
        syncRecord(record).catch(console.error);
    }
}

export const createRecordsSlice: StateCreator<
    WorkStore,
    [],
    [],
    RecordsSlice
> = (set, get) => ({
    // ============================================
    // State
    // ============================================
    records: [],

    // ============================================
    // CRUD Actions
    // ============================================

    addRecord: (record) => {
        if (record.work_name) {
            const existing = findDuplicateRecord(
                get().records,
                record.work_name,
                record.deal_name
            );

            if (existing) {
                set(
                    create((state) => {
                        const rec = state.records.find(
                            (r) => r.id === existing.id
                        );
                        if (!rec) return;

                        if (rec.date !== record.date) {
                            rec.date = record.date;
                        }

                        if (rec.is_completed) {
                            rec.is_completed = false;
                            rec.completed_at = undefined;
                        }

                        if (record.sessions && record.sessions.length > 0) {
                            const existing_ids = new Set(
                                rec.sessions.map((s) => s.id)
                            );
                            const new_sessions = record.sessions.filter(
                                (s) => !existing_ids.has(s.id)
                            );
                            if (new_sessions.length > 0) {
                                rec.sessions.push(...new_sessions);
                                recalculateRecordFromSessions(
                                    rec,
                                    undefined,
                                    get().getLunchTimeMinutes()
                                );
                            }
                        }
                    })
                );
                syncRecordById(get, existing.id);
                return;
            }
        }

        set(
            create((state) => {
                state.records.push(record);
            })
        );
        syncRecord(record).catch(console.error);
    },

    deleteRecord: (id) => {
        set(
            create((state) => {
                const index = state.records.findIndex((r) => r.id === id);
                if (index !== -1) state.records.splice(index, 1);
            })
        );
        syncDeleteRecord(id).catch(console.error);
    },

    softDeleteRecord: (id) => {
        set(
            create((state) => {
                const record = state.records.find((r) => r.id === id);
                if (record) {
                    record.is_deleted = true;
                    record.deleted_at = new Date().toISOString();
                }
            })
        );
        syncRecordById(get, id);
    },

    restoreRecord: (id) => {
        set(
            create((state) => {
                const record = state.records.find((r) => r.id === id);
                if (record) {
                    record.is_deleted = false;
                    record.deleted_at = undefined;
                }
            })
        );
        syncRecordById(get, id);
    },

    permanentlyDeleteRecord: (id) => {
        set(
            create((state) => {
                const index = state.records.findIndex((r) => r.id === id);
                if (index !== -1) state.records.splice(index, 1);
            })
        );
        syncDeleteRecord(id).catch(console.error);
    },

    getDeletedRecords: () => {
        return get().records.filter((r) => r.is_deleted === true);
    },

    updateRecord: (id, updates) => {
        set(
            create((state) => {
                const record = state.records.find((r) => r.id === id);
                if (record) {
                    Object.assign(record, updates);
                }
            })
        );
        syncRecordById(get, id);
    },

    // ============================================
    // Session Management
    // ============================================

    updateSession: (
        record_id,
        session_id,
        new_start,
        new_end,
        new_date,
        is_overnight
    ) => {
        const { records, timer } = get();

        const validation = validateAndAdjustSessionTime(
            records,
            timer,
            record_id,
            session_id,
            new_start,
            new_end,
            new_date,
            is_overnight
        );

        if (!validation.success) {
            return {
                success: false,
                adjusted: validation.adjusted,
                message: validation.message,
            };
        }

        const adjusted_start = validation.adjusted_start || new_start;
        const adjusted_end = validation.adjusted_end || new_end;
        const record = records.find((r) => r.id === record_id);
        const current_session = record?.sessions.find(
            (s) => s.id === session_id
        );
        const target_date =
            new_date || current_session?.date || record?.date || "";

        const lunch_time = get().getLunchTimeMinutes();
        const final_start_mins = timeToMinutes(adjusted_start);
        const final_end_mins = getEffectiveEndMinutes(
            adjusted_end,
            is_overnight
        );
        const duration_minutes = Math.max(
            1,
            calculateDurationExcludingLunch(
                final_start_mins,
                final_end_mins,
                lunch_time
            )
        );

        set(
            create((state) => {
                const rec = state.records.find((r) => r.id === record_id);
                if (rec) {
                    const session = rec.sessions.find(
                        (s) => s.id === session_id
                    );
                    if (session) {
                        session.date = target_date;
                        session.start_time = adjusted_start;
                        session.end_time = adjusted_end;
                        session.duration_minutes = duration_minutes;
                        session.is_overnight = is_overnight || undefined;
                    }
                    recalculateRecordFromSessions(rec, undefined, lunch_time);
                }
            })
        );

        syncRecordById(get, record_id);

        return {
            success: true,
            adjusted: validation.adjusted,
            message: validation.message,
        };
    },

    deleteSession: (record_id, session_id) => {
        const { records } = get();
        const record = records.find((r) => r.id === record_id);
        if (!record) return;

        const remaining_sessions = record.sessions.filter(
            (s) => s.id !== session_id
        );

        if (remaining_sessions.length === 0) {
            set(
                create((state) => {
                    const index = state.records.findIndex(
                        (r) => r.id === record_id
                    );
                    if (index !== -1) state.records.splice(index, 1);
                })
            );
            syncDeleteRecord(record_id).catch(console.error);
            return;
        }

        set(
            create((state) => {
                const rec = state.records.find((r) => r.id === record_id);
                if (rec) {
                    const session_index = rec.sessions.findIndex(
                        (s) => s.id === session_id
                    );
                    if (session_index !== -1) {
                        rec.sessions.splice(session_index, 1);
                    }
                    recalculateRecordFromSessions(
                        rec,
                        undefined,
                        get().getLunchTimeMinutes()
                    );
                }
            })
        );

        syncRecordById(get, record_id);
    },

    // ============================================
    // Completion Status
    // ============================================

    markAsCompleted: (id) => {
        const { timer, records } = get();
        const record = records.find((r) => r.id === id);

        if (
            timer.is_running &&
            timer.active_form_data &&
            record &&
            timer.active_form_data.work_name === record.work_name &&
            timer.active_form_data.deal_name === record.deal_name
        ) {
            get().stopTimer();
        }

        set(
            create((state) => {
                const rec = state.records.find((r) => r.id === id);
                if (rec) {
                    rec.is_completed = true;
                    rec.completed_at = new Date().toISOString();
                }
            })
        );

        syncRecordById(get, id);
    },

    markAsIncomplete: (id) => {
        set(
            create((state) => {
                const rec = state.records.find((r) => r.id === id);
                if (rec) {
                    rec.is_completed = false;
                    rec.completed_at = undefined;
                }
            })
        );

        syncRecordById(get, id);
    },
});
