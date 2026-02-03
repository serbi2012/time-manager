/**
 * DataTable Storybook 스토리
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button, Space, Tag, message } from "antd";
import type { SortingState, ColumnDef } from "@tanstack/react-table";
import { DataTable, createDataTableColumnHelper } from "./DataTable";

// ============================================================================
// 테스트 데이터
// ============================================================================

interface WorkRecord {
    id: string;
    project_code: string;
    work_name: string;
    task_name: string;
    duration_minutes: number;
    status: "진행중" | "완료" | "대기";
    date: string;
}

const mock_records: WorkRecord[] = [
    {
        id: "1",
        project_code: "A25_01846",
        work_name: "5.6 프레임워크 FE",
        task_name: "개발",
        duration_minutes: 120,
        status: "진행중",
        date: "2026-02-03",
    },
    {
        id: "2",
        project_code: "A25_01847",
        work_name: "API 설계",
        task_name: "분석",
        duration_minutes: 60,
        status: "완료",
        date: "2026-02-03",
    },
    {
        id: "3",
        project_code: "A25_01848",
        work_name: "DB 마이그레이션",
        task_name: "개발",
        duration_minutes: 180,
        status: "대기",
        date: "2026-02-02",
    },
    {
        id: "4",
        project_code: "A25_01849",
        work_name: "문서화 작업",
        task_name: "문서",
        duration_minutes: 90,
        status: "진행중",
        date: "2026-02-02",
    },
    {
        id: "5",
        project_code: "A25_01850",
        work_name: "코드 리뷰",
        task_name: "리뷰",
        duration_minutes: 45,
        status: "완료",
        date: "2026-02-01",
    },
    {
        id: "6",
        project_code: "A25_01851",
        work_name: "버그 수정",
        task_name: "개발",
        duration_minutes: 150,
        status: "진행중",
        date: "2026-02-01",
    },
    {
        id: "7",
        project_code: "A25_01852",
        work_name: "테스트 작성",
        task_name: "테스트",
        duration_minutes: 200,
        status: "대기",
        date: "2026-01-31",
    },
    {
        id: "8",
        project_code: "A25_01853",
        work_name: "배포 준비",
        task_name: "배포",
        duration_minutes: 30,
        status: "완료",
        date: "2026-01-31",
    },
];

const column_helper = createDataTableColumnHelper<WorkRecord>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<WorkRecord, any>[] = [
    column_helper.accessor("project_code", {
        header: "프로젝트 코드",
        cell: (info) => <code>{info.getValue()}</code>,
        size: 120,
    }),
    column_helper.accessor("work_name", {
        header: "작업명",
        cell: (info) => info.getValue(),
    }),
    column_helper.accessor("task_name", {
        header: "업무명",
        cell: (info) => <Tag>{info.getValue()}</Tag>,
        size: 80,
    }),
    column_helper.accessor("duration_minutes", {
        header: "소요시간",
        cell: (info) => {
            const minutes = info.getValue() as number;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
        },
        size: 100,
    }),
    column_helper.accessor("status", {
        header: "상태",
        cell: (info) => {
            const status = info.getValue() as "진행중" | "완료" | "대기";
            const color_map: Record<string, string> = {
                진행중: "processing",
                완료: "success",
                대기: "default",
            };
            return <Tag color={color_map[status]}>{status}</Tag>;
        },
        size: 80,
    }),
    column_helper.accessor("date", {
        header: "날짜",
        cell: (info) => info.getValue(),
        size: 100,
    }),
];

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof DataTable<WorkRecord>> = {
    title: "Shared/Table/DataTable",
    component: DataTable,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "@tanstack/react-table 기반 공통 테이블 컴포넌트입니다. WorkRecordTable, AdminSessionGrid 등에서 중복되던 테이블 패턴을 통합했습니다.",
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// 스토리
// ============================================================================

/**
 * 기본 테이블
 */
export const Default: Story = {
    render: () => <DataTable data={mock_records} columns={columns} bordered />,
};

/**
 * 정렬 활성화
 */
