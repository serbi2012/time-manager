/**
 * 일별 컬럼 컴포넌트
 */

import { Typography, Tag, Empty } from "antd";
import type { DayRecords } from "../lib/copy_formatter";
import { formatDuration } from "../../../shared/lib/time";
import { getRecordDurationForDate } from "../../work-record/lib/duration_calculator";
import { getCategoryColor } from "../../../shared/config";

const { Text } = Typography;

export interface DayColumnProps {
    day: DayRecords;
    is_today: boolean;
}

/**
 * 일별 컬럼 컴포넌트
 */
export function DayColumn({ day, is_today }: DayColumnProps) {
    const { date, day_of_week, records, total_minutes } = day;

    return (
        <div className={`day-column ${is_today ? "day-column-today" : ""}`}>
            {/* 헤더 */}
            <div className="day-column-header">
                <Text strong>{day_of_week}요일</Text>
                <Text type="secondary" className="!text-sm">
                    {date.slice(5)}
                </Text>
            </div>

            {/* 레코드 목록 */}
            <div className="day-column-content">
                {records.length === 0 ? (
                    <Empty
                        description="작업 없음"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    records.map((record) => {
                        const duration = getRecordDurationForDate(record, date);
                        return (
                            <div key={record.id} className="day-record">
                                <Text ellipsis className="!flex-1">
                                    {record.deal_name || record.work_name}
                                </Text>
                                <Tag
                                    color={getCategoryColor(
                                        record.category_name
                                    )}
                                    className="!ml-xs"
                                >
                                    {formatDuration(duration)}
                                </Tag>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 푸터 */}
            {total_minutes > 0 && (
                <div className="day-column-footer">
                    <Text strong>{formatDuration(total_minutes)}</Text>
                </div>
            )}
        </div>
    );
}

export default DayColumn;
