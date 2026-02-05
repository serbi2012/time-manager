/**
 * 주간 일정 헤더: 제목, 주 선택, 관리업무 필터, 복사 버튼
 */

import { Typography, Button, Space, DatePicker, Radio, Tooltip } from "antd";
import {
    CopyOutlined,
    LeftOutlined,
    RightOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { WEEKLY_LABELS } from "../../constants";
import {
    WEEKLY_HEADER_TITLE_STYLE,
    WEEKLY_HEADER_ICON_STYLE,
    WEEKLY_DATE_PICKER_MOBILE_STYLE,
} from "../../constants/styles";

export interface WeeklyHeaderProps {
    is_mobile: boolean;
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

export function WeeklyHeader({
    is_mobile,
    selected_week_start,
    on_prev_week,
    on_next_week,
    on_this_week,
    on_week_change,
    hide_management_work,
    on_hide_management_change,
    on_copy,
    copy_disabled,
}: WeeklyHeaderProps) {
    const datePickerFormat = (value: Dayjs) =>
        is_mobile
            ? `${value.format("M월")} ${Math.ceil(value.date() / 7)}주`
            : `${value.format("YYYY년 M월")} ${Math.ceil(
                  value.date() / 7
              )}주차`;

    return (
        <div
            className={`weekly-header ${
                is_mobile ? "weekly-header-mobile" : ""
            }`}
        >
            {!is_mobile && (
                <Typography.Title level={4} style={WEEKLY_HEADER_TITLE_STYLE}>
                    <CalendarOutlined style={WEEKLY_HEADER_ICON_STYLE} />
                    {WEEKLY_LABELS.title}
                </Typography.Title>
            )}

            <Space size={is_mobile ? "small" : "middle"}>
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
                    style={
                        is_mobile ? WEEKLY_DATE_PICKER_MOBILE_STYLE : undefined
                    }
                />
                <Button
                    icon={<RightOutlined />}
                    onClick={on_next_week}
                    size="middle"
                />
                <Button
                    onClick={on_this_week}
                    size={is_mobile ? "small" : "middle"}
                >
                    {is_mobile
                        ? WEEKLY_LABELS.thisWeekShort
                        : WEEKLY_LABELS.thisWeek}
                </Button>
            </Space>

            <Space size={is_mobile ? "small" : "middle"}>
                <Radio.Group
                    value={hide_management_work}
                    onChange={(e) => on_hide_management_change(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                    size="small"
                >
                    <Radio.Button value={false}>
                        {is_mobile
                            ? WEEKLY_LABELS.viewAllShort
                            : WEEKLY_LABELS.viewAll}
                    </Radio.Button>
                    <Radio.Button value={true}>
                        {is_mobile
                            ? WEEKLY_LABELS.excludeManagementShort
                            : WEEKLY_LABELS.excludeManagement}
                    </Radio.Button>
                </Radio.Group>

                <Tooltip title={WEEKLY_LABELS.copyTooltip}>
                    <Button
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={on_copy}
                        disabled={copy_disabled}
                        size="middle"
                    >
                        {is_mobile ? "" : WEEKLY_LABELS.copy}
                    </Button>
                </Tooltip>
            </Space>
        </div>
    );
}
