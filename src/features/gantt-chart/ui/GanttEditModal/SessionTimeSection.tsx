/**
 * 세션 시간 입력 섹션 — Hero Time Style
 */

import { useMemo } from "react";
import { Form, Input } from "antd";
import { timeToMinutes, formatDuration } from "../../../../shared/lib/time";
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
    GANTT_MODAL_DURATION_LABEL,
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

const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const HERO_INPUT_CLASS =
    "!w-[110px] !h-[48px] !text-2xl !font-semibold !text-center !rounded-lg";

/**
 * 세션 시간 입력 섹션 컴포넌트 (히어로 타임 스타일)
 */
export function SessionTimeSection({
    is_active_session,
}: SessionTimeSectionProps) {
    const start_time = Form.useWatch("session_start_time");
    const end_time = Form.useWatch("session_end_time");

    const duration_text = useMemo(() => {
        if (!start_time || !end_time) return null;
        if (!TIME_PATTERN.test(start_time) || !TIME_PATTERN.test(end_time))
            return null;
        const diff = timeToMinutes(end_time) - timeToMinutes(start_time);
        if (diff <= 0) return null;
        return formatDuration(diff);
    }, [start_time, end_time]);

    return (
        <div className="mb-lg px-xl py-xl bg-bg-grey rounded-lg">
            <div className="mb-lg text-center font-medium text-sm text-text-secondary">
                {GANTT_MODAL_SESSION_TIME_HEADER}
            </div>

            <div className="flex items-start justify-center gap-xl">
                <div className="flex flex-col items-center gap-[6px]">
                    <Form.Item
                        name="session_start_time"
                        rules={TIME_VALIDATION_RULES}
                        className="!mb-0"
                    >
                        <Input
                            placeholder={GANTT_FORM_PLACEHOLDER_START}
                            maxLength={5}
                            className={HERO_INPUT_CLASS}
                        />
                    </Form.Item>
                    <span className="text-xs text-text-secondary">
                        {GANTT_FORM_LABEL_START}
                    </span>
                </div>

                <span className="text-lg text-text-disabled leading-[48px]">
                    →
                </span>

                <div className="flex flex-col items-center gap-[6px]">
                    <Form.Item
                        name="session_end_time"
                        rules={END_TIME_VALIDATION_RULES}
                        className="!mb-0"
                    >
                        <Input
                            placeholder={GANTT_FORM_PLACEHOLDER_END}
                            maxLength={5}
                            disabled={is_active_session}
                            className={HERO_INPUT_CLASS}
                        />
                    </Form.Item>
                    <span className="text-xs text-text-secondary">
                        {GANTT_FORM_LABEL_END}
                    </span>
                </div>
            </div>

            {duration_text && (
                <div className="mt-lg flex justify-center">
                    <span className="text-sm text-text-secondary">
                        {GANTT_MODAL_DURATION_LABEL} {duration_text}
                    </span>
                </div>
            )}

            {is_active_session && (
                <div className="mt-sm text-xs text-text-disabled text-center">
                    {GANTT_MODAL_ACTIVE_SESSION_HINT}
                </div>
            )}
        </div>
    );
}
