/**
 * HeaderContent 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HeaderContent } from "../../../../widgets/Header/HeaderContent";

const mock_navigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mock_navigate,
    };
});

describe("HeaderContent", () => {
    beforeEach(() => {
        mock_navigate.mockClear();
    });

    it("렌더링되어야 함", () => {
        render(
            <MemoryRouter>
                <HeaderContent />
            </MemoryRouter>
        );

        expect(screen.getByText("업무 관리")).toBeInTheDocument();
    });

    it("시계 아이콘이 표시되어야 함", () => {
        render(
            <MemoryRouter>
                <HeaderContent />
            </MemoryRouter>
        );

        const icon = document.querySelector("[aria-label='clock-circle']");
        expect(icon).toBeInTheDocument();
    });

    it("클릭 시 홈(/)으로 네비게이션", () => {
        render(
            <MemoryRouter>
                <HeaderContent />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("업무 관리"));
        expect(mock_navigate).toHaveBeenCalledWith("/");
    });

    it("커서 스타일이 pointer여야 함", () => {
        render(
            <MemoryRouter>
                <HeaderContent />
            </MemoryRouter>
        );

        const container = screen.getByText("업무 관리").closest("div");
        expect(container).toBeInTheDocument();
        expect(container?.className).toContain("cursor-pointer");
    });
});
