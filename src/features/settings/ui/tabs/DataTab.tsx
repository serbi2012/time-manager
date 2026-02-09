/**
 * 데이터 탭 컴포넌트 (시간 설정, 프리셋, 내보내기/가져오기, 저장소 상태)
 */

import { Card, Space, Switch, Button, Typography, TimePicker } from "antd";
import {
    ClockCircleOutlined,
    AppstoreOutlined,
    SaveOutlined,
    DownloadOutlined,
    UploadOutlined,
    CheckCircleFilled,
    CloudOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useWorkStore } from "@/store/useWorkStore";
import { APP_THEME_COLORS } from "@/shared/constants";
import { SUCCESS_MESSAGES } from "@/shared/constants/ui/messages";
import { message } from "antd";
import {
    SETTINGS_DATA_TIME_TITLE,
    SETTINGS_DATA_LUNCH_TITLE,
    SETTINGS_DATA_LUNCH_DESC,
    SETTINGS_DATA_PRESET_TITLE,
    SETTINGS_DATA_POSTFIX_TITLE,
    SETTINGS_DATA_POSTFIX_DESC,
    SETTINGS_DATA_MANAGEMENT_TITLE,
    SETTINGS_DATA_EXPORT,
    SETTINGS_DATA_IMPORT,
    SETTINGS_DATA_IMPORT_DESC,
    SETTINGS_DATA_STORAGE_CONNECTED,
    SETTINGS_DATA_STORAGE_CONNECTED_DESC,
    SETTINGS_DATA_STORAGE_LOCAL,
    SETTINGS_DATA_STORAGE_LOCAL_DESC,
} from "../../constants";
import { cn } from "@/shared/lib/cn";
import { SettingItem } from "./SettingItem";

const { Text } = Typography;

const CARD_BODY_MOBILE = { padding: "12px" as const };
const CARD_BODY_DESKTOP = { padding: "16px" as const };
const CARD_BODY_MANAGEMENT_MOBILE = { padding: 12 };
const CARD_BODY_MANAGEMENT_DESKTOP = { padding: 16 };

const STORAGE_AUTH_BG = "#f6ffed";
const STORAGE_LOCAL_BG = "#e6f4ff";

export interface DataTabProps {
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
    is_mobile?: boolean;
}

export function DataTab({
    onExport,
    onImport,
    isAuthenticated,
    is_mobile,
}: DataTabProps) {
    const use_postfix = useWorkStore(
        (state) => state.use_postfix_on_preset_add
    );
    const setUsePostfix = useWorkStore(
        (state) => state.setUsePostfixOnPresetAdd
    );
    const lunch_start_time = useWorkStore((state) => state.lunch_start_time);
    const lunch_end_time = useWorkStore((state) => state.lunch_end_time);
    const setLunchTime = useWorkStore((state) => state.setLunchTime);
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    const handleLunchTimeChange = (
        times: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
    ) => {
        if (times && times[0] && times[1]) {
            const start = times[0].format("HH:mm");
            const end = times[1].format("HH:mm");
            setLunchTime(start, end);
            message.success(SUCCESS_MESSAGES.lunchTimeChanged);
        }
    };

    return (
        <div className={cn("flex flex-col", is_mobile ? "gap-lg" : "gap-xl")}>
            <Card
                size="small"
                title={
                    <Space>
                        <ClockCircleOutlined style={{ color: theme_color }} />
                        <span>{SETTINGS_DATA_TIME_TITLE}</span>
                    </Space>
                }
                styles={{
                    body: is_mobile ? CARD_BODY_MOBILE : CARD_BODY_DESKTOP,
                }}
            >
                <SettingItem
                    title={SETTINGS_DATA_LUNCH_TITLE}
                    description={SETTINGS_DATA_LUNCH_DESC}
                    is_mobile={is_mobile}
                    action={
                        <TimePicker.RangePicker
                            value={[
                                dayjs(lunch_start_time, "HH:mm"),
                                dayjs(lunch_end_time, "HH:mm"),
                            ]}
                            onChange={handleLunchTimeChange}
                            format="HH:mm"
                            minuteStep={5}
                            size="small"
                            style={{ width: is_mobile ? "100%" : 180 }}
                            allowClear={false}
                        />
                    }
                />
            </Card>

            <Card
                size="small"
                title={
                    <Space>
                        <AppstoreOutlined style={{ color: theme_color }} />
                        <span>{SETTINGS_DATA_PRESET_TITLE}</span>
                    </Space>
                }
                styles={{
                    body: is_mobile ? CARD_BODY_MOBILE : CARD_BODY_DESKTOP,
                }}
            >
                <SettingItem
                    title={SETTINGS_DATA_POSTFIX_TITLE}
                    description={SETTINGS_DATA_POSTFIX_DESC}
                    is_mobile={is_mobile}
                    action={
                        <Switch
                            checked={use_postfix}
                            onChange={setUsePostfix}
                        />
                    }
                />
            </Card>

            <Card
                size="small"
                title={
                    <Space>
                        <SaveOutlined style={{ color: theme_color }} />
                        <span>{SETTINGS_DATA_MANAGEMENT_TITLE}</span>
                    </Space>
                }
                styles={{
                    body: is_mobile
                        ? CARD_BODY_MANAGEMENT_MOBILE
                        : CARD_BODY_MANAGEMENT_DESKTOP,
                }}
            >
                <div
                    className={cn(
                        "grid grid-cols-2",
                        is_mobile ? "gap-sm mb-md" : "gap-md mb-lg"
                    )}
                >
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={onExport}
                        style={{ height: is_mobile ? 40 : 48 }}
                    >
                        {SETTINGS_DATA_EXPORT}
                    </Button>
                    <Button
                        icon={<UploadOutlined />}
                        onClick={onImport}
                        style={{ height: is_mobile ? 40 : 48 }}
                    >
                        {SETTINGS_DATA_IMPORT}
                    </Button>
                </div>
                <Text
                    type="secondary"
                    style={{ fontSize: is_mobile ? 11 : 12 }}
                >
                    {SETTINGS_DATA_IMPORT_DESC}
                </Text>
            </Card>

            <Card
                size="small"
                styles={{
                    body: {
                        padding: is_mobile ? 12 : 16,
                        background: isAuthenticated
                            ? STORAGE_AUTH_BG
                            : STORAGE_LOCAL_BG,
                        borderRadius: 8,
                    },
                }}
            >
                <div className="flex items-center gap-md">
                    {isAuthenticated ? (
                        <CheckCircleFilled className="!text-[#52c41a] !text-[32px] shrink-0" />
                    ) : (
                        <CloudOutlined className="!text-[#1677ff] !text-[32px] shrink-0" />
                    )}
                    <div className="flex-1">
                        <Text strong className="!block !text-md">
                            {isAuthenticated
                                ? SETTINGS_DATA_STORAGE_CONNECTED
                                : SETTINGS_DATA_STORAGE_LOCAL}
                        </Text>
                        <Text type="secondary" className="!text-sm">
                            {isAuthenticated
                                ? SETTINGS_DATA_STORAGE_CONNECTED_DESC
                                : SETTINGS_DATA_STORAGE_LOCAL_DESC}
                        </Text>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default DataTab;
