/**
 * 관리자 그리드 헤더 (카드 제목 + 시간 표시 형식)
 */

import { Space, Tag, Radio } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import {
    ADMIN_PANEL_TITLE,
    ADMIN_TAG,
    TIME_DISPLAY_LABEL,
    TIME_FORMAT_HOURS,
    TIME_FORMAT_MINUTES,
} from "../../constants";
import { ADMIN_CARD_EXTRA_SPACE_STYLE } from "../../constants/styles";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";

interface AdminGridHeaderProps {
    time_format: TimeDisplayFormat;
    on_time_format_change: (v: TimeDisplayFormat) => void;
}

export function AdminGridHeader({
    time_format,
    on_time_format_change,
}: AdminGridHeaderProps) {
    return (
        <>
            <Space>
                <SettingOutlined />
                <span>{ADMIN_PANEL_TITLE}</span>
                <Tag color="purple">{ADMIN_TAG}</Tag>
            </Space>
            <Space>
                <span style={ADMIN_CARD_EXTRA_SPACE_STYLE}>
                    {TIME_DISPLAY_LABEL}
                </span>
                <Radio.Group
                    value={time_format}
                    onChange={(e) => on_time_format_change(e.target.value)}
                    size="small"
                    optionType="button"
                    buttonStyle="solid"
                >
                    <Radio.Button value="hours">
                        {TIME_FORMAT_HOURS}
                    </Radio.Button>
                    <Radio.Button value="minutes">
                        {TIME_FORMAT_MINUTES}
                    </Radio.Button>
                </Radio.Group>
            </Space>
        </>
    );
}
