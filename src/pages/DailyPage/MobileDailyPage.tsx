/**
 * 모바일 일간 페이지
 */

import { useState } from "react";
import { Layout } from "antd";
import DailyGanttChart from "../../components/DailyGanttChart";
import WorkRecordTable from "../../components/WorkRecordTable";
import { MobilePresetDrawer, MobilePresetFab } from "../../widgets/Navigation";
import { useWorkStore } from "../../store/useWorkStore";
import { useRecordCreation } from "../../shared/hooks";
import {
    SlideIn,
    FadeIn,
    usePageTransitionContext,
    MOBILE_DAILY_DELAYS,
} from "../../shared/ui";

const { Content } = Layout;

/**
 * 모바일 일간 페이지
 */
export function MobileDailyPage() {
    const [is_preset_drawer_open, setIsPresetDrawerOpen] = useState(false);
    const app_theme = useWorkStore((state) => state.app_theme);
    const { createFromTemplate } = useRecordCreation();

    // 프리셋에서 작업 기록에만 추가 (타이머 없이)
    const handleAddRecordOnly = (template_id: string) => {
        createFromTemplate(template_id);
        // 드로어 닫기
        setIsPresetDrawerOpen(false);
    };

    const { is_ready, transition_enabled, transition_speed } =
        usePageTransitionContext();

    return (
        <Layout className="app-body">
            <SlideIn
                direction="bottom"
                show={is_ready}
                delay={MOBILE_DAILY_DELAYS.content}
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
                enabled={transition_enabled}
                speed={transition_speed}
            >
                <Content className="app-content">
                    <div className="gantt-section">
                        <DailyGanttChart />
                    </div>
                    <div className="table-section">
                        <WorkRecordTable />
                    </div>
                </Content>
            </SlideIn>

            <FadeIn
                show={is_ready}
                delay={MOBILE_DAILY_DELAYS.content + 0.2}
                enabled={transition_enabled}
                speed={transition_speed}
            >
                <MobilePresetFab
                    on_open={() => setIsPresetDrawerOpen(true)}
                    app_theme={app_theme}
                />
            </FadeIn>

            <MobilePresetDrawer
                is_open={is_preset_drawer_open}
                on_close={() => setIsPresetDrawerOpen(false)}
                on_add_record_only={handleAddRecordOnly}
                app_theme={app_theme}
            />
        </Layout>
    );
}

export default MobileDailyPage;
