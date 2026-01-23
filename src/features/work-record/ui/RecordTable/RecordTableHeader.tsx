/**
 * 레코드 테이블 헤더 컴포넌트
 */

import { DatePicker, Space, Button, Statistic, Row, Col } from "antd";
import {
    CheckCircleOutlined,
    DeleteOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { RecordTableHeaderProps } from "../../lib/types";
import { formatDuration } from "../../../../shared/lib/time";


/**
 * 레코드 테이블 헤더 컴포넌트
 * 날짜 선택, 통계 표시, 완료/휴지통 버튼
 */
export function RecordTableHeader({
    selected_date,
    on_date_change,
    total_minutes,
    record_count,
    completed_count,
    on_show_completed,
    on_show_trash,
}: RecordTableHeaderProps) {
    const handle_prev_day = () => {
        const prev = dayjs(selected_date).subtract(1, "day");
        on_date_change(prev.format("YYYY-MM-DD"));
    };

    const handle_next_day = () => {
        const next = dayjs(selected_date).add(1, "day");
        on_date_change(next.format("YYYY-MM-DD"));
    };

    const handle_today = () => {
        on_date_change(dayjs().format("YYYY-MM-DD"));
    };

    const is_today = selected_date === dayjs().format("YYYY-MM-DD");

    return (
        <div className="record-table-header">
            <Row gutter={[16, 16]} align="middle">
                {/* 날짜 선택 */}
                <Col flex="auto">
                    <Space>
                        <Button
                            icon={<LeftOutlined />}
                            onClick={handle_prev_day}
                            size="small"
                        />
                        <DatePicker
                            value={dayjs(selected_date)}
                            onChange={(date) =>
                                date && on_date_change(date.format("YYYY-MM-DD"))
                            }
                            allowClear={false}
                            format="YYYY-MM-DD (ddd)"
                        />
                        <Button
                            icon={<RightOutlined />}
                            onClick={handle_next_day}
                            size="small"
                        />
                        {!is_today && (
                            <Button onClick={handle_today} size="small">
                                오늘
                            </Button>
                        )}
                    </Space>
                </Col>

                {/* 통계 */}
                <Col>
                    <Space size="large">
                        <Statistic
                            title="작업"
                            value={record_count}
                            suffix="개"
                            valueStyle={{ fontSize: 16 }}
                        />
                        <Statistic
                            title="총 시간"
                            value={formatDuration(total_minutes)}
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Space>
                </Col>

                {/* 완료/휴지통 버튼 */}
                <Col>
                    <Space>
                        <Button
                            icon={<CheckCircleOutlined />}
                            onClick={on_show_completed}
                        >
                            완료 ({completed_count})
                        </Button>
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={on_show_trash}
                        >
                            휴지통
                        </Button>
                    </Space>
                </Col>
            </Row>

            <style>{`
                .record-table-header {
                    margin-bottom: 16px;
                }
            `}</style>
        </div>
    );
}

export default RecordTableHeader;
