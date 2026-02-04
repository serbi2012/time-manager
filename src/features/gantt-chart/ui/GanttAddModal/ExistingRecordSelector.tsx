/**
 * 기존 작업 선택 UI
 */

import { Radio, Space, Typography } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import {
    RADIO_CARD_SELECTED_STYLE,
    RADIO_CARD_UNSELECTED_STYLE,
    TEXT_SECONDARY_WITH_MARGIN_STYLE,
    TEXT_BLOCK_WITH_MARGIN_STYLE,
} from "../../../../shared/ui/form/styles";
import {
    GANTT_MODAL_SELECT_WORK_PROMPT,
    GANTT_FONT_SMALL,
} from "../../constants";

const { Text } = Typography;

export interface ExistingRecordSelectorProps {
    /** 오늘 레코드 목록 */
    today_records: WorkRecord[];
    /** 선택된 레코드 ID */
    selected_record_id: string | null;
    /** 선택 변경 핸들러 */
    onChange: (record_id: string) => void;
}

const RECORD_META_STYLE: React.CSSProperties = {
    fontSize: GANTT_FONT_SMALL,
};

/**
 * 기존 작업 선택 컴포넌트
 */
export function ExistingRecordSelector({
    today_records,
    selected_record_id,
    onChange,
}: ExistingRecordSelectorProps) {
    return (
        <div>
            <Text type="secondary" style={TEXT_BLOCK_WITH_MARGIN_STYLE}>
                {GANTT_MODAL_SELECT_WORK_PROMPT}
            </Text>
            <Radio.Group
                value={selected_record_id}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: "100%" }}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    {today_records.map((record) => (
                        <Radio
                            key={record.id}
                            value={record.id}
                            style={
                                selected_record_id === record.id
                                    ? RADIO_CARD_SELECTED_STYLE
                                    : RADIO_CARD_UNSELECTED_STYLE
                            }
                        >
                            <div>
                                <Text strong>{record.work_name}</Text>
                                {record.deal_name && (
                                    <Text
                                        type="secondary"
                                        style={TEXT_SECONDARY_WITH_MARGIN_STYLE}
                                    >
                                        - {record.deal_name}
                                    </Text>
                                )}
                                <br />
                                <Text
                                    type="secondary"
                                    style={RECORD_META_STYLE}
                                >
                                    [{record.project_code}]{" "}
                                    {record.task_name && `${record.task_name}`}
                                    {record.sessions?.length
                                        ? ` (${record.sessions.length}개 세션)`
                                        : ""}
                                </Text>
                            </div>
                        </Radio>
                    ))}
                </Space>
            </Radio.Group>
        </div>
    );
}
