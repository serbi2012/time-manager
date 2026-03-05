/**
 * 데모 컴포넌트 공용 더미 데이터 (store와 완전 격리)
 */

import { DEMO_DATA_LABELS } from "@/features/guide/constants";

export interface DemoRecord {
    id: string;
    project_code: string;
    work_name: string;
    deal_name: string;
    task_name: string;
    category_name: string;
    duration_minutes: number;
    start_time: string;
    end_time: string;
    date: string;
    is_running: boolean;
    is_completed: boolean;
}

export interface DemoTemplate {
    id: string;
    work_name: string;
    deal_name: string;
    task_name: string;
    category_name: string;
    project_code?: string;
    color: string;
}

export const DEMO_RECORDS: DemoRecord[] = [
    {
        id: "1",
        project_code: "A25_01846",
        work_name: DEMO_DATA_LABELS.frameworkFE,
        deal_name: DEMO_DATA_LABELS.componentDev,
        task_name: DEMO_DATA_LABELS.dev,
        category_name: DEMO_DATA_LABELS.dev,
        duration_minutes: 90,
        start_time: "09:00",
        end_time: "10:30",
        date: "2026-02-11",
        is_running: false,
        is_completed: false,
    },
    {
        id: "2",
        project_code: "A25_01846",
        work_name: DEMO_DATA_LABELS.frameworkFE,
        deal_name: DEMO_DATA_LABELS.apiIntegration,
        task_name: DEMO_DATA_LABELS.dev,
        category_name: DEMO_DATA_LABELS.dev,
        duration_minutes: 45,
        start_time: "10:30",
        end_time: "",
        date: "2026-02-11",
        is_running: true,
        is_completed: false,
    },
    {
        id: "3",
        project_code: "A00_00000",
        work_name: DEMO_DATA_LABELS.management,
        deal_name: DEMO_DATA_LABELS.weeklyMeeting,
        task_name: DEMO_DATA_LABELS.etc,
        category_name: DEMO_DATA_LABELS.meeting,
        duration_minutes: 30,
        start_time: "14:00",
        end_time: "14:30",
        date: "2026-02-11",
        is_running: false,
        is_completed: true,
    },
];

export const DEMO_TEMPLATES: DemoTemplate[] = [
    {
        id: "1",
        work_name: DEMO_DATA_LABELS.frameworkFE,
        deal_name: DEMO_DATA_LABELS.componentDev,
        task_name: DEMO_DATA_LABELS.dev,
        category_name: DEMO_DATA_LABELS.dev,
        project_code: "A25_01846",
        color: "var(--color-primary)",
    },
    {
        id: "2",
        work_name: DEMO_DATA_LABELS.frameworkBE,
        deal_name: DEMO_DATA_LABELS.apiDesign,
        task_name: DEMO_DATA_LABELS.design,
        category_name: DEMO_DATA_LABELS.dev,
        color: "var(--color-success)",
    },
    {
        id: "3",
        work_name: DEMO_DATA_LABELS.management,
        deal_name: DEMO_DATA_LABELS.weeklyMeeting,
        task_name: DEMO_DATA_LABELS.etc,
        category_name: DEMO_DATA_LABELS.meeting,
        project_code: "A00_00000",
        color: "var(--color-warning)",
    },
];

export function getCategoryColor(category: string): string {
    const color_map: Record<string, string> = {
        [DEMO_DATA_LABELS.dev]: "green",
        [DEMO_DATA_LABELS.docs]: "orange",
        [DEMO_DATA_LABELS.meeting]: "purple",
        [DEMO_DATA_LABELS.envSetup]: "cyan",
        [DEMO_DATA_LABELS.codeReview]: "magenta",
        [DEMO_DATA_LABELS.test]: "blue",
        [DEMO_DATA_LABELS.etc]: "default",
    };
    return color_map[category] || "default";
}
