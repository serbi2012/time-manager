import { create } from "zustand";
import { persist } from "zustand/middleware";
import dayjs from "dayjs";
import type {
    WorkRecord,
    TimerState,
    WorkFormData,
    WorkTemplate,
    WorkSession,
} from "../types";

// 점심시간 상수 (11:40 ~ 12:40)
const LUNCH_START_MINUTES = 11 * 60 + 40; // 700분 (11:40)
const LUNCH_END_MINUTES = 12 * 60 + 40; // 760분 (12:40)
const LUNCH_DURATION = LUNCH_END_MINUTES - LUNCH_START_MINUTES; // 60분

// 점심시간을 제외한 실제 작업 시간 계산
// 예: 11:00 ~ 13:00 -> 11:00~11:40(40분) + 12:40~13:00(20분) = 60분
const calculateDurationExcludingLunch = (
    start_mins: number,
    end_mins: number
): number => {
    // 점심시간과 겹치지 않는 경우
    if (end_mins <= LUNCH_START_MINUTES || start_mins >= LUNCH_END_MINUTES) {
        return end_mins - start_mins;
    }

    // 점심시간에 완전히 포함되는 경우
    if (start_mins >= LUNCH_START_MINUTES && end_mins <= LUNCH_END_MINUTES) {
        return 0;
    }

    // 점심시간을 완전히 포함하는 경우
    if (start_mins < LUNCH_START_MINUTES && end_mins > LUNCH_END_MINUTES) {
        return end_mins - start_mins - LUNCH_DURATION;
    }

    // 점심시간 시작 부분과 겹치는 경우 (작업이 점심시간 중간에 끝남)
    if (start_mins < LUNCH_START_MINUTES && end_mins <= LUNCH_END_MINUTES) {
        return LUNCH_START_MINUTES - start_mins;
    }

    // 점심시간 끝 부분과 겹치는 경우 (작업이 점심시간 중간에 시작)
    if (start_mins >= LUNCH_START_MINUTES && end_mins > LUNCH_END_MINUTES) {
        return end_mins - LUNCH_END_MINUTES;
    }

    return end_mins - start_mins;
};

// 템플릿 색상 팔레트
export const TEMPLATE_COLORS = [
    "#1890ff",
    "#52c41a",
    "#faad14",
    "#f5222d",
    "#722ed1",
    "#13c2c2",
    "#eb2f96",
    "#fa8c16",
    "#a0d911",
    "#2f54eb",
];

interface WorkStore {
    records: WorkRecord[];
    templates: WorkTemplate[];
    timer: TimerState;
    form_data: WorkFormData;
    selected_date: string;

    // 사용자 정의 옵션 (업무명, 카테고리명)
    custom_task_options: string[];
    custom_category_options: string[];

    // 숨김 처리된 자동완성 옵션 (필드별로 관리)
    hidden_autocomplete_options: {
        work_name: string[];
        task_name: string[];
        deal_name: string[];
        project_code: string[];
        task_option: string[];
        category_option: string[];
    };

    // 프리셋 추가 시 구분자(postfix) 사용 여부 (기본값: false = 이름 그대로)
    use_postfix_on_preset_add: boolean;

    // 앱 테마 색상 (기본값: blue)
    app_theme: AppTheme;

    // 타이머 액션
    startTimer: (template_id?: string) => void;
    stopTimer: () => WorkRecord | null;
    getElapsedSeconds: () => number; // 실시간 경과 시간 계산
    resetTimer: () => void;
    switchTemplate: (template_id: string) => void;
    updateActiveFormData: (data: Partial<WorkFormData>) => void; // 타이머 실행 중 form_data 업데이트
    updateTimerStartTime: (new_start_time: number) => void; // 타이머 시작 시간 변경 (간트차트 리사이즈용)

    // 폼 액션
    setFormData: (data: Partial<WorkFormData>) => void;
    resetFormData: () => void;

    // 레코드 액션
    addRecord: (record: WorkRecord) => void;
    deleteRecord: (id: string) => void;
    softDeleteRecord: (id: string) => void; // 휴지통으로 이동
    restoreRecord: (id: string) => void; // 휴지통에서 복원
    permanentlyDeleteRecord: (id: string) => void; // 완전 삭제
    getDeletedRecords: () => WorkRecord[]; // 삭제된 작업 목록
    updateRecord: (id: string, record: Partial<WorkRecord>) => void;

    // 세션 수정 (시간 충돌 방지 포함)
    updateSession: (
        record_id: string,
        session_id: string,
        new_start: string,
        new_end: string,
        new_date?: string // 날짜 변경 (선택)
    ) => { success: boolean; adjusted: boolean; message?: string };

    deleteSession: (record_id: string, session_id: string) => void;

    // 템플릿 액션
    addTemplate: (
        template: Omit<WorkTemplate, "id" | "created_at">
    ) => WorkTemplate;
    deleteTemplate: (id: string) => void;
    updateTemplate: (id: string, template: Partial<WorkTemplate>) => void;
    reorderTemplates: (active_id: string, over_id: string) => void;
    applyTemplate: (template_id: string) => void;

    // 날짜 필터
    setSelectedDate: (date: string) => void;
    getFilteredRecords: () => WorkRecord[];
    getIncompleteRecords: () => WorkRecord[]; // 미완료 작업 (선택 날짜 + 과거 미완료)
    getCompletedRecords: () => WorkRecord[]; // 완료된 작업 목록

    // 완료 상태 관리
    markAsCompleted: (id: string) => void;
    markAsIncomplete: (id: string) => void;

