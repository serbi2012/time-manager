/**
 * HeaderNavPill 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HeaderNavPill } from "../../../../widgets/Header/HeaderNavPill";
import type { NavItem } from "../../../../widgets/Header/HeaderNavPill";

const mock_navigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mock_navigate,
    };
});

const mock_items: NavItem[] = [
    { key: "/", label: "일간 기록", icon: <span data-testid="icon-daily" /> },
    {
        key: "/weekly",
        label: "주간 일정",
        icon: <span data-testid="icon-weekly" />,
    },
    {
        key: "/guide",
        label: "설명서",
        icon: <span data-testid="icon-guide" />,
    },
];

describe("HeaderNavPill", () => {
    beforeEach(() => {
        mock_navigate.mockClear();
    });

    it("모든 네비게이션 항목이 렌더링됨", () => {
        render(
            <MemoryRouter>
                <HeaderNavPill items={mock_items} current_path="/" />
            </MemoryRouter>
        );

        expect(screen.getByText("일간 기록")).toBeInTheDocument();
        expect(screen.getByText("주간 일정")).toBeInTheDocument();
        expect(screen.getByText("설명서")).toBeInTheDocument();
    });

    it("항목 클릭 시 해당 경로로 네비게이션", () => {
        render(
            <MemoryRouter>
                <HeaderNavPill items={mock_items} current_path="/" />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("주간 일정"));
        expect(mock_navigate).toHaveBeenCalledWith("/weekly");
    });

    it("다른 항목 클릭 시에도 네비게이션 호출", () => {
        render(
            <MemoryRouter>
                <HeaderNavPill items={mock_items} current_path="/weekly" />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("설명서"));
        expect(mock_navigate).toHaveBeenCalledWith("/guide");
    });

    it("nav 요소로 렌더링됨", () => {
        render(
            <MemoryRouter>
                <HeaderNavPill items={mock_items} current_path="/" />
            </MemoryRouter>
        );

        expect(document.querySelector("nav")).toBeInTheDocument();
    });

    it("아이콘이 표시됨", () => {
        render(
            <MemoryRouter>
                <HeaderNavPill items={mock_items} current_path="/" />
            </MemoryRouter>
        );

        expect(screen.getByTestId("icon-daily")).toBeInTheDocument();
        expect(screen.getByTestId("icon-weekly")).toBeInTheDocument();
    });
});
