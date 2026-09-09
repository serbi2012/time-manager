/**
 * 모달 단축키/포커스 통합 테스트
 *
 * 모달이 열렸을 때 전역 단축키가 막히고, 제출 단축키와 포커스가
 * 의도대로 동작하는지 검증합니다.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { Modal, Input, Button } from "antd";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { useAppShortcuts, useModalKeyboard } from "../../../shared/hooks";
import { resetShortcutManager } from "../../../shared/lib/shortcuts";
import { ConfirmPopconfirm } from "../../../shared/ui/confirm";
import {
    useShortcutStore,
    DEFAULT_SHORTCUTS,
} from "../../../store/useShortcutStore";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

function pressKey(init: KeyboardEventInit): void {
    act(() => {
        window.dispatchEvent(
            new KeyboardEvent("keydown", { bubbles: true, ...init })
        );
    });
}

interface HarnessProps {
    onSubmit: () => void;
    onGlobalShortcut: () => void;
}

function ModalHarness({ onSubmit, onGlobalShortcut }: HarnessProps) {
    const [open, setOpen] = useState(false);

    useAppShortcuts({ openNewWorkModal: onGlobalShortcut });
    useModalKeyboard({ open, onSubmit });

    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                모달 열기
            </button>
            <Modal
                title="테스트 모달"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                getContainer={false}
            >
                <Input placeholder="프로젝트 코드" />
                <Input placeholder="작업명" />
            </Modal>
        </>
    );
}

describe("모달 단축키 통합", () => {
    beforeEach(() => {
        resetShortcutManager();
        useShortcutStore.setState({ shortcuts: [...DEFAULT_SHORTCUTS] });
    });

    afterEach(() => {
        resetShortcutManager();
    });

    it("모달이 닫혀 있으면 전역 단축키가 동작한다", () => {
        const on_global = vi.fn();

        render(
            <TestWrapper>
                <ModalHarness onSubmit={vi.fn()} onGlobalShortcut={on_global} />
            </TestWrapper>
        );

        pressKey({ key: "n", altKey: true });

        expect(on_global).toHaveBeenCalledTimes(1);
    });

    it("모달이 열리면 전역 단축키가 막힌다", () => {
        const on_global = vi.fn();

        render(
            <TestWrapper>
                <ModalHarness onSubmit={vi.fn()} onGlobalShortcut={on_global} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("모달 열기"));
        pressKey({ key: "n", altKey: true });

        expect(on_global).not.toHaveBeenCalled();
    });

    it("모달이 열려 있으면 F8로 제출된다", () => {
        const on_submit = vi.fn();

        render(
            <TestWrapper>
                <ModalHarness
                    onSubmit={on_submit}
                    onGlobalShortcut={vi.fn()}
                />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("모달 열기"));
        pressKey({ key: "F8" });

        expect(on_submit).toHaveBeenCalledTimes(1);
    });

    it("입력란에 포커스가 있어도 F8이 동작한다", () => {
        const on_submit = vi.fn();

        render(
            <TestWrapper>
                <ModalHarness
                    onSubmit={on_submit}
                    onGlobalShortcut={vi.fn()}
                />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("모달 열기"));

        const input = screen.getByPlaceholderText("프로젝트 코드");
        input.focus();

        act(() => {
            input.dispatchEvent(
                new KeyboardEvent("keydown", { key: "F8", bubbles: true })
            );
        });

        expect(on_submit).toHaveBeenCalledTimes(1);
    });

    it("모달을 닫으면 전역 단축키가 되살아난다", () => {
        const on_global = vi.fn();

        render(
            <TestWrapper>
                <ModalHarness onSubmit={vi.fn()} onGlobalShortcut={on_global} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("모달 열기"));
        fireEvent.click(screen.getByLabelText("Close"));

        pressKey({ key: "n", altKey: true });

        expect(on_global).toHaveBeenCalledTimes(1);
    });

    it("모달을 열면 첫 입력란으로 포커스가 옮겨간다", async () => {
        render(
            <TestWrapper>
                <ModalHarness onSubmit={vi.fn()} onGlobalShortcut={vi.fn()} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("모달 열기"));

        await waitFor(() => {
            expect(document.activeElement).toBe(
                screen.getByPlaceholderText("프로젝트 코드")
            );
        });
    });

    it("모달을 닫으면 열기 전 위치로 포커스가 되돌아간다", async () => {
        render(
            <TestWrapper>
                <ModalHarness onSubmit={vi.fn()} onGlobalShortcut={vi.fn()} />
            </TestWrapper>
        );

        const trigger = screen.getByText("모달 열기");
        trigger.focus();
        fireEvent.click(trigger);

        await waitFor(() => {
            expect(document.activeElement).toBe(
                screen.getByPlaceholderText("프로젝트 코드")
            );
        });

        fireEvent.click(screen.getByLabelText("Close"));

        await waitFor(() => {
            expect(document.activeElement).toBe(trigger);
        });
    });

    it("설정에서 제출 키를 바꾸면 새 키로 제출된다", () => {
        const on_submit = vi.fn();

        useShortcutStore.setState({
            shortcuts: DEFAULT_SHORTCUTS.map((s) =>
                s.id === "modal-submit" ? { ...s, keys: "F9" } : s
            ),
        });

        render(
            <TestWrapper>
                <ModalHarness
                    onSubmit={on_submit}
                    onGlobalShortcut={vi.fn()}
                />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("모달 열기"));

        pressKey({ key: "F8" });
        expect(on_submit).not.toHaveBeenCalled();

        pressKey({ key: "F9" });
        expect(on_submit).toHaveBeenCalledTimes(1);
    });
});

describe("확인 팝오버 키보드", () => {
    beforeEach(() => {
        resetShortcutManager();
        useShortcutStore.setState({ shortcuts: [...DEFAULT_SHORTCUTS] });
    });

    afterEach(() => {
        resetShortcutManager();
    });

    function ConfirmHarness({ onConfirm }: { onConfirm: () => void }) {
        return (
            <ConfirmPopconfirm
                title="삭제할까요?"
                onConfirm={onConfirm}
                okText="삭제"
                cancelText="취소"
            >
                <Button>삭제</Button>
            </ConfirmPopconfirm>
        );
    }

    it("팝오버가 열린 상태에서 Enter로 확인된다", async () => {
        const on_confirm = vi.fn();

        render(
            <TestWrapper>
                <ConfirmHarness onConfirm={on_confirm} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("삭제"));
        await screen.findByText("삭제할까요?");

        pressKey({ key: "Enter" });

        expect(on_confirm).toHaveBeenCalledTimes(1);
    });

    it("팝오버가 닫혀 있으면 Enter가 확인을 부르지 않는다", () => {
        const on_confirm = vi.fn();

        render(
            <TestWrapper>
                <ConfirmHarness onConfirm={on_confirm} />
            </TestWrapper>
        );

        pressKey({ key: "Enter" });

        expect(on_confirm).not.toHaveBeenCalled();
    });

    it("ESC로 취소하면 확인 콜백이 불리지 않는다", async () => {
        const on_confirm = vi.fn();

        render(
            <TestWrapper>
                <ConfirmHarness onConfirm={on_confirm} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("삭제"));
        await screen.findByText("삭제할까요?");

        pressKey({ key: "Escape" });

        expect(on_confirm).not.toHaveBeenCalled();
    });

    it("확인한 뒤에는 Enter가 다시 확인을 부르지 않는다", async () => {
        const on_confirm = vi.fn();

        render(
            <TestWrapper>
                <ConfirmHarness onConfirm={on_confirm} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText("삭제"));
        await screen.findByText("삭제할까요?");

        pressKey({ key: "Enter" });
        pressKey({ key: "Enter" });

        expect(on_confirm).toHaveBeenCalledTimes(1);
    });
});
