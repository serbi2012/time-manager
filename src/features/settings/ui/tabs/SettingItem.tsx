/**
 * 설정 항목 레이아웃 (반응형)
 */

import { Typography } from "antd";

const { Text } = Typography;

export interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action: React.ReactNode;
    is_mobile?: boolean;
}

export function SettingItem({
    icon,
    title,
    description,
    action,
    is_mobile,
}: SettingItemProps) {
    if (is_mobile) {
        return (
            <div className="py-md border-b border-[#f0f0f0]">
                <div className="mb-sm">
                    <Text strong className="!text-sm !block !mb-[2px]">
                        {title}
                    </Text>
                    {description && (
                        <Text type="secondary" className="!text-xs !leading-[1.4]">
                            {description}
                        </Text>
                    )}
                </div>
                <div>{action}</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between py-lg border-b border-[#f0f0f0]">
            <div className="flex items-start gap-md flex-1">
                <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-base text-[#595959] shrink-0">{icon}</div>
                <div className="flex-1">
                    <Text strong className="!text-sm !block">
                        {title}
                    </Text>
                    {description && (
                        <Text type="secondary" className="!text-xs">
                            {description}
                        </Text>
                    )}
                </div>
            </div>
            <div className="shrink-0 ml-lg">{action}</div>
        </div>
    );
}
