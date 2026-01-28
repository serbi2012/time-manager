/**
 * MobileHeader 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MobileHeader } from "../../../../widgets/Header/MobileHeader";

// useNavigate 모킹
const mock_navigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mock_navigate,
    };
});

describe("MobileHeader", () => {
    const default_props = {
        app_theme: "blue" as const,
        user: null,
        auth_loading: false,
        is_authenticated: false,
        sync_status: "idle" as const,
        show_sync_check: false,
        is_syncing: false,
        on_login: vi.fn(),
        on_logout: vi.fn(),
        on_manual_sync: vi.fn(),
        on_settings_open: vi.fn(),
    };

    beforeEach(() => {
        mock_navigate.mockClear();
    });

    it("렌더링되어야 함", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <MobileHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("일간 기록")).toBeInTheDocument();
    });

    it("일간 페이지에서 '일간 기록' 표시", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <MobileHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("일간 기록")).toBeInTheDocument();
    });

    it("주간 페이지에서 '주간 일정' 표시", () => {
        render(
            <MemoryRouter initialEntries={["/weekly"]}>
                <MobileHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("주간 일정")).toBeInTheDocument();
    });

    it("건의사항 페이지에서 '건의사항' 표시", () => {
        render(
            <MemoryRouter initialEntries={["/suggestions"]}>
                <MobileHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("건의사항")).toBeInTheDocument();
    });

    it("설명서 페이지에서 '설명서' 표시", () => {
        render(
            <MemoryRouter initialEntries={["/guide"]}>
                <MobileHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("설명서")).toBeInTheDocument();
    });

    it("오늘 날짜가 표시되어야 함", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <MobileHeader {...default_props} />
            </MemoryRouter>
        );

        // 날짜 형식: "1월 28일 화요일"
        const today = new Date();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        const expected_text = `${month}월 ${date}일`;

        expect(screen.getByText(new RegExp(expected_text))).toBeInTheDocument();
    });

    it("로고 클릭 시 홈(/)으로 네비게이션", () => {
        render(
            <MemoryRouter initialEntries={["/weekly"]}>
                <MobileHeader {...default_props} />
            </MemoryRouter>
        );

        const logo_area = document.querySelector(".mobile-header-left");
        expect(logo_area).toBeInTheDocument();

        if (logo_area) {
            fireEvent.click(logo_area);
            expect(mock_navigate).toHaveBeenCalledWith("/");
        }
    });

    it("설정 버튼 클릭 시 on_settings_open 호출", () => {
        const on_settings_open = vi.fn();
        render(
            <MemoryRouter initialEntries={["/"]}>
                <MobileHeader {...default_props} on_settings_open={on_settings_open} />
            </MemoryRouter>
        );

        const settings_button = document.querySelector(".mobile-header-btn");
        expect(settings_button).toBeInTheDocument();

        if (settings_button) {
            fireEvent.click(settings_button);
            expect(on_settings_open).toHaveBeenCalled();
        }
    });

    it("알 수 없는 경로에서는 기본 '일간 기록' 표시", () => {
        render(
            <MemoryRouter initialEntries={["/unknown-path"]}>
                <MobileHeader {...default_props} />
            </MemoryRouter>
        );

        expect(screen.getByText("일간 기록")).toBeInTheDocument();
    });
});
