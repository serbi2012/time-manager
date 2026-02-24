/**
 * UserMenu 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserMenu } from "../../../../widgets/Header/UserMenu";

const base_props = {
    user: null,
    auth_loading: false,
    is_authenticated: false,
    is_mobile: false,
    is_syncing: false,
    on_login: vi.fn(),
    on_logout: vi.fn(),
    on_manual_sync: vi.fn(),
};

describe("UserMenu", () => {
    describe("비로그인 데스크탑", () => {
        it("'로그인' 버튼이 표시됨", () => {
            render(<UserMenu {...base_props} />);

            expect(screen.getByText("로그인")).toBeInTheDocument();
        });

        it("로그인 버튼 클릭 시 on_login 호출", () => {
            const on_login = vi.fn();
            render(<UserMenu {...base_props} on_login={on_login} />);

            fireEvent.click(screen.getByText("로그인"));
            expect(on_login).toHaveBeenCalled();
        });
    });

    describe("비로그인 모바일", () => {
        it("모바일에서는 Ant Design Button으로 렌더링", () => {
            render(<UserMenu {...base_props} is_mobile={true} />);

            const button = document.querySelector(".ant-btn");
            expect(button).toBeInTheDocument();
        });
    });

    describe("로딩 중", () => {
        it("auth_loading 시 스피너 표시", () => {
            render(<UserMenu {...base_props} auth_loading={true} />);

            const spinner = document.querySelector(".ant-spin");
            expect(spinner).toBeInTheDocument();
        });
    });

    describe("로그인 상태", () => {
        const mock_user = {
            displayName: "테스트 사용자",
            email: "test@example.com",
            photoURL: null,
        } as unknown as import("firebase/auth").User;

        it("아바타가 표시됨", () => {
            render(
                <UserMenu
                    {...base_props}
                    user={mock_user}
                    is_authenticated={true}
                />
            );

            const avatar = document.querySelector(".ant-avatar");
            expect(avatar).toBeInTheDocument();
        });

        it("유저명 텍스트는 표시되지 않음 (아바타만)", () => {
            render(
                <UserMenu
                    {...base_props}
                    user={mock_user}
                    is_authenticated={true}
                />
            );

            expect(screen.queryByText("테스트 사용자")).not.toBeInTheDocument();
        });
    });
});
