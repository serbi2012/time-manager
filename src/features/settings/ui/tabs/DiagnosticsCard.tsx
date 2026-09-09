import { Card, Space, Button, Typography } from "antd";
import { BugOutlined, DownloadOutlined } from "@ant-design/icons";
import { useWorkStore, APP_THEME_COLORS } from "@/store/useWorkStore";
import { useDiagnostics } from "@/shared/hooks";
import { message } from "@/shared/lib/message";
import { DIAGNOSTIC_LABELS } from "@/shared/constants";
import { cn } from "@/shared/lib/cn";

const { Text } = Typography;

const CARD_BODY_MOBILE = { padding: 12 };
const CARD_BODY_DESKTOP = { padding: 16 };
const BUTTON_HEIGHT_MOBILE = 40;
const BUTTON_HEIGHT_DESKTOP = 48;

interface DiagnosticsCardProps {
    is_mobile?: boolean;
}

export function DiagnosticsCard({ is_mobile }: DiagnosticsCardProps) {
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;
    const { error_count, downloadReport, clearEvents } = useDiagnostics();

    const handleDownload = () => {
        downloadReport();
        message.success(DIAGNOSTIC_LABELS.DOWNLOADED);
    };

    const handleClear = () => {
        clearEvents();
        message.success(DIAGNOSTIC_LABELS.CLEARED);
    };

    return (
        <Card
            size="small"
            title={
                <Space>
                    <BugOutlined style={{ color: theme_color }} />
                    <span>{DIAGNOSTIC_LABELS.SECTION_TITLE}</span>
                </Space>
            }
            styles={{
                body: is_mobile ? CARD_BODY_MOBILE : CARD_BODY_DESKTOP,
            }}
        >
            <Text
                type="secondary"
                className={cn("!block", is_mobile ? "!text-xs" : "!text-sm")}
            >
                {DIAGNOSTIC_LABELS.SECTION_DESCRIPTION}
            </Text>

            <div
                className={cn(
                    "grid grid-cols-2",
                    is_mobile ? "gap-sm mt-md" : "gap-md mt-lg"
                )}
            >
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    style={{
                        height: is_mobile
                            ? BUTTON_HEIGHT_MOBILE
                            : BUTTON_HEIGHT_DESKTOP,
                    }}
                >
                    {DIAGNOSTIC_LABELS.DOWNLOAD_BUTTON}
                </Button>
                <Button
                    onClick={handleClear}
                    disabled={error_count === 0}
                    style={{
                        height: is_mobile
                            ? BUTTON_HEIGHT_MOBILE
                            : BUTTON_HEIGHT_DESKTOP,
                    }}
                >
                    {DIAGNOSTIC_LABELS.CLEAR_BUTTON}
                </Button>
            </div>

            <div className={cn("flex flex-col", is_mobile ? "mt-md" : "mt-lg")}>
                <Text
                    type={error_count > 0 ? "danger" : "secondary"}
                    className={is_mobile ? "!text-xs" : "!text-sm"}
                >
                    {error_count > 0
                        ? DIAGNOSTIC_LABELS.EVENT_COUNT(error_count)
                        : DIAGNOSTIC_LABELS.NO_EVENTS}
                </Text>
                <Text
                    type="secondary"
                    className={is_mobile ? "!text-xs" : "!text-sm"}
                >
                    {DIAGNOSTIC_LABELS.CONTENT_HINT}
                </Text>
            </div>
        </Card>
    );
}
