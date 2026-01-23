/**
 * 모바일 레코드 카드 컴포넌트
 */

import { Card, Typography, Tag, Space, Button } from "antd";
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    DownOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import type { MobileRecordCardProps } from "../../lib/types";
import { formatDuration, formatTimer } from "../../../../shared/lib/time";
import { getCategoryColor } from "../../../../shared/config";

const { Text } = Typography;

/**
 * 모바일 레코드 카드 컴포넌트
 * 모바일 화면에서 레코드를 카드 형태로 표시
 */
export function MobileRecordCard({
    record,
    is_running,
    is_expanded,
    on_toggle_expand,
    on_start,
    on_stop,
    on_edit,
    on_delete,
    on_complete,
    elapsed_seconds = 0,
}: MobileRecordCardProps) {
    const { 
        work_name, 
        deal_name, 
        category_name, 
        duration_minutes,
        start_time,
        end_time,
        is_completed,
    } = record;

    return (
        <Card
            className={`mobile-record-card ${is_running ? "mobile-record-running" : ""}`}
            size="small"
            onClick={on_toggle_expand}
        >
            {/* 헤더 */}
            <div className="mobile-card-header">
                <div className="mobile-card-title">
                    <Text strong ellipsis>
                        {deal_name || work_name}
                    </Text>
                    <Tag color={getCategoryColor(category_name)} style={{ marginLeft: 8 }}>
                        {category_name}
                    </Tag>
                </div>
                <div className="mobile-card-time">
                    {is_running ? (
                        <Text type="success" strong>
                            <ClockCircleOutlined /> {formatTimer(elapsed_seconds)}
                        </Text>
                    ) : (
                        <Text type="secondary">
                            {formatDuration(duration_minutes)}
                        </Text>
                    )}
                </div>
            </div>

            {/* 부제목 */}
            {deal_name && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {work_name}
                </Text>
            )}

            {/* 시간 정보 */}
            <div className="mobile-card-time-range">
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {start_time} ~ {end_time || "진행 중"}
                </Text>
            </div>

            {/* 확장 영역 */}
            {is_expanded && (
                <div
                    className="mobile-card-actions"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Space wrap>
                        {is_running ? (
                            <Button
                                type="primary"
                                danger
                                icon={<PauseCircleOutlined />}
                                onClick={on_stop}
                                size="small"
                            >
                                정지
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={on_start}
                                size="small"
                                disabled={is_completed}
                            >
                                시작
                            </Button>
                        )}
                        <Button
                            icon={<EditOutlined />}
                            onClick={on_edit}
                            size="small"
                        >
                            수정
                        </Button>
                        <Button
                            icon={<CheckOutlined />}
                            onClick={on_complete}
                            size="small"
                        >
                            {is_completed ? "취소" : "완료"}
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={on_delete}
                            size="small"
                        >
                            삭제
                        </Button>
                    </Space>
                </div>
            )}

            {/* 확장 아이콘 */}
            <div className="mobile-card-expand-icon">
                <DownOutlined
                    style={{
                        transform: is_expanded ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 0.2s",
                    }}
                />
            </div>

            <style>{`
                .mobile-record-card {
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: box-shadow 0.2s;
                }
                .mobile-record-card:hover {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .mobile-record-running {
                    border-left: 3px solid #52c41a;
                }
                .mobile-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .mobile-card-title {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    min-width: 0;
                }
                .mobile-card-time-range {
                    margin-top: 4px;
                }
                .mobile-card-actions {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px dashed #e8e8e8;
                }
                .mobile-card-expand-icon {
                    position: absolute;
                    right: 12px;
                    bottom: 8px;
                    color: #bfbfbf;
                }
            `}</style>
        </Card>
    );
}

export default MobileRecordCard;
