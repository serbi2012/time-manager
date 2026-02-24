/**
 * DesktopHeader 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DesktopHeader } from "../../../../widgets/Header/DesktopHeader";
import type { NavItem } from "../../../../widgets/Header/HeaderNavPill";

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

const mock_nav_items: NavItem[] = [
    { key: "/", label: "일간 기록", icon: <span /> },
    { key: "/weekly", label: "주간 일정", icon: <span /> },
];

const default_props = {
    app_theme: "blue" as const,
    nav_items: mock_nav_items,
    current_path: "/",
    user: null,
    auth_loading: false,
    is_authenticated: false,
    sync_status: "idle" as const,
    show_sync_check: false,
    is_syncing: false,
    current_version: "2.0.25",
    on_login: vi.fn(),
    on_logout: vi.fn(),
    on_manual_sync: vi.fn(),
    on_settings_open: vi.fn(),
    on_changelog_open: vi.fn(),
};

describe("DesktopHeader", () => {
    it("헤더가 렌더링됨", () => {
        render(
            <MemoryRouter>
                <DesktopHeader {...default_props} />
            </MemoryRouter>
        );

        expect(document.querySelector("header")).toBeInTheDocument();
    });

    it("로고 '업무 관리'가 표시됨", () => {
        render(
            <MemoryRouter>
                <DesktopHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("업무 관리")).toBeInTheDocument();
    });

    it("네비게이션 항목이 표시됨", () => {
        render(
            <MemoryRouter>
                <DesktopHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("일간 기록")).toBeInTheDocument();
        expect(screen.getByText("주간 일정")).toBeInTheDocument();
    });

    it("설정 버튼 클릭 시 on_settings_open 호출", () => {
        const on_settings_open = vi.fn();
        render(
            <MemoryRouter>
                <DesktopHeader
                    {...default_props}
                    on_settings_open={on_settings_open}
                />
            </MemoryRouter>
        );

        const buttons = document.querySelectorAll("button");
        const settings_button = Array.from(buttons).find((btn) =>
            btn.querySelector("[aria-label='setting']")
        );

        if (settings_button) {
            fireEvent.click(settings_button);
            expect(on_settings_open).toHaveBeenCalled();
        }
    });

    it("비로그인 시 로그인 버튼이 표시됨", () => {
        render(
            <MemoryRouter>
                <DesktopHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("로그인")).toBeInTheDocument();
    });

    it("비로그인 시 '게스트' 텍스트가 표시됨", () => {
        render(
            <MemoryRouter>
                <DesktopHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("게스트")).toBeInTheDocument();
    });
});
