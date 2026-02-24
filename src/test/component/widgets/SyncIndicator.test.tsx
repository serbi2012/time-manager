/**
 * SyncIndicator 컴포넌트 테스트
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SyncIndicator } from "../../../widgets/SyncStatus/SyncIndicator";

const base_props = {
    show_sync_check: false,
    auth_loading: false,
};

describe("SyncIndicator", () => {
    describe("데스크탑", () => {
        it("동기화됨 상태에서 '동기화됨' 텍스트 표시", () => {
            render(
                <SyncIndicator
                    {...base_props}
                    sync_status="synced"
                    is_authenticated={true}
                    is_mobile={false}
                />
            );

            expect(screen.getByText("동기화됨")).toBeInTheDocument();
        });

        it("동기화 중 상태에서 '동기화 중' 텍스트 표시", () => {
            render(
                <SyncIndicator
                    {...base_props}
                    sync_status="syncing"
                    is_authenticated={true}
                    is_mobile={false}
                />
            );

            expect(screen.getByText("동기화 중")).toBeInTheDocument();
        });

        it("에러 상태에서 '오류' 텍스트 표시", () => {
            render(
                <SyncIndicator
                    {...base_props}
                    sync_status="error"
                    is_authenticated={true}
                    is_mobile={false}
                />
            );

            expect(screen.getByText("오류")).toBeInTheDocument();
        });

        it("비로그인 시 '게스트' 텍스트 표시", () => {
            render(
                <SyncIndicator
                    {...base_props}
                    sync_status="idle"
                    is_authenticated={false}
                    is_mobile={false}
                />
            );

            expect(screen.getByText("게스트")).toBeInTheDocument();
        });
    });

    describe("모바일", () => {
        it("비로그인 시 아이콘만 표시 (텍스트 없음)", () => {
            render(
                <SyncIndicator
                    {...base_props}
                    sync_status="idle"
                    is_authenticated={false}
                    is_mobile={true}
                />
            );

            expect(screen.queryByText("게스트")).not.toBeInTheDocument();
        });
    });

    it("auth_loading 중이고 비인증 시 null 반환", () => {
        const { container } = render(
            <SyncIndicator
                {...base_props}
                sync_status="idle"
                is_authenticated={false}
                auth_loading={true}
                is_mobile={false}
            />
        );

        expect(container.firstChild).toBeNull();
    });
});
