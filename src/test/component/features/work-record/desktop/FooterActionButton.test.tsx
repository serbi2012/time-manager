/**
 * FooterActionButton 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FooterActionButton } from "../../../../../features/work-record/ui/Desktop/FooterActionButton";

describe("FooterActionButton", () => {
    const default_props = {
        icon: <span data-testid="test-icon">icon</span>,
        label: "테스트 버튼",
        onClick: vi.fn(),
    };

    it("라벨이 렌더링된다", () => {
        render(<FooterActionButton {...default_props} />);

        expect(screen.getByText("테스트 버튼")).toBeInTheDocument();
    });

    it("아이콘이 렌더링된다", () => {
        render(<FooterActionButton {...default_props} />);

        expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("클릭 시 onClick 핸들러가 호출된다", () => {
        const on_click = vi.fn();
        render(<FooterActionButton {...default_props} onClick={on_click} />);

        fireEvent.click(screen.getByText("테스트 버튼"));

        expect(on_click).toHaveBeenCalledTimes(1);
    });

    it("button 요소로 렌더링된다", () => {
        render(<FooterActionButton {...default_props} />);

        expect(
            screen.getByRole("button", { name: /테스트 버튼/ })
        ).toBeInTheDocument();
    });
});
