/**
 * SelectWithAdd 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../helpers/test_utils";
import { SelectWithAdd } from "../../../../../shared/ui/form";

describe("SelectWithAdd", () => {
    const mock_options = [
        { value: "option1", label: "옵션 1" },
        { value: "option2", label: "옵션 2" },
        { value: "option3", label: "옵션 3" },
    ];

    describe("기본 렌더링", () => {
        it("placeholder가 표시된다", () => {
            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    placeholder="선택하세요"
                />
            );

            expect(screen.getByText("선택하세요")).toBeInTheDocument();
        });

        it("옵션들이 드롭다운에 표시된다", async () => {
            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    placeholder="선택하세요"
                />
            );

            // 드롭다운 열기
            fireEvent.mouseDown(screen.getByRole("combobox"));

            await waitFor(() => {
                expect(screen.getByText("옵션 1")).toBeInTheDocument();
                expect(screen.getByText("옵션 2")).toBeInTheDocument();
                expect(screen.getByText("옵션 3")).toBeInTheDocument();
            });
        });
    });

    describe("새 옵션 추가", () => {
        it("추가 영역이 드롭다운 하단에 표시된다", async () => {
            const handle_add = vi.fn();

            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    onAddOption={handle_add}
                    addPlaceholder="새 항목"
                />
            );

            // 드롭다운 열기
            fireEvent.mouseDown(screen.getByRole("combobox"));

            await waitFor(() => {
                expect(
                    screen.getByPlaceholderText("새 항목")
                ).toBeInTheDocument();
                expect(screen.getByText("추가")).toBeInTheDocument();
            });
        });

        it("추가 버튼 클릭 시 onAddOption이 호출된다", async () => {
            const handle_add = vi.fn();

            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    onAddOption={handle_add}
                    addPlaceholder="새 항목"
                />
            );

            // 드롭다운 열기
            fireEvent.mouseDown(screen.getByRole("combobox"));

            await waitFor(() => {
                expect(
                    screen.getByPlaceholderText("새 항목")
                ).toBeInTheDocument();
            });

            // 새 항목 입력
            const input = screen.getByPlaceholderText("새 항목");
            fireEvent.change(input, { target: { value: "새 옵션" } });

            // 추가 버튼 클릭
            fireEvent.click(screen.getByText("추가"));

            expect(handle_add).toHaveBeenCalledWith("새 옵션");
        });

        it("빈 값은 추가되지 않는다", async () => {
            const handle_add = vi.fn();

            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    onAddOption={handle_add}
                    addPlaceholder="새 항목"
                />
            );

            // 드롭다운 열기
            fireEvent.mouseDown(screen.getByRole("combobox"));

            await waitFor(() => {
                expect(screen.getByText("추가")).toBeInTheDocument();
            });

            // 빈 상태로 추가 버튼 클릭
            fireEvent.click(screen.getByText("추가"));

            expect(handle_add).not.toHaveBeenCalled();
        });

        it("showAddArea=false일 때 추가 영역이 표시되지 않는다", async () => {
            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    onAddOption={vi.fn()}
                    showAddArea={false}
                />
            );

            // 드롭다운 열기
            fireEvent.mouseDown(screen.getByRole("combobox"));

            await waitFor(() => {
                expect(screen.getByText("옵션 1")).toBeInTheDocument();
            });

            expect(
                screen.queryByPlaceholderText("새 항목")
            ).not.toBeInTheDocument();
        });
    });

    describe("옵션 숨기기", () => {
        it("showHideButton=true일 때 각 옵션에 숨기기 버튼이 표시된다", async () => {
            const handle_hide = vi.fn();

            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    onHideOption={handle_hide}
                    showHideButton={true}
                />
            );

            // 드롭다운 열기
            fireEvent.mouseDown(screen.getByRole("combobox"));

            await waitFor(() => {
                // CloseOutlined 아이콘이 있는지 확인 (3개 옵션 각각에)
                const close_icons = document.querySelectorAll(".anticon-close");
                expect(close_icons.length).toBeGreaterThanOrEqual(3);
            });
        });

        it("showHideButton=false일 때 숨기기 버튼이 표시되지 않는다", async () => {
            const handle_hide = vi.fn();

            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    onHideOption={handle_hide}
                    showHideButton={false}
                />
            );

            // 드롭다운 열기
            fireEvent.mouseDown(screen.getByRole("combobox"));

            await waitFor(() => {
                expect(screen.getByText("옵션 1")).toBeInTheDocument();
            });

            const close_icons = document.querySelectorAll(".anticon-close");
            expect(close_icons.length).toBe(0);
        });
    });

    describe("값 선택", () => {
        it("옵션 선택 시 onChange가 호출된다", async () => {
            const handle_change = vi.fn();

            renderWithProviders(
                <SelectWithAdd
                    options={mock_options}
                    onChange={handle_change}
                />
            );

            // 드롭다운 열기
            fireEvent.mouseDown(screen.getByRole("combobox"));

            await waitFor(() => {
                expect(screen.getByText("옵션 1")).toBeInTheDocument();
            });

            // 옵션 선택
            fireEvent.click(screen.getByText("옵션 1"));

            expect(handle_change).toHaveBeenCalled();
        });
    });
});
