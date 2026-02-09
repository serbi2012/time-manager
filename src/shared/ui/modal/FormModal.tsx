/**
 * 폼을 포함하는 모달 컴포넌트
 *
 * Form 제출/취소 로직을 통합하고, 단축키 표시 및 로딩 상태 처리
 *
 * @example
 * <FormModal
 *   title="새 작업"
 *   open={isOpen}
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   form={form}
 *   submitText="등록"
 *   submitShortcut="F8"
 * >
 *   <Form.Item name="work_name" label="작업명">
 *     <Input />
 *   </Form.Item>
 * </FormModal>
 */

import { useCallback, type ReactNode } from "react";
import { Form, type ModalProps } from "antd";
import type { FormInstance } from "antd";
import { BaseModal } from "./BaseModal";

export interface FormModalProps extends Omit<ModalProps, "onOk" | "footer"> {
    children: ReactNode;
    /** Ant Design Form 인스턴스 */
    form: FormInstance;
    /** 폼 제출 콜백 */
    onSubmit: () => void;
    /** 모달 닫기 콜백 */
    onCancel: () => void;
    /** 제출 버튼 텍스트 (기본값: "확인") */
    submitText?: string;
    /** 취소 버튼 텍스트 (기본값: "취소") */
    cancelText?: string;
    /** 제출 버튼 단축키 (예: "F8") */
    submitShortcut?: string;
    /** 로딩 상태 */
    loading?: boolean;
    /** 닫을 때 폼 리셋 여부 (기본값: true) */
    resetOnClose?: boolean;
    /** 폼 레이아웃 (기본값: "vertical") */
    formLayout?: "horizontal" | "vertical" | "inline";
}

/**
 * 폼을 포함하는 모달 컴포넌트
 */
export function FormModal({
    children,
    form,
    onSubmit,
    onCancel,
    submitText = "확인",
    cancelText = "취소",
    submitShortcut,
    loading = false,
    resetOnClose = true,
    formLayout = "vertical",
    ...modalProps
}: FormModalProps) {
    const handleCancel = useCallback(() => {
        if (resetOnClose) {
            form.resetFields();
        }
        onCancel();
    }, [form, onCancel, resetOnClose]);

    const handleOk = useCallback(() => {
        form.validateFields()
            .then(() => {
                onSubmit();
            })
            .catch(() => {
                // validation failed
            });
    }, [form, onSubmit]);

    // 단축키가 있으면 버튼 텍스트에 포함
    const okText = submitShortcut ? (
        <>
            {submitText}{" "}
            <span className="ml-xs px-[6px] py-[2px] bg-black/[0.06] rounded text-[11px]">
                {submitShortcut}
            </span>
        </>
    ) : (
        submitText
    );

    return (
        <BaseModal
            {...modalProps}
            onCancel={handleCancel}
            onOk={handleOk}
            okText={okText}
            cancelText={cancelText}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout={formLayout}>
                {children}
            </Form>
        </BaseModal>
    );
}

export default FormModal;
