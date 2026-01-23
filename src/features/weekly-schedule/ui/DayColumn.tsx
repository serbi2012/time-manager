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
                <Text strong>
                    {day_of_week}요일
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
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
                                <Text ellipsis style={{ flex: 1 }}>
                                    {record.deal_name || record.work_name}
                                </Text>
                                <Tag 
                                    color={getCategoryColor(record.category_name)}
                                    style={{ marginLeft: 4 }}
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
            
            <style>{`
                .day-column {
                    border: 1px solid #f0f0f0;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 200px;
                }
                .day-column-today {
                    border-color: #1890ff;
                    background: #f6ffed;
                }
                .day-column-header {
                    padding: 8px 12px;
                    background: #fafafa;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .day-column-today .day-column-header {
                    background: #e6f7ff;
                }
                .day-column-content {
                    flex: 1;
                    padding: 8px;
                    overflow-y: auto;
                }
                .day-record {
                    display: flex;
                    align-items: center;
                    padding: 4px 0;
                    border-bottom: 1px dashed #f0f0f0;
                }
                .day-record:last-child {
                    border-bottom: none;
                }
                .day-column-footer {
                    padding: 8px 12px;
                    background: #fafafa;
                    border-top: 1px solid #f0f0f0;
                    text-align: right;
                }
            `}</style>
        </div>
    );
}

export default DayColumn;
