import { useEffect, useRef } from "react";
import { useShortcutStore } from "@/store/useShortcutStore";
import {
    installShortcutListener,
    registerBinding,
} from "@/shared/lib/shortcuts";
import { MODAL_SUBMIT_SHORTCUT_ID } from "@/shared/constants";

export type AppShortcutHandlers = Record<string, (() => void) | undefined>;

/**
 * 스토어에 정의된 전역 단축키를 매니저에 등록한다
 *
 * 모달 제출 단축키는 각 모달이 자기 레이어에 등록하므로 여기서는 제외한다.
 * 앱에서 한 번만 호출한다.
 */
export function useAppShortcuts(handlers: AppShortcutHandlers): void {
    const shortcuts = useShortcutStore((state) => state.shortcuts);
    const handlers_ref = useRef(handlers);

    useEffect(() => {
        handlers_ref.current = handlers;
    }, [handlers]);

    useEffect(() => installShortcutListener(), []);

    useEffect(() => {
        const releases = shortcuts
            .filter(
                (shortcut) =>
                    shortcut.enabled &&
                    shortcut.keys &&
                    shortcut.id !== MODAL_SUBMIT_SHORTCUT_ID
            )
            .map((shortcut) =>
                registerBinding({
                    id: `app-shortcut:${shortcut.id}`,
                    keys: shortcut.keys,
                    scope: "global",
                    handler: () => handlers_ref.current[shortcut.action]?.(),
                })
            );

        return () => releases.forEach((release) => release());
    }, [shortcuts]);
}
