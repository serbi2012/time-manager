/**
 * 데스크탑 일간 페이지
 */

import { Layout } from "antd";
import DailyGanttChart from "../../components/DailyGanttChart";
import WorkRecordTable from "../../components/WorkRecordTable";
import { DesktopSidebar } from "../../widgets/Navigation";
import { useRecordCreation } from "../../shared/hooks";
import {
    SlideIn,
    usePageTransitionContext,
    DESKTOP_DAILY_DELAYS,
} from "../../shared/ui";

const { Content } = Layout;

/**
 * 데스크탑 일간 페이지
 */
export function DesktopDailyPage() {
    const { createFromTemplate } = useRecordCreation();

    // 프리셋에서 작업 기록에만 추가 (타이머 없이)
    const handleAddRecordOnly = (template_id: string) => {
        createFromTemplate(template_id);
    };

    const { is_ready, transition_enabled, transition_speed } =
        usePageTransitionContext();

    return (
        <Layout className="app-body">
            <SlideIn
                direction="left"
                show={is_ready}
                delay={DESKTOP_DAILY_DELAYS.sidebar}
                enabled={transition_enabled}
                speed={transition_speed}
            >
                <DesktopSidebar on_add_record_only={handleAddRecordOnly} />
            </SlideIn>
            <Content className="app-content">
                <SlideIn
                    direction="top"
                    show={is_ready}
                    delay={DESKTOP_DAILY_DELAYS.gantt}
                    className="gantt-section"
                    enabled={transition_enabled}
                    speed={transition_speed}
                >
                    <DailyGanttChart />
                </SlideIn>
                <SlideIn
                    direction="bottom"
                    show={is_ready}
                    delay={DESKTOP_DAILY_DELAYS.table}
                    className="table-section"
                    enabled={transition_enabled}
                    speed={transition_speed}
                >
                    <WorkRecordTable />
                </SlideIn>
            </Content>
        </Layout>
    );
}

export default DesktopDailyPage;
