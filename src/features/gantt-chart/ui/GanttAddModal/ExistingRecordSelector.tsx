/**
 * 기존 작업 선택 UI
 */

import { Radio, Space, Typography } from "antd";
import type { WorkRecord } from "../../../../shared/types";
import { GANTT_MODAL_SELECT_WORK_PROMPT } from "../../constants";

const { Text } = Typography;

export interface ExistingRecordSelectorProps {
    /** 오늘 레코드 목록 */
    today_records: WorkRecord[];
    /** 선택된 레코드 ID */
    selected_record_id: string | null;
    /** 선택 변경 핸들러 */
    onChange: (record_id: string) => void;
}

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
            <Text type="secondary" className="!block !mb-md">
                {GANTT_MODAL_SELECT_WORK_PROMPT}
            </Text>
            <Radio.Group
                value={selected_record_id}
                onChange={(e) => onChange(e.target.value)}
                className="!w-full"
            >
                <Space direction="vertical" className="!w-full">
                    {today_records.map((record) => (
                        <Radio
                            key={record.id}
                            value={record.id}
                            className={`!w-full !py-sm !px-md !border !border-[#d9d9d9] !rounded-md ${
                                selected_record_id === record.id
                                    ? "!bg-[#e6f4ff]"
                                    : "!bg-transparent"
                            }`}
                        >
                            <div>
                                <Text strong>{record.work_name}</Text>
                                {record.deal_name && (
                                    <Text type="secondary" className="!ml-sm">
                                        - {record.deal_name}
                                    </Text>
                                )}
                                <br />
                                <Text type="secondary" className="!text-sm">
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
