import { useState, useMemo, useEffect } from "react";
import {
    Table,
    Card,
    DatePicker,
    Button,
    Popconfirm,
    Space,
    Typography,
    Tag,
    Statistic,
    Row,
    Col,
    Timeline,
    Modal,
    Form,
    Input,
    Select,
    Tooltip,
    AutoComplete,
    Divider,
} from "antd";
import {
    DeleteOutlined,
    CopyOutlined,
    ClockCircleOutlined,
    HistoryOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
    useWorkStore,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "../store/useWorkStore";
import type { WorkRecord, WorkSession } from "../types";

const { Text } = Typography;

// 초를 읽기 쉬운 형식으로 변환
const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds}초`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) {
        return `${mins}분`;
    }
    return `${mins}분 ${secs}초`;
};

// 타이머 표시 형식 (HH:MM:SS)
const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 세션의 duration을 초 단위로 가져오기 (기존 데이터 호환)
const getSessionDurationSeconds = (session: WorkSession): number => {
    if (
        session.duration_seconds !== undefined &&
        !isNaN(session.duration_seconds)
    ) {
        return session.duration_seconds;
    }
    const legacy = session as unknown as { duration_minutes?: number };
    if (
        legacy.duration_minutes !== undefined &&
        !isNaN(legacy.duration_minutes)
    ) {
        return legacy.duration_minutes * 60;
    }
    return 0;
};

// 레코드의 duration_minutes 가져오기 (NaN 처리)
const getRecordDurationMinutes = (record: WorkRecord): number => {
    if (
        record.duration_minutes !== undefined &&
        !isNaN(record.duration_minutes) &&
        record.duration_minutes > 0
    ) {
        return record.duration_minutes;
    }
    if (record.sessions && record.sessions.length > 0) {
        const total_seconds = record.sessions.reduce(
            (sum, s) => sum + getSessionDurationSeconds(s),
            0
        );
        if (total_seconds > 0) {
            return Math.max(1, Math.ceil(total_seconds / 60));
        }
    }
    if (record.start_time && record.end_time) {
        const start = dayjs(`2000-01-01 ${record.start_time}`);
        const end = dayjs(`2000-01-01 ${record.end_time}`);
        const diff_seconds = end.diff(start, "second");
        if (diff_seconds > 0) {
            return Math.max(1, Math.ceil(diff_seconds / 60));
        }
    }
    return 0;
};

export default function WorkRecordTable() {
    const {
        records,
        selected_date,
        setSelectedDate,
        deleteRecord,
        timer,
        form_data,
        startTimer,
        stopTimer,
        switchTemplate,
        setFormData,
        updateElapsedTime,
        templates,
        getAutoCompleteOptions,
        custom_task_options,
        custom_category_options,
        addCustomTaskOption,
        addCustomCategoryOption,
    } = useWorkStore();

    const [is_modal_open, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [new_task_input, setNewTaskInput] = useState("");
    const [new_category_input, setNewCategoryInput] = useState("");

    // 작업명/거래명 자동완성 옵션 (records, templates 변경 시 갱신)
    const work_name_options = useMemo(() => {
        return getAutoCompleteOptions("work_name").map((v) => ({ value: v }));
    }, [records, templates, getAutoCompleteOptions]);

    const deal_name_options = useMemo(() => {
        return getAutoCompleteOptions("deal_name").map((v) => ({ value: v }));
    }, [records, templates, getAutoCompleteOptions]);

    // 업무명/카테고리명 옵션 (기본 + 사용자 정의)
    const task_options = useMemo(() => {
        const all = [...DEFAULT_TASK_OPTIONS, ...custom_task_options];
        return [...new Set(all)].map((v) => ({ value: v, label: v }));
    }, [custom_task_options]);

    const category_options = useMemo(() => {
        const all = [...DEFAULT_CATEGORY_OPTIONS, ...custom_category_options];
        return [...new Set(all)].map((v) => ({ value: v, label: v }));
    }, [custom_category_options]);

    // 업무명/카테고리명 추가 핸들러
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

    // 타이머 업데이트
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer.is_running) {
            interval = setInterval(() => {
                updateElapsedTime();
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer.is_running, updateElapsedTime]);

    // 오늘 날짜인지 확인
    const is_today = selected_date === dayjs().format("YYYY-MM-DD");

    // 선택된 날짜의 레코드 필터링 + 진행 중인 작업 포함
    const filtered_records = useMemo(() => {
        const saved_records = records.filter((r) => r.date === selected_date);

        // 진행 중인 작업이 있고, 오늘 날짜인 경우
        if (timer.is_running && is_today && form_data.work_name) {
            // 이미 저장된 레코드에 같은 작업이 있는지 확인
            const existing = saved_records.find(
                (r) =>
                    r.work_name === form_data.work_name &&
                    r.deal_name === form_data.deal_name
            );

            // 없으면 진행 중인 작업을 가상 레코드로 추가
            if (!existing) {
                const virtual_record: WorkRecord = {
                    id: "__active__",
                    work_name: form_data.work_name,
                    task_name: form_data.task_name,
                    deal_name: form_data.deal_name,
                    category_name: form_data.category_name,
                    note: form_data.note,
                    duration_minutes: 0,
                    start_time: timer.start_time
                        ? dayjs(timer.start_time).format("HH:mm:ss")
                        : "",
                    end_time: "",
                    date: selected_date,
                    sessions: [],
                };
                return [virtual_record, ...saved_records];
            }
        }

        return saved_records;
    }, [
        records,
        selected_date,
        timer.is_running,
        timer.start_time,
        is_today,
        form_data,
    ]);

    // 총 시간 계산 (가상 레코드 제외)
    const total_minutes = useMemo(() => {
        return filtered_records
            .filter((r) => r.id !== "__active__")
            .reduce((sum, r) => sum + getRecordDurationMinutes(r), 0);
    }, [filtered_records]);

    // 현재 작업 중인 레코드 찾기
    const getActiveRecordId = () => {
        if (!timer.is_running) return null;
        // 가상 레코드인 경우
        if (filtered_records.some((r) => r.id === "__active__")) {
            return "__active__";
        }
        // form_data와 매칭되는 레코드 찾기
        const matching = filtered_records.find(
            (r) =>
                r.work_name === form_data.work_name &&
                r.deal_name === form_data.deal_name
        );
        return matching?.id || null;
    };

    // 클립보드 복사 (표 형식)
    const handleCopyToClipboard = () => {
        const header = "작업명\t업무명\t거래명\t카테고리명\t시간(분)\t비고";
        const rows = filtered_records.map(
            (r) =>
                `${r.work_name}\t${r.task_name}\t${r.deal_name}\t${
                    r.category_name
                }\t${getRecordDurationMinutes(r)}\t${r.note}`
        );
        const text = [header, ...rows].join("\n");
        navigator.clipboard.writeText(text);
    };

    // 작업 시작/중지 토글
    const handleToggleRecord = (record: WorkRecord) => {
        const is_active = getActiveRecordId() === record.id;

        if (is_active) {
            // 현재 작업 중지
            stopTimer();
        } else if (timer.is_running) {
            // 다른 작업으로 전환
            // 매칭되는 템플릿 찾기
            const template = templates.find(
                (t) =>
                    t.work_name === record.work_name &&
                    t.deal_name === record.deal_name
            );
            if (template) {
                switchTemplate(template.id);
            } else {
                // 템플릿 없으면 직접 form_data 설정 후 전환
                stopTimer();
                setFormData({
                    work_name: record.work_name,
                    task_name: record.task_name,
                    deal_name: record.deal_name,
                    category_name: record.category_name,
                    note: record.note,
                });
                startTimer();
            }
        } else {
            // 새로 시작
            setFormData({
                work_name: record.work_name,
                task_name: record.task_name,
                deal_name: record.deal_name,
                category_name: record.category_name,
                note: record.note,
            });
            startTimer();
        }
    };

    // 새 작업 추가
    const handleAddNewWork = async () => {
        try {
            const values = await form.validateFields();
            setFormData({
                work_name: values.work_name,
                task_name: values.task_name || "",
                deal_name: values.deal_name || "",
                category_name: values.category_name || "",
                note: values.note || "",
            });

            // 기존 타이머 중지 후 새 타이머 시작
            if (timer.is_running) {
                stopTimer();
            }
            startTimer();

            form.resetFields();
            setIsModalOpen(false);
        } catch {
            // validation failed
        }
    };

    // 확장 행 렌더링 (세션 이력)
    const expandedRowRender = (record: WorkRecord) => {
        const sessions: WorkSession[] =
            record.sessions && record.sessions.length > 0
                ? record.sessions
                : [
                      {
                          id: record.id,
                          start_time: record.start_time,
                          end_time: record.end_time,
                          duration_seconds: record.duration_minutes * 60,
                      },
                  ];

        if (sessions.length === 0) {
            return (
                <div style={{ padding: "16px", color: "#999" }}>
                    세션 이력이 없습니다.
                </div>
            );
        }

        return (
            <div className="session-history">
                <div className="session-header">
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    <Text strong>작업 이력</Text>
                    <Text
                        type="secondary"
                        style={{ marginLeft: 8, fontSize: 12 }}
                    >
                        (총 {sessions.length}회 작업)
                    </Text>
                </div>

                <Timeline
                    mode="left"
                    style={{ marginTop: 16, marginLeft: 8 }}
                    items={sessions.map(
                        (session: WorkSession, index: number) => ({
                            color:
                                index === sessions.length - 1 ? "blue" : "gray",
                            label: (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    #{index + 1}
                                </Text>
                            ),
                            children: (
                                <div className="session-item">
                                    <Space>
                                        <ClockCircleOutlined
                                            style={{ color: "#1890ff" }}
                                        />
                                        <Text>
                                            {session.start_time} ~{" "}
                                            {session.end_time}
                                        </Text>
                                        <Tag color="blue">
                                            {formatDuration(
                                                getSessionDurationSeconds(
                                                    session
                                                )
                                            )}
                                        </Tag>
                                    </Space>
                                </div>
                            ),
                        })
                    )}
                />

                <div className="session-summary">
                    <Space split={<span style={{ color: "#d9d9d9" }}>|</span>}>
                        <Text type="secondary">
                            첫 시작: {record.start_time}
                        </Text>
                        <Text type="secondary">
                            마지막 종료: {record.end_time}
                        </Text>
                        <Text strong style={{ color: "#1890ff" }}>
                            총{" "}
                            {formatDuration(
                                sessions.reduce(
                                    (sum, s) =>
                                        sum + getSessionDurationSeconds(s),
                                    0
                                )
                            )}
                        </Text>
                    </Space>
                </div>

                <style>{`
                    .session-history { padding: 16px 24px; background: #fafafa; border-radius: 8px; }
                    .session-header { display: flex; align-items: center; margin-bottom: 8px; }
                    .session-item { padding: 4px 0; }
                    .session-summary { margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e8e8e8; }
                `}</style>
            </div>
        );
    };

    const columns: ColumnsType<WorkRecord> = [
        {
            title: "",
            key: "timer_action",
            width: 50,
            align: "center",
            render: (_, record: WorkRecord) => {
                const is_active = getActiveRecordId() === record.id;
                return (
                    <Tooltip
                        title={
                            is_active
                                ? "정지"
                                : timer.is_running
                                ? "전환"
                                : "시작"
                        }
                    >
                        <Button
                            type={is_active ? "primary" : "default"}
                            danger={is_active}
                            shape="circle"
                            size="small"
                            icon={
                                is_active ? (
                                    <PauseCircleOutlined />
                                ) : (
                                    <PlayCircleOutlined />
                                )
                            }
                            onClick={() => handleToggleRecord(record)}
                        />
                    </Tooltip>
                );
            },
        },
        {
            title: "작업명",
            dataIndex: "work_name",
            key: "work_name",
            width: 150,
            render: (text: string, record: WorkRecord) => {
                const is_active = getActiveRecordId() === record.id;
                return (
                    <Space>
                        <Text
                            strong
                            style={{ color: is_active ? "#1890ff" : undefined }}
                        >
                            {text}
                        </Text>
                        {is_active && (
                            <Tag color="processing" style={{ marginLeft: 4 }}>
                                {formatTimer(timer.elapsed_seconds)}
                            </Tag>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "업무명",
            dataIndex: "task_name",
            key: "task_name",
            width: 80,
            render: (text: string) =>
                text ? <Tag color="blue">{text}</Tag> : "-",
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            width: 180,
            ellipsis: true,
            render: (text: string) => text || "-",
        },
        {
            title: "카테고리",
            dataIndex: "category_name",
            key: "category_name",
            width: 90,
            render: (text: string) => {
                const color_map: Record<string, string> = {
                    개발: "green",
                    문서작업: "orange",
                    회의: "purple",
                    환경세팅: "cyan",
                    코드리뷰: "magenta",
                    테스트: "blue",
                    기타: "default",
                };
                return text ? (
                    <Tag color={color_map[text] || "default"}>{text}</Tag>
                ) : (
                    "-"
                );
            },
        },
        {
            title: "시간",
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            width: 60,
            align: "center",
            render: (_: number, record: WorkRecord) => (
                <Text strong style={{ color: "#1890ff" }}>
                    {getRecordDurationMinutes(record)}분
                </Text>
            ),
        },
        {
            title: "시작-종료",
            key: "time_range",
            width: 120,
            render: (_, record: WorkRecord) => (
                <Text type="secondary" style={{ fontSize: 11 }}>
                    {record.start_time?.slice(0, 5)} ~{" "}
                    {record.end_time?.slice(0, 5)}
                </Text>
            ),
        },
        {
            title: "",
            key: "action",
            width: 40,
            render: (_, record: WorkRecord) => {
                // 가상 레코드(진행 중)는 삭제 불가
                if (record.id === "__active__") {
                    return null;
                }
                return (
                    <Popconfirm
                        title="삭제 확인"
                        description="이 기록을 삭제하시겠습니까?"
                        onConfirm={() => deleteRecord(record.id)}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                );
            },
        },
    ];

    return (
        <>
            <Card
                title={
                    <Space>
                        <ClockCircleOutlined />
                        <span>오늘의 작업 기록</span>
                        {timer.is_running && (
                            <Tag
                                color="processing"
                                icon={<ClockCircleOutlined spin />}
                            >
                                {form_data.work_name} 진행 중
                            </Tag>
                        )}
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            새 작업
                        </Button>
                        <DatePicker
                            value={dayjs(selected_date)}
                            onChange={(date) =>
                                setSelectedDate(
                                    date?.format("YYYY-MM-DD") ||
                                        dayjs().format("YYYY-MM-DD")
                                )
                            }
                            allowClear={false}
                        />
                        <Button
                            icon={<CopyOutlined />}
                            onClick={handleCopyToClipboard}
                            disabled={filtered_records.length === 0}
                        >
                            복사
                        </Button>
                    </Space>
                }
            >
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Statistic
                            title="오늘 작업 수"
                            value={filtered_records.length}
                            suffix="건"
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="총 작업 시간"
                            value={total_minutes}
                            suffix="분"
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="시간 환산"
                            value={(total_minutes / 60).toFixed(1)}
                            suffix="시간"
                        />
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filtered_records}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: 900 }}
                    expandable={{
                        expandedRowRender,
                        rowExpandable: () => true,
                    }}
                    rowClassName={(record) =>
                        getActiveRecordId() === record.id ? "active-row" : ""
                    }
                    locale={{
                        emptyText:
                            "작업 기록이 없습니다. 프리셋에서 작업을 추가하거나 새 작업을 시작하세요.",
                    }}
                />
            </Card>

            <Modal
                title="새 작업 시작"
                open={is_modal_open}
                onOk={handleAddNewWork}
                onCancel={() => {
                    form.resetFields();
                    setIsModalOpen(false);
                }}
                okText="시작"
                cancelText="취소"
            >
                <Form form={form} layout="vertical">
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
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{
                                                padding: "0 8px 4px",
                                                width: "100%",
                                            }}
                                        >
                                            <Input
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
                                                size="small"
                                                style={{ width: 130 }}
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
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: "8px 0" }} />
                                        <Space
                                            style={{
                                                padding: "0 8px 4px",
                                                width: "100%",
                                            }}
                                        >
                                            <Input
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
                                                size="small"
                                                style={{ width: 130 }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={
                                                    handleAddCategoryOption
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

            <style>{`
                .active-row {
                    background-color: #e6f7ff !important;
                }
                .active-row:hover > td {
                    background-color: #bae7ff !important;
                }
            `}</style>
        </>
    );
}