    // 자동완성 헬퍼
    getAutoCompleteOptions: (field: keyof WorkFormData) => string[];
    getProjectCodeOptions: () => {
        value: string;
        label: string;
        work_name?: string;
    }[]; // 프로젝트 코드 자동완성 (work_name 포함)

    // 사용자 정의 옵션 관리
    addCustomTaskOption: (option: string) => void;
    addCustomCategoryOption: (option: string) => void;
    removeCustomTaskOption: (option: string) => void;
    removeCustomCategoryOption: (option: string) => void;

    // 자동완성 옵션 숨김 관리
    hideAutoCompleteOption: (
        field: "work_name" | "task_name" | "deal_name" | "project_code" | "task_option" | "category_option",
        value: string
    ) => void;
    unhideAutoCompleteOption: (
        field: "work_name" | "task_name" | "deal_name" | "project_code" | "task_option" | "category_option",
        value: string
    ) => void;

    // 프리셋 추가 시 구분자 사용 설정
    setUsePostfixOnPresetAdd: (value: boolean) => void;

    // 앱 테마 설정
    setAppTheme: (theme: AppTheme) => void;
}

const DEFAULT_FORM_DATA: WorkFormData = {
    project_code: "",
    work_name: "",
    task_name: "",
    deal_name: "",
    category_name: "",
    note: "",
};

// 프로젝트 코드 기본값
const DEFAULT_PROJECT_CODE = "A00_00000";

const DEFAULT_TIMER: TimerState = {
    is_running: false,
    start_time: null,
    active_template_id: null,
    active_form_data: null,
    active_record_id: null,
    active_session_id: null,
};

// 같은 작업 기록 찾기 (미완료 작업 우선, 중복 발견 시 자동 병합)
// set_fn: 중복 병합 시 상태 업데이트용 함수
const findExistingRecord = (
    records: WorkRecord[],
    date: string,
    work_name: string,
    deal_name: string,
    set_fn?: (updater: (state: { records: WorkRecord[] }) => { records: WorkRecord[] }) => void
): WorkRecord | undefined => {
    // 1. 미완료 작업 중에서 같은 work_name + deal_name 찾기 (날짜 무관)
    const incomplete_matches = records.filter(
        (r) =>
            !r.is_deleted &&
            !r.is_completed &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );

    // 미완료 매칭이 있으면
    if (incomplete_matches.length > 0) {
        // 중복이 2개 이상이면 자동 병합
        if (incomplete_matches.length >= 2 && set_fn) {
            console.log(
                `[AutoMerge] "${work_name} > ${deal_name}" 중복 ${incomplete_matches.length}개 발견, 자동 병합`
            );
            const merged = mergeRecords(incomplete_matches);
            set_fn((state) => {
                let updated = state.records.map((r) =>
                    r.id === merged.base_record.id ? merged.base_record : r
                );
                updated = updated.filter((r) => !merged.deleted_ids.includes(r.id));
                return { records: updated };
            });
            return merged.base_record;
        }
        return incomplete_matches[0];
    }

    // 2. 없으면 같은 날짜의 작업 찾기
    const date_match = records.find(
        (r) =>
            !r.is_deleted &&
            r.date === date &&
            r.work_name === work_name &&
            r.deal_name === deal_name
    );
    return date_match;
};

// 여러 레코드를 하나로 병합 (내부 헬퍼)
const mergeRecords = (
    records_to_merge: WorkRecord[]
): { base_record: WorkRecord; deleted_ids: string[] } => {
    const sorted = [...records_to_merge].sort((a, b) => {
        const date_cmp = a.date.localeCompare(b.date);
        if (date_cmp !== 0) return date_cmp;
        return (a.start_time || "").localeCompare(b.start_time || "");
    });

    const base = sorted[0];
    const others = sorted.slice(1);

    // 모든 세션 수집 (중복 ID 제거)
    const all_sessions: WorkSession[] = [...(base.sessions || [])];
    const session_ids = new Set(all_sessions.map((s) => s.id));

    others.forEach((r) => {
        (r.sessions || []).forEach((s) => {
            if (!session_ids.has(s.id)) {
                all_sessions.push(s);
                session_ids.add(s.id);
            }
        });
    });

    // 세션 정렬
    all_sessions.sort((a, b) => {
        const date_a = a.date || base.date;
        const date_b = b.date || base.date;
        const date_cmp = date_a.localeCompare(date_b);
        if (date_cmp !== 0) return date_cmp;
        return (a.start_time || "").localeCompare(b.start_time || "");
    });

    const total = all_sessions.reduce((sum, s) => sum + getSessionMinutes(s), 0);
    const first = all_sessions[0];
    const last = all_sessions[all_sessions.length - 1];

    return {
        base_record: {
            ...base,
            sessions: all_sessions,
            duration_minutes: Math.max(1, total),
            start_time: first?.start_time || base.start_time,
            end_time: last?.end_time || base.end_time,
            date: first?.date || base.date,
        },
        deleted_ids: others.map((r) => r.id),
    };
};

// 새 세션 생성 (분 단위로 반올림, 점심시간 제외)
const createSession = (start_time: number, end_time: number): WorkSession => {
    // 시작/종료 시간을 분 단위로 반올림
    const start_dayjs = dayjs(start_time);
    const end_dayjs = dayjs(end_time);

    // 분 단위로 계산 (초는 버림)
    const start_minutes = start_dayjs.hour() * 60 + start_dayjs.minute();
    const end_minutes = end_dayjs.hour() * 60 + end_dayjs.minute();

    // 점심시간을 제외한 실제 작업 시간 계산
    const duration_minutes = Math.max(
        1,
        calculateDurationExcludingLunch(start_minutes, end_minutes)
    );

    return {
        id: crypto.randomUUID(),
        date: start_dayjs.format("YYYY-MM-DD"),
        start_time: start_dayjs.format("HH:mm"),
        end_time: end_dayjs.format("HH:mm"),
        duration_minutes,
    };
};

