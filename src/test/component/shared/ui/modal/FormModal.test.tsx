/**
 * FormModal 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Form, Input } from "antd";
import { renderWithProviders } from "../../../../helpers/test_utils";
import { FormModal } from "../../../../../shared/ui/modal";

// Form 래퍼 컴포넌트
function FormModalWrapper({
    onSubmit = vi.fn(),
    onCancel = vi.fn(),
    ...props
}: Partial<Parameters<typeof FormModal>[0]>) {
    const [form] = Form.useForm();

    return (
        <FormModal
            title="테스트 폼"
            open={true}
            form={form}
            onSubmit={onSubmit}
            onCancel={onCancel}
            {...props}
        >
            <Form.Item
                name="test_field"
                label="테스트 필드"
                rules={[{ required: true, message: "필수 입력" }]}
            >
                <Input placeholder="입력하세요" />
            </Form.Item>
        </FormModal>
    );
}

describe("FormModal", () => {
    describe("기본 렌더링", () => {
        it("폼 필드가 표시된다", () => {
            renderWithProviders(<FormModalWrapper />);

            expect(screen.getByText("테스트 필드")).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("입력하세요")
            ).toBeInTheDocument();
        });

        it("기본 버튼 텍스트가 표시된다", () => {
            renderWithProviders(<FormModalWrapper />);

            expect(screen.getByText("확인")).toBeInTheDocument();
            expect(screen.getByText("취소")).toBeInTheDocument();
        });
    });

    describe("커스텀 버튼 텍스트", () => {
        it("submitText가 적용된다", () => {
            renderWithProviders(<FormModalWrapper submitText="저장" />);

            expect(screen.getByText("저장")).toBeInTheDocument();
        });

        it("cancelText가 적용된다", () => {
            renderWithProviders(<FormModalWrapper cancelText="닫기" />);

            expect(screen.getByText("닫기")).toBeInTheDocument();
        });

        it("submitShortcut이 표시된다", () => {
            renderWithProviders(
                <FormModalWrapper submitText="등록" submitShortcut="F8" />
            );

            expect(screen.getByText("등록")).toBeInTheDocument();
            expect(screen.getByText("F8")).toBeInTheDocument();
        });
    });

    describe("폼 제출", () => {
        it("유효한 데이터로 제출 시 onSubmit이 호출된다", async () => {
            const handle_submit = vi.fn();

            renderWithProviders(<FormModalWrapper onSubmit={handle_submit} />);

            // 필드 입력
            const input = screen.getByPlaceholderText("입력하세요");
            fireEvent.change(input, { target: { value: "테스트 값" } });

            // 확인 버튼 클릭
            const ok_button = screen.getByRole("button", { name: /확인/i });
            fireEvent.click(ok_button);

            await waitFor(() => {
                expect(handle_submit).toHaveBeenCalled();
            });
        });

        it("유효하지 않은 데이터는 제출되지 않는다", async () => {
            const handle_submit = vi.fn();

            renderWithProviders(<FormModalWrapper onSubmit={handle_submit} />);

            // 필드 비우고 제출
            const ok_button = screen.getByRole("button", { name: /확인/i });
            fireEvent.click(ok_button);

            await waitFor(() => {
                // 에러 메시지 표시
                expect(screen.getByText("필수 입력")).toBeInTheDocument();
            });

            expect(handle_submit).not.toHaveBeenCalled();
        });
    });

    describe("취소", () => {
        it("취소 버튼 클릭 시 onCancel이 호출된다", async () => {
            const handle_cancel = vi.fn();

            renderWithProviders(<FormModalWrapper onCancel={handle_cancel} />);

            const cancel_button = screen.getByRole("button", { name: /취소/i });
            fireEvent.click(cancel_button);

            await waitFor(() => {
                expect(handle_cancel).toHaveBeenCalled();
            });
        });
    });

    describe("로딩 상태", () => {
        it("loading=true일 때 확인 버튼이 로딩 상태가 된다", () => {
            renderWithProviders(<FormModalWrapper loading={true} />);

            const ok_button = screen.getByRole("button", { name: /확인/i });
            // Ant Design의 로딩 버튼은 .ant-btn-loading 클래스를 가짐
            expect(ok_button.closest("button")).toHaveClass("ant-btn-loading");
        });
    });

    describe("폼 레이아웃", () => {
        it("기본 레이아웃은 vertical이다", () => {
            renderWithProviders(<FormModalWrapper />);

            const form = document.querySelector(".ant-form-vertical");
            expect(form).toBeInTheDocument();
        });

        it("horizontal 레이아웃이 적용된다", () => {
            renderWithProviders(<FormModalWrapper formLayout="horizontal" />);

            const form = document.querySelector(".ant-form-horizontal");
            expect(form).toBeInTheDocument();
        });
    });
});
