/**
 * 모바일 일간 페이지
 */

import { useState } from "react";
import { Layout, message } from "antd";
import DailyGanttChart from "../../components/DailyGanttChart";
import WorkRecordTable from "../../components/WorkRecordTable";
import { MobilePresetDrawer, MobilePresetFab } from "../../widgets/Navigation";
import { useWorkStore } from "../../store/useWorkStore";

const { Content } = Layout;

/**
 * 모바일 일간 페이지
 */
export function MobileDailyPage() {
    const [is_preset_drawer_open, setIsPresetDrawerOpen] = useState(false);
    const app_theme = useWorkStore((state) => state.app_theme);

    // 프리셋에서 작업 기록에만 추가 (타이머 없이)
    const handleAddRecordOnly = (template_id: string) => {
        const state = useWorkStore.getState();
        const template = state.templates.find((t) => t.id === template_id);
        if (!template) return;

        let deal_name = template.deal_name || "작업";

        if (state.use_postfix_on_preset_add) {
            const now = new Date();
            const random_suffix = Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0");
            const unique_id = `${String(now.getMonth() + 1).padStart(
                2,
                "0"
            )}${String(now.getDate()).padStart(2, "0")}_${String(
                now.getHours()
            ).padStart(2, "0")}${String(now.getMinutes()).padStart(
                2,
                "0"
            )}${String(now.getSeconds()).padStart(2, "0")}_${random_suffix}`;
            deal_name = template.deal_name
                ? `${template.deal_name}_${unique_id}`
                : `작업_${unique_id}`;
        } else {
            const base_deal_name = deal_name;
            const existing_records = state.records.filter(
                (r) =>
                    !r.is_deleted &&
                    !r.is_completed &&
                    r.work_name === template.work_name &&
                    (r.deal_name === base_deal_name ||
                        r.deal_name.match(
                            new RegExp(`^${base_deal_name} \\(\\d+\\)$`)
                        ))
            );

            if (existing_records.length > 0) {
                let max_num = 1;
                existing_records.forEach((r) => {
                    const match = r.deal_name.match(/\((\d+)\)$/);
                    if (match) {
                        max_num = Math.max(max_num, parseInt(match[1]));
                    }
                });
                deal_name = `${base_deal_name} (${max_num + 1})`;
            }
        }

        // 선택된 날짜에 작업 추가 (달력에서 다른 날짜를 보고 있으면 해당 날짜에 추가)
        const target_date = state.selected_date;

        const new_record = {
            id: crypto.randomUUID(),
            project_code: template.project_code || "A00_00000",
            work_name: template.work_name,
            task_name: template.task_name,
            deal_name: deal_name,
            category_name: template.category_name,
            note: template.note,
            duration_minutes: 0,
            start_time: "",
            end_time: "",
            date: target_date,
            sessions: [],
            is_completed: false,
            is_deleted: false,
        };

        useWorkStore.getState().addRecord(new_record);
        message.success(`"${template.work_name}" 작업이 추가되었습니다`);

        // 드로어 닫기
        setIsPresetDrawerOpen(false);
    };

    return (
        <Layout className="app-body">
            <Content className="app-content">
                <div className="gantt-section">
                    <DailyGanttChart />
                </div>
                <div className="table-section">
                    <WorkRecordTable />
                </div>
            </Content>

            <MobilePresetFab
                on_open={() => setIsPresetDrawerOpen(true)}
                app_theme={app_theme}
            />

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
