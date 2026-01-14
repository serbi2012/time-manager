import { useState, useMemo } from "react";
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
    total_minutes: number; // 전체 기간 누적시간
    deals: {
        deal_name: string;
        total_minutes: number; // 해당 거래의 전체 기간 누적시간
    }[];
}

// 날짜별 그룹화 데이터 타입
interface DayGroup {
    date: string;
    day_name: string;
    works: WorkGroup[];
}

const WeeklySchedule = () => {
    const { records } = useWorkStore();

    // 선택된 주의 시작일 (월요일)
    const [selected_week_start, setSelectedWeekStart] = useState<Dayjs>(
        dayjs().startOf("isoWeek")
    );

    // 수정 가능한 진행상태 상태
    const [editable_data, setEditableData] = useState<
        Record<string, { status: string }>
    >({});

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

    // 전체 기간 누적시간 계산 (work_name 기준)
    const getTotalMinutesForWork = (work_name: string): number => {
        return records
            .filter((r) => r.work_name === work_name)
            .reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
    };

    // 전체 기간 누적시간 계산 (work_name + deal_name 기준)
    const getTotalMinutesForDeal = (
        work_name: string,
        deal_name: string
    ): number => {
        return records
            .filter(
                (r) => r.work_name === work_name && r.deal_name === deal_name
            )
            .reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
    };

    // 작업의 첫 시작일 찾기
    const getFirstStartDate = (work_name: string): string => {
        const work_records = records.filter((r) => r.work_name === work_name);
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
    };

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
                            (record.is_completed ? "완료" : "진행중"),
                        start_date: getFirstStartDate(record.work_name),
                        total_minutes: getTotalMinutesForWork(record.work_name),
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
                            record.deal_name
                        ),
                    });
                }
            });

            if (work_map.size > 0) {
                groups.push({
                    date,
                    day_name,
                    works: Array.from(work_map.values()),
                });
            }
        });

        return groups;
    }, [week_dates, weekly_records, records, editable_data]);

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

        day_groups.forEach((day_group) => {
            const date = dayjs(day_group.date);
            text += `${date.format("M/D")} (${day_group.day_name})\n`;

            day_group.works.forEach((work) => {
                text += `[${work.project_code}] ${work.work_name} (진행상태: ${
                    work.status
                }, 시작일자: ${work.start_date}, 누적시간: ${formatMinutes(
                    work.total_minutes
                )})\n`;

                work.deals.forEach((deal) => {
                    text += `> ${deal.deal_name} (누적시간: ${formatMinutes(
                        deal.total_minutes
                    )})\n`;
                });
            });
        });

        return text;
    };

    // 클립보드 복사
    const handleCopy = () => {
        const text = generateCopyText();
        navigator.clipboard.writeText(text).then(() => {
            message.success("클립보드에 복사되었습니다");
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
                <div className="weekly-header">
                    <Title level={4} style={{ margin: 0 }}>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        주간 일정
                    </Title>

                    <Space>
                        <Button
                            icon={<LeftOutlined />}
                            onClick={handlePrevWeek}
                        />
                        <DatePicker
                            picker="week"
                            value={selected_week_start}
                            onChange={(date) =>
                                date &&
                                setSelectedWeekStart(date.startOf("isoWeek"))
                            }
                            format={(value) =>
                                `${value.format("YYYY년 M월")} ${Math.ceil(
                                    value.date() / 7
                                )}주차`
                            }
                        />
                        <Button
                            icon={<RightOutlined />}
                            onClick={handleNextWeek}
                        />
                        <Button onClick={handleThisWeek}>이번 주</Button>
                    </Space>

                    <Tooltip title="복사하기">
                        <Button
                            type="primary"
                            icon={<CopyOutlined />}
                            onClick={handleCopy}
                            disabled={day_groups.length === 0}
                        >
                            복사
                        </Button>
                    </Tooltip>
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
                            <Title level={5}>복사 미리보기</Title>
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
