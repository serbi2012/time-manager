import { useState, useMemo, useCallback } from "react";
import {
    Layout,
    Typography,
    DatePicker,
    Card,
    Button,
    Input,
    Space,
    Divider,
    message,
    Empty,
    Tooltip,
    Radio,
} from "antd";
import {
    CopyOutlined,
    LeftOutlined,
    RightOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ko";
import { useWorkStore } from "../store/useWorkStore";
import type { WorkRecord } from "../types";
import { SUCCESS_MESSAGES } from "../shared/constants";
import { useResponsive } from "../hooks/useResponsive";

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.locale("ko");

const { Content } = Layout;
const { Title, Text } = Typography;

// 요일 한글
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

// 분을 HH:mm 형식으로 변환
const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// 작업별 그룹화 데이터 타입
interface WorkGroup {
    project_code: string;
    work_name: string;
    status: string; // 진행상태
    start_date: string; // 시작일자
    total_minutes: number; // 해당 날짜까지의 누적시간
    deals: {
        deal_name: string;
        total_minutes: number; // 해당 거래의 해당 날짜까지 누적시간
    }[];
}

// 날짜별 그룹화 데이터 타입
interface DayGroup {
    date: string;
    day_name: string;
    works: WorkGroup[];
}

const WeeklySchedule = () => {
    const { is_mobile } = useResponsive();
    const { records } = useWorkStore();

    // 선택된 주의 시작일 (월요일)
    const [selected_week_start, setSelectedWeekStart] = useState<Dayjs>(
        dayjs().startOf("isoWeek")
    );

    // 수정 가능한 진행상태 상태
    const [editable_data, setEditableData] = useState<
        Record<string, { status: string }>
    >({});

    // 복사 형식 (1: 기존 형식, 2: 구분선 형식)
    const [copy_format, setCopyFormat] = useState<1 | 2>(2);

    // 관리업무 숨기기 옵션
    const [hide_management_work, setHideManagementWork] = useState(false);

    // 주간 범위의 날짜들 (월~일)
    const week_dates = useMemo(() => {
        const dates: string[] = [];
        for (let i = 0; i < 7; i++) {
            dates.push(selected_week_start.add(i, "day").format("YYYY-MM-DD"));
        }
        return dates;
    }, [selected_week_start]);

    // 해당 주의 작업 기록 필터링
    const weekly_records = useMemo(() => {
        const week_start = selected_week_start.format("YYYY-MM-DD");
        const week_end = selected_week_start.add(6, "day").format("YYYY-MM-DD");

        return records.filter((record) => {
            // 삭제된 레코드는 제외
            if (record.is_deleted) return false;

            // 세션 날짜가 해당 주에 포함되는지 확인
            const has_session_in_week = record.sessions?.some((session) => {
                const session_date = session.date || record.date;
                return session_date >= week_start && session_date <= week_end;
            });
            return (
                has_session_in_week ||
                (record.date >= week_start && record.date <= week_end)
            );
        });
    }, [records, selected_week_start]);

    // 특정 날짜까지의 누적시간 계산 (work_name 기준)
    const getTotalMinutesForWork = useCallback(
        (work_name: string, up_to_date: string): number => {
            return records
                .filter((r) => r.work_name === work_name && !r.is_deleted)
                .reduce((sum, r) => {
                    // 세션별로 날짜를 확인하여 해당 날짜까지의 시간만 계산
                    const sessions_up_to_date =
                        r.sessions?.filter((s) => {
                            const session_date = s.date || r.date;
                            return session_date <= up_to_date;
                        }) || [];

                    return (
                        sum +
                        sessions_up_to_date.reduce(
                            (s_sum, s) => s_sum + (s.duration_minutes || 0),
                            0
                        )
                    );
                }, 0);
        },
        [records]
    );

    // 특정 날짜까지의 누적시간 계산 (work_name + deal_name 기준)
    const getTotalMinutesForDeal = useCallback(
        (work_name: string, deal_name: string, up_to_date: string): number => {
            return records
                .filter(
                    (r) =>
                        r.work_name === work_name &&
                        r.deal_name === deal_name &&
                        !r.is_deleted
                )
                .reduce((sum, r) => {
                    // 세션별로 날짜를 확인하여 해당 날짜까지의 시간만 계산
                    const sessions_up_to_date =
                        r.sessions?.filter((s) => {
                            const session_date = s.date || r.date;
                            return session_date <= up_to_date;
                        }) || [];

                    return (
                        sum +
                        sessions_up_to_date.reduce(
                            (s_sum, s) => s_sum + (s.duration_minutes || 0),
                            0
                        )
                    );
                }, 0);
        },
        [records]
    );

    // 작업의 첫 시작일 찾기
    const getFirstStartDate = useCallback(
        (work_name: string): string => {
            const work_records = records.filter(
                (r) => r.work_name === work_name
            );
            if (work_records.length === 0) return "";

            let earliest_date = work_records[0].date;
            work_records.forEach((r) => {
                r.sessions?.forEach((s) => {
                    const session_date = s.date || r.date;
                    if (session_date < earliest_date) {
                        earliest_date = session_date;
                    }
                });
                if (r.date < earliest_date) {
                    earliest_date = r.date;
                }
            });

            const date = dayjs(earliest_date);
            return `${date.format("M/D")}(${DAY_NAMES[date.day()]})`;
        },
        [records]
    );

    // 작업의 진행상태 판단
    // 1. 타이머가 돌아가는 세션이 있으면 → "진행중"
    // 2. 모든 세션 종료 + 완료 버튼 안 누름 → "진행중"
    // 3. 모든 세션 종료 + 완료 버튼 누름 → "완료"
    const getWorkProgressStatus = useCallback(
        (work_name: string): string => {
            const work_records = records.filter(
                (r) => r.work_name === work_name && !r.is_deleted
            );

            if (work_records.length === 0) return "진행중";

            // 1. 진행중인 세션(end_time이 빈 문자열)이 하나라도 있으면 "진행중"
            const all_sessions = work_records.flatMap((r) => r.sessions || []);
            const has_running_session = all_sessions.some(
                (s) => s.end_time === ""
            );
            if (has_running_session) return "진행중";

            // 2. 모든 레코드가 is_completed여야 "완료"
            const all_completed = work_records.every((r) => r.is_completed);

            return all_completed ? "완료" : "진행중";
        },
        [records]
    );

    // 날짜별로 그룹화된 데이터 생성
    const day_groups = useMemo(() => {
        const groups: DayGroup[] = [];

        week_dates.forEach((date) => {
            const date_dayjs = dayjs(date);
            const day_name = DAY_NAMES[date_dayjs.day()];

            // 해당 날짜에 세션이 있는 작업들 찾기
            const work_map = new Map<string, WorkGroup>();

            weekly_records.forEach((record: WorkRecord) => {
                // 해당 날짜에 세션이 있는지 확인
                const sessions_on_date = record.sessions?.filter(
                    (s) => (s.date || record.date) === date
                );

                if (!sessions_on_date || sessions_on_date.length === 0) {
                    // record.date가 해당 날짜인지 확인
                    if (record.date !== date) return;
                }

                const work_key = record.work_name;

                if (!work_map.has(work_key)) {
                    // editable_data에서 수정된 값 가져오기
                    const edited = editable_data[work_key];

                    work_map.set(work_key, {
                        project_code: record.project_code || "A00_00000",
                        work_name: record.work_name,
                        status:
                            edited?.status ||
                            getWorkProgressStatus(record.work_name),
                        start_date: getFirstStartDate(record.work_name),
                        total_minutes: getTotalMinutesForWork(
                            record.work_name,
                            date
                        ),
                        deals: [],
                    });
                }

                const work_group = work_map.get(work_key)!;

                // deal 추가 (중복 방지)
                if (
                    !work_group.deals.some(
                        (d) => d.deal_name === record.deal_name
                    )
                ) {
                    work_group.deals.push({
                        deal_name: record.deal_name || record.work_name,
                        total_minutes: getTotalMinutesForDeal(
                            record.work_name,
                            record.deal_name,
                            date
                        ),
                    });
                }
            });

            if (work_map.size > 0) {
                // 관리업무 숨기기 필터 적용
                const filtered_works = Array.from(work_map.values()).filter(
                    (work) => {
                        if (
                            hide_management_work &&
                            work.project_code === "A24_05591"
                        ) {
                            return false;
                        }
                        return true;
                    }
                );

                if (filtered_works.length > 0) {
                    groups.push({
                        date,
                        day_name,
                        works: filtered_works,
                    });
                }
            }
        });

        return groups;
    }, [
        week_dates,
        weekly_records,
        editable_data,
        hide_management_work,
        getFirstStartDate,
        getWorkProgressStatus,
        getTotalMinutesForWork,
        getTotalMinutesForDeal,
    ]);

    // 진행상태 수정
    const handleStatusChange = (work_name: string, value: string) => {
        setEditableData((prev) => ({
            ...prev,
            [work_name]: {
                status: value,
            },
        }));
    };

    // 복사용 텍스트 생성
    const generateCopyText = (): string => {
        let text = "";

        if (copy_format === 1) {
            // 기존 형식
            day_groups.forEach((day_group) => {
                const date = dayjs(day_group.date);
                text += `${date.format("M/D")} (${day_group.day_name})\n`;

                day_group.works.forEach((work) => {
                    text += `[${work.project_code}] ${
                        work.work_name
                    } (진행상태: ${work.status}, 시작일자: ${
                        work.start_date
                    }, 누적시간: ${formatMinutes(work.total_minutes)})\n`;

                    work.deals.forEach((deal) => {
                        text += `> ${deal.deal_name} (누적시간: ${formatMinutes(
                            deal.total_minutes
                        )})\n`;
                    });
                });
            });
        } else {
            // 구분선 형식
            const separator = "────────────────────────────────────────";

            day_groups.forEach((day_group) => {
                const date = dayjs(day_group.date);
                text += `${separator}\n`;
                text += `■ ${date.format("M/D")} (${day_group.day_name})\n`;
                text += `${separator}\n`;

                day_group.works.forEach((work) => {
                    text += `[${work.project_code}] ${
                        work.work_name
                    } (진행상태: ${work.status}, 시작일자: ${
                        work.start_date
                    }, 누적시간: ${formatMinutes(work.total_minutes)})\n`;

                    work.deals.forEach((deal) => {
                        text += `  · ${
                            deal.deal_name
                        } (누적시간: ${formatMinutes(deal.total_minutes)})\n`;
                    });

                    text += "\n";
                });
            });
        }

        return text;
    };

    // 클립보드 복사
    const handleCopy = () => {
        const text = generateCopyText();
        navigator.clipboard.writeText(text).then(() => {
            message.success(SUCCESS_MESSAGES.clipboardCopied);
        });
    };

    // 주 이동
    const handlePrevWeek = () => {
        setSelectedWeekStart((prev) => prev.subtract(1, "week"));
    };

    const handleNextWeek = () => {
        setSelectedWeekStart((prev) => prev.add(1, "week"));
    };

    const handleThisWeek = () => {
        setSelectedWeekStart(dayjs().startOf("isoWeek"));
    };

    return (
        <Content className="weekly-schedule-content">
            <div className="weekly-schedule-container">
                {/* 헤더 */}
                <div
                    className={`weekly-header ${
                        is_mobile ? "weekly-header-mobile" : ""
                    }`}
                >
                    {!is_mobile && (
                        <Title level={4} style={{ margin: 0 }}>
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            주간 일정
                        </Title>
                    )}

                    <Space size={is_mobile ? "small" : "middle"}>
                        <Button
                            icon={<LeftOutlined />}
                            onClick={handlePrevWeek}
                            size={is_mobile ? "middle" : "middle"}
                        />
                        <DatePicker
                            picker="week"
                            value={selected_week_start}
                            onChange={(date) =>
                                date &&
                                setSelectedWeekStart(date.startOf("isoWeek"))
                            }
                            format={(value) =>
                                is_mobile
                                    ? `${value.format("M월")} ${Math.ceil(
                                          value.date() / 7
                                      )}주`
                                    : `${value.format(
                                          "YYYY년 M월"
                                      )} ${Math.ceil(value.date() / 7)}주차`
                            }
                            style={is_mobile ? { width: 100 } : undefined}
                        />
                        <Button
                            icon={<RightOutlined />}
                            onClick={handleNextWeek}
                            size={is_mobile ? "middle" : "middle"}
                        />
                        <Button
                            onClick={handleThisWeek}
                            size={is_mobile ? "small" : "middle"}
                        >
                            {is_mobile ? "오늘" : "이번 주"}
                        </Button>
                    </Space>

                    <Space size={is_mobile ? "small" : "middle"}>
                        <Radio.Group
                            value={hide_management_work}
                            onChange={(e) =>
                                setHideManagementWork(e.target.value)
                            }
                            optionType="button"
                            buttonStyle="solid"
                            size="small"
                        >
                            <Radio.Button value={false}>
                                {is_mobile ? "전체" : "전체 보기"}
                            </Radio.Button>
                            <Radio.Button value={true}>
                                {is_mobile
                                    ? "관리제외"
                                    : "[A24_05591] 관리업무 제외"}
                            </Radio.Button>
                        </Radio.Group>

                        <Tooltip title="복사하기">
                            <Button
                                type="primary"
                                icon={<CopyOutlined />}
                                onClick={handleCopy}
                                disabled={day_groups.length === 0}
                                size={is_mobile ? "middle" : "middle"}
                            >
                                {is_mobile ? "" : "복사"}
                            </Button>
                        </Tooltip>
                    </Space>
                </div>

                <Divider style={{ margin: "16px 0" }} />

                {/* 주간 범위 표시 */}
                <div className="week-range">
                    <Text type="secondary">
                        {selected_week_start.format("YYYY년 M월 D일")} ~{" "}
                        {selected_week_start.add(6, "day").format("M월 D일")}
                    </Text>
                </div>

                {/* 주간 일정 카드 */}
                {day_groups.length === 0 ? (
                    <Empty description="해당 주에 작업 기록이 없습니다" />
                ) : (
                    <div className="weekly-schedule-list">
                        {day_groups.map((day_group) => (
                            <Card
                                key={day_group.date}
                                className="day-card"
                                title={
                                    <Text strong style={{ fontSize: 16 }}>
                                        {dayjs(day_group.date).format("M/D")} (
                                        {day_group.day_name})
                                    </Text>
                                }
                            >
                                {day_group.works.map((work, work_idx) => (
                                    <div key={work_idx} className="work-item">
                                        {/* 작업 헤더 */}
                                        <div className="work-header">
                                            <Space wrap>
                                                <Text>
                                                    [{work.project_code}]
                                                </Text>
                                                <Text strong>
                                                    {work.work_name}
                                                </Text>
                                                <Text type="secondary">
                                                    (진행상태:
                                                </Text>
                                                <Input
                                                    size="small"
                                                    value={work.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            work.work_name,
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{ width: 80 }}
                                                />
                                                <Text type="secondary">
                                                    , 시작일자:{" "}
                                                    {work.start_date}, 누적시간:{" "}
                                                    {formatMinutes(
                                                        work.total_minutes
                                                    )}
                                                    )
                                                </Text>
                                            </Space>
                                        </div>

                                        {/* 거래 목록 */}
                                        <div className="deal-list">
                                            {work.deals.map(
                                                (deal, deal_idx) => (
                                                    <div
                                                        key={deal_idx}
                                                        className="deal-item"
                                                    >
                                                        <Text type="secondary">
                                                            &gt;{" "}
                                                        </Text>
                                                        <Text>
                                                            {deal.deal_name}
                                                        </Text>
                                                        <Text type="secondary">
                                                            {" "}
                                                            (누적시간:{" "}
                                                            {formatMinutes(
                                                                deal.total_minutes
                                                            )}
                                                            )
                                                        </Text>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {work_idx <
                                            day_group.works.length - 1 && (
                                            <Divider
                                                style={{ margin: "8px 0" }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </Card>
                        ))}
                    </div>
                )}

                {/* 미리보기 영역 */}
                {day_groups.length > 0 && (
                    <>
                        <Divider />
                        <div className="preview-section">
                            <div className="preview-header">
                                <Title level={5} style={{ margin: 0 }}>
                                    복사 미리보기
                                </Title>
                                <Radio.Group
                                    value={copy_format}
                                    onChange={(e) =>
                                        setCopyFormat(e.target.value)
                                    }
                                    size="small"
                                >
                                    <Radio.Button value={1}>
                                        형식 1
                                    </Radio.Button>
                                    <Radio.Button value={2}>
                                        형식 2
                                    </Radio.Button>
                                </Radio.Group>
                            </div>
                            <pre className="copy-preview">
                                {generateCopyText()}
                            </pre>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .weekly-schedule-content {
                    padding: 24px;
                    background: #f5f5f5;
                    min-height: calc(100vh - 64px);
                    overflow-y: auto;
                }

                .weekly-schedule-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    padding: 24px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .weekly-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .week-range {
                    text-align: center;
                    margin-bottom: 16px;
                }

                .weekly-schedule-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .day-card {
                    border-radius: 8px;
                }

                .day-card .ant-card-head {
                    background: #fafafa;
                    border-radius: 8px 8px 0 0;
                }

                .work-item {
                    margin-bottom: 8px;
                }

                .work-header {
                    margin-bottom: 4px;
                }

                .deal-list {
                    padding-left: 16px;
                }

                .deal-item {
                    margin: 2px 0;
                }

                .preview-section {
                    margin-top: 16px;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .copy-preview {
                    background: #f5f5f5;
                    padding: 16px;
                    border-radius: 8px;
                    font-family: 'D2Coding', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                    word-break: break-all;
                    max-height: 400px;
                    overflow-y: auto;
                }
            `}</style>
        </Content>
    );
};

export default WeeklySchedule;
