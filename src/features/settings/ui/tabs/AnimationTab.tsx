/**
 * 애니메이션 탭 컴포넌트
 * 트랜지션 효과 및 애니메이션 관련 설정 관리
 */

import { Card, Space, Switch, Select, Typography } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import {
    useWorkStore,
    APP_THEME_COLORS,
    type TransitionSpeed,
} from "../../../../store/useWorkStore";
import { TRANSITION_SPEED_LABELS } from "../../../../shared/ui";
import { cn } from "@/shared/lib/cn";

const { Text } = Typography;

interface SettingItemProps {
    title: string;
    description: string;
    action: React.ReactNode;
    is_mobile?: boolean;
}

function SettingItem({
    title,
    description,
    action,
    is_mobile,
}: SettingItemProps) {
    if (is_mobile) {
        return (
            <div className="py-md border-b border-[#f0f0f0] last:border-b-0">
                <div className="flex justify-between items-center mb-xs">
                    <Text strong className="!text-[13px]">
                        {title}
                    </Text>
                    {action}
                </div>
                <Text type="secondary" className="!text-[11px] !block">
                    {description}
                </Text>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between py-[14px] border-b border-[#fafafa] last:border-b-0">
            <div className="flex-1 min-w-0">
                <Text strong className="!text-[13px] !block !mb-[2px]">
                    {title}
                </Text>
                <Text type="secondary" className="!text-xs !leading-[1.4]">
                    {description}
                </Text>
            </div>
            <div className="shrink-0 ml-xl">{action}</div>
        </div>
    );
}

interface AnimationTabProps {
    is_mobile?: boolean;
}

/**
 * 애니메이션 탭 컴포넌트
 * 페이지 트랜지션, 애니메이션 효과 설정 관리
 */
export function AnimationTab({ is_mobile }: AnimationTabProps) {
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    // 트랜지션 설정
    const transition_enabled = useWorkStore(
        (state) => state.transition_enabled
    );
    const transition_speed = useWorkStore((state) => state.transition_speed);
    const setTransitionEnabled = useWorkStore(
        (state) => state.setTransitionEnabled
    );
    const setTransitionSpeed = useWorkStore(
        (state) => state.setTransitionSpeed
    );

    return (
        <div className={cn("flex flex-col", is_mobile ? "gap-lg" : "gap-xl")}>
            {/* 트랜지션 효과 섹션 */}
            <Card
                size="small"
                title={
                    <Space>
                        <ThunderboltOutlined style={{ color: theme_color }} />
                        <span>트랜지션 효과</span>
                    </Space>
                }
                styles={{ body: { padding: is_mobile ? "0 12px" : "0 16px" } }}
            >
                <SettingItem
                    title="페이지 진입 애니메이션"
                    description="페이지 로딩 후 UI가 슬라이드되며 나타납니다"
                    is_mobile={is_mobile}
                    action={
                        <Switch
                            checked={transition_enabled}
                            onChange={setTransitionEnabled}
                        />
                    }
                />
                <SettingItem
                    title="애니메이션 속도"
                    description="트랜지션 효과의 속도를 조절합니다"
                    is_mobile={is_mobile}
                    action={
                        <Select
                            value={transition_speed}
                            onChange={(value) =>
                                setTransitionSpeed(value as TransitionSpeed)
                            }
                            options={[
                                {
                                    value: "slow",
                                    label: TRANSITION_SPEED_LABELS.slow,
                                },
                                {
                                    value: "normal",
                                    label: TRANSITION_SPEED_LABELS.normal,
                                },
                                {
                                    value: "fast",
                                    label: TRANSITION_SPEED_LABELS.fast,
                                },
                            ]}
                            size="small"
                            style={{ width: is_mobile ? "100%" : 100 }}
                            disabled={!transition_enabled}
                        />
                    }
                />
            </Card>

            {/* 향후 추가될 애니메이션 설정을 위한 공간 */}
        </div>
    );
}

export default AnimationTab;
