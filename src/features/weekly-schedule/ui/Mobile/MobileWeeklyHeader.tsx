/**
 * 모바일 주간 일정 헤더
 */

import { Button, Space, DatePicker, Radio, Tooltip } from "antd";
import { CopyOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { WEEKLY_LABELS } from "../../constants";
import { WEEKLY_DATE_PICKER_MOBILE_STYLE } from "../../constants/styles";

export interface MobileWeeklyHeaderProps {
    selected_week_start: Dayjs;
    on_prev_week: () => void;
    on_next_week: () => void;
    on_this_week: () => void;
    on_week_change: (date: Dayjs) => void;
    hide_management_work: boolean;
    on_hide_management_change: (value: boolean) => void;
    on_copy: () => void;
    copy_disabled: boolean;
}

export function MobileWeeklyHeader({
    selected_week_start,
    on_prev_week,
    on_next_week,
    on_this_week,
    on_week_change,
    hide_management_work,
    on_hide_management_change,
    on_copy,
    copy_disabled,
}: MobileWeeklyHeaderProps) {
    const datePickerFormat = (value: Dayjs) =>
        `${value.format("M월")} ${Math.ceil(value.date() / 7)}주`;

    return (
        <div className="weekly-header weekly-header-mobile">
            <Space size="small">
                <Button
                    icon={<LeftOutlined />}
                    onClick={on_prev_week}
                    size="middle"
                />
                <DatePicker
                    picker="week"
                    value={selected_week_start}
                    onChange={(date) =>
                        date && on_week_change(date.startOf("isoWeek"))
                    }
                    format={datePickerFormat}
                    style={WEEKLY_DATE_PICKER_MOBILE_STYLE}
                />
                <Button
                    icon={<RightOutlined />}
                    onClick={on_next_week}
                    size="middle"
                />
                <Button onClick={on_this_week} size="small">
                    {WEEKLY_LABELS.thisWeekShort}
                </Button>
            </Space>

            <Space size="small">
                <Radio.Group
                    value={hide_management_work}
                    onChange={(e) => on_hide_management_change(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                    size="small"
                >
                    <Radio.Button value={false}>
                        {WEEKLY_LABELS.viewAllShort}
                    </Radio.Button>
                    <Radio.Button value={true}>
                        {WEEKLY_LABELS.excludeManagementShort}
                    </Radio.Button>
                </Radio.Group>

                <Tooltip title={WEEKLY_LABELS.copyTooltip}>
                    <Button
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={on_copy}
                        disabled={copy_disabled}
                        size="middle"
                    />
                </Tooltip>
            </Space>
        </div>
    );
}