export const WithSorting: Story = {
    render: () => {
        const [sorting, setSorting] = useState<SortingState>([]);

        return (
            <div>
                <div style={{ marginBottom: 16 }}>
                    현재 정렬: {JSON.stringify(sorting)}
                </div>
                <DataTable
                    data={mock_records}
                    columns={columns}
                    enableSorting
                    onSortingChange={setSorting}
                    bordered
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: "헤더를 클릭하여 정렬할 수 있습니다.",
            },
        },
    },
};

/**
 * 페이지네이션 활성화
 */
export const WithPagination: Story = {
    render: () => (
        <DataTable
            data={mock_records}
            columns={columns}
            enablePagination
            pageSize={3}
            bordered
        />
    ),
    parameters: {
        docs: {
            description: {
                story: "페이지네이션이 활성화된 테이블입니다.",
            },
        },
    },
};

/**
 * 행 선택 활성화
 */
export const WithRowSelection: Story = {
    render: () => {
        const [selectedRows, setSelectedRows] = useState<WorkRecord[]>([]);

        return (
            <div>
                <div style={{ marginBottom: 16 }}>
                    선택된 행: {selectedRows.length}개
                    {selectedRows.length > 0 && (
                        <span style={{ marginLeft: 8 }}>
                            ({selectedRows.map((r) => r.work_name).join(", ")})
                        </span>
                    )}
                </div>
                <DataTable
                    data={mock_records}
                    columns={columns}
                    enableRowSelection
                    getRowId={(row) => row.id}
                    onRowSelectionChange={setSelectedRows}
                    bordered
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: "행을 선택할 수 있습니다. 헤더 체크박스로 전체 선택도 가능합니다.",
            },
        },
    },
};

/**
 * 행 클릭 이벤트
 */
export const WithRowClick: Story = {
    render: () => (
        <DataTable
            data={mock_records}
            columns={columns}
            onRowClick={(row) => message.info(`클릭: ${row.work_name}`)}
            onRowDoubleClick={(row) =>
                message.success(`더블클릭: ${row.work_name}`)
            }
            bordered
            hoverable
        />
    ),
    parameters: {
        docs: {
            description: {
                story: "행 클릭/더블클릭 이벤트를 처리할 수 있습니다.",
            },
        },
    },
};

/**
 * 모든 기능 활성화
 */
export const FullFeatured: Story = {
    render: () => {
        const [selectedRows, setSelectedRows] = useState<WorkRecord[]>([]);

        const handleDelete = () => {
            if (selectedRows.length === 0) {
                message.warning("선택된 항목이 없습니다");
                return;
            }
            message.success(`${selectedRows.length}개 항목 삭제`);
        };

        return (
            <div>
                <Space style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        danger
                        disabled={selectedRows.length === 0}
                        onClick={handleDelete}
                    >
                        선택 삭제 ({selectedRows.length})
                    </Button>
                </Space>
                <DataTable
                    data={mock_records}
                    columns={columns}
                    enableSorting
                    enablePagination
                    enableRowSelection
                    pageSize={5}
                    getRowId={(row) => row.id}
                    onRowSelectionChange={setSelectedRows}
                    onRowClick={(row) => message.info(`${row.work_name} 선택`)}
                    bordered
                    striped
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: "정렬, 페이지네이션, 행 선택, 행 클릭 모든 기능이 활성화된 테이블입니다.",
            },
        },
    },
};

/**
 * 빈 상태
 */
export const Empty: Story = {
    render: () => (
        <DataTable
            data={[]}
            columns={columns}
            emptyText="작업 기록이 없습니다"
            bordered
        />
    ),
};

/**
 * 로딩 상태
 */
export const Loading: Story = {
    render: () => (
        <DataTable data={mock_records} columns={columns} loading bordered />
    ),
};

/**
 * 작은 크기
 */
export const SmallSize: Story = {
    render: () => (
        <DataTable
            data={mock_records}
            columns={columns}
            size="small"
            bordered
        />
    ),
};

/**
 * 줄무늬 배경
 */
export const Striped: Story = {
    render: () => (
        <DataTable data={mock_records} columns={columns} striped bordered />
    ),
};
