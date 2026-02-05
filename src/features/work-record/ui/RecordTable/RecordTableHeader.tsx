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
import { RECORD_BUTTON, RECORD_UI_TEXT } from "../../constants";

/**
 * 레코드 테이블 헤더 컴포넌트
 * 날짜 선택, 통계 표시, 완료/휴지통 버튼
 */
export function RecordTableHeader({
    selected_date,
    on_date_change,
    total_minutes,
    record_count,
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
                                date &&
                                on_date_change(date.format("YYYY-MM-DD"))
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
                                {RECORD_UI_TEXT.TODAY_TEXT}
                            </Button>
                        )}
                    </Space>
                </Col>

                {/* 통계 */}
                <Col>
                    <Space size="large">
                        <Statistic
                            title={RECORD_UI_TEXT.WORK_COUNT_LABEL}
                            value={record_count}
                            suffix={RECORD_UI_TEXT.WORK_COUNT_UNIT}
                            valueStyle={{ fontSize: 16 }}
                        />
                        <Statistic
                            title={RECORD_UI_TEXT.TOTAL_DURATION_LABEL}
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
                            {RECORD_BUTTON.VIEW_COMPLETED}
                        </Button>
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={on_show_trash}
                        >
                            {RECORD_BUTTON.VIEW_TRASH}
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
