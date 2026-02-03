/**
 * BaseModal 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../helpers/test_utils";
import { BaseModal } from "../../../../../shared/ui/modal";

describe("BaseModal", () => {
    describe("기본 렌더링", () => {
        it("open=true일 때 모달이 표시된다", () => {
            renderWithProviders(
                <BaseModal title="테스트 모달" open={true} onCancel={vi.fn()}>
                    <p>모달 내용</p>
                </BaseModal>
            );

            expect(screen.getByText("테스트 모달")).toBeInTheDocument();
            expect(screen.getByText("모달 내용")).toBeInTheDocument();
        });

        it("open=false일 때 모달이 표시되지 않는다", () => {
            renderWithProviders(
                <BaseModal title="테스트 모달" open={false} onCancel={vi.fn()}>
                    <p>모달 내용</p>
                </BaseModal>
            );

            expect(screen.queryByText("테스트 모달")).not.toBeInTheDocument();
        });

        it("title이 헤더에 표시된다", () => {
            renderWithProviders(
                <BaseModal title="커스텀 제목" open={true} onCancel={vi.fn()}>
                    <p>내용</p>
                </BaseModal>
            );

            expect(screen.getByText("커스텀 제목")).toBeInTheDocument();
        });
    });

    describe("이벤트 핸들링", () => {
        it("닫기 버튼 클릭 시 onCancel이 호출된다", async () => {
            const handle_cancel = vi.fn();

            renderWithProviders(
                <BaseModal
                    title="테스트 모달"
                    open={true}
                    onCancel={handle_cancel}
                >
                    <p>모달 내용</p>
                </BaseModal>
            );

            // 닫기 버튼 클릭 (X 버튼)
            const close_button = document.querySelector(".ant-modal-close");
            if (close_button) {
                fireEvent.click(close_button);
            }

            await waitFor(() => {
                expect(handle_cancel).toHaveBeenCalled();
            });
        });

        it("확인 버튼 클릭 시 onOk가 호출된다", async () => {
            const handle_ok = vi.fn();

            renderWithProviders(
                <BaseModal
                    title="테스트 모달"
                    open={true}
                    onCancel={vi.fn()}
                    onOk={handle_ok}
                >
                    <p>모달 내용</p>
                </BaseModal>
            );

            const ok_button = screen.getByRole("button", { name: /확인/i });
            fireEvent.click(ok_button);

            expect(handle_ok).toHaveBeenCalled();
        });
    });

    describe("props 전달", () => {
        it("width가 적용된다", () => {
            renderWithProviders(
                <BaseModal
                    title="넓은 모달"
                    open={true}
                    onCancel={vi.fn()}
                    width={800}
                >
                    <p>내용</p>
                </BaseModal>
            );

            const modal = document.querySelector(".ant-modal");
            expect(modal).toHaveStyle({ width: "800px" });
        });

        it("footer=null일 때 푸터가 표시되지 않는다", () => {
            renderWithProviders(
                <BaseModal
                    title="푸터 없음"
                    open={true}
                    onCancel={vi.fn()}
                    footer={null}
                >
                    <p>내용</p>
                </BaseModal>
            );

            expect(
                document.querySelector(".ant-modal-footer")
            ).not.toBeInTheDocument();
        });

        it("커스텀 okText가 적용된다", () => {
            renderWithProviders(
                <BaseModal
                    title="테스트"
                    open={true}
                    onCancel={vi.fn()}
                    okText="저장하기"
                >
                    <p>내용</p>
                </BaseModal>
            );

            expect(screen.getByText("저장하기")).toBeInTheDocument();
        });

        it("커스텀 cancelText가 적용된다", () => {
            renderWithProviders(
                <BaseModal
                    title="테스트"
                    open={true}
                    onCancel={vi.fn()}
                    cancelText="닫기"
                >
                    <p>내용</p>
                </BaseModal>
            );

            expect(screen.getByText("닫기")).toBeInTheDocument();
        });
    });

    describe("children 렌더링", () => {
        it("children이 모달 본문에 렌더링된다", () => {
            renderWithProviders(
                <BaseModal title="테스트" open={true} onCancel={vi.fn()}>
                    <div data-testid="custom-content">커스텀 컨텐츠</div>
                </BaseModal>
            );

            expect(screen.getByTestId("custom-content")).toBeInTheDocument();
            expect(screen.getByText("커스텀 컨텐츠")).toBeInTheDocument();
        });
    });
});
