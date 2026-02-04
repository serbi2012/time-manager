/**
 * 세션 시간 입력 섹션
 */

import { Form, Input, Space } from "antd";
import {
    SESSION_TIME_CONTAINER_STYLE,
    SESSION_TIME_HEADER_STYLE,
    FORM_ITEM_NO_MARGIN_STYLE,
    HINT_TEXT_STYLE,
} from "../../../../shared/ui/form/styles";
import {
    GANTT_MODAL_SESSION_TIME_HEADER,
    GANTT_FORM_LABEL_START,
    GANTT_FORM_LABEL_END,
    GANTT_FORM_PLACEHOLDER_START,
    GANTT_FORM_PLACEHOLDER_END,
    GANTT_FORM_VALIDATE_START_REQUIRED,
    GANTT_FORM_VALIDATE_END_REQUIRED,
    GANTT_FORM_VALIDATE_TIME_FORMAT,
    GANTT_INPUT_TIME_WIDTH,
    GANTT_OPTION_CLOSE_COLOR,
    GANTT_FONT_SMALL,
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

const TIME_INPUT_STYLE = { width: GANTT_INPUT_TIME_WIDTH };
const SEPARATOR_STYLE = { color: GANTT_OPTION_CLOSE_COLOR };
const HINT_STYLE = {
    ...HINT_TEXT_STYLE,
    fontSize: GANTT_FONT_SMALL,
    color: GANTT_OPTION_CLOSE_COLOR,
};

/**
 * 세션 시간 입력 섹션 컴포넌트
 */
export function SessionTimeSection({
    is_active_session,
}: SessionTimeSectionProps) {
    return (
        <div style={SESSION_TIME_CONTAINER_STYLE}>
            <div style={SESSION_TIME_HEADER_STYLE}>
                {GANTT_MODAL_SESSION_TIME_HEADER}
            </div>
            <Space size="middle">
                <Form.Item
                    name="session_start_time"
                    label={GANTT_FORM_LABEL_START}
                    rules={TIME_VALIDATION_RULES}
                    style={FORM_ITEM_NO_MARGIN_STYLE}
                >
                    <Input
                        placeholder={GANTT_FORM_PLACEHOLDER_START}
                        style={TIME_INPUT_STYLE}
                        maxLength={5}
                    />
                </Form.Item>
                <span style={SEPARATOR_STYLE}>~</span>
                <Form.Item
                    name="session_end_time"
                    label={GANTT_FORM_LABEL_END}
                    rules={END_TIME_VALIDATION_RULES}
                    style={FORM_ITEM_NO_MARGIN_STYLE}
                >
                    <Input
                        placeholder={GANTT_FORM_PLACEHOLDER_END}
                        style={TIME_INPUT_STYLE}
                        maxLength={5}
                        disabled={is_active_session}
                    />
                </Form.Item>
            </Space>
            {is_active_session && (
                <div style={HINT_STYLE}>{GANTT_MODAL_ACTIVE_SESSION_HINT}</div>
            )}
        </div>
    );
}
