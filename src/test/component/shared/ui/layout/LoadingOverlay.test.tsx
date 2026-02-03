/**
 * LoadingOverlay 컴포넌트 테스트
 */

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../helpers/test_utils";
import { LoadingOverlay } from "../../../../../shared/ui/layout";

describe("LoadingOverlay", () => {
    describe("기본 렌더링", () => {
        it("loading=true일 때 오버레이가 표시된다", () => {
            renderWithProviders(<LoadingOverlay loading={true} />);

            expect(screen.getByText("로딩 중...")).toBeInTheDocument();
        });

        it("loading=false일 때 오버레이가 표시되지 않는다", () => {
            renderWithProviders(<LoadingOverlay loading={false} />);

            expect(screen.queryByText("로딩 중...")).not.toBeInTheDocument();
        });

        it("커스텀 message가 표시된다", () => {
            renderWithProviders(
                <LoadingOverlay
                    loading={true}
                    message="데이터를 불러오는 중..."
                />
            );

            expect(
                screen.getByText("데이터를 불러오는 중...")
            ).toBeInTheDocument();
        });
    });

    describe("Spin 컴포넌트", () => {
        it("Spin이 렌더링된다", () => {
            renderWithProviders(<LoadingOverlay loading={true} />);

            // Ant Design Spin은 .ant-spin 클래스를 가짐
            const spin = document.querySelector(".ant-spin");
            expect(spin).toBeInTheDocument();
        });

        it("기본 크기는 large이다", () => {
            renderWithProviders(<LoadingOverlay loading={true} />);

            const spin = document.querySelector(".ant-spin-lg");
            expect(spin).toBeInTheDocument();
        });

        it("spinSize가 적용된다", () => {
            renderWithProviders(
                <LoadingOverlay loading={true} spinSize="small" />
            );

            const spin = document.querySelector(".ant-spin-sm");
            expect(spin).toBeInTheDocument();
        });
    });

    describe("메시지 표시", () => {
        it("message가 없으면 텍스트가 표시되지 않는다", () => {
            renderWithProviders(<LoadingOverlay loading={true} message="" />);

            // Spin은 있지만 텍스트는 없음
            const spin = document.querySelector(".ant-spin");
            expect(spin).toBeInTheDocument();
            expect(screen.queryByText("로딩 중...")).not.toBeInTheDocument();
        });
    });

    describe("props 전달", () => {
        it("다양한 props가 전달되어도 렌더링된다", () => {
            renderWithProviders(
                <LoadingOverlay
                    loading={true}
                    message="테스트"
                    backgroundColor="rgba(0,0,0,0.5)"
                    zIndex={9999}
                    topOffset={64}
                    spinSize="default"
                />
            );

            expect(screen.getByText("테스트")).toBeInTheDocument();
        });
    });
});
