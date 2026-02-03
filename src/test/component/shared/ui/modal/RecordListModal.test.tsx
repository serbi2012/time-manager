/**
 * RecordListModal 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { renderWithProviders } from "../../../../helpers/test_utils";
import { RecordListModal } from "../../../../../shared/ui/modal";

interface TestRecord {
    id: string;
    name: string;
    status: string;
}

const mock_records: TestRecord[] = [
    { id: "1", name: "레코드 1", status: "완료" },
    { id: "2", name: "레코드 2", status: "진행중" },
    { id: "3", name: "레코드 3", status: "대기" },
];

const columns: ColumnsType<TestRecord> = [
    { title: "이름", dataIndex: "name", key: "name" },
    { title: "상태", dataIndex: "status", key: "status" },
];

describe("RecordListModal", () => {
    describe("기본 렌더링", () => {
        it("title이 표시된다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={mock_records}
                    columns={columns}
                />
            );

            expect(screen.getByText("레코드 목록")).toBeInTheDocument();
        });

        it("레코드 목록이 테이블에 표시된다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={mock_records}
                    columns={columns}
                />
            );

            expect(screen.getByText("레코드 1")).toBeInTheDocument();
            expect(screen.getByText("레코드 2")).toBeInTheDocument();
            expect(screen.getByText("레코드 3")).toBeInTheDocument();
        });

        it("레코드 수가 표시된다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={mock_records}
                    columns={columns}
                    countText="개의 레코드"
                />
            );

            expect(screen.getByText("총 3개의 레코드")).toBeInTheDocument();
        });
    });

    describe("빈 상태", () => {
        it("records가 비어있을 때 Empty가 표시된다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={[]}
                    columns={columns}
                    emptyText="데이터가 없습니다"
                />
            );

            expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
        });

        it("커스텀 emptyText가 적용된다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={[]}
                    columns={columns}
                    emptyText="완료된 작업이 없습니다"
                />
            );

            expect(
                screen.getByText("완료된 작업이 없습니다")
            ).toBeInTheDocument();
        });
    });

    describe("검색 기능", () => {
        it("showSearch=true일 때 검색창이 표시된다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={mock_records}
                    columns={columns}
                    showSearch={true}
                    searchValue=""
                    onSearchChange={vi.fn()}
                    searchPlaceholder="검색..."
                />
            );

            expect(screen.getByPlaceholderText("검색...")).toBeInTheDocument();
        });

        it("검색어 입력 시 onSearchChange가 호출된다", () => {
            const handle_search = vi.fn();

            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={mock_records}
                    columns={columns}
                    showSearch={true}
                    searchValue=""
                    onSearchChange={handle_search}
                />
            );

            const search_input = screen.getByRole("textbox");
            fireEvent.change(search_input, { target: { value: "레코드" } });

            expect(handle_search).toHaveBeenCalledWith("레코드");
        });
    });

    describe("헤더 추가 요소", () => {
        it("headerExtra가 렌더링된다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={mock_records}
                    columns={columns}
                    headerExtra={<Button>추가 버튼</Button>}
                />
            );

            expect(screen.getByText("추가 버튼")).toBeInTheDocument();
        });
    });

    describe("모달 닫기", () => {
        it("닫기 버튼 클릭 시 onClose가 호출된다", () => {
            const handle_close = vi.fn();

            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={handle_close}
                    records={mock_records}
                    columns={columns}
                />
            );

            const close_button = document.querySelector(".ant-modal-close");
            if (close_button) {
                fireEvent.click(close_button);
            }

            expect(handle_close).toHaveBeenCalled();
        });
    });

    describe("페이지네이션", () => {
        it("pageSize가 적용된다", () => {
            // 15개 레코드 생성
            const many_records = Array.from({ length: 15 }, (_, i) => ({
                id: String(i + 1),
                name: `레코드 ${i + 1}`,
                status: "완료",
            }));

            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={many_records}
                    columns={columns}
                    pageSize={5}
                />
            );

            // 첫 페이지에는 5개만 표시
            expect(screen.getByText("레코드 1")).toBeInTheDocument();
            expect(screen.getByText("레코드 5")).toBeInTheDocument();
            // 6번째는 다음 페이지에
            expect(screen.queryByText("레코드 6")).not.toBeInTheDocument();
        });
    });

    describe("테이블 크기", () => {
        it("기본 크기는 small이다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={mock_records}
                    columns={columns}
                />
            );

            const table = document.querySelector(".ant-table-small");
            expect(table).toBeInTheDocument();
        });

        it("middle 크기가 적용된다", () => {
            renderWithProviders(
                <RecordListModal
                    title="레코드 목록"
                    open={true}
                    onClose={vi.fn()}
                    records={mock_records}
                    columns={columns}
                    tableSize="middle"
                />
            );

            const table = document.querySelector(".ant-table-middle");
            expect(table).toBeInTheDocument();
        });
    });
});
