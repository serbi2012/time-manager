import { useMemo, useState, useRef, useCallback } from "react";
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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useWorkStore,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "../store/useWorkStore";
import type { WorkRecord, WorkSession } from "../types";

const { Text } = Typography;

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
    // 기존 데이터는 duration_seconds 필드가 있을 수 있음
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
    key: string; // work_name + deal_name
    record: WorkRecord;
    sessions: WorkSession[];
    first_start: number; // 정렬용 (첫 세션 시작 시간)
}

// 드래그 선택 영역 타입
interface DragSelection {
    start_mins: number;
    end_mins: number;
    start_x: number;
    end_x: number;
}

export default function DailyGanttChart() {
    const {
        records,
        selected_date,
        templates,
        addRecord,
        getAutoCompleteOptions,
        custom_task_options,
        custom_category_options,
        addCustomTaskOption,
        addCustomCategoryOption,
    } = useWorkStore();

    // 드래그 상태
    const [is_dragging, setIsDragging] = useState(false);
    const [drag_selection, setDragSelection] = useState<DragSelection | null>(null);
    const drag_start_ref = useRef<{ x: number; mins: number } | null>(null);
    const grid_ref = useRef<HTMLDivElement>(null);

    // 모달 상태
    const [is_modal_open, setIsModalOpen] = useState(false);
    const [selected_time_range, setSelectedTimeRange] = useState<{ start: string; end: string } | null>(null);
    const [form] = Form.useForm();

    // 사용자 정의 옵션 입력
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");

    // 거래명 기준으로 세션을 그룹화 (같은 거래명은 같은 행)
    const grouped_works = useMemo(() => {
        const groups: Map<string, GroupedWork> = new Map();

        records
            .filter((r) => r.date === selected_date)
            .forEach((record) => {
                // 거래명 기준으로 그룹화 (거래명이 없으면 작업명 사용)
                const key = record.deal_name || record.work_name;
                const sessions =
                    record.sessions && record.sessions.length > 0
                        ? record.sessions
                        : [
                              {
                                  id: record.id,
                                  date: record.date,
                                  start_time: record.start_time,
                                  end_time: record.end_time,
                                  duration_minutes: record.duration_minutes,
                              },
                          ];

                if (groups.has(key)) {
                    // 기존 그룹에 세션 추가
                    const group = groups.get(key)!;
                    group.sessions.push(...sessions);
                } else {
                    // 새 그룹 생성
                    groups.set(key, {
                        key,
                        record,
                        sessions: [...sessions],
                        first_start: timeToMinutes(sessions[0].start_time),
                    });
                }
            });

        // 첫 세션 시작 시간순 정렬
        return Array.from(groups.values()).sort(
            (a, b) => a.first_start - b.first_start
        );
    }, [records, selected_date]);

    // 모든 세션에서 시간 범위 계산 (기본 9시-18시)
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

    // 자동완성 옵션
    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({ value: v }));
    }, [records, templates, getAutoCompleteOptions]);

    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({ value: v }));
    }, [records, templates, getAutoCompleteOptions]);

    const task_options = useMemo(() => {
        const all = [...DEFAULT_TASK_OPTIONS, ...custom_task_options];
        return [...new Set(all)].map((v) => ({ value: v, label: v }));
    }, [custom_task_options]);

    const category_options = useMemo(() => {
        const all = [...DEFAULT_CATEGORY_OPTIONS, ...custom_category_options];
        return [...new Set(all)].map((v) => ({ value: v, label: v }));
    }, [custom_category_options]);

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
    const getBarStyle = (session: WorkSession, color: string) => {
        const start = timeToMinutes(session.start_time);
        const end = timeToMinutes(session.end_time);

        const left = ((start - time_range.start) / total_minutes) * 100;
        const width = ((end - start) / total_minutes) * 100;

        return {
            left: `${left}%`,
            width: `${Math.max(width, 0.5)}%`,
            backgroundColor: color,
        };
    };

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
    const xToMinutes = useCallback((x: number): number => {
        if (!grid_ref.current) return 0;
        const rect = grid_ref.current.getBoundingClientRect();
        const relative_x = x - rect.left;
        const percentage = relative_x / rect.width;
        const mins = time_range.start + percentage * total_minutes;
        // 5분 단위로 스냅
        return Math.round(mins / 5) * 5;
    }, [time_range, total_minutes]);

    // 드래그 시작
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!grid_ref.current) return;
        
        const mins = xToMinutes(e.clientX);
        drag_start_ref.current = { x: e.clientX, mins };
        setIsDragging(true);
        setDragSelection({
            start_mins: mins,
            end_mins: mins,
            start_x: e.clientX,
            end_x: e.clientX,
        });
    }, [xToMinutes]);

    // 드래그 중
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!is_dragging || !drag_start_ref.current) return;

        const current_mins = xToMinutes(e.clientX);
        const start_mins = drag_start_ref.current.mins;

        setDragSelection({
            start_mins: Math.min(start_mins, current_mins),
            end_mins: Math.max(start_mins, current_mins),
            start_x: Math.min(drag_start_ref.current.x, e.clientX),
            end_x: Math.max(drag_start_ref.current.x, e.clientX),
        });
    }, [is_dragging, xToMinutes]);

    // 드래그 종료
    const handleMouseUp = useCallback(() => {
        if (!is_dragging || !drag_selection) {
            setIsDragging(false);
            setDragSelection(null);
            return;
        }

        const duration = drag_selection.end_mins - drag_selection.start_mins;
        
        // 최소 5분 이상 선택해야 함
        if (duration >= 5) {
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
            handleMouseUp();
        }
    }, [is_dragging, handleMouseUp]);

    // 작업 추가 핸들러
    const handleAddWork = async () => {
        if (!selected_time_range) return;

        try {
            const values = await form.validateFields();
            const start_mins = timeToMinutes(selected_time_range.start);
            const end_mins = timeToMinutes(selected_time_range.end);
            const duration_minutes = end_mins - start_mins;

            const new_record: WorkRecord = {
                id: crypto.randomUUID(),
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
                duration_minutes,
                start_time: selected_time_range.start,
                end_time: selected_time_range.end,
                date: selected_date,
                sessions: [
                    {
                        id: crypto.randomUUID(),
                        date: selected_date,
                        start_time: selected_time_range.start,
                        end_time: selected_time_range.end,
                        duration_minutes,
                    },
                ],
                is_completed: false,
            };

            addRecord(new_record);
            message.success(`${selected_time_range.start} ~ ${selected_time_range.end} 작업이 추가되었습니다.`);
            
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
        if (!drag_selection || !grid_ref.current) return {};
        
        const left = ((drag_selection.start_mins - time_range.start) / total_minutes) * 100;
        const width = ((drag_selection.end_mins - drag_selection.start_mins) / total_minutes) * 100;

        return {
            left: `${left}%`,
            width: `${width}%`,
        };
    };

    return (
        <>
            <Card
                title={`일간 타임라인 (${dayjs(selected_date).format("YYYY-MM-DD")})`}
                size="small"
                extra={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        💡 빈 영역을 드래그하여 작업 추가
                    </Text>
                }
            >
                {grouped_works.length === 0 ? (
                    <div 
                        className="gantt-empty-container"
                        ref={grid_ref}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* 시간 눈금 */}
                        <div className="gantt-time-header-empty">
                            {time_labels.map((label, idx) => (
                                <div
                                    key={label}
                                    className="gantt-time-label"
                                    style={{
                                        left: `${(idx / (time_labels.length - 1)) * 100}%`,
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
                                        left: `${(idx / (time_labels.length - 1)) * 100}%`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* 선택 영역 */}
                        {is_dragging && drag_selection && (
                            <div 
                                className="gantt-selection"
                                style={getSelectionStyle()}
                            >
                                <Text className="gantt-selection-text">
                                    {minutesToTime(drag_selection.start_mins)} ~ {minutesToTime(drag_selection.end_mins)}
                                </Text>
                            </div>
                        )}

                        <div className="gantt-empty-hint">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span>
                                        작업 기록이 없습니다<br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            드래그하여 작업 추가
                                        </Text>
                                    </span>
                                }
                            />
                        </div>
                    </div>
                ) : (
                    <div 
                        className="gantt-container"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* 시간 눈금 */}
                        <div className="gantt-time-header">
                            {time_labels.map((label, idx) => (
                                <div
                                    key={label}
                                    className="gantt-time-label"
                                    style={{
                                        left: `${(idx / (time_labels.length - 1)) * 100}%`,
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
                                        left: `${(idx / (time_labels.length - 1)) * 100}%`,
                                    }}
                                />
                            ))}

                            {/* 선택 영역 */}
                            {is_dragging && drag_selection && (
                                <div 
                                    className="gantt-selection"
                                    style={getSelectionStyle()}
                                >
                                    <Text className="gantt-selection-text">
                                        {minutesToTime(drag_selection.start_mins)} ~ {minutesToTime(drag_selection.end_mins)}
                                    </Text>
                                </div>
                            )}
                        </div>

                        {/* 작업별 행 (같은 작업은 같은 행) */}
                        <div className="gantt-bars">
                            {grouped_works.map((group, row_idx) => {
                                const color = getWorkColor(group.record);
                                return (
                                    <div
                                        key={group.key}
                                        className="gantt-row"
                                        style={{ top: row_idx * 40 }}
                                    >
                                        {/* 작업명 라벨 */}
                                        <div
                                            className="gantt-row-label"
                                            style={{ borderLeftColor: color }}
                                        >
                                            <Text
                                                ellipsis
                                                style={{ fontSize: 11, maxWidth: 80 }}
                                            >
                                                {group.record.deal_name || group.record.work_name}
                                            </Text>
                                        </div>

                                        {/* 해당 작업의 모든 세션 바 */}
                                        <div className="gantt-row-bars">
                                            {group.sessions.map((session, idx) => (
                                                <Tooltip
                                                    key={session.id + idx}
                                                    title={
                                                        <div>
                                                            <div>
                                                                <strong>
                                                                    {group.record.work_name}
                                                                </strong>
                                                            </div>
                                                            {group.record.deal_name && (
                                                                <div>
                                                                    {group.record.deal_name}
                                                                </div>
                                                            )}
                                                            <div>
                                                                {session.start_time} ~{" "}
                                                                {session.end_time}
                                                            </div>
                                                            <div>
                                                                {formatMinutes(
                                                                    getSessionMinutes(session)
                                                                )}
                                                            </div>
                                                            <div style={{ marginTop: 4 }}>
                                                                총 {group.sessions.length}회,{" "}
                                                                {formatMinutes(
                                                                    getTotalDuration(
                                                                        group.sessions
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <div
                                                        className="gantt-bar"
                                                        style={getBarStyle(session, color)}
                                                    />
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <style>{`
                    .gantt-container {
                        position: relative;
                        min-height: ${Math.max(grouped_works.length * 40 + 40, 100)}px;
                        padding-top: 30px;
                        padding-left: 90px;
                    }
                    
                    .gantt-empty-container {
                        position: relative;
                        min-height: 150px;
                        cursor: crosshair;
                        user-select: none;
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
                        user-select: none;
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
                    }
                    
                    .gantt-selection-text {
                        background: #1890ff;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        white-space: nowrap;
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
                        min-height: ${Math.max(grouped_works.length * 40, 60)}px;
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
                    }
                    
                    .gantt-row-bars {
                        flex: 1;
                        position: relative;
                        height: 100%;
                    }
                    
                    .gantt-bar {
                        position: absolute;
                        height: 20px;
                        top: 6px;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: opacity 0.2s, transform 0.1s;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    }
                    
                    .gantt-bar:hover {
                        opacity: 0.85;
                        transform: scaleY(1.2);
                        z-index: 10;
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
                            <Text type="secondary" style={{ fontWeight: 'normal' }}>
                                ({selected_time_range.start} ~ {selected_time_range.end})
                            </Text>
                        )}
                    </Space>
                }
                open={is_modal_open}
                onOk={handleAddWork}
                onCancel={handleModalCancel}
                okText="추가"
                cancelText="취소"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="work_name"
                        label="작업명"
                        rules={[{ required: true, message: "작업명을 입력하세요" }]}
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
                        <Form.Item name="task_name" label="업무명" style={{ flex: 1 }}>
                            <Select
                                placeholder="업무 선택"
                                options={task_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space style={{ padding: "0 8px 4px", width: "100%" }}>
                                            <Input
                                                placeholder="새 업무명"
                                                value={new_task_input}
                                                onChange={(e) => setNewTaskInput(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                size="small"
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={handleAddTaskOption}
                                                size="small"
                                            >
                                                추가
                                            </Button>
                                        </Space>
                                    </>
                                )}
                            />
                        </Form.Item>
                        <Form.Item name="category_name" label="카테고리" style={{ flex: 1 }}>
                            <Select
                                placeholder="카테고리"
                                options={category_options}
                                allowClear
                                popupMatchSelectWidth={240}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space style={{ padding: "0 8px 4px", width: "100%" }}>
                                            <Input
                                                placeholder="새 카테고리"
                                                value={new_category_input}
                                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                size="small"
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={handleAddCategoryOption}
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
        </>
    );
}