// 세션의 duration을 분 단위로 가져오기 (기존 데이터 호환)
const getSessionMinutes = (session: WorkSession): number => {
    if (session.duration_minutes !== undefined) {
        return session.duration_minutes;
    }
    // 기존 데이터는 duration_seconds 필드가 있을 수 있음
    const legacy = session as unknown as { duration_seconds?: number };
    if (legacy.duration_seconds !== undefined) {
        return Math.ceil(legacy.duration_seconds / 60);
    }
    return 0;
};

// 세션들의 총 시간을 분으로 계산
const calculateTotalMinutes = (sessions: WorkSession[]): number => {
    const total_minutes = sessions.reduce(
        (sum, s) => sum + getSessionMinutes(s),
        0
    );
    return Math.max(1, total_minutes);
};

// 기본 업무명/카테고리명 옵션
export const DEFAULT_TASK_OPTIONS = [
    "개발",
    "작업",
    "분석",
    "설계",
    "테스트",
    "기타",
];
export const DEFAULT_CATEGORY_OPTIONS = [
    "개발",
    "문서작업",
    "회의",
    "환경세팅",
    "코드리뷰",
    "테스트",
    "기타",
];

// 앱 테마 색상 타입
export type AppTheme = "blue" | "green" | "purple" | "red" | "orange" | "teal" | "black";

// 테마별 색상 정의
export const APP_THEME_COLORS: Record<AppTheme, {
    primary: string;       // Ant Design colorPrimary
    gradient: string;      // 헤더 그라데이션
    gradientDark: string;  // 어두운 그라데이션 (그림자용)
}> = {
    blue: {
        primary: "#1890ff",
        gradient: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
        gradientDark: "#096dd9",
    },
    green: {
        primary: "#52c41a",
        gradient: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
        gradientDark: "#389e0d",
    },
    purple: {
        primary: "#722ed1",
        gradient: "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
        gradientDark: "#531dab",
    },
    red: {
        primary: "#f5222d",
        gradient: "linear-gradient(135deg, #f5222d 0%, #cf1322 100%)",
        gradientDark: "#cf1322",
    },
    orange: {
        primary: "#fa8c16",
        gradient: "linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)",
        gradientDark: "#d46b08",
    },
    teal: {
        primary: "#13c2c2",
        gradient: "linear-gradient(135deg, #13c2c2 0%, #08979c 100%)",
        gradientDark: "#08979c",
    },
    black: {
        primary: "#434343",
        gradient: "linear-gradient(135deg, #434343 0%, #1a1a1a 100%)",
        gradientDark: "#1a1a1a",
    },
};

// 테마 라벨
export const APP_THEME_LABELS: Record<AppTheme, string> = {
    blue: "파란색 (기본)",
    green: "초록색",
    purple: "보라색",
    red: "빨간색",
    orange: "주황색",
    teal: "청록색",
    black: "검정색",
};

