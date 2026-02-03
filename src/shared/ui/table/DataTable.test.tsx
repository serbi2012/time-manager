/**
 * DataTable 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, createDataTableColumnHelper } from "./DataTable";

// ============================================================================
// 테스트용 데이터 타입 및 목 데이터
// ============================================================================

interface TestData {
    id: string;
    name: string;
    age: number;
    email: string;
}

const mock_data: TestData[] = [
    { id: "1", name: "홍길동", age: 30, email: "hong@test.com" },
    { id: "2", name: "김철수", age: 25, email: "kim@test.com" },
    { id: "3", name: "이영희", age: 28, email: "lee@test.com" },
    { id: "4", name: "박지민", age: 35, email: "park@test.com" },
    { id: "5", name: "정수연", age: 22, email: "jung@test.com" },
];

const column_helper = createDataTableColumnHelper<TestData>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const test_columns: ColumnDef<TestData, any>[] = [
    column_helper.accessor("name", {
        header: "이름",
        cell: (info) => info.getValue(),
    }),
    column_helper.accessor("age", {
        header: "나이",
        cell: (info) => info.getValue(),
    }),
    column_helper.accessor("email", {
        header: "이메일",
        cell: (info) => info.getValue(),
    }),
];

// ============================================================================
// 기본 렌더링 테스트
// ============================================================================

describe("DataTable 기본 렌더링", () => {
    it("테이블이 렌더링된다", () => {
        render(<DataTable data={mock_data} columns={test_columns} />);

        // 헤더 확인
        expect(screen.getByText("이름")).toBeInTheDocument();
        expect(screen.getByText("나이")).toBeInTheDocument();
        expect(screen.getByText("이메일")).toBeInTheDocument();

        // 데이터 확인
        expect(screen.getByText("홍길동")).toBeInTheDocument();
        expect(screen.getByText("김철수")).toBeInTheDocument();
    });

    it("빈 데이터일 때 빈 상태 메시지가 표시된다", () => {
        render(
            <DataTable
                data={[]}
                columns={test_columns}
                emptyText="데이터가 없습니다"
            />
        );

        expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
    });

    it("로딩 상태가 표시된다", () => {
        render(
            <DataTable data={mock_data} columns={test_columns} loading={true} />
        );

        // Spin 컴포넌트가 렌더링되는지 확인
        const spinner = document.querySelector(".ant-spin-spinning");
        expect(spinner).toBeInTheDocument();
    });

    it("커스텀 빈 상태 메시지가 표시된다", () => {
        render(
            <DataTable
                data={[]}
                columns={test_columns}
                emptyText="조회된 결과가 없습니다"
            />
        );

        expect(screen.getByText("조회된 결과가 없습니다")).toBeInTheDocument();
    });
});

// ============================================================================
// 정렬 테스트
// ============================================================================

describe("DataTable 정렬", () => {
    it("정렬이 비활성화되면 정렬 아이콘이 표시되지 않는다", () => {
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enableSorting={false}
            />
        );

        // 정렬 아이콘이 없어야 함
        const sort_icons = document.querySelectorAll(
            ".anticon-caret-up, .anticon-caret-down, .anticon-minus"
        );
        expect(sort_icons.length).toBe(0);
    });

    it("정렬이 활성화되면 정렬 아이콘이 표시된다", () => {
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enableSorting={true}
            />
        );

        // 정렬 아이콘이 있어야 함 (각 컬럼당 1개)
        const sort_icons = document.querySelectorAll(".anticon-minus");
        expect(sort_icons.length).toBe(3); // 3개 컬럼
    });

    it("헤더 클릭 시 정렬이 변경된다", async () => {
        const on_sorting_change = vi.fn();
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enableSorting={true}
                onSortingChange={on_sorting_change}
            />
        );

        const name_header = screen.getByText("이름");
        fireEvent.click(name_header);

        expect(on_sorting_change).toHaveBeenCalled();
    });
});

// ============================================================================
// 페이지네이션 테스트
// ============================================================================

describe("DataTable 페이지네이션", () => {
    it("페이지네이션이 비활성화되면 페이지네이션이 표시되지 않는다", () => {
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enablePagination={false}
            />
        );

        // 페이지네이션이 없어야 함
        const pagination = document.querySelector(".ant-pagination");
        expect(pagination).not.toBeInTheDocument();
    });

    it("페이지네이션이 활성화되면 페이지네이션이 표시된다", () => {
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enablePagination={true}
                pageSize={2}
            />
        );

        // 페이지네이션이 있어야 함
        const pagination = document.querySelector(".ant-pagination");
        expect(pagination).toBeInTheDocument();
    });

    it("페이지 크기에 따라 데이터가 잘린다", () => {
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enablePagination={true}
                pageSize={2}
            />
        );

        // 첫 페이지에는 2개의 데이터만 표시
        expect(screen.getByText("홍길동")).toBeInTheDocument();
        expect(screen.getByText("김철수")).toBeInTheDocument();
        expect(screen.queryByText("이영희")).not.toBeInTheDocument();
    });
});

// ============================================================================
// 행 선택 테스트
// ============================================================================

describe("DataTable 행 선택", () => {
    it("행 선택이 비활성화되면 체크박스가 표시되지 않는다", () => {
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enableRowSelection={false}
            />
        );

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBe(0);
    });

    it("행 선택이 활성화되면 체크박스가 표시된다", () => {
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enableRowSelection={true}
                getRowId={(row) => row.id}
            />
        );

        // 헤더 체크박스 + 데이터 행 체크박스
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBe(6); // 1(헤더) + 5(데이터)
    });

    it("행 체크박스 클릭 시 선택 콜백이 호출된다", async () => {
        const on_selection_change = vi.fn();
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enableRowSelection={true}
                getRowId={(row) => row.id}
                onRowSelectionChange={on_selection_change}
            />
        );

        // 첫 번째 데이터 행의 체크박스 클릭
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        fireEvent.click(checkboxes[1]); // 첫 번째 데이터 행 (인덱스 0은 헤더)

        await waitFor(() => {
            expect(on_selection_change).toHaveBeenCalledWith([mock_data[0]]);
        });
    });

    it("전체 선택 체크박스가 동작한다", async () => {
        const on_selection_change = vi.fn();
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                enableRowSelection={true}
                enableMultiRowSelection={true}
                getRowId={(row) => row.id}
                onRowSelectionChange={on_selection_change}
            />
        );

        // 헤더 체크박스 클릭 (전체 선택)
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        fireEvent.click(checkboxes[0]);

        await waitFor(() => {
            expect(on_selection_change).toHaveBeenCalledWith(mock_data);
        });
    });
});

// ============================================================================
// 행 클릭 테스트
// ============================================================================

describe("DataTable 행 클릭", () => {
    it("행 클릭 시 콜백이 호출된다", async () => {
        const on_row_click = vi.fn();
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                onRowClick={on_row_click}
            />
        );

        const row = screen.getByText("홍길동").closest("tr");
        if (row) {
            fireEvent.click(row);
        }

        expect(on_row_click).toHaveBeenCalledWith(mock_data[0]);
    });

    it("행 더블클릭 시 콜백이 호출된다", async () => {
        const on_row_double_click = vi.fn();
        render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                onRowDoubleClick={on_row_double_click}
            />
        );

        const row = screen.getByText("홍길동").closest("tr");
        if (row) {
            fireEvent.doubleClick(row);
        }

        expect(on_row_double_click).toHaveBeenCalledWith(mock_data[0]);
    });
});

// ============================================================================
// 스타일 테스트
// ============================================================================

describe("DataTable 스타일", () => {
    it("size prop이 적용된다", () => {
        const { container } = render(
            <DataTable data={mock_data} columns={test_columns} size="small" />
        );

        const table = container.querySelector(".data-table-small");
        expect(table).toBeInTheDocument();
    });

    it("bordered prop이 적용된다", () => {
        const { container } = render(
            <DataTable
                data={mock_data}
                columns={test_columns}
                bordered={true}
            />
        );

        const wrapper = container.querySelector(".data-table-bordered");
        expect(wrapper).toBeInTheDocument();
    });

    it("striped prop이 적용된다", () => {
        const { container } = render(
            <DataTable data={mock_data} columns={test_columns} striped={true} />
        );

        const wrapper = container.querySelector(".data-table-striped");
        expect(wrapper).toBeInTheDocument();
    });
});

// ============================================================================
// createDataTableColumnHelper 테스트
// ============================================================================

describe("createDataTableColumnHelper", () => {
    it("컬럼 헬퍼가 생성된다", () => {
        const helper = createDataTableColumnHelper<TestData>();
        expect(helper).toBeDefined();
        expect(helper.accessor).toBeDefined();
        expect(helper.display).toBeDefined();
    });

    it("accessor 컬럼이 생성된다", () => {
        const helper = createDataTableColumnHelper<TestData>();
        const column = helper.accessor("name", {
            header: "이름",
        });

        expect(column).toBeDefined();
    });
});
