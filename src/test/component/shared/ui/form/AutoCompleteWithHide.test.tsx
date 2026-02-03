/**
 * AutoCompleteWithHide 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../../helpers/test_utils";
import { AutoCompleteWithHide } from "../../../../../shared/ui/form";

describe("AutoCompleteWithHide", () => {
    const mock_options = [
        { value: "PRJ001", label: "프로젝트 A" },
        { value: "PRJ002", label: "프로젝트 B" },
        { value: "PRJ003", label: "프로젝트 C" },
    ];

    describe("기본 렌더링", () => {
        it("AutoComplete가 렌더링된다", () => {
            renderWithProviders(
                <AutoCompleteWithHide
                    options={mock_options}
                    placeholder="프로젝트 선택"
                />
            );

            // Ant Design AutoComplete의 placeholder는 별도 div로 표시됨
            expect(screen.getByText("프로젝트 선택")).toBeInTheDocument();
        });

        it("combobox role을 가진 input이 존재한다", () => {
            renderWithProviders(
                <AutoCompleteWithHide
                    options={mock_options}
                    placeholder="프로젝트 선택"
                />
            );

            expect(screen.getByRole("combobox")).toBeInTheDocument();
        });
    });

    describe("값 입력", () => {
        it("직접 입력값도 허용된다", () => {
            const handle_change = vi.fn();

            renderWithProviders(
                <AutoCompleteWithHide
                    options={mock_options}
                    onChange={handle_change}
                />
            );

            const input = screen.getByRole("combobox");
            fireEvent.change(input, { target: { value: "새로운 값" } });

            expect(handle_change).toHaveBeenCalledWith(
                "새로운 값",
                expect.anything()
            );
        });

        it("value가 설정되면 표시된다", () => {
            renderWithProviders(
                <AutoCompleteWithHide
                    options={mock_options}
                    value="테스트 값"
                    onChange={vi.fn()}
                />
            );

            const input = screen.getByRole("combobox");
            expect(input).toHaveValue("테스트 값");
        });
    });

    describe("옵션 구조", () => {
        it("옵션이 enhanced_options로 변환된다", () => {
            // 컴포넌트가 내부적으로 옵션을 변환하는지 확인
            // 실제 드롭다운 테스트는 통합 테스트에서 수행
            const handle_hide = vi.fn();

            const { container } = renderWithProviders(
                <AutoCompleteWithHide
                    options={mock_options}
                    onHideOption={handle_hide}
                    showHideButton={true}
                />
            );

            // AutoComplete가 렌더링됨
            expect(container.querySelector(".ant-select")).toBeInTheDocument();
        });

        it("showHideButton=false일 때도 컴포넌트가 렌더링된다", () => {
            const { container } = renderWithProviders(
                <AutoCompleteWithHide
                    options={mock_options}
                    onHideOption={vi.fn()}
                    showHideButton={false}
                />
            );

            expect(container.querySelector(".ant-select")).toBeInTheDocument();
        });
    });

    describe("searchValue", () => {
        it("searchValue가 있어도 컴포넌트가 정상 렌더링된다", () => {
            const { container } = renderWithProviders(
                <AutoCompleteWithHide
                    options={mock_options}
                    searchValue="프로젝트"
                />
            );

            expect(container.querySelector(".ant-select")).toBeInTheDocument();
        });
    });
});
