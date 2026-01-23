import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import type { InputRef } from "antd";
import {
    Card,
    Typography,
    Empty,
    Tooltip,
    Modal,
    Form,
    Input,
    Select,
    AutoComplete,
    Space,
    Divider,
    Button,
    message,
    Popover,
    Popconfirm,
} from "antd";
import { PlusOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useWorkStore,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "../store/useWorkStore";
import { useShortcutStore } from "../store/useShortcutStore";
import type { WorkRecord, WorkSession } from "../types";
import { useResponsive } from "../hooks/useResponsive";
import { formatShortcutKeyForPlatform, matchShortcutKey } from "../hooks/useShortcuts";

const { Text } = Typography;

// 점심시간 상수 (11:40 ~ 12:40)
const LUNCH_START = 11 * 60 + 40; // 700분 (11:40)
const LUNCH_END = 12 * 60 + 40; // 760분 (12:40)
const LUNCH_DURATION = LUNCH_END - LUNCH_START; // 60분

// 점심시간을 제외한 실제 작업 시간 계산
const calculateDurationExcludingLunch = (
    start_mins: number,
    end_mins: number
): number => {
    if (end_mins <= LUNCH_START || start_mins >= LUNCH_END) {
        return end_mins - start_mins;
    }
    if (start_mins >= LUNCH_START && end_mins <= LUNCH_END) {
        return 0;
    }
    if (start_mins < LUNCH_START && end_mins > LUNCH_END) {
        return end_mins - start_mins - LUNCH_DURATION;
    }
    if (start_mins < LUNCH_START && end_mins <= LUNCH_END) {
        return LUNCH_START - start_mins;
    }
    if (start_mins >= LUNCH_START && end_mins > LUNCH_END) {
        return end_mins - LUNCH_END;
    }
    return end_mins - start_mins;
};

// 시간을 분으로 변환 (예: "09:30" -> 570)
const timeToMinutes = (time_str: string): number => {
    const parts = time_str.split(":").map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 60 + minutes;
};

// 분을 시간 문자열로 변환 (분 -> HH:mm)
const minutesToTime = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

// 세션의 duration_minutes 가져오기 (호환성)
const getSessionMinutes = (session: WorkSession): number => {
    if (
        session.duration_minutes !== undefined &&
        !isNaN(session.duration_minutes)
    ) {
        return session.duration_minutes;
    }
    const legacy = session as unknown as { duration_seconds?: number };
    if (
        legacy.duration_seconds !== undefined &&
        !isNaN(legacy.duration_seconds)
    ) {
        return Math.ceil(legacy.duration_seconds / 60);
    }
    return 0;
};

// 작업별 그룹화된 세션 타입
interface GroupedWork {
    key: string;
    record: WorkRecord;
    sessions: WorkSession[];
    first_start: number;
}

// 드래그 선택 영역 타입
interface DragSelection {
    start_mins: number;
    end_mins: number;
}

// 세션 시간 범위 타입 (충돌 감지용)
interface TimeSlot {
    start: number;
    end: number;
}

// 리사이즈 드래그 상태 타입
interface ResizeState {
    session_id: string;
    record_id: string;
    handle: "left" | "right";
    original_start: number;
    original_end: number;
    current_value: number;
}

export default function DailyGanttChart() {
    const { is_mobile } = useResponsive();

    const {
        records,
        selected_date,
        templates,
        timer,
        getElapsedSeconds,
        addRecord,
        updateRecord,
        updateSession,
        deleteSession,
        getAutoCompleteOptions,
        getProjectCodeOptions,
        custom_task_options,
        custom_category_options,
        hidden_autocomplete_options,
        addCustomTaskOption,
        addCustomCategoryOption,
        hideAutoCompleteOption,
        updateTimerStartTime,
    } = useWorkStore();

    // 모달 저장 단축키 설정
    const modal_submit_shortcut = useShortcutStore((state) => 
        state.shortcuts.find(s => s.id === 'modal-submit')
    );
    const modal_submit_keys = modal_submit_shortcut?.keys || 'F8';

    // 성능을 위해 1분마다만 업데이트 (진행 중인 작업 표시용)
    const [gantt_tick, setGanttTick] = useState(0);
    useEffect(() => {
        if (!timer.is_running) return;

        // 1분(60초)마다 업데이트
        const interval = setInterval(() => {
            setGanttTick((t) => t + 1);
        }, 60000);

        return () => clearInterval(interval);
    }, [timer.is_running, timer.start_time]);

    // 드래그 상태
    const [is_dragging, setIsDragging] = useState(false);
    const [drag_selection, setDragSelection] = useState<DragSelection | null>(
        null
    );
    const drag_start_ref = useRef<{
        mins: number;
        available_min: number;
        available_max: number;
        waiting_for_empty: boolean; // 빈 영역 대기 중 플래그
    } | null>(null);
    const grid_ref = useRef<HTMLDivElement>(null);

    // 리사이즈 상태
    const [resize_state, setResizeState] = useState<ResizeState | null>(null);

    // 모달 상태
    const [is_modal_open, setIsModalOpen] = useState(false);
    const [selected_time_range, setSelectedTimeRange] = useState<{
        start: string;
        end: string;
    } | null>(null);
    const [form] = Form.useForm();

    // 수정 모달 상태
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [edit_record, setEditRecord] = useState<WorkRecord | null>(null);
    const [edit_form] = Form.useForm();

    // 사용자 정의 옵션 입력
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");

    // Input refs for focus management
    const new_task_input_ref = useRef<InputRef>(null);
    const new_category_input_ref = useRef<InputRef>(null);

    // 우클릭 팝오버 상태
    const [context_menu, setContextMenu] = useState<{
        session: WorkSession;
        record: WorkRecord;
    } | null>(null);

    // 거래명 기준으로 세션을 그룹화 (진행 중인 작업 포함)
    // 선택된 날짜의 세션만 표시 (레코드 날짜가 아닌 세션 날짜 기준)
    const grouped_works = useMemo(() => {
        const groups: Map<string, GroupedWork> = new Map();

        // 타이머 관련 정보 미리 계산 (중복 세션 필터링용)
        let timer_key: string | null = null;
        let timer_start_min = 0;
        let timer_date: string | null = null;

        if (timer.is_running && timer.active_form_data && timer.start_time) {
            timer_key =
                timer.active_form_data.deal_name ||
                timer.active_form_data.work_name;
            timer_date = dayjs(timer.start_time).format("YYYY-MM-DD");
            timer_start_min = timeToMinutes(
                dayjs(timer.start_time).format("HH:mm")
            );
        }

        records.forEach((record) => {
            // 삭제된 레코드는 제외
            if (record.is_deleted) return;

            // 레코드의 세션 중 선택된 날짜의 세션만 필터링
            // sessions가 비어있고 start_time도 없으면 간트에 표시하지 않음
            let all_sessions: typeof record.sessions = [];
            if (record.sessions && record.sessions.length > 0) {
                all_sessions = record.sessions;
            } else if (record.start_time) {
                // start_time이 있는 경우에만 가상 세션 생성
                all_sessions = [
                    {
                        id: record.id,
                        date: record.date,
                        start_time: record.start_time,
                        end_time: record.end_time,
                        duration_minutes: record.duration_minutes,
                    },
                ];
            }

            // 세션이 없으면 스킵
            if (all_sessions.length === 0) return;

            // 선택된 날짜의 세션만 필터링
            let date_sessions = all_sessions.filter(
                (s) => (s.date || record.date) === selected_date
            );

            // 해당 날짜에 세션이 없으면 스킵
            if (date_sessions.length === 0) return;

            const key = record.deal_name || record.work_name;

            // 타이머가 실행 중이고, 이 레코드가 현재 타이머 작업과 같으면
            // 시작 시간이 같은(중복) 세션만 필터링 (1분 이내 차이)
            if (
                timer_key &&
                timer_date === selected_date &&
                key === timer_key
            ) {
                date_sessions = date_sessions.filter((s) => {
                    const s_start = timeToMinutes(s.start_time);
                    // 시작 시간이 1분 이상 차이나는 세션만 유지
                    return Math.abs(s_start - timer_start_min) > 1;
                });
            }

            // 필터링 후 세션이 없으면 스킵 (타이머 가상 세션으로 대체됨)
            if (date_sessions.length === 0) return;

            if (groups.has(key)) {
                const group = groups.get(key)!;
                group.sessions.push(...date_sessions);
            } else {
                groups.set(key, {
                    key,
                    record,
                    sessions: [...date_sessions],
                    first_start: timeToMinutes(date_sessions[0].start_time),
                });
            }
        });

        // 현재 진행 중인 작업이 있고, 오늘 날짜인 경우 가상 세션 추가
        // (겹치는 세션은 위 records.forEach에서 이미 필터링됨)
        if (timer.is_running && timer.active_form_data && timer.start_time) {
            const start_date = dayjs(timer.start_time).format("YYYY-MM-DD");

            // 오늘 날짜의 작업인 경우에만 표시
            if (start_date === selected_date) {
                const elapsed_seconds = getElapsedSeconds();
                const elapsed_minutes = Math.floor(elapsed_seconds / 60);
                const start_time_str = dayjs(timer.start_time).format("HH:mm");
                const end_time_str = dayjs().format("HH:mm");

                const key =
                    timer.active_form_data.deal_name ||
                    timer.active_form_data.work_name;

                // 가상 세션 생성
                const virtual_session: WorkSession = {
                    id: "virtual-running-session",
                    date: selected_date,
                    start_time: start_time_str,
                    end_time: end_time_str,
                    duration_minutes: elapsed_minutes,
                };

                const existing_group = groups.get(key);

                if (existing_group) {
                    // 기존 그룹에 가상 세션 추가 (겹치는 세션은 이미 필터링됨)
                    existing_group.sessions.push(virtual_session);
                } else {
                    // 새 그룹 생성 (가상 레코드)
                    const virtual_record: WorkRecord = {
                        id: "virtual-running-record",
                        project_code:
                            timer.active_form_data.project_code || "A00_00000",
                        work_name: timer.active_form_data.work_name,
                        task_name: timer.active_form_data.task_name || "",
                        deal_name: timer.active_form_data.deal_name || "",
                        category_name:
                            timer.active_form_data.category_name || "",
                        note: timer.active_form_data.note || "",
                        duration_minutes: elapsed_minutes,
                        start_time: start_time_str,
                        end_time: end_time_str,
                        date: selected_date,
                        sessions: [virtual_session],
                        is_completed: false,
                    };

                    groups.set(key, {
                        key,
                        record: virtual_record,
                        sessions: [virtual_session],
                        first_start: timeToMinutes(start_time_str),
                    });
                }
            }
        }

        return Array.from(groups.values()).sort(
            (a, b) => a.first_start - b.first_start
        );
    }, [
        records,
        selected_date,
        timer.is_running,
        timer.active_form_data,
        timer.start_time,
        gantt_tick,
        getElapsedSeconds,
    ]);

    // 모든 세션의 시간 슬롯 (충돌 감지용) - 시작 시간순 정렬
    // 점심시간도 점유된 슬롯으로 처리
    // 현재 레코딩 중인 작업도 포함
    const occupied_slots = useMemo((): TimeSlot[] => {
        const slots: TimeSlot[] = [];

        // 점심시간 슬롯 추가
        slots.push({ start: LUNCH_START, end: LUNCH_END });

        grouped_works.forEach((group) => {
            group.sessions.forEach((session) => {
                slots.push({
                    start: timeToMinutes(session.start_time),
                    end: timeToMinutes(session.end_time),
                });
            });
        });

        // 현재 레코딩 중인 작업의 시간도 충돌 감지에 포함
        if (timer.is_running && timer.start_time) {
            const start_date = dayjs(timer.start_time).format("YYYY-MM-DD");
            if (start_date === selected_date) {
                const start_mins = timeToMinutes(
                    dayjs(timer.start_time).format("HH:mm")
                );
                const end_mins = timeToMinutes(dayjs().format("HH:mm"));
                if (end_mins > start_mins) {
                    slots.push({ start: start_mins, end: end_mins });
                }
            }
        }

        return slots.sort((a, b) => a.start - b.start);
    }, [grouped_works, timer.is_running, timer.start_time, selected_date]);

    // 특정 시간이 기존 세션 위에 있는지 확인
    const isOnExistingBar = useCallback(
        (mins: number): boolean => {
            return occupied_slots.some(
                (slot) => mins >= slot.start && mins < slot.end
            );
        },
        [occupied_slots]
    );

    // 시간 범위 계산 (기본 9시-18시)
    const time_range = useMemo(() => {
        let min_start = 9 * 60;
        let max_end = 18 * 60;

        if (grouped_works.length > 0) {
            grouped_works.forEach((group) => {
                group.sessions.forEach((session) => {
                    const start = timeToMinutes(session.start_time);
                    const end = timeToMinutes(session.end_time);
                    min_start = Math.min(min_start, start);
                    max_end = Math.max(max_end, end);
                });
            });
        }

        return {
            start: Math.floor(min_start / 60) * 60,
            end: Math.ceil(max_end / 60) * 60,
        };
    }, [grouped_works]);

    // 드래그 시작점에서 확장 가능한 범위 계산
    // anchor_mins를 기준으로 왼쪽/오른쪽으로 확장할 수 있는 최대 범위 반환
    const getAvailableRange = useCallback(
        (anchor_mins: number): { min: number; max: number } => {
            let min_bound = time_range.start;
            let max_bound = time_range.end;

            for (const slot of occupied_slots) {
                // 앵커 왼쪽에 있는 슬롯 중 가장 가까운 것의 end가 min_bound
                if (slot.end <= anchor_mins) {
                    min_bound = Math.max(min_bound, slot.end);
                }
                // 앵커 오른쪽에 있는 슬롯 중 가장 가까운 것의 start가 max_bound
                if (slot.start >= anchor_mins) {
                    max_bound = Math.min(max_bound, slot.start);
                    break; // 정렬되어 있으므로 첫 번째 발견한 것이 가장 가까움
                }
            }

            return { min: min_bound, max: max_bound };
        },
        [occupied_slots, time_range]
    );

    // 시간 라벨 생성
    const time_labels = useMemo(() => {
        const labels: string[] = [];
        for (let m = time_range.start; m <= time_range.end; m += 60) {
            labels.push(
                `${Math.floor(m / 60)
                    .toString()
                    .padStart(2, "0")}:00`
            );
        }
        return labels;
    }, [time_range]);

    const total_minutes = time_range.end - time_range.start;

    // 자동완성 옵션 (원본 데이터)
    const raw_project_code_options = useMemo(() => {
        return getProjectCodeOptions();
    }, [records, templates, getProjectCodeOptions]);

    // 프로젝트 코드 선택 시 작업명 자동 채우기 핸들러
    const handleProjectCodeSelect = useCallback(
        (value: string) => {
            const selected = raw_project_code_options.find(
                (opt) => opt.value === value
            );
            if (selected?.work_name) {
                form.setFieldsValue({ work_name: selected.work_name });
            }
        },
        [raw_project_code_options, form]
    );

    // 프로젝트 코드 자동완성 옵션 (삭제 버튼 포함)
    const project_code_options = useMemo(() => {
        return raw_project_code_options.map((opt) => ({
            ...opt,
            label: (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>{opt.label}</span>
                    <CloseOutlined
                        style={{
                            fontSize: 10,
                            color: "#999",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("project_code", opt.value);
                            message.info(`"${opt.value}" 코드가 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [raw_project_code_options, hideAutoCompleteOption]);

    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({
            value: v,
            label: (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>{v}</span>
                    <CloseOutlined
                        style={{
                            fontSize: 10,
                            color: "#999",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("work_name", v);
                            message.info(`"${v}" 옵션이 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [
        records,
        templates,
        hidden_autocomplete_options,
        getAutoCompleteOptions,
        hideAutoCompleteOption,
    ]);

    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({
            value: v,
            label: (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>{v}</span>
                    <CloseOutlined
                        style={{
                            fontSize: 10,
                            color: "#999",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            hideAutoCompleteOption("deal_name", v);
                            message.info(`"${v}" 옵션이 숨겨졌습니다`);
                        }}
                    />
                </div>
            ),
        }));
    }, [
        records,
        templates,
        hidden_autocomplete_options,
        getAutoCompleteOptions,
        hideAutoCompleteOption,
    ]);

    const task_options = useMemo(() => {
        const all = [...DEFAULT_TASK_OPTIONS, ...custom_task_options];
        const hidden = hidden_autocomplete_options.task_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [custom_task_options, hidden_autocomplete_options]);

    const category_options = useMemo(() => {
        const all = [...DEFAULT_CATEGORY_OPTIONS, ...custom_category_options];
        const hidden = hidden_autocomplete_options.category_option || [];
        return [...new Set(all)]
            .filter((v) => !hidden.includes(v))
            .map((v) => ({ value: v, label: v }));
    }, [custom_category_options, hidden_autocomplete_options]);

    // 작업별 색상 가져오기
    const getWorkColor = (record: WorkRecord): string => {
        const template = templates.find(
            (t) =>
                t.work_name === record.work_name &&
                t.deal_name === record.deal_name
        );
        if (template) return template.color;

        const colors = [
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
        let hash = 0;
        const key = record.work_name + record.deal_name;
        for (let i = 0; i < key.length; i++) {
            hash = key.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // 바 위치 및 너비 계산
    const getBarStyle = (
        session: WorkSession,
        color: string,
        is_running = false
    ) => {
        const start = timeToMinutes(session.start_time);
        const end = timeToMinutes(session.end_time);

        const left = ((start - time_range.start) / total_minutes) * 100;
        let width = ((end - start) / total_minutes) * 100;

        // 모든 세션에 최소 너비 보장 (0분 세션도 표시)
        // 최소 5분 너비 또는 1% 중 큰 값
        const min_width_percent = Math.max((5 / total_minutes) * 100, 1);
        width = Math.max(width, min_width_percent);

        return {
            left: `${left}%`,
            width: `${width}%`,
            backgroundColor: color,
            // 진행 중인 세션에 애니메이션 효과
            ...(is_running && {
                opacity: 0.8,
                animation: "pulse 2s ease-in-out infinite",
            }),
        };
    };

    // 점심시간 오버레이 스타일 계산
    const lunch_overlay_style = useMemo(() => {
        // 점심시간이 현재 시간 범위에 포함되는지 확인
        if (LUNCH_END <= time_range.start || LUNCH_START >= time_range.end) {
            return null; // 점심시간이 범위 밖
        }

        const visible_start = Math.max(LUNCH_START, time_range.start);
        const visible_end = Math.min(LUNCH_END, time_range.end);

        const left = ((visible_start - time_range.start) / total_minutes) * 100;
        const width = ((visible_end - visible_start) / total_minutes) * 100;

        return {
            left: `${left}%`,
            width: `${width}%`,
        };
    }, [time_range, total_minutes]);

    // 분을 읽기 쉬운 형식으로
    const formatMinutes = (minutes: number): string => {
        if (minutes < 60) return `${minutes}분`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return `${hrs}시간`;
        return `${hrs}시간 ${mins}분`;
    };

    // 총 소요 시간 계산
    const getTotalDuration = (sessions: WorkSession[]): number => {
        return sessions.reduce((sum, s) => sum + getSessionMinutes(s), 0);
    };

    // X 좌표를 분으로 변환
    const xToMinutes = useCallback(
        (x: number): number => {
            if (!grid_ref.current) return 0;
            const rect = grid_ref.current.getBoundingClientRect();
            const relative_x = x - rect.left;
            const percentage = relative_x / rect.width;
            const mins = time_range.start + percentage * total_minutes;
            // 1분 단위로 스냅
            return Math.round(mins);
        },
        [time_range, total_minutes]
    );

    // 드래그 시작
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (!grid_ref.current) return;

            // 기존 바 클릭은 무시 (툴팁 등 다른 동작 허용)
            const target = e.target as HTMLElement;
            if (target.classList.contains("gantt-bar")) {
                return;
            }

            const mins = xToMinutes(e.clientX);

            e.preventDefault();

            // 기존 세션 위에서 시작해도 드래그는 허용
            // 빈 영역에 마우스가 도달하면 그때부터 선택 영역 표시
            const on_existing = isOnExistingBar(mins);

            drag_start_ref.current = {
                mins,
                available_min: time_range.start,
                available_max: time_range.end,
                waiting_for_empty: on_existing, // 빈 영역 대기 중 플래그
            };
            setIsDragging(true);

            // 빈 영역에서 시작했으면 바로 선택 영역 표시
            if (!on_existing) {
                const available = getAvailableRange(mins);
                drag_start_ref.current.available_min = available.min;
                drag_start_ref.current.available_max = available.max;
                setDragSelection({
                    start_mins: mins,
                    end_mins: mins,
                });
            } else {
                // 기존 세션 위에서 시작했으면 선택 영역 null
                setDragSelection(null);
            }
        },
        [xToMinutes, isOnExistingBar, getAvailableRange, time_range]
    );

    // 드래그 중
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!is_dragging || !drag_start_ref.current) return;

            const current_mins = xToMinutes(e.clientX);
            const on_existing = isOnExistingBar(current_mins);

            // 빈 영역 대기 중이면서 아직 기존 세션 위에 있으면 무시
            if (drag_start_ref.current.waiting_for_empty) {
                if (on_existing) {
                    // 아직 기존 세션 위에 있음 - 선택 영역 표시 안함
                    setDragSelection(null);
                    return;
                } else {
                    // 빈 영역에 도달! 여기서부터 선택 시작
                    const available = getAvailableRange(current_mins);
                    drag_start_ref.current = {
                        mins: current_mins,
                        available_min: available.min,
                        available_max: available.max,
                        waiting_for_empty: false,
                    };
                    setDragSelection({
                        start_mins: current_mins,
                        end_mins: current_mins,
                    });
                    return;
                }
            }

            const {
                mins: anchor_mins,
                available_min,
                available_max,
            } = drag_start_ref.current;

            // 확장 가능한 범위 내로 clamp
            const clamped_mins = Math.max(
                available_min,
                Math.min(available_max, current_mins)
            );

            setDragSelection({
                start_mins: Math.min(anchor_mins, clamped_mins),
                end_mins: Math.max(anchor_mins, clamped_mins),
            });
        },
        [is_dragging, xToMinutes, isOnExistingBar, getAvailableRange]
    );

    // 드래그 종료
    const handleMouseUp = useCallback(() => {
        if (!is_dragging || !drag_selection) {
            setIsDragging(false);
            setDragSelection(null);
            return;
        }

        const duration = drag_selection.end_mins - drag_selection.start_mins;

        // 최소 1분 이상 선택해야 함 (충돌은 자동으로 방지됨)
        if (duration >= 1) {
            setSelectedTimeRange({
                start: minutesToTime(drag_selection.start_mins),
                end: minutesToTime(drag_selection.end_mins),
            });
            setIsModalOpen(true);
        }

        setIsDragging(false);
        setDragSelection(null);
        drag_start_ref.current = null;
    }, [is_dragging, drag_selection]);

    // 마우스가 영역을 벗어났을 때
    const handleMouseLeave = useCallback(() => {
        if (is_dragging) {
            setIsDragging(false);
            setDragSelection(null);
            drag_start_ref.current = null;
        }
        if (resize_state) {
            setResizeState(null);
        }
    }, [is_dragging, resize_state]);

    // 리사이즈 시작
    const handleResizeStart = useCallback(
        (
            e: React.MouseEvent,
            session: WorkSession,
            record: WorkRecord,
            handle: "left" | "right"
        ) => {
            e.stopPropagation();
            e.preventDefault();

            const start_mins = timeToMinutes(session.start_time);
            const end_mins = timeToMinutes(session.end_time);

            setResizeState({
                session_id: session.id,
                record_id: record.id,
                handle,
                original_start: start_mins,
                original_end: end_mins,
                current_value: handle === "left" ? start_mins : end_mins,
            });
        },
        []
    );

    // 리사이즈 중 (마우스 이동)
    const handleResizeMove = useCallback(
        (e: React.MouseEvent) => {
            if (!resize_state) return;

            const mins = xToMinutes(e.clientX);
            const clamped = Math.max(
                time_range.start,
                Math.min(time_range.end, mins)
            );

            setResizeState((prev) =>
                prev ? { ...prev, current_value: clamped } : null
            );
        },
        [resize_state, xToMinutes, time_range]
    );

    // 리사이즈 종료
    const handleResizeEnd = useCallback(() => {
        if (!resize_state) return;

        const {
            session_id,
            record_id,
            handle,
            original_start,
            original_end,
            current_value,
        } = resize_state;

        const new_start = handle === "left" ? current_value : original_start;
        const new_end = handle === "right" ? current_value : original_end;

        // 유효성 검사 (최소 1분 이상)
        if (new_end - new_start < 1) {
            message.warning("최소 1분 이상이어야 합니다.");
            setResizeState(null);
            return;
        }

        // 진행 중인 작업의 시작 시간 조절
        if (session_id === "virtual-running-session") {
            // 분 단위를 타임스탬프로 변환 (오늘 날짜 기준)
            const today = dayjs(selected_date);
            const new_start_timestamp = today
                .hour(Math.floor(new_start / 60))
                .minute(new_start % 60)
                .second(0)
                .millisecond(0)
                .valueOf();
            
            updateTimerStartTime(new_start_timestamp);
            setResizeState(null);
            return;
        }

        // updateSession 호출 (충돌 시 자동 조정됨)
        const result = updateSession(
            record_id,
            session_id,
            minutesToTime(new_start),
            minutesToTime(new_end)
        );

        if (result.adjusted) {
            message.info(result.message);
        } else if (!result.success) {
            message.error(result.message);
        }

        setResizeState(null);
    }, [resize_state, updateSession, selected_date, updateTimerStartTime]);

    // 리사이즈 중인 바 스타일 계산
    const getResizingBarStyle = useCallback(
        (session: WorkSession, color: string) => {
            if (!resize_state || resize_state.session_id !== session.id) {
                return null;
            }

            const { handle, original_start, original_end, current_value } =
                resize_state;
            const start = handle === "left" ? current_value : original_start;
            const end = handle === "right" ? current_value : original_end;

            // 유효하지 않은 범위면 원래 스타일 반환
            if (end <= start) return null;

            const left = ((start - time_range.start) / total_minutes) * 100;
            const width = ((end - start) / total_minutes) * 100;

            return {
                left: `${left}%`,
                width: `${Math.max(width, 0.5)}%`,
                backgroundColor: color,
                opacity: 0.6,
                border: "2px dashed white",
            };
        },
        [resize_state, time_range, total_minutes]
    );

    // 작업 추가 핸들러
    const handleAddWork = async () => {
        if (!selected_time_range) return;

        try {
            const values = await form.validateFields();
            const start_mins = timeToMinutes(selected_time_range.start);
            const end_mins = timeToMinutes(selected_time_range.end);
            // 점심시간을 제외한 실제 작업 시간
            const duration_minutes = calculateDurationExcludingLunch(
                start_mins,
                end_mins
            );

            const new_session = {
                id: crypto.randomUUID(),
                date: selected_date,
                start_time: selected_time_range.start,
                end_time: selected_time_range.end,
                duration_minutes,
            };

            // 같은 날짜에 같은 work_name, deal_name을 가진 기존 레코드 찾기
            const existing_record = records.find(
                (r) =>
                    r.date === selected_date &&
                    r.work_name === values.work_name &&
                    r.deal_name === (values.deal_name || "")
            );

            if (existing_record) {
                // 기존 레코드에 세션 추가
                const updated_sessions = [
                    ...(existing_record.sessions || []),
                    new_session,
                ];
                const total_minutes = updated_sessions.reduce(
                    (sum, s) => sum + (s.duration_minutes || 0),
                    0
                );

                // 세션들을 시간순 정렬
                const sorted_sessions = [...updated_sessions].sort((a, b) => {
                    return (
                        timeToMinutes(a.start_time) -
                        timeToMinutes(b.start_time)
                    );
                });

                updateRecord(existing_record.id, {
                    sessions: sorted_sessions,
                    duration_minutes: total_minutes,
                    start_time:
                        sorted_sessions[0]?.start_time ||
                        existing_record.start_time,
                    end_time:
                        sorted_sessions[sorted_sessions.length - 1]?.end_time ||
                        existing_record.end_time,
                });

                message.success(
                    `기존 작업에 ${selected_time_range.start} ~ ${selected_time_range.end} 세션이 추가되었습니다.`
                );
            } else {
                // 새 레코드 생성
                const new_record: WorkRecord = {
                    id: crypto.randomUUID(),
                    project_code: values.project_code || "A00_00000",
                    work_name: values.work_name,
                    task_name: values.task_name || "",
                    deal_name: values.deal_name || "",
                    category_name: values.category_name || "",
                    note: values.note || "",
                    duration_minutes,
                    start_time: selected_time_range.start,
                    end_time: selected_time_range.end,
                    date: selected_date,
                    sessions: [new_session],
                    is_completed: false,
                };

                addRecord(new_record);
                message.success(
                    `${selected_time_range.start} ~ ${selected_time_range.end} 작업이 추가되었습니다.`
                );
            }

            form.resetFields();
            setIsModalOpen(false);
            setSelectedTimeRange(null);
        } catch {
            // validation failed
        }
    };

    // 모달 취소
    const handleModalCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
        setSelectedTimeRange(null);
    };

    // 더블클릭으로 수정 모달 열기
    const handleBarDoubleClick = useCallback(
        (record: WorkRecord, e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            // 진행 중인 가상 세션은 수정 불가
            if (record.id === "virtual-running-record") {
                message.info("진행 중인 작업은 수정할 수 없습니다.");
                return;
            }

            setEditRecord(record);
            edit_form.setFieldsValue({
                project_code: record.project_code,
                work_name: record.work_name,
                deal_name: record.deal_name,
                task_name: record.task_name,
                category_name: record.category_name,
                note: record.note,
            });
            setIsEditModalOpen(true);
        },
        [edit_form]
    );

    // 우클릭 메뉴에서 수정 클릭
    const handleContextEdit = useCallback(() => {
        if (!context_menu) return;
        
        const { record } = context_menu;
        if (record.id === "virtual-running-record") {
            message.info("진행 중인 작업은 수정할 수 없습니다.");
            setContextMenu(null);
            return;
        }

        setEditRecord(record);
        edit_form.setFieldsValue({
            project_code: record.project_code,
            work_name: record.work_name,
            deal_name: record.deal_name,
            task_name: record.task_name,
            category_name: record.category_name,
            note: record.note,
        });
        setIsEditModalOpen(true);
        setContextMenu(null);
    }, [context_menu, edit_form]);

    // 우클릭 메뉴에서 세션 삭제
    const handleContextDeleteSession = useCallback(() => {
        if (!context_menu) return;
        
        const { session, record } = context_menu;
        if (session.id === "virtual-running-session") {
            message.info("진행 중인 세션은 삭제할 수 없습니다.");
            setContextMenu(null);
            return;
        }

        deleteSession(record.id, session.id);
        message.success("세션이 삭제되었습니다.");
        setContextMenu(null);
    }, [context_menu, deleteSession]);

    // 수정 저장 핸들러
    const handleEditWork = async () => {
        if (!edit_record) return;

        try {
            const values = await edit_form.validateFields();

            updateRecord(edit_record.id, {
                project_code: values.project_code || "A00_00000",
                work_name: values.work_name,
                deal_name: values.deal_name || "",
                task_name: values.task_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
            });

            message.success("작업이 수정되었습니다.");
            setIsEditModalOpen(false);
            setEditRecord(null);
            edit_form.resetFields();
        } catch {
            // validation failed
        }
    };

    // 수정 모달 취소
    const handleEditModalCancel = () => {
        edit_form.resetFields();
        setIsEditModalOpen(false);
        setEditRecord(null);
    };

    // 사용자 정의 옵션 추가
    const handleAddTaskOption = () => {
        if (new_task_input.trim()) {
            addCustomTaskOption(new_task_input.trim());
            setNewTaskInput("");
        }
    };

    const handleAddCategoryOption = () => {
        if (new_category_input.trim()) {
            addCustomCategoryOption(new_category_input.trim());
            setNewCategoryInput("");
        }
    };

    // 선택 영역 스타일 계산
    const getSelectionStyle = () => {
        if (!drag_selection) return {};

        const left =
            ((drag_selection.start_mins - time_range.start) / total_minutes) *
            100;
        const width =
            ((drag_selection.end_mins - drag_selection.start_mins) /
                total_minutes) *
            100;

        return {
            left: `${left}%`,
            width: `${width}%`,
        };
    };

    return (
        <>
            <Card
                title={`일간 타임라인 (${dayjs(selected_date).format(
                    "YYYY-MM-DD"
                )})`}
                size="small"
                extra={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        💡 빈 영역을 드래그하여 작업 추가
                    </Text>
                }
            >
                {/* 모바일: 수평 스크롤 컨테이너 */}
                <div className={is_mobile ? "gantt-scroll-container" : ""}>
                    <div
                        className={`gantt-wrapper ${
                            is_mobile ? "gantt-mobile-scroll" : ""
                        }`}
                        onMouseMove={(e) => {
                            if (resize_state) {
                                handleResizeMove(e);
                            } else {
                                handleMouseMove(e);
                            }
                        }}
                        onMouseUp={() => {
                            if (resize_state) {
                                handleResizeEnd();
                            } else {
                                handleMouseUp();
                            }
                        }}
                        onMouseLeave={handleMouseLeave}
                        onTouchMove={
                            is_mobile
                                ? (e) => {
                                      // 모바일 터치 드래그 지원
                                      if (
                                          !is_dragging ||
                                          !drag_start_ref.current
                                      )
                                          return;
                                      const touch = e.touches[0];
                                      const grid = grid_ref.current;
                                      if (!grid) return;
                                      const rect = grid.getBoundingClientRect();
                                      const x_ratio =
                                          (touch.clientX - rect.left) /
                                          rect.width;
                                      const current_mins = Math.round(
                                          time_range.start +
                                              x_ratio * total_minutes
                                      );
                                      const {
                                          mins: start_mins,
                                          available_min,
                                          available_max,
                                      } = drag_start_ref.current;
                                      const clamped_mins = Math.max(
                                          available_min,
                                          Math.min(available_max, current_mins)
                                      );
                                      const [sel_start, sel_end] =
                                          start_mins < clamped_mins
                                              ? [start_mins, clamped_mins]
                                              : [clamped_mins, start_mins];
                                      setDragSelection({
                                          start_mins: sel_start,
                                          end_mins: sel_end,
                                      });
                                  }
                                : undefined
                        }
                        onTouchEnd={is_mobile ? handleMouseUp : undefined}
                    >
                        {grouped_works.length === 0 ? (
                            <div
                                className="gantt-empty-container"
                                ref={grid_ref}
                                onMouseDown={handleMouseDown}
                            >
                                {/* 시간 눈금 */}
                                <div className="gantt-time-header-empty">
                                    {time_labels.map((label, idx) => (
                                        <div
                                            key={label}
                                            className="gantt-time-label"
                                            style={{
                                                left: `${
                                                    (idx /
                                                        (time_labels.length -
                                                            1)) *
                                                    100
                                                }%`,
                                            }}
                                        >
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                {/* 그리드 */}
                                <div className="gantt-grid-empty">
                                    {time_labels.map((label, idx) => (
                                        <div
                                            key={label}
                                            className="gantt-grid-line"
                                            style={{
                                                left: `${
                                                    (idx /
                                                        (time_labels.length -
                                                            1)) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    ))}

                                    {/* 점심시간 오버레이 */}
                                    {lunch_overlay_style && (
                                        <Tooltip title="점심시간 (11:40 ~ 12:40)">
                                            <div
                                                className="gantt-lunch-overlay"
                                                style={lunch_overlay_style}
                                            />
                                        </Tooltip>
                                    )}
                                </div>

                                {/* 선택 영역 */}
                                {is_dragging && drag_selection && (
                                    <div
                                        className="gantt-selection"
                                        style={getSelectionStyle()}
                                    >
                                        <Text className="gantt-selection-text">
                                            {minutesToTime(
                                                drag_selection.start_mins
                                            )}{" "}
                                            ~{" "}
                                            {minutesToTime(
                                                drag_selection.end_mins
                                            )}
                                        </Text>
                                    </div>
                                )}

                                <div className="gantt-empty-hint">
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <span>
                                                작업 기록이 없습니다
                                                <br />
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    드래그하여 작업 추가
                                                </Text>
                                            </span>
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="gantt-container">
                                {/* 시간 눈금 */}
                                <div className="gantt-time-header">
                                    {time_labels.map((label, idx) => (
                                        <div
                                            key={label}
                                            className="gantt-time-label"
                                            style={{
                                                left: `${
                                                    (idx /
                                                        (time_labels.length -
                                                            1)) *
                                                    100
                                                }%`,
                                            }}
                                        >
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                {/* 그리드 및 드래그 영역 */}
                                <div
                                    className="gantt-grid"
                                    ref={grid_ref}
                                    onMouseDown={handleMouseDown}
                                >
                                    {time_labels.map((label, idx) => (
                                        <div
                                            key={label}
                                            className="gantt-grid-line"
                                            style={{
                                                left: `${
                                                    (idx /
                                                        (time_labels.length -
                                                            1)) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    ))}

                                    {/* 점심시간 오버레이 */}
                                    {lunch_overlay_style && (
                                        <Tooltip title="점심시간 (11:40 ~ 12:40)">
                                            <div
                                                className="gantt-lunch-overlay"
                                                style={lunch_overlay_style}
                                            />
                                        </Tooltip>
                                    )}

                                    {/* 선택 영역 */}
                                    {is_dragging && drag_selection && (
                                        <div
                                            className="gantt-selection"
                                            style={getSelectionStyle()}
                                        >
                                            <Text className="gantt-selection-text">
                                                {minutesToTime(
                                                    drag_selection.start_mins
                                                )}{" "}
                                                ~{" "}
                                                {minutesToTime(
                                                    drag_selection.end_mins
                                                )}
                                            </Text>
                                        </div>
                                    )}

                                    {/* 작업별 행 */}
                                    <div className="gantt-bars">
                                        {grouped_works.map((group, row_idx) => {
                                            const color = getWorkColor(
                                                group.record
                                            );
                                            return (
                                                <div
                                                    key={group.key}
                                                    className="gantt-row"
                                                    style={{
                                                        top: row_idx * 40,
                                                    }}
                                                >
                                                    {/* 작업명 라벨 */}
                                                    <div
                                                        className="gantt-row-label"
                                                        style={{
                                                            borderLeftColor:
                                                                color,
                                                        }}
                                                    >
                                                        <Text
                                                            ellipsis
                                                            style={{
                                                                fontSize: 11,
                                                                maxWidth: 80,
                                                            }}
                                                        >
                                                            {group.record
                                                                .deal_name ||
                                                                group.record
                                                                    .work_name}
                                                        </Text>
                                                    </div>

                                                    {/* 해당 작업의 모든 세션 바 */}
                                                    <div className="gantt-row-bars">
                                                        {group.sessions.map(
                                                            (session, idx) => {
                                                                const is_context_open = context_menu?.session.id === session.id;
                                                                
                                                                return (
                                                                <Popover
                                                                    key={session.id + idx}
                                                                    open={is_context_open}
                                                                    onOpenChange={(open) => {
                                                                        if (!open) setContextMenu(null);
                                                                    }}
                                                                    trigger="contextMenu"
                                                                    placement="top"
                                                                    content={
                                                                        <div style={{ minWidth: 160 }}>
                                                                            <div style={{ marginBottom: 8 }}>
                                                                                <strong>{group.record.work_name}</strong>
                                                                                {group.record.deal_name && (
                                                                                    <div style={{ color: "#666", fontSize: 12 }}>
                                                                                        {group.record.deal_name}
                                                                                    </div>
                                                                                )}
                                                                                <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                                                                                    {session.start_time} ~ {session.end_time}
                                                                                </div>
                                                                            </div>
                                                                            <Space direction="vertical" style={{ width: "100%" }}>
                                                                                <Button
                                                                                    type="text"
                                                                                    icon={<EditOutlined />}
                                                                                    onClick={handleContextEdit}
                                                                                    style={{ width: "100%", textAlign: "left" }}
                                                                                    disabled={session.id === "virtual-running-session"}
                                                                                >
                                                                                    작업 수정
                                                                                </Button>
                                                                                <Popconfirm
                                                                                    title="세션 삭제"
                                                                                    description={`이 세션(${session.start_time}~${session.end_time})을 삭제하시겠습니까?`}
                                                                                    onConfirm={handleContextDeleteSession}
                                                                                    okText="삭제"
                                                                                    cancelText="취소"
                                                                                    okButtonProps={{ danger: true }}
                                                                                >
                                                                                    <Button
                                                                                        type="text"
                                                                                        danger
                                                                                        icon={<DeleteOutlined />}
                                                                                        style={{ width: "100%", textAlign: "left" }}
                                                                                        disabled={session.id === "virtual-running-session"}
                                                                                    >
                                                                                        세션 삭제
                                                                                    </Button>
                                                                                </Popconfirm>
                                                                            </Space>
                                                                        </div>
                                                                    }
                                                                >
                                                                <Tooltip
                                                                    title={
                                                                        resize_state?.session_id ===
                                                                        session.id || is_context_open ? null : (
                                                                            <div>
                                                                                <div>
                                                                                    <strong>
                                                                                        {
                                                                                            group
                                                                                                .record
                                                                                                .work_name
                                                                                        }
                                                                                    </strong>
                                                                                </div>
                                                                                {group
                                                                                    .record
                                                                                    .deal_name && (
                                                                                    <div>
                                                                                        {
                                                                                            group
                                                                                                .record
                                                                                                .deal_name
                                                                                        }
                                                                                    </div>
                                                                                )}
                                                                                <div>
                                                                                    {
                                                                                        session.start_time
                                                                                    }{" "}
                                                                                    ~{" "}
                                                                                    {
                                                                                        session.end_time
                                                                                    }
                                                                                </div>
                                                                                <div>
                                                                                    {formatMinutes(
                                                                                        getSessionMinutes(
                                                                                            session
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                                <div
                                                                                    style={{
                                                                                        marginTop: 4,
                                                                                    }}
                                                                                >
                                                                                    총{" "}
                                                                                    {
                                                                                        group
                                                                                            .sessions
                                                                                            .length
                                                                                    }
                                                                                    회,{" "}
                                                                                    {formatMinutes(
                                                                                        getTotalDuration(
                                                                                            group.sessions
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                                {session.id !==
                                                                                    "virtual-running-session" && (
                                                                                    <div
                                                                                        style={{
                                                                                            marginTop: 4,
                                                                                            fontSize: 11,
                                                                                            color: "#aaa",
                                                                                        }}
                                                                                    >
                                                                                        💡
                                                                                        모서리
                                                                                        드래그로
                                                                                        시간
                                                                                        조절
                                                                                        <br />
                                                                                        💡
                                                                                        더블클릭으로
                                                                                        작업
                                                                                        수정
                                                                                        <br />
                                                                                        💡
                                                                                        우클릭으로
                                                                                        메뉴
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    }
                                                                >
                                                                    <div
                                                                        className={`gantt-bar ${
                                                                            session.id ===
                                                                            "virtual-running-session"
                                                                                ? "gantt-bar-running"
                                                                                : ""
                                                                        } ${
                                                                            resize_state?.session_id ===
                                                                            session.id
                                                                                ? "gantt-bar-resizing"
                                                                                : ""
                                                                        }`}
                                                                        style={
                                                                            getResizingBarStyle(
                                                                                session,
                                                                                color
                                                                            ) ||
                                                                            getBarStyle(
                                                                                session,
                                                                                color,
                                                                                session.id ===
                                                                                    "virtual-running-session"
                                                                            )
                                                                        }
                                                                        onDoubleClick={(
                                                                            e
                                                                        ) =>
                                                                            handleBarDoubleClick(
                                                                                group.record,
                                                                                e
                                                                            )
                                                                        }
                                                                        onContextMenu={(e) => {
                                                                            e.preventDefault();
                                                                            setContextMenu({
                                                                                session,
                                                                                record: group.record,
                                                                            });
                                                                        }}
                                                                    >
                                                                        {/* 리사이즈 핸들 - 왼쪽(시작 시간): 항상 표시, 오른쪽(종료 시간): 레코딩 중이 아닌 경우에만 */}
                                                                        <div
                                                                            className="resize-handle resize-handle-left"
                                                                            onMouseDown={(
                                                                                e
                                                                            ) =>
                                                                                handleResizeStart(
                                                                                    e,
                                                                                    session,
                                                                                    group.record,
                                                                                    "left"
                                                                                )
                                                                            }
                                                                        />
                                                                        {session.id !==
                                                                            "virtual-running-session" && (
                                                                            <div
                                                                                className="resize-handle resize-handle-right"
                                                                                onMouseDown={(
                                                                                    e
                                                                                ) =>
                                                                                    handleResizeStart(
                                                                                        e,
                                                                                        session,
                                                                                        group.record,
                                                                                        "right"
                                                                                    )
                                                                                }
                                                                            />
                                                                        )}
                                                                        {/* 리사이즈 중일 때 시간 표시 */}
                                                                        {resize_state?.session_id ===
                                                                            session.id && (
                                                                            <div className="resize-time-indicator">
                                                                                {minutesToTime(
                                                                                    resize_state.handle ===
                                                                                        "left"
                                                                                        ? resize_state.current_value
                                                                                        : resize_state.original_start
                                                                                )}
                                                                                {
                                                                                    " ~ "
                                                                                }
                                                                                {minutesToTime(
                                                                                    resize_state.handle ===
                                                                                        "right"
                                                                                        ? resize_state.current_value
                                                                                        : resize_state.original_end
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </Tooltip>
                                                                </Popover>
                                                            );
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style>{`
                    .gantt-wrapper {
                        user-select: none;
                    }
                    
                    .gantt-container {
                        position: relative;
                        min-height: ${Math.max(
                            grouped_works.length * 40 + 40,
                            100
                        )}px;
                        padding-top: 30px;
                        padding-left: 90px;
                    }
                    
                    .gantt-empty-container {
                        position: relative;
                        min-height: 150px;
                        cursor: crosshair;
                    }
                    
                    .gantt-time-header {
                        position: absolute;
                        top: 0;
                        left: 90px;
                        right: 0;
                        height: 24px;
                    }
                    
                    .gantt-time-header-empty {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 24px;
                    }
                    
                    .gantt-time-label {
                        position: absolute;
                        transform: translateX(-50%);
                        font-size: 11px;
                        color: #8c8c8c;
                    }
                    
                    .gantt-grid {
                        position: absolute;
                        top: 24px;
                        left: 90px;
                        right: 0;
                        bottom: 0;
                        cursor: crosshair;
                    }
                    
                    .gantt-grid-empty {
                        position: absolute;
                        top: 24px;
                        left: 0;
                        right: 0;
                        bottom: 0;
                    }
                    
                    .gantt-grid-line {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 1px;
                        background: #f0f0f0;
                    }
                    
                    .gantt-selection {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        background: rgba(24, 144, 255, 0.2);
                        border: 2px dashed #1890ff;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 100;
                        pointer-events: none;
                        transition: background 0.15s, border-color 0.15s;
                    }
                    
                    .gantt-selection-text {
                        background: #1890ff;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        white-space: nowrap;
                    }
                    
                    .gantt-lunch-overlay {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        background: repeating-linear-gradient(
                            45deg,
                            rgba(0, 0, 0, 0.03),
                            rgba(0, 0, 0, 0.03) 10px,
                            rgba(0, 0, 0, 0.06) 10px,
                            rgba(0, 0, 0, 0.06) 20px
                        );
                        border-left: 2px dashed #d9d9d9;
                        border-right: 2px dashed #d9d9d9;
                        z-index: 1;
                        cursor: not-allowed;
                    }
                    
                    .gantt-lunch-overlay::before {
                        content: '🍽️';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 20px;
                        opacity: 0.5;
                    }
                    
                    .gantt-empty-hint {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        pointer-events: none;
                    }
                    
                    .gantt-bars {
                        position: relative;
                        min-height: ${Math.max(
                            grouped_works.length * 40,
                            60
                        )}px;
                    }
                    
                    .gantt-row {
                        position: absolute;
                        left: -90px;
                        right: 0;
                        height: 32px;
                        display: flex;
                        align-items: center;
                    }
                    
                    .gantt-row-label {
                        width: 85px;
                        flex-shrink: 0;
                        padding: 4px 8px;
                        background: #fafafa;
                        border-left: 3px solid #1890ff;
                        border-radius: 0 4px 4px 0;
                        margin-right: 5px;
                        overflow: hidden;
                        pointer-events: none;
                    }
                    
                    .gantt-row-bars {
                        flex: 1;
                        position: relative;
                        height: 100%;
                        pointer-events: none;
                    }
                    
                    .gantt-bar {
                        position: absolute;
                        height: 20px;
                        top: 6px;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: opacity 0.2s, transform 0.1s;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                        pointer-events: auto;
                    }
                    
                    .gantt-bar-running {
                        animation: pulse 2s ease-in-out infinite;
                        box-shadow: 0 0 8px rgba(24, 144, 255, 0.6);
                    }
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 0.7; }
                        50% { opacity: 1; }
                    }
                    
                    .gantt-bar:hover {
                        opacity: 0.85;
                        transform: scaleY(1.2);
                        z-index: 10;
                    }
                    
                    .gantt-bar-resizing {
                        z-index: 20;
                        transform: scaleY(1.3);
                    }
                    
                    .gantt-bar-zero {
                        animation: zeroPulse 1.5s ease-in-out infinite;
                    }
                    
                    @keyframes zeroPulse {
                        0%, 100% { opacity: 0.6; box-shadow: 0 0 4px #ff4d4f; }
                        50% { opacity: 1; box-shadow: 0 0 8px #ff4d4f; }
                    }
                    
                    /* 리사이즈 핸들 */
                    .resize-handle {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 10px;
                        cursor: ew-resize;
                        z-index: 10;
                        opacity: 0;
                        transition: opacity 0.15s, background 0.15s;
                    }
                    
                    .resize-handle-left {
                        left: -2px;
                        border-radius: 4px 0 0 4px;
                    }
                    
                    .resize-handle-right {
                        right: -2px;
                        border-radius: 0 4px 4px 0;
                    }
                    
                    .gantt-bar:hover .resize-handle {
                        opacity: 1;
                        background: rgba(255, 255, 255, 0.3);
                    }
                    
                    .resize-handle:hover {
                        background: rgba(255, 255, 255, 0.6) !important;
                    }
                    
                    /* 리사이즈 중 시간 표시 */
                    .resize-time-indicator {
                        position: absolute;
                        top: -24px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        white-space: nowrap;
                        z-index: 100;
                        pointer-events: none;
                    }
                `}</style>
            </Card>

            {/* 작업 추가 모달 */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined />
                        <span>작업 추가</span>
                        {selected_time_range && (
                            <Text
                                type="secondary"
                                style={{ fontWeight: "normal" }}
                            >
                                ({selected_time_range.start} ~{" "}
                                {selected_time_range.end})
                            </Text>
                        )}
                    </Space>
                }
                open={is_modal_open}
                onCancel={handleModalCancel}
                footer={[
                    <Button key="ok" type="primary" onClick={handleAddWork}>
                        추가 ({formatShortcutKeyForPlatform(modal_submit_keys)})
                    </Button>,
                    <Button key="cancel" onClick={handleModalCancel}>
                        취소
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onKeyDown={(e) => {
                        if (matchShortcutKey(e, modal_submit_keys)) {
                            e.preventDefault();
                            handleAddWork();
                        }
                    }}
                >
                    <Form.Item name="project_code" label="프로젝트 코드">
                        <AutoComplete
                            options={project_code_options}
                            placeholder="예: A25_01846 (미입력 시 A00_00000)"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onSelect={(value: string) =>
                                handleProjectCodeSelect(value)
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="work_name"
                        label="작업명"
                        rules={[
                            { required: true, message: "작업명을 입력하세요" },
                        ]}
                    >
                        <AutoComplete
                            options={work_name_options}
                            placeholder="예: 5.6 프레임워크 FE"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item name="deal_name" label="거래명 (상세 작업)">
                        <AutoComplete
                            options={deal_name_options}
                            placeholder="예: 5.6 테스트 케이스 확인 및 이슈 처리"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Space style={{ width: "100%" }} size="middle">
                        <Form.Item
                            name="task_name"
                            label="업무명"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="업무 선택"
                                options={task_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                optionRender={(option) => (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span>{option.label}</span>
                                        <CloseOutlined
                                            style={{
                                                fontSize: 10,
                                                color: "#999",
                                                cursor: "pointer",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideAutoCompleteOption(
                                                    "task_option",
                                                    option.value as string
                                                );
                                            }}
                                        />
                                    </div>
                                )}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{
                                                padding: "0 8px 4px",
                                                width: "100%",
                                            }}
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(
                                                    () =>
                                                        new_task_input_ref.current?.focus(),
                                                    0
                                                );
                                            }}
                                        >
                                            <Input
                                                ref={new_task_input_ref}
                                                placeholder="새 업무명"
                                                value={new_task_input}
                                                onChange={(e) =>
                                                    setNewTaskInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setTimeout(
                                                        () =>
                                                            new_task_input_ref.current?.focus(),
                                                        0
                                                    );
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    new_task_input_ref.current?.focus();
                                                }}
                                                onFocus={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={handleAddTaskOption}
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                            >
                                                추가
                                            </Button>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                        <Form.Item
                            name="category_name"
                            label="카테고리"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="카테고리"
                                options={category_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                optionRender={(option) => (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span>{option.label}</span>
                                        <CloseOutlined
                                            style={{
                                                fontSize: 10,
                                                color: "#999",
                                                cursor: "pointer",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                hideAutoCompleteOption(
                                                    "category_option",
                                                    option.value as string
                                                );
                                            }}
                                        />
                                    </div>
                                )}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{
                                                padding: "0 8px 4px",
                                                width: "100%",
                                            }}
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimeout(
                                                    () =>
                                                        new_category_input_ref.current?.focus(),
                                                    0
                                                );
                                            }}
                                        >
                                            <Input
                                                ref={new_category_input_ref}
                                                placeholder="새 카테고리"
                                                value={new_category_input}
                                                onChange={(e) =>
                                                    setNewCategoryInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setTimeout(
                                                        () =>
                                                            new_category_input_ref.current?.focus(),
                                                        0
                                                    );
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    new_category_input_ref.current?.focus();
                                                }}
                                                onFocus={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={
                                                    handleAddCategoryOption
                                                }
                                                onMouseDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                size="small"
                                            >
                                                추가
                                            </Button>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item name="note" label="비고">
                        <Input.TextArea placeholder="추가 메모" rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 작업 수정 모달 */}
            <Modal
                title={
                    <Space>
                        <span>작업 수정</span>
                        {edit_record && (
                            <Text
                                type="secondary"
                                style={{ fontWeight: "normal" }}
                            >
                                (
                                {edit_record.deal_name || edit_record.work_name}
                                )
                            </Text>
                        )}
                    </Space>
                }
                open={is_edit_modal_open}
                onCancel={handleEditModalCancel}
                footer={[
                    <Button key="ok" type="primary" onClick={handleEditWork}>
                        저장 ({formatShortcutKeyForPlatform(modal_submit_keys)})
                    </Button>,
                    <Button key="cancel" onClick={handleEditModalCancel}>
                        취소
                    </Button>,
                ]}
            >
                <Form
                    form={edit_form}
                    layout="vertical"
                    onKeyDown={(e) => {
                        if (matchShortcutKey(e, modal_submit_keys)) {
                            e.preventDefault();
                            handleEditWork();
                        }
                    }}
                >
                    <Form.Item name="project_code" label="프로젝트 코드">
                        <AutoComplete
                            options={project_code_options}
                            placeholder="예: A25_01846 (미입력 시 A00_00000)"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onSelect={(value: string) => {
                                const selected = raw_project_code_options.find(
                                    (opt) => opt.value === value
                                );
                                if (selected?.work_name) {
                                    edit_form.setFieldsValue({
                                        work_name: selected.work_name,
                                    });
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="work_name"
                        label="작업명"
                        rules={[
                            { required: true, message: "작업명을 입력하세요" },
                        ]}
                    >
                        <AutoComplete
                            options={work_name_options}
                            placeholder="예: 5.6 프레임워크 FE"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item name="deal_name" label="거래명 (상세 작업)">
                        <AutoComplete
                            options={deal_name_options}
                            placeholder="예: 5.6 테스트 케이스 확인 및 이슈 처리"
                            filterOption={(input, option) =>
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Space style={{ width: "100%" }} size="middle">
                        <Form.Item
                            name="task_name"
                            label="업무명"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="업무 선택"
                                options={task_options}
                                allowClear
                                popupMatchSelectWidth={240}
                            />
                        </Form.Item>
                        <Form.Item
                            name="category_name"
                            label="카테고리"
                            style={{ flex: 1 }}
                        >
                            <Select
                                placeholder="카테고리"
                                options={category_options}
                                allowClear
                                popupMatchSelectWidth={240}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item name="note" label="비고">
                        <Input.TextArea placeholder="추가 메모" rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
