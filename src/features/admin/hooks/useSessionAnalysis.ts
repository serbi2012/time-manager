/**
 * 세션 분석 데이터를 계산하는 커스텀 훅
 *
 * SessionsTab에서 사용하는 모든 useMemo 기반 파생 데이터를 제공
 */

import { useMemo } from "react";
import dayjs from "dayjs";
import { timeToMinutes } from "../../../shared/lib/time";
import type { SessionWithMeta } from "../lib/conflict_finder";
import type { ConflictInfo } from "../lib/conflict_finder";
import type { ProblemInfo } from "../lib/problem_detector";
import type { ViewMode } from "./useAdminFilters";

interface UseSessionAnalysisParams {
    all_sessions: SessionWithMeta[];
    conflicts: ConflictInfo[];
    problem_sessions: Map<string, ProblemInfo[]>;
    date_range: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
    view_mode: ViewMode;
    search_date: dayjs.Dayjs | null;
    search_time: dayjs.Dayjs | null;
}

export function useSessionAnalysis({
    all_sessions,
    conflicts,
    problem_sessions,
    date_range,
    view_mode,
    search_date,
    search_time,
}: UseSessionAnalysisParams) {
    const conflict_session_ids = useMemo(() => {
        const ids = new Set<string>();
        conflicts.forEach((c) => {
            ids.add(c.session1.id);
            ids.add(c.session2.id);
        });
        return ids;
    }, [conflicts]);

    const conflict_pairs = useMemo(() => {
        const pairs = new Map<string, SessionWithMeta[]>();
        conflicts.forEach((c) => {
            if (!pairs.has(c.session1.id)) pairs.set(c.session1.id, []);
            pairs.get(c.session1.id)!.push(c.session2);
            if (!pairs.has(c.session2.id)) pairs.set(c.session2.id, []);
            pairs.get(c.session2.id)!.push(c.session1);
        });
        return pairs;
    }, [conflicts]);

    const problem_session_ids = useMemo(
        () => new Set(problem_sessions.keys()),
        [problem_sessions]
    );

    const invisible_session_ids = useMemo(() => {
        const ids = new Set<string>();
        all_sessions.forEach((s) => {
            if (!s.start_time || !s.end_time) {
                ids.add(s.id);
                return;
            }
            const start_mins = timeToMinutes(s.start_time);
            const end_mins = timeToMinutes(s.end_time);
            if (end_mins - start_mins <= 1) ids.add(s.id);
        });
        return ids;
    }, [all_sessions]);

    const running_sessions = useMemo(
        () => all_sessions.filter((s) => s.end_time === ""),
        [all_sessions]
    );

    const running_session_ids = useMemo(
        () => new Set(running_sessions.map((s) => s.id)),
        [running_sessions]
    );

    const duplicate_running_sessions = useMemo(() => {
        const by_record = new Map<string, SessionWithMeta[]>();
        running_sessions.forEach((s) => {
            if (!by_record.has(s.record_id)) by_record.set(s.record_id, []);
            by_record.get(s.record_id)!.push(s);
        });
        return Array.from(by_record.entries())
            .filter(([, sessions]) => sessions.length >= 2)
            .map(([record_id, sessions]) => ({
                record_id,
                work_name: sessions[0].work_name,
                deal_name: sessions[0].deal_name,
                sessions,
            }));
    }, [running_sessions]);

    const time_search_results = useMemo(() => {
        if (!search_date || !search_time) return new Set<string>();
        const target_date = search_date.format("YYYY-MM-DD");
        const target_mins = search_time.hour() * 60 + search_time.minute();
        const ids = new Set<string>();
        all_sessions.forEach((s) => {
            if (s.date !== target_date || !s.start_time || !s.end_time) return;
            const start_mins = timeToMinutes(s.start_time);
            const end_mins = timeToMinutes(s.end_time);
            if (start_mins === end_mins) {
                if (start_mins === target_mins) ids.add(s.id);
            } else if (target_mins >= start_mins && target_mins < end_mins) {
                ids.add(s.id);
            }
        });
        return ids;
    }, [all_sessions, search_date, search_time]);

    const filtered_sessions = useMemo(() => {
        let result = all_sessions;
        if (view_mode !== "time_search" && date_range?.[0] && date_range?.[1]) {
            const start = date_range[0].format("YYYY-MM-DD");
            const end = date_range[1].format("YYYY-MM-DD");
            result = result.filter((s) => s.date >= start && s.date <= end);
        }
        if (view_mode === "conflicts")
            result = result.filter((s) => conflict_session_ids.has(s.id));
        else if (view_mode === "problems")
            result = result.filter((s) => problem_session_ids.has(s.id));
        else if (view_mode === "invisible")
            result = result.filter((s) => invisible_session_ids.has(s.id));
        else if (view_mode === "running")
            result = result.filter((s) => running_session_ids.has(s.id));
        else if (view_mode === "time_search" && search_date && search_time)
            result = result.filter((s) => time_search_results.has(s.id));
        else if (view_mode === "time_search" && search_date) {
            const d = search_date.format("YYYY-MM-DD");
            result = result.filter((s) => s.date === d);
        }
        return result;
    }, [
        all_sessions,
        date_range,
        view_mode,
        conflict_session_ids,
        problem_session_ids,
        invisible_session_ids,
        running_session_ids,
        time_search_results,
        search_date,
        search_time,
    ]);

    const unique_dates = useMemo(() => {
        const dates = new Set(all_sessions.map((s) => s.date));
        return Array.from(dates).sort((a, b) => b.localeCompare(a));
    }, [all_sessions]);

    const conflict_dates = useMemo(
        () => new Set(conflicts.map((c) => c.date)),
        [conflicts]
    );

    const problem_dates = useMemo(() => {
        const dates = new Set<string>();
        all_sessions.forEach((s) => {
            if (problem_session_ids.has(s.id)) dates.add(s.date);
        });
        return dates;
    }, [all_sessions, problem_session_ids]);

    const problem_stats = useMemo(() => {
        const stats = {
            zero_duration: 0,
            missing_time: 0,
            invalid_time: 0,
            future_time: 0,
        };
        problem_sessions.forEach((list) => {
            list.forEach((p) => {
                stats[p.type]++;
            });
        });
        return stats;
    }, [problem_sessions]);

    const time_search_message =
        search_date && search_time
            ? time_search_results.size > 0
                ? `${search_date.format("YYYY-MM-DD")} ${search_time.format(
                      "HH:mm"
                  )}에 ${time_search_results.size}개의 세션이 걸쳐있습니다.`
                : `${search_date.format("YYYY-MM-DD")} ${search_time.format(
                      "HH:mm"
                  )}에 걸쳐있는 세션이 없습니다.`
            : null;

    return {
        conflict_session_ids,
        conflict_pairs,
        problem_session_ids,
        invisible_session_ids,
        running_sessions,
        running_session_ids,
        duplicate_running_sessions,
        time_search_results,
        filtered_sessions,
        unique_dates,
        conflict_dates,
        problem_dates,
        problem_stats,
        time_search_message,
    };
}
