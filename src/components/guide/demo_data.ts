/**
 * 데모 컴포넌트 공용 더미 데이터 (store와 완전 격리)
 */

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
        work_name: "5.6 프레임워크 FE",
        deal_name: "컴포넌트 개발",
        task_name: "개발",
        category_name: "개발",
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
        work_name: "5.6 프레임워크 FE",
        deal_name: "API 연동 작업",
        task_name: "개발",
        category_name: "개발",
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
        work_name: "관리업무",
        deal_name: "주간회의",
        task_name: "기타",
        category_name: "회의",
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
        work_name: "5.6 프레임워크 FE",
        deal_name: "컴포넌트 개발",
        task_name: "개발",
        category_name: "개발",
        project_code: "A25_01846",
        color: "var(--color-primary)",
    },
    {
        id: "2",
        work_name: "5.6 프레임워크 BE",
        deal_name: "API 설계",
        task_name: "설계",
        category_name: "개발",
        color: "var(--color-success)",
    },
    {
        id: "3",
        work_name: "관리업무",
        deal_name: "주간회의",
        task_name: "기타",
        category_name: "회의",
        project_code: "A00_00000",
        color: "var(--color-warning)",
    },
];

export function getCategoryColor(category: string): string {
    const color_map: Record<string, string> = {
        개발: "green",
        문서작업: "orange",
        회의: "purple",
        환경세팅: "cyan",
        코드리뷰: "magenta",
        테스트: "blue",
        기타: "default",
    };
    return color_map[category] || "default";
}
