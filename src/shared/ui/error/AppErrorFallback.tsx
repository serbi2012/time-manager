import { Button, Typography } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useDiagnostics } from "@/shared/hooks/useDiagnostics";
import { DIAGNOSTIC_LABELS } from "@/shared/constants";

const { Title, Text, Paragraph } = Typography;

interface AppErrorFallbackProps {
    error: Error;
    onReset: () => void;
}

export function AppErrorFallback({ error, onReset }: AppErrorFallbackProps) {
    const { downloadReport } = useDiagnostics();

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-app p-xl">
            <div className="w-full max-w-lg bg-bg-default rounded-xl border border-border-light shadow-sm p-2xl flex flex-col gap-lg">
                <div className="flex flex-col gap-xs">
                    <Title level={4} className="!mb-0">
                        {DIAGNOSTIC_LABELS.BOUNDARY_TITLE}
                    </Title>
                    <Text type="secondary" className="text-md">
                        {DIAGNOSTIC_LABELS.BOUNDARY_DESCRIPTION}
                    </Text>
                </div>

                <Paragraph
                    code
                    className="!mb-0 max-h-40 overflow-auto text-sm break-words"
                >
                    {error.message}
                </Paragraph>

                <div className="flex flex-wrap gap-sm">
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={downloadReport}
                    >
                        {DIAGNOSTIC_LABELS.DOWNLOAD_BUTTON}
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={onReset}>
                        {DIAGNOSTIC_LABELS.BOUNDARY_RETRY}
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        {DIAGNOSTIC_LABELS.BOUNDARY_RELOAD}
                    </Button>
                </div>

                <Text type="secondary" className="text-sm">
                    {DIAGNOSTIC_LABELS.SHARE_HINT}
                </Text>
            </div>
        </div>
    );
}