export const useWorkStore = create<WorkStore>()(
    persist(
        (set, get) => ({
            records: [],
            templates: [],
            timer: DEFAULT_TIMER,
            form_data: DEFAULT_FORM_DATA,
            selected_date: dayjs().format("YYYY-MM-DD"),
            custom_task_options: [],
            custom_category_options: [],
            hidden_autocomplete_options: {
                work_name: [],
                task_name: [],
                deal_name: [],
                project_code: [],
                task_option: [],
                category_option: [],
            },
            use_postfix_on_preset_add: false, // 기본값: 이름 그대로 추가
            app_theme: "blue" as AppTheme, // 기본값: 파란색

    startTimer: (template_id?: string) => {
        const { form_data, records } = get();
        const start_time = Date.now();
        const start_dayjs = dayjs(start_time);
        const record_date = start_dayjs.format("YYYY-MM-DD");
        const start_time_str = start_dayjs.format("HH:mm");

        // 진행 중인 세션 생성 (end_time은 빈 문자열)
        const new_session: WorkSession = {
            id: crypto.randomUUID(),
            date: record_date,
            start_time: start_time_str,
            end_time: "", // 진행 중 표시
            duration_minutes: 0,
        };

        // 같은 작업 기록 찾기 (미완료 작업 우선)
        const existing_record = findExistingRecord(
            records,
            record_date,
            form_data.work_name,
            form_data.deal_name,
            set
        );

        let active_record_id: string;
        let active_session_id: string;

        if (existing_record) {
            // 기존 레코드에 이미 진행 중인 세션(end_time = "")이 있는지 확인
            const existing_running_session = (
                existing_record.sessions || []
            ).find((s) => s.end_time === "");

            if (existing_running_session) {
                // 이미 진행 중인 세션이 있으면 새 세션을 추가하지 않고 기존 세션 사용
                active_record_id = existing_record.id;
                active_session_id = existing_running_session.id;

                // 타이머 상태만 업데이트 (세션은 추가하지 않음)
                set({
                    timer: {
                        is_running: true,
                        start_time: start_time, // 현재 타이머 시작 시간
                        active_template_id: template_id || null,
                        active_form_data: { ...form_data },
                        active_record_id: active_record_id,
                        active_session_id: active_session_id,
                    },
                });
                return;
            }

            // 진행 중인 세션이 없으면 새 세션 추가
            active_record_id = existing_record.id;
            active_session_id = new_session.id;
            set((state) => ({
                records: state.records.map((r) =>
                    r.id === existing_record.id
                        ? {
                              ...r,
                              sessions: [...(r.sessions || []), new_session],
                              start_time: r.start_time || start_time_str,
                          }
                        : r
                ),
            }));
        } else {
            // 새 레코드 생성
            active_record_id = crypto.randomUUID();
            active_session_id = new_session.id;
            const new_record: WorkRecord = {
                id: active_record_id,
                ...form_data,
                project_code: form_data.project_code || DEFAULT_PROJECT_CODE,
                duration_minutes: 0,
                start_time: start_time_str,
                end_time: "",
                date: record_date,
                sessions: [new_session],
                is_completed: false,
            };
            set((state) => ({
                records: [...state.records, new_record],
            }));
        }

        // 타이머 상태 업데이트
        set({
            timer: {
                is_running: true,
                start_time: start_time,
                active_template_id: template_id || null,
                active_form_data: { ...form_data },
                active_record_id: active_record_id,
                active_session_id: active_session_id,
            },
        });
    },

    stopTimer: () => {
        const { timer, records } = get();
        if (!timer.is_running || !timer.start_time || !timer.active_form_data)
            return null;

        // 진행 중인 세션의 레코드와 세션 ID 확인
        const { active_record_id, active_session_id } = timer;
        if (!active_record_id || !active_session_id) {
            // 이전 버전 호환: active_record_id/session_id가 없는 경우 (이미 실행 중이던 타이머)
            // 기존 방식대로 처리
            const active_form = timer.active_form_data;
            const end_time = Date.now();
            const record_date = dayjs(timer.start_time).format("YYYY-MM-DD");
            const new_session = createSession(timer.start_time, end_time);

            const existing_record = findExistingRecord(
                records,
                record_date,
                active_form.work_name,
                active_form.deal_name,
                set
            );

            if (existing_record) {
                const updated_sessions = [
                    ...(existing_record.sessions || []),
                    new_session,
                ];
                const total_minutes = calculateTotalMinutes(updated_sessions);
                const new_start_time = existing_record.start_time || new_session.start_time;

                set((state) => ({
                    records: state.records.map((r) =>
                        r.id === existing_record.id
                            ? {
                                  ...r,
                                  duration_minutes: total_minutes,
                                  start_time: new_start_time,
                                  end_time: new_session.end_time,
                                  sessions: updated_sessions,
                              }
                            : r
                    ),
                    timer: DEFAULT_TIMER,
                    form_data: DEFAULT_FORM_DATA,
                }));

                return { ...existing_record, duration_minutes: total_minutes };
            } else {
                const new_record: WorkRecord = {
                    id: crypto.randomUUID(),
                    ...active_form,
                    project_code: active_form.project_code || DEFAULT_PROJECT_CODE,
                    duration_minutes: calculateTotalMinutes([new_session]),
                    start_time: new_session.start_time,
                    end_time: new_session.end_time,
                    date: record_date,
                    sessions: [new_session],
                    is_completed: false,
                };

                set((state) => ({
                    records: [...state.records, new_record],
                    timer: DEFAULT_TIMER,
                    form_data: DEFAULT_FORM_DATA,
                }));

                return new_record;
            }
        }

        // 새로운 방식: 이미 추가된 세션의 end_time 업데이트
        const end_time = Date.now();
        const end_dayjs = dayjs(end_time);
        const end_time_str = end_dayjs.format("HH:mm");

        const record = records.find((r) => r.id === active_record_id);
        if (!record) {
            set({ timer: DEFAULT_TIMER, form_data: DEFAULT_FORM_DATA });
            return null;
        }

        // 세션의 종료 시간 및 소요 시간 계산
        const start_dayjs = dayjs(timer.start_time);
        const start_minutes = start_dayjs.hour() * 60 + start_dayjs.minute();
        const end_minutes = end_dayjs.hour() * 60 + end_dayjs.minute();
        const duration_minutes = Math.max(
            1,
            calculateDurationExcludingLunch(start_minutes, end_minutes)
        );

        // 세션 업데이트
        const updated_sessions = record.sessions.map((s) =>
            s.id === active_session_id
                ? { ...s, end_time: end_time_str, duration_minutes }
                : s
        );

        // 레코드 총 시간 재계산
        const total_minutes = calculateTotalMinutes(updated_sessions);

        // 마지막 종료 시간 결정
        const last_session = updated_sessions
            .filter((s) => s.end_time !== "")
            .sort((a, b) => a.end_time.localeCompare(b.end_time))
            .pop();

        set((state) => ({
            records: state.records.map((r) =>
                r.id === active_record_id
                    ? {
                          ...r,
                          sessions: updated_sessions,
                          duration_minutes: total_minutes,
                          end_time: last_session?.end_time || end_time_str,
                      }
                    : r
            ),
            timer: DEFAULT_TIMER,
            form_data: DEFAULT_FORM_DATA,
        }));

        return { ...record, duration_minutes: total_minutes };
    },

    // 작업 전환: 현재 작업 저장 후 새 작업 시작
    switchTemplate: (template_id: string) => {
        const { timer, templates, records } = get();
        const template = templates.find((t) => t.id === template_id);
        if (!template) return;

        // 현재 진행 중인 작업이 있으면 세션 종료
        if (timer.is_running && timer.start_time && timer.active_form_data) {
            const { active_record_id, active_session_id } = timer;
            const end_time = Date.now();
            const end_dayjs = dayjs(end_time);
            const end_time_str = end_dayjs.format("HH:mm");

            if (active_record_id && active_session_id) {
                // 새로운 방식: 이미 추가된 세션의 end_time 업데이트
                const record = records.find((r) => r.id === active_record_id);
                if (record) {
                    const start_dayjs = dayjs(timer.start_time);
                    const start_minutes = start_dayjs.hour() * 60 + start_dayjs.minute();
                    const end_minutes = end_dayjs.hour() * 60 + end_dayjs.minute();
                    const duration_minutes = Math.max(
                        1,
                        calculateDurationExcludingLunch(start_minutes, end_minutes)
                    );

                    const updated_sessions = record.sessions.map((s) =>
                        s.id === active_session_id
                            ? { ...s, end_time: end_time_str, duration_minutes }
                            : s
                    );

                    const total_minutes = calculateTotalMinutes(updated_sessions);
                    const last_session = updated_sessions
                        .filter((s) => s.end_time !== "")
                        .sort((a, b) => a.end_time.localeCompare(b.end_time))
                        .pop();

                    set((state) => ({
                        records: state.records.map((r) =>
                            r.id === active_record_id
                                ? {
                                      ...r,
                                      sessions: updated_sessions,
                                      duration_minutes: total_minutes,
                                      end_time: last_session?.end_time || end_time_str,
                                  }
                                : r
                        ),
                    }));
                }
            } else {
                // 이전 버전 호환: active_record_id/session_id가 없는 경우
                const active_form = timer.active_form_data;
                const record_date = dayjs(timer.start_time).format("YYYY-MM-DD");
                const new_session = createSession(timer.start_time, end_time);

                const existing_record = findExistingRecord(
                    records,
                    record_date,
                    active_form.work_name,
                    active_form.deal_name,
                    set
                );

                if (existing_record) {
                    const updated_sessions = [
                        ...(existing_record.sessions || []),
                        new_session,
                    ];
                    const total_minutes = calculateTotalMinutes(updated_sessions);
                    const new_start_time = existing_record.start_time || new_session.start_time;

                    set((state) => ({
                        records: state.records.map((r) =>
                            r.id === existing_record.id
                                ? {
                                      ...r,
                                      duration_minutes: total_minutes,
                                      start_time: new_start_time,
                                      end_time: new_session.end_time,
                                      sessions: updated_sessions,
                                  }
                                : r
                        ),
                    }));
                } else {
                    const new_record: WorkRecord = {
                        id: crypto.randomUUID(),
                        ...active_form,
                        project_code:
                            active_form.project_code || DEFAULT_PROJECT_CODE,
                        duration_minutes: calculateTotalMinutes([new_session]),
                        start_time: new_session.start_time,
                        end_time: new_session.end_time,
                        date: record_date,
                        sessions: [new_session],
                        is_completed: false,
                    };

                    set((state) => ({
                        records: [...state.records, new_record],
                    }));
                }
            }
        }

        // 새 템플릿으로 타이머 시작 (records에도 세션 추가)
        const new_form_data: WorkFormData = {
            project_code: template.project_code || DEFAULT_PROJECT_CODE,
            work_name: template.work_name,
            task_name: template.task_name,
            deal_name: template.deal_name,
            category_name: template.category_name,
            note: template.note,
        };

        // 폼 데이터 먼저 설정
        set({ form_data: new_form_data });

        // 새 작업 시작 (startTimer와 유사한 로직)
        const start_time = Date.now();
        const start_dayjs = dayjs(start_time);
        const record_date = start_dayjs.format("YYYY-MM-DD");
        const start_time_str = start_dayjs.format("HH:mm");

        const new_session: WorkSession = {
            id: crypto.randomUUID(),
            date: record_date,
            start_time: start_time_str,
            end_time: "",
            duration_minutes: 0,
        };

        // 최신 records 가져오기 (이전 세션 종료 후 상태)
        const current_records = get().records;
        const existing_record = findExistingRecord(
            current_records,
            record_date,
            new_form_data.work_name,
            new_form_data.deal_name,
            set
        );

        let active_record_id: string;

        if (existing_record) {
            active_record_id = existing_record.id;
            set((state) => ({
                records: state.records.map((r) =>
                    r.id === existing_record.id
                        ? {
                              ...r,
                              sessions: [...(r.sessions || []), new_session],
                              start_time: r.start_time || start_time_str,
                          }
                        : r
                ),
            }));
        } else {
            active_record_id = crypto.randomUUID();
            const new_record: WorkRecord = {
                id: active_record_id,
                ...new_form_data,
                project_code: new_form_data.project_code || DEFAULT_PROJECT_CODE,
                duration_minutes: 0,
                start_time: start_time_str,
                end_time: "",
                date: record_date,
                sessions: [new_session],
                is_completed: false,
            };
            set((state) => ({
                records: [...state.records, new_record],
            }));
        }

        set({
            timer: {
                is_running: true,
                start_time: start_time,
                active_template_id: template_id,
                active_form_data: new_form_data,
                active_record_id: active_record_id,
                active_session_id: new_session.id,
            },
        });
    },

    // 경과 시간을 실시간으로 계산 (저장하지 않음)
    getElapsedSeconds: () => {
        const { timer } = get();
        if (!timer.is_running || !timer.start_time) return 0;
        return Math.floor((Date.now() - timer.start_time) / 1000);
    },

    resetTimer: () => {
        const { timer, records } = get();

        // 진행 중인 세션이 있으면 삭제
        if (timer.is_running && timer.active_record_id && timer.active_session_id) {
            const record = records.find((r) => r.id === timer.active_record_id);
            if (record) {
                const remaining_sessions = record.sessions.filter(
                    (s) => s.id !== timer.active_session_id
                );

                if (remaining_sessions.length === 0) {
                    // 세션이 모두 삭제되면 레코드도 삭제
                    set((state) => ({
                        records: state.records.filter((r) => r.id !== timer.active_record_id),
                    }));
                } else {
                    // 남은 세션으로 레코드 업데이트
                    const total_minutes = calculateTotalMinutes(remaining_sessions);
                    set((state) => ({
                        records: state.records.map((r) =>
                            r.id === timer.active_record_id
                                ? {
                                      ...r,
                                      sessions: remaining_sessions,
                                      duration_minutes: total_minutes,
                                  }
                                : r
                        ),
                    }));
                }
            }
        }

        set({ timer: DEFAULT_TIMER, form_data: DEFAULT_FORM_DATA });
    },

    // 타이머 실행 중 active_form_data 업데이트
    updateActiveFormData: (data) => {
        set((state) => ({
            timer: {
                ...state.timer,
                active_form_data: state.timer.active_form_data
                    ? { ...state.timer.active_form_data, ...data }
                    : null,
            },
            form_data: { ...state.form_data, ...data },
        }));
    },

    // 타이머 시작 시간 변경 (간트차트에서 진행 중인 작업의 시작 시간을 앞당길 때)
    updateTimerStartTime: (new_start_time) => {
        const { timer, records } = get();
        if (!timer.is_running || !timer.start_time) return;

        // 새 시작 시간은 현재 시간보다 미래일 수 없음
        if (new_start_time > Date.now()) return;

        const new_start_time_str = dayjs(new_start_time).format("HH:mm");

        // 타이머 상태 업데이트
        set((state) => ({
            timer: {
                ...state.timer,
                start_time: new_start_time,
            },
        }));

        // 진행 중인 세션의 start_time도 업데이트
        if (timer.active_record_id && timer.active_session_id) {
            const record = records.find((r) => r.id === timer.active_record_id);
            if (record) {
                const updated_sessions = record.sessions.map((s) =>
                    s.id === timer.active_session_id
                        ? { ...s, start_time: new_start_time_str }
                        : s
                );

                // 첫 세션이면 레코드의 start_time도 업데이트
                const first_session = updated_sessions.sort((a, b) =>
                    a.start_time.localeCompare(b.start_time)
                )[0];

                set((state) => ({
                    records: state.records.map((r) =>
                        r.id === timer.active_record_id
                            ? {
                                  ...r,
                                  sessions: updated_sessions,
                                  start_time: first_session?.start_time || r.start_time,
                              }
                            : r
                    ),
                }));
            }
        }
    },

    setFormData: (data) => {
        set((state) => ({
            form_data: { ...state.form_data, ...data },
        }));
    },

    resetFormData: () => {
        set({ form_data: DEFAULT_FORM_DATA });
    },

    addRecord: (record) => {
        set((state) => ({
            records: [...state.records, record],
        }));
    },

    deleteRecord: (id) => {
        set((state) => ({
            records: state.records.filter((r) => r.id !== id),
        }));
    },

    // 휴지통으로 이동 (soft delete)
    softDeleteRecord: (id) => {
        set((state) => ({
            records: state.records.map((r) =>
                r.id === id
                    ? {
                          ...r,
                          is_deleted: true,
                          deleted_at: new Date().toISOString(),
                      }
                    : r
            ),
        }));
    },

    // 휴지통에서 복원
    restoreRecord: (id) => {
        set((state) => ({
            records: state.records.map((r) =>
                r.id === id
                    ? { ...r, is_deleted: false, deleted_at: undefined }
                    : r
            ),
        }));
    },

    // 완전 삭제
    permanentlyDeleteRecord: (id) => {
        set((state) => ({
            records: state.records.filter((r) => r.id !== id),
        }));
    },

    // 삭제된 작업 목록
    getDeletedRecords: () => {
        return get().records.filter((r) => r.is_deleted === true);
    },

    updateRecord: (id, record) => {
        set((state) => ({
            records: state.records.map((r) =>
                r.id === id ? { ...r, ...record } : r
            ),
        }));
    },

    // 세션 수정 (시간 충돌 방지 포함)
    updateSession: (record_id, session_id, new_start, new_end, new_date) => {
        const { records } = get();
        const record = records.find((r) => r.id === record_id);
        if (!record)
            return {
                success: false,
                adjusted: false,
                message: "레코드를 찾을 수 없습니다.",
            };

        const session_index = record.sessions.findIndex(
            (s) => s.id === session_id
        );
        if (session_index === -1)
            return {
                success: false,
                adjusted: false,
                message: "세션을 찾을 수 없습니다.",
            };

        const current_session = record.sessions[session_index];
        const target_date = new_date || current_session.date || record.date;
        const is_date_changed =
            new_date && new_date !== (current_session.date || record.date);

        // 시간 문자열을 분으로 변환 (HH:mm -> 분)
        const timeToMinutes = (time: string): number => {
            const parts = time.split(":").map(Number);
            const h = parts[0] || 0;
            const m = parts[1] || 0;
            return h * 60 + m;
        };

        // 분을 시간 문자열로 변환 (분 -> HH:mm)
        const minutesToTime = (mins: number): string => {
            const h = Math.floor(mins / 60);
            const m = Math.floor(mins % 60);
            return `${h.toString().padStart(2, "0")}:${m
                .toString()
                .padStart(2, "0")}`;
        };

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
            // 삭제된 레코드는 충돌 감지에서 제외
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
        const { timer } = get();
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
                        work_name: timer.active_form_data.work_name || "진행 중인 작업",
                        deal_name: timer.active_form_data.deal_name || "",
                    });
                }
            }
        }

        // 충돌 작업 정보를 포함한 메시지 생성 헬퍼
        const formatConflictInfo = (other: typeof same_day_sessions[0]) => {
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
                        message: `${target_date}에 ${formatConflictInfo(other)} 작업과 시간이 겹칩니다. 시간을 조정하세요.`,
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
                                message: `${formatConflictInfo(other)} 작업과 시간이 완전히 겹칩니다.`,
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
                                message: `${formatConflictInfo(other)} 작업 안에 완전히 포함됩니다.`,
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
        const updated_sessions = record.sessions.map((s, idx) =>
            idx === session_index
                ? {
                      ...s,
                      date: target_date,
                      start_time: adjusted_start,
                      end_time: adjusted_end,
                      duration_minutes,
                  }
                : s
        );

        // 날짜별로 세션 정렬 (날짜 오름차순, 시간 오름차순)
        const sorted_sessions = [...updated_sessions].sort((a, b) => {
            const date_a = a.date || record.date;
            const date_b = b.date || record.date;
            if (date_a !== date_b) return date_a.localeCompare(date_b);
            return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
        });

        // 레코드 업데이트 (총 시간, 시작/종료 시간 재계산)
        const total_minutes = updated_sessions.reduce(
            (sum, s) => sum + getSessionMinutes(s),
            0
        );

        set((state) => ({
            records: state.records.map((r) =>
                r.id === record_id
                    ? {
                          ...r,
                          sessions: sorted_sessions,
                          duration_minutes: Math.max(1, total_minutes),
                          start_time:
                              sorted_sessions[0]?.start_time || r.start_time,
                          end_time:
                              sorted_sessions[sorted_sessions.length - 1]
                                  ?.end_time || r.end_time,
                      }
                    : r
            ),
        }));

        return {
            success: true,
            adjusted: was_adjusted,
            message: was_adjusted
                ? "시간 충돌로 인해 자동 조정되었습니다."
                : undefined,
        };
    },

    // 세션 삭제
    deleteSession: (record_id, session_id) => {
        const { records } = get();
        const record = records.find((r) => r.id === record_id);
        if (!record) return;

        const updated_sessions = record.sessions.filter(
            (s) => s.id !== session_id
        );

        // 세션이 모두 삭제되면 레코드도 삭제
        if (updated_sessions.length === 0) {
            set((state) => ({
                records: state.records.filter((r) => r.id !== record_id),
            }));
            return;
        }

        // 시간 재계산
        const timeToMinutes = (time: string): number => {
            const parts = time.split(":").map(Number);
            return (parts[0] || 0) * 60 + (parts[1] || 0);
        };

        const total_minutes = updated_sessions.reduce(
            (sum, s) => sum + getSessionMinutes(s),
            0
        );
        const sorted_sessions = [...updated_sessions].sort(
            (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
        );

        set((state) => ({
            records: state.records.map((r) =>
                r.id === record_id
                    ? {
                          ...r,
                          sessions: updated_sessions,
                          duration_minutes: Math.max(1, total_minutes),
                          start_time:
                              sorted_sessions[0]?.start_time || r.start_time,
                          end_time:
                              sorted_sessions[sorted_sessions.length - 1]
                                  ?.end_time || r.end_time,
                      }
                    : r
            ),
        }));
    },

    // 템플릿 관리
    addTemplate: (template) => {
        const new_template: WorkTemplate = {
            ...template,
            id: crypto.randomUUID(),
            created_at: dayjs().toISOString(),
        };
        set((state) => ({
            templates: [...state.templates, new_template],
        }));
        return new_template;
    },

    deleteTemplate: (id) => {
        set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
        }));
    },

    updateTemplate: (id, template) => {
        set((state) => ({
            templates: state.templates.map((t) =>
                t.id === id ? { ...t, ...template } : t
            ),
        }));
    },

    reorderTemplates: (active_id, over_id) => {
        set((state) => {
            const old_index = state.templates.findIndex((t) => t.id === active_id);
            const new_index = state.templates.findIndex((t) => t.id === over_id);
            if (old_index === -1 || new_index === -1) return state;

            const new_templates = [...state.templates];
            const [removed] = new_templates.splice(old_index, 1);
            new_templates.splice(new_index, 0, removed);

            return { templates: new_templates };
        });
    },

    applyTemplate: (template_id) => {
        const { templates } = get();
        const template = templates.find((t) => t.id === template_id);
        if (!template) return;

        set({
            form_data: {
                project_code: template.project_code || "",
                work_name: template.work_name,
                task_name: template.task_name,
                deal_name: template.deal_name,
                category_name: template.category_name,
                note: template.note,
            },
        });
    },

    setSelectedDate: (date) => {
        set({ selected_date: date });
    },

    getFilteredRecords: () => {
        const { records, selected_date } = get();
        return records.filter((r) => r.date === selected_date && !r.is_deleted);
    },

    // 미완료 작업: 선택된 날짜의 레코드 + 과거 미완료 레코드
    getIncompleteRecords: () => {
        const { records, selected_date } = get();
        return records.filter((r) => {
            // 삭제된 레코드는 제외
            if (r.is_deleted) return false;
            // 완료된 레코드는 제외
            if (r.is_completed) return false;
            // 선택된 날짜의 레코드 또는 과거의 미완료 레코드
            return r.date <= selected_date;
        });
    },

    // 완료된 작업 목록
    getCompletedRecords: () => {
        const { records } = get();
        return records
            .filter((r) => r.is_completed && !r.is_deleted)
            .sort((a, b) => {
                // 완료 시간 기준 내림차순 정렬
                const a_time = a.completed_at || a.date;
                const b_time = b.completed_at || b.date;
                return b_time.localeCompare(a_time);
            });
    },

    // 완료 상태 관리
    markAsCompleted: (id: string) => {
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

        set((state) => ({
            records: state.records.map((r) =>
                r.id === id
                    ? {
                          ...r,
                          is_completed: true,
                          completed_at: new Date().toISOString(),
                      }
                    : r
            ),
        }));
    },

    markAsIncomplete: (id: string) => {
        set((state) => ({
            records: state.records.map((r) =>
                r.id === id
                    ? { ...r, is_completed: false, completed_at: undefined }
                    : r
            ),
        }));
    },

    // 자동완성 옵션 생성 (숨김 목록 필터링)
    getAutoCompleteOptions: (field) => {
        const { records, templates, hidden_autocomplete_options } = get();
        const values = new Set<string>();

        // 기존 레코드에서 추출
        records.forEach((r) => {
            const value = r[field as keyof WorkRecord];
            if (typeof value === "string" && value.trim()) {
                values.add(value);
            }
        });

        // 템플릿에서도 추출
        templates.forEach((t) => {
            const value = t[field as keyof WorkTemplate];
            if (typeof value === "string" && value.trim()) {
                values.add(value);
            }
        });

        // 숨김 목록 필터링
        const hidden_list =
            hidden_autocomplete_options[
                field as keyof typeof hidden_autocomplete_options
            ] || [];
        const filtered = Array.from(values).filter(
            (v) => !hidden_list.includes(v)
        );

        return filtered.sort();
    },

    // 프로젝트 코드 자동완성 옵션 (코드 + 작업명 표시, 숨김 목록 필터링)
    getProjectCodeOptions: () => {
        const { records, templates, hidden_autocomplete_options } = get();
        const code_map = new Map<string, Set<string>>(); // code -> work_names

        // 레코드에서 추출
        records.forEach((r) => {
            if (r.project_code && r.project_code.trim()) {
                if (!code_map.has(r.project_code)) {
                    code_map.set(r.project_code, new Set());
                }
                if (r.work_name) {
                    code_map.get(r.project_code)!.add(r.work_name);
                }
            }
        });

        // 템플릿에서도 추출
        templates.forEach((t) => {
            if (t.project_code && t.project_code.trim()) {
                if (!code_map.has(t.project_code)) {
                    code_map.set(t.project_code, new Set());
                }
                if (t.work_name) {
                    code_map.get(t.project_code)!.add(t.work_name);
                }
            }
        });

        // 숨김 목록
        const hidden_codes = hidden_autocomplete_options.project_code || [];

        // 옵션 생성: { value: 코드, label: "[코드] 작업명1, 작업명2...", work_name: 첫번째 작업명 }
        const options: { value: string; label: string; work_name?: string }[] =
            [];
        code_map.forEach((work_names, code) => {
            // 숨김 처리된 코드 제외
            if (hidden_codes.includes(code)) return;

            const names_arr = Array.from(work_names);
            const names = names_arr.slice(0, 3).join(", ");
            const suffix =
                work_names.size > 3 ? ` 외 ${work_names.size - 3}개` : "";
            options.push({
                value: code,
                label: `[${code}] ${names}${suffix}`,
                work_name: names_arr[0] || undefined, // 첫 번째 작업명
            });
        });

        return options.sort((a, b) => a.value.localeCompare(b.value));
    },

    // 사용자 정의 옵션 관리
    addCustomTaskOption: (option) => {
        const trimmed = option.trim();
        if (!trimmed) return;
        set((state) => ({
            custom_task_options: state.custom_task_options.includes(trimmed)
                ? state.custom_task_options
                : [...state.custom_task_options, trimmed],
        }));
    },

    addCustomCategoryOption: (option) => {
        const trimmed = option.trim();
        if (!trimmed) return;
        set((state) => ({
            custom_category_options: state.custom_category_options.includes(
                trimmed
            )
                ? state.custom_category_options
                : [...state.custom_category_options, trimmed],
        }));
    },

    removeCustomTaskOption: (option) => {
        set((state) => ({
            custom_task_options: state.custom_task_options.filter(
                (o) => o !== option
            ),
        }));
    },

    removeCustomCategoryOption: (option) => {
        set((state) => ({
            custom_category_options: state.custom_category_options.filter(
                (o) => o !== option
            ),
        }));
    },

    // 자동완성 옵션 숨김 처리
    hideAutoCompleteOption: (field, value) => {
        set((state) => {
            const current_list = state.hidden_autocomplete_options[field] || [];
            return {
                hidden_autocomplete_options: {
                    ...state.hidden_autocomplete_options,
                    [field]: current_list.includes(value)
                        ? current_list
                        : [...current_list, value],
                },
            };
        });
    },

    // 자동완성 옵션 숨김 해제
    unhideAutoCompleteOption: (field, value) => {
        set((state) => {
            const current_list = state.hidden_autocomplete_options[field] || [];
            return {
                hidden_autocomplete_options: {
                    ...state.hidden_autocomplete_options,
                    [field]: current_list.filter((v) => v !== value),
                },
            };
        });
    },

    setUsePostfixOnPresetAdd: (value) => {
        set({ use_postfix_on_preset_add: value });
    },

    setAppTheme: (theme) => {
        set({ app_theme: theme });
    },
        }),
        {
            name: "work-time-storage", // LocalStorage 키
            partialize: (state) => ({
                // 영속화할 상태만 선택 (form_data, selected_date 제외)
                records: state.records,
                templates: state.templates,
                timer: state.timer,
                custom_task_options: state.custom_task_options,
                custom_category_options: state.custom_category_options,
                hidden_autocomplete_options: state.hidden_autocomplete_options,
                use_postfix_on_preset_add: state.use_postfix_on_preset_add,
                app_theme: state.app_theme,
            }),
        }
    )
);
