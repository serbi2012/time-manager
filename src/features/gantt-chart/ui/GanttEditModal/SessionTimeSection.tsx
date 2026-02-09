/**
 * 세션 시간 입력 섹션
 */

import { Form, Input, Space } from "antd";
import {
    GANTT_MODAL_SESSION_TIME_HEADER,
    GANTT_FORM_LABEL_START,
    GANTT_FORM_LABEL_END,
    GANTT_FORM_PLACEHOLDER_START,
    GANTT_FORM_PLACEHOLDER_END,
    GANTT_FORM_VALIDATE_START_REQUIRED,
    GANTT_FORM_VALIDATE_END_REQUIRED,
    GANTT_FORM_VALIDATE_TIME_FORMAT,
    GANTT_MODAL_ACTIVE_SESSION_HINT,
} from "../../constants";

export interface SessionTimeSectionProps {
    /** 진행 중 세션 여부 */
    is_active_session: boolean;
}

const TIME_VALIDATION_RULES = [
    {
        required: true,
        message: GANTT_FORM_VALIDATE_START_REQUIRED,
    },
    {
        pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        message: GANTT_FORM_VALIDATE_TIME_FORMAT,
    },
];

const END_TIME_VALIDATION_RULES = [
    {
        required: true,
        message: GANTT_FORM_VALIDATE_END_REQUIRED,
    },
    {
        pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        message: GANTT_FORM_VALIDATE_TIME_FORMAT,
    },
];

/**
 * 세션 시간 입력 섹션 컴포넌트
 */
export function SessionTimeSection({
    is_active_session,
}: SessionTimeSectionProps) {
    return (
        <div className="mb-lg p-md bg-bg-grey rounded-lg">
            <div className="mb-sm font-medium text-sm text-text-secondary">
                {GANTT_MODAL_SESSION_TIME_HEADER}
            </div>
            <Space size="middle">
                <Form.Item
                    name="session_start_time"
                    label={GANTT_FORM_LABEL_START}
                    rules={TIME_VALIDATION_RULES}
                    className="!mb-0"
                >
                    <Input
                        placeholder={GANTT_FORM_PLACEHOLDER_START}
                        className="!w-[80px]"
                        maxLength={5}
                    />
                </Form.Item>
                <span className="text-text-disabled">~</span>
                <Form.Item
                    name="session_end_time"
                    label={GANTT_FORM_LABEL_END}
                    rules={END_TIME_VALIDATION_RULES}
                    className="!mb-0"
                >
                    <Input
                        placeholder={GANTT_FORM_PLACEHOLDER_END}
                        className="!w-[80px]"
                        maxLength={5}
                        disabled={is_active_session}
                    />
                </Form.Item>
            </Space>
            {is_active_session && (
                <div className="mt-sm text-sm text-text-disabled">
                    {GANTT_MODAL_ACTIVE_SESSION_HINT}
                </div>
            )}
        </div>
    );
}
