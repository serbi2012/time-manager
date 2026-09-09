import { useCallback, useState, type ReactNode } from "react";
import { Popconfirm, type PopconfirmProps } from "antd";
import { useShortcutLayer, useShortcut } from "@/shared/hooks";
import { CONFIRM_KEYS } from "@/shared/constants";

export interface ConfirmPopconfirmProps
    extends Omit<
        PopconfirmProps,
        "open" | "onOpenChange" | "onConfirm" | "onCancel" | "title"
    > {
    title: ReactNode;
    children: ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    /** 열림 상태를 바깥에서 제어할 때 전달 (생략하면 내부에서 관리) */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** 확인 버튼을 위험(빨강) 스타일로 (기본 true) */
    danger?: boolean;
    disabled?: boolean;
}

/**
 * Enter/ESC가 항상 동작하는 확인 팝오버
 *
 * 열려 있는 동안 단축키 레이어를 잡아 전역 단축키를 막고,
 * 포커스 위치와 무관하게 Enter로 확인, ESC로 취소되게 한다.
 */
export function ConfirmPopconfirm({
    title,
    children,
    onConfirm,
    onCancel,
    open,
    onOpenChange,
    danger = true,
    disabled = false,
    okButtonProps,
    ...popconfirm_props
}: ConfirmPopconfirmProps) {
    const [internal_open, setInternalOpen] = useState(false);

    const is_controlled = open !== undefined;
    const is_open = is_controlled ? open : internal_open;

    const layer_id = useShortcutLayer(is_open);

    const setOpen = useCallback(
        (next: boolean) => {
            if (!is_controlled) {
                setInternalOpen(next);
            }
            onOpenChange?.(next);
        },
        [is_controlled, onOpenChange]
    );

    const handleConfirm = useCallback(() => {
        setOpen(false);
        onConfirm();
    }, [setOpen, onConfirm]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        onCancel?.();
    }, [setOpen, onCancel]);

    useShortcut({
        keys: CONFIRM_KEYS.CONFIRM,
        scope: "layer",
        layer_id,
        input_policy: "allow",
        enabled: is_open,
        handler: handleConfirm,
    });

    useShortcut({
        keys: CONFIRM_KEYS.CANCEL,
        scope: "layer",
        layer_id,
        input_policy: "allow",
        enabled: is_open,
        handler: handleCancel,
    });

    return (
        <Popconfirm
            {...popconfirm_props}
            title={title}
            open={is_open}
            onOpenChange={(next) => {
                if (disabled) return;
                setOpen(next);
            }}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            okButtonProps={{ danger, autoFocus: true, ...okButtonProps }}
            destroyOnHidden
        >
            {children}
        </Popconfirm>
    );
}
