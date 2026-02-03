/**
 * EmptyState 컴포넌트 테스트
 */

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Button } from "antd";
import { renderWithProviders } from "../../../../helpers/test_utils";
import { EmptyState } from "../../../../../shared/ui/layout";

describe("EmptyState", () => {
    describe("기본 렌더링", () => {
        it("description이 표시된다", () => {
            renderWithProviders(<EmptyState description="데이터가 없습니다" />);

            expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
        });

        it("기본 이미지가 표시된다", () => {
            renderWithProviders(<EmptyState description="데이터가 없습니다" />);

            // Ant Design Empty의 이미지
            const empty_image = document.querySelector(".ant-empty-image");
            expect(empty_image).toBeInTheDocument();
        });
    });

    describe("부가 설명", () => {
        it("subDescription이 표시된다", () => {
            renderWithProviders(
                <EmptyState
                    description="프리셋이 없습니다"
                    subDescription="추가 버튼으로 추가하세요"
                />
            );

            expect(screen.getByText("프리셋이 없습니다")).toBeInTheDocument();
            expect(
                screen.getByText("추가 버튼으로 추가하세요")
            ).toBeInTheDocument();
        });

        it("subDescription이 secondary 타입으로 표시된다", () => {
            renderWithProviders(
                <EmptyState
                    description="메인 설명"
                    subDescription="부가 설명"
                />
            );

            const sub_text = screen.getByText("부가 설명");
            // Ant Design Typography.Text type="secondary"는 .ant-typography-secondary 클래스 사용
            expect(sub_text).toHaveClass("ant-typography-secondary");
        });
    });

    describe("이미지 타입", () => {
        it("imageType='simple'일 때 심플 이미지가 사용된다", () => {
            renderWithProviders(
                <EmptyState description="테스트" imageType="simple" />
            );

            // PRESENTED_IMAGE_SIMPLE은 inline SVG
            const empty = document.querySelector(".ant-empty");
            expect(empty).toBeInTheDocument();
        });

        it("imageType='default'일 때 기본 이미지가 사용된다", () => {
            renderWithProviders(
                <EmptyState description="테스트" imageType="default" />
            );

            const empty = document.querySelector(".ant-empty");
            expect(empty).toBeInTheDocument();
        });
    });

    describe("커스텀 이미지", () => {
        it("image prop으로 커스텀 이미지가 사용된다", () => {
            renderWithProviders(
                <EmptyState
                    description="테스트"
                    image={
                        <img
                            src="/custom.png"
                            alt="custom"
                            data-testid="custom-image"
                        />
                    }
                />
            );

            expect(screen.getByTestId("custom-image")).toBeInTheDocument();
        });
    });

    describe("액션 버튼", () => {
        it("action이 렌더링된다", () => {
            renderWithProviders(
                <EmptyState
                    description="데이터가 없습니다"
                    action={<Button type="primary">추가하기</Button>}
                />
            );

            expect(screen.getByText("추가하기")).toBeInTheDocument();
        });

        it("여러 액션 요소가 렌더링된다", () => {
            renderWithProviders(
                <EmptyState
                    description="데이터가 없습니다"
                    action={
                        <>
                            <Button type="primary">추가</Button>
                            <Button>새로고침</Button>
                        </>
                    }
                />
            );

            expect(screen.getByText("추가")).toBeInTheDocument();
            expect(screen.getByText("새로고침")).toBeInTheDocument();
        });
    });

    describe("props 전달", () => {
        it("다양한 props가 전달되어도 렌더링된다", () => {
            renderWithProviders(
                <EmptyState
                    description="테스트"
                    subDescription="부가 테스트"
                    imageType="default"
                    style={{ padding: 20 }}
                />
            );

            const empty = document.querySelector(".ant-empty");
            expect(empty).toBeInTheDocument();
            expect(screen.getByText("테스트")).toBeInTheDocument();
        });
    });
});
