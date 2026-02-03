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
import dayjs from "dayjs";
import type { RecordsSlice, WorkStore, WorkSession } from "../types";
import { syncRecord, syncDeleteRecord } from "@/firebase/syncService";
import {
    getSessionMinutes,
    calculateDurationExcludingLunch,
    timeToMinutes,
    minutesToTime,
} from "../lib";

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
        const record = get().records.find((r) => r.id === id);
        if (record) {
            syncRecord(record).catch(console.error);
        }
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
        const record = get().records.find((r) => r.id === id);
        if (record) {
            syncRecord(record).catch(console.error);
        }
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
        const updated_record = get().records.find((r) => r.id === id);
        if (updated_record) {
            syncRecord(updated_record).catch(console.error);
        }
    },

    // ============================================
    // Session Management
    // ============================================

    updateSession: (record_id, session_id, new_start, new_end, new_date) => {
        const { records, timer } = get();
        const record = records.find((r) => r.id === record_id);
        if (!record) {
            return {
                success: false,
                adjusted: false,
                message: "레코드를 찾을 수 없습니다.",
            };
        }

        const session_index = record.sessions.findIndex(
            (s) => s.id === session_id
        );
        if (session_index === -1) {
            return {
                success: false,
                adjusted: false,
                message: "세션을 찾을 수 없습니다.",
            };
        }

        const current_session = record.sessions[session_index];
        const target_date = new_date || current_session.date || record.date;
        const is_date_changed =
            new_date && new_date !== (current_session.date || record.date);

        let adjusted_start = new_start;
        let adjusted_end = new_end;
        let was_adjusted = false;

        const new_start_mins = timeToMinutes(new_start);
        const new_end_mins = timeToMinutes(new_end);

        // 종료 시간이 시작 시간보다 빨라지면 안됨
        if (new_end_mins <= new_start_mins) {
            return {
                success: false,
                adjusted: false,
                message: "종료 시간은 시작 시간보다 나중이어야 합니다.",
            };
        }

        // 대상 날짜의 모든 세션 수집 (현재 수정 중인 세션 제외)
        const same_day_sessions: {
            record_id: string;
            session: WorkSession;
            start_mins: number;
            end_mins: number;
            work_name: string;
            deal_name: string;
        }[] = [];

        records.forEach((r) => {
            if (r.is_deleted) return;

            r.sessions?.forEach((s) => {
                const session_date = s.date || r.date;
                if (
                    session_date === target_date &&
                    !(r.id === record_id && s.id === session_id)
                ) {
                    same_day_sessions.push({
                        record_id: r.id,
                        session: s,
                        start_mins: timeToMinutes(s.start_time),
                        end_mins: timeToMinutes(s.end_time),
                        work_name: r.work_name,
                        deal_name: r.deal_name,
                    });
                }
            });
        });

        // 현재 레코딩 중인 작업의 시간도 충돌 감지에 포함
        if (timer.is_running && timer.start_time && timer.active_form_data) {
            const timer_date = dayjs(timer.start_time).format("YYYY-MM-DD");
            if (timer_date === target_date) {
                const timer_start_mins = timeToMinutes(
                    dayjs(timer.start_time).format("HH:mm")
                );
                const timer_end_mins = timeToMinutes(dayjs().format("HH:mm"));
                if (timer_end_mins > timer_start_mins) {
                    same_day_sessions.push({
                        record_id: "virtual-running-record",
                        session: {
                            id: "virtual-running-session",
                            date: timer_date,
                            start_time: dayjs(timer.start_time).format("HH:mm"),
                            end_time: dayjs().format("HH:mm"),
                            duration_minutes: timer_end_mins - timer_start_mins,
                        },
                        start_mins: timer_start_mins,
                        end_mins: timer_end_mins,
                        work_name:
                            timer.active_form_data.work_name ||
                            "진행 중인 작업",
                        deal_name: timer.active_form_data.deal_name || "",
                    });
                }
            }
        }

        // 충돌 작업 정보를 포함한 메시지 생성 헬퍼
        const formatConflictInfo = (
            other: (typeof same_day_sessions)[0]
        ): string => {
            const name_part = other.deal_name
                ? `"${other.work_name} > ${other.deal_name}"`
                : `"${other.work_name}"`;
            return `${name_part} (${other.session.start_time}~${other.session.end_time})`;
        };

        // 날짜가 변경된 경우: 충돌 검사만 하고 자동 조정 안함
        if (is_date_changed) {
            for (const other of same_day_sessions) {
                const overlaps = !(
                    new_end_mins <= other.start_mins ||
                    new_start_mins >= other.end_mins
                );
                if (overlaps) {
                    return {
                        success: false,
                        adjusted: false,
                        message: `${target_date}에 ${formatConflictInfo(
                            other
                        )} 작업과 시간이 겹칩니다. 시간을 조정하세요.`,
                    };
                }
            }
        } else {
            // 날짜가 동일한 경우: 충돌 시 자동 조정
            let current_start_mins = new_start_mins;
            let current_end_mins = new_end_mins;

            // 충돌이 있는 동안 반복적으로 조정 (최대 10회)
            for (let iteration = 0; iteration < 10; iteration++) {
                let has_conflict = false;

                for (const other of same_day_sessions) {
                    // 현재 세션이 기존 세션과 겹치는지 확인
                    const overlaps = !(
                        current_end_mins <= other.start_mins ||
                        current_start_mins >= other.end_mins
                    );

                    if (overlaps) {
                        has_conflict = true;

                        // 새 세션이 기존 세션을 완전히 포함하는 경우 → 실패
                        if (
                            current_start_mins <= other.start_mins &&
                            current_end_mins >= other.end_mins
                        ) {
                            return {
                                success: false,
                                adjusted: false,
                                message: `${formatConflictInfo(
                                    other
                                )} 작업과 시간이 완전히 겹칩니다.`,
                            };
                        }

                        // 기존 세션이 새 세션을 완전히 포함하는 경우 → 실패
                        if (
                            other.start_mins <= current_start_mins &&
                            other.end_mins >= current_end_mins
                        ) {
                            return {
                                success: false,
                                adjusted: false,
                                message: `${formatConflictInfo(
                                    other
                                )} 작업 안에 완전히 포함됩니다.`,
                            };
                        }

                        // 시작 시간이 기존 세션 안에 있는 경우 → 시작 시간을 기존 세션 종료 시간으로 조정
                        if (
                            current_start_mins >= other.start_mins &&
                            current_start_mins < other.end_mins
                        ) {
                            current_start_mins = other.end_mins;
                            was_adjusted = true;
                        }
                        // 종료 시간이 기존 세션 안에 있는 경우 → 종료 시간을 기존 세션 시작 시간으로 조정
                        else if (
                            current_end_mins > other.start_mins &&
                            current_end_mins <= other.end_mins
                        ) {
                            current_end_mins = other.start_mins;
                            was_adjusted = true;
                        }
                    }
                }

                if (!has_conflict) break;
            }

            adjusted_start = minutesToTime(current_start_mins);
            adjusted_end = minutesToTime(current_end_mins);
        }

        // 조정 후에도 유효한지 확인
        const final_start_mins = timeToMinutes(adjusted_start);
        const final_end_mins = timeToMinutes(adjusted_end);
        if (final_end_mins <= final_start_mins) {
            return {
                success: false,
                adjusted: false,
                message: "충돌을 피할 수 없습니다. 다른 시간을 선택하세요.",
            };
        }

        // 세션 업데이트 (점심시간 제외한 실제 작업 시간)
        const duration_minutes = Math.max(
            1,
            calculateDurationExcludingLunch(final_start_mins, final_end_mins)
        );

        set(
            create((state) => {
                const rec = state.records.find((r) => r.id === record_id);
                if (rec) {
                    // 세션 업데이트
                    const session = rec.sessions.find(
                        (s) => s.id === session_id
                    );
                    if (session) {
                        session.date = target_date;
                        session.start_time = adjusted_start;
                        session.end_time = adjusted_end;
                        session.duration_minutes = duration_minutes;
                    }

                    // 세션 정렬
                    rec.sessions.sort((a, b) => {
                        const date_a = a.date || rec.date;
                        const date_b = b.date || rec.date;
                        if (date_a !== date_b) return date_a.localeCompare(date_b);
                        return (
                            timeToMinutes(a.start_time) -
                            timeToMinutes(b.start_time)
                        );
                    });

                    // 총 시간 재계산
                    const total_minutes = rec.sessions.reduce(
                        (sum, s) => sum + getSessionMinutes(s),
                        0
                    );
                    rec.duration_minutes = Math.max(1, total_minutes);
                    rec.start_time =
                        rec.sessions[0]?.start_time || rec.start_time;
                    rec.end_time =
                        rec.sessions[rec.sessions.length - 1]?.end_time ||
                        rec.end_time;
                }
            })
        );

        // Firebase에 업데이트
        const updated_record = get().records.find((r) => r.id === record_id);
        if (updated_record) {
            syncRecord(updated_record).catch(console.error);
        }

        return {
            success: true,
            adjusted: was_adjusted,
            message: was_adjusted
                ? "시간 충돌로 인해 자동 조정되었습니다."
                : undefined,
        };
    },

    deleteSession: (record_id, session_id) => {
        const { records } = get();
        const record = records.find((r) => r.id === record_id);
        if (!record) return;

        const remaining_sessions = record.sessions.filter(
            (s) => s.id !== session_id
        );

        // 세션이 모두 삭제되면 레코드도 삭제
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
                    // 세션 삭제
                    const session_index = rec.sessions.findIndex(
                        (s) => s.id === session_id
                    );
                    if (session_index !== -1) {
                        rec.sessions.splice(session_index, 1);
                    }

                    // 시간 재계산
                    const total_minutes = rec.sessions.reduce(
                        (sum, s) => sum + getSessionMinutes(s),
                        0
                    );
                    rec.duration_minutes = Math.max(1, total_minutes);

                    // 정렬 후 시작/종료 시간 업데이트
                    rec.sessions.sort(
                        (a, b) =>
                            timeToMinutes(a.start_time) -
                            timeToMinutes(b.start_time)
                    );
                    rec.start_time =
                        rec.sessions[0]?.start_time || rec.start_time;
                    rec.end_time =
                        rec.sessions[rec.sessions.length - 1]?.end_time ||
                        rec.end_time;
                }
            })
        );

        const updated_record = get().records.find((r) => r.id === record_id);
        if (updated_record) {
            syncRecord(updated_record).catch(console.error);
        }
    },

    // ============================================
    // Completion Status
    // ============================================

    markAsCompleted: (id) => {
        const { timer, records } = get();
        const record = records.find((r) => r.id === id);

        // 현재 타이머가 이 작업과 관련이 있으면 중지
        if (
            timer.is_running &&
            timer.active_form_data &&
            record &&
            timer.active_form_data.work_name === record.work_name &&
            timer.active_form_data.deal_name === record.deal_name
        ) {
            // 타이머 중지 (세션 저장)
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

        const updated_record = get().records.find((r) => r.id === id);
        if (updated_record) {
            syncRecord(updated_record).catch(console.error);
        }
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

        const updated_record = get().records.find((r) => r.id === id);
        if (updated_record) {
            syncRecord(updated_record).catch(console.error);
        }
    },
});
