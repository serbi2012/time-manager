/**
 * GuideBook 전용 데모 컴포넌트 레지스트리
 * - 실제 store와 완전 격리
 * - 더미 데이터만 사용
 * - 읽기 전용 (인터랙션 비활성화)
 */

import { Typography } from "antd";
import { DEMO_COMPONENT_LABELS } from "@/features/guide/constants";
import { DemoWorkRecordTable } from "./DemoWorkRecordTable";
import { DemoWorkTemplateList } from "./DemoWorkTemplateList";
import { DemoDailyGanttChart } from "./DemoDailyGanttChart";
import {
    DemoEmptyState,
    DemoShortcutsTable,
    DemoSettingsPanel,
} from "./DemoMiscComponents";

const { Text } = Typography;

// eslint-disable-next-line react-refresh/only-export-components -- 데모 레지스트리
export const DEMO_COMPONENTS: Record<string, React.ComponentType> = {
    WorkRecordTable: DemoWorkRecordTable,
    WorkTemplateList: DemoWorkTemplateList,
    DailyGanttChart: DemoDailyGanttChart,
    EmptyState: DemoEmptyState,
    ShortcutsTable: DemoShortcutsTable,
    SettingsPanel: DemoSettingsPanel,
};

export function DemoRenderer({ componentName }: { componentName: string }) {
    const Component = DEMO_COMPONENTS[componentName];

    if (!Component) {
        return (
            <div className="demo-not-found">
                <Text type="secondary">
                    {DEMO_COMPONENT_LABELS.notFound(componentName)}
                </Text>
            </div>
        );
    }

    return (
        <div className="demo-wrapper">
            <div className="demo-badge">
                {DEMO_COMPONENT_LABELS.uiPreview}
            </div>
            <Component />
        </div>
    );
}
