import { useMemo } from "react";
import { Card, Typography, Empty, Tooltip } from "antd";
import dayjs from "dayjs";
import { useWorkStore } from "../store/useWorkStore";
import type { WorkRecord, WorkSession } from "../types";

const { Text } = Typography;

// 시간을 분으로 변환 (예: "09:30:00" -> 570)
const timeToMinutes = (time_str: string): number => {
    const [hours, minutes, seconds] = time_str.split(":").map(Number);
    return hours * 60 + minutes + (seconds || 0) / 60;
};

// 세션의 duration_seconds 가져오기 (호환성)
const getSessionSeconds = (session: WorkSession): number => {
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

// 작업별 그룹화된 세션 타입
interface GroupedWork {
    key: string; // work_name + deal_name
    record: WorkRecord;
    sessions: WorkSession[];
    first_start: number; // 정렬용 (첫 세션 시작 시간)
}

export default function DailyGanttChart() {
    const { records, selected_date, templates } = useWorkStore();

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
                                  start_time: record.start_time,
                                  end_time: record.end_time,
                                  duration_seconds: record.duration_minutes * 60,
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

    // 모든 세션에서 시간 범위 계산
    const time_range = useMemo(() => {
        if (grouped_works.length === 0) {
            return { start: 9 * 60, end: 18 * 60 }; // 기본 9시-18시
        }

        let min_start = Infinity;
        let max_end = -Infinity;

        grouped_works.forEach((group) => {
            group.sessions.forEach((session) => {
                const start = timeToMinutes(session.start_time);
                const end = timeToMinutes(session.end_time);
                min_start = Math.min(min_start, start);
                max_end = Math.max(max_end, end);
            });
        });

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

    // 시간을 읽기 쉬운 형식으로
    const formatSeconds = (seconds: number): string => {
        if (seconds < 60) return `${seconds}초`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (secs === 0) return `${mins}분`;
        return `${mins}분 ${secs}초`;
    };

    // 총 소요 시간 계산
    const getTotalDuration = (sessions: WorkSession[]): number => {
        return sessions.reduce((sum, s) => sum + getSessionSeconds(s), 0);
    };

    return (
        <Card
            title={`일간 타임라인 (${dayjs(selected_date).format("YYYY-MM-DD")})`}
            size="small"
        >
            {grouped_works.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="작업 기록이 없습니다"
                />
            ) : (
                <div className="gantt-container">
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

                    {/* 그리드 라인 */}
                    <div className="gantt-grid">
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
                                                            {formatSeconds(
                                                                getSessionSeconds(session)
                                                            )}
                                                        </div>
                                                        <div style={{ marginTop: 4 }}>
                                                            총 {group.sessions.length}회,{" "}
                                                            {formatSeconds(
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
                
                .gantt-time-header {
                    position: absolute;
                    top: 0;
                    left: 90px;
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
                }
                
                .gantt-grid-line {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: #f0f0f0;
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
    );
}
