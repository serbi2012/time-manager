/**
 * Mobile gantt context menu state management hook.
 * Manages card-level and segment-level context menus for long-press.
 */

import { useState, useCallback, useMemo } from "react";
import {
    EditOutlined,
    PlayCircleOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import type { MobileActionMenuItem } from "@/shared/ui";
import type { WorkRecord, WorkSession } from "@/shared/types";
import type { GroupedWork } from "../lib/slot_calculator";
import { useWorkStore } from "@/store/useWorkStore";
import { message } from "@/shared/lib/message";
import { SUCCESS_MESSAGES } from "@/shared/constants";
import {
    GANTT_MOBILE_CONTEXT_MENU,
    GANTT_MOBILE_SEGMENT_MENU,
} from "../constants";

interface UseMobileGanttMenusOptions {
    grouped_works: GroupedWork[];
    onEditSession: (record: WorkRecord, session: WorkSession) => void;
}

export function useMobileGanttMenus({
    grouped_works,
    onEditSession,
}: UseMobileGanttMenusOptions) {
    const [card_menu_open, setCardMenuOpen] = useState(false);
    const [card_menu_anchor, setCardMenuAnchor] = useState<DOMRect | null>(null);
    const [card_menu_record, setCardMenuRecord] = useState<WorkRecord | null>(null);

    const [seg_menu_open, setSegMenuOpen] = useState(false);
    const [seg_menu_anchor, setSegMenuAnchor] = useState<DOMRect | null>(null);
    const [seg_menu_record, setSegMenuRecord] = useState<WorkRecord | null>(null);
    const [seg_menu_session, setSegMenuSession] = useState<WorkSession | null>(null);

    const handleCardLongPress = useCallback(
        (record: WorkRecord, anchor_rect: DOMRect) => {
            setCardMenuRecord(record);
            setCardMenuAnchor(anchor_rect);
            setCardMenuOpen(true);
        },
        []
    );

    const handleCardMenuAction = useCallback(
        (key: string) => {
            if (!card_menu_record) return;
            if (key === "edit") {
                const first_session = grouped_works
                    .find((g) => g.record.id === card_menu_record.id)
                    ?.sessions[0];
                if (first_session) {
                    onEditSession(card_menu_record, first_session);
                }
            } else if (key === "start_timer") {
                useWorkStore.getState().startTimer(card_menu_record.id);
            } else if (key === "delete") {
                useWorkStore.getState().softDeleteRecord(card_menu_record.id);
                message.success(SUCCESS_MESSAGES.recordTrashed);
            }
        },
        [card_menu_record, grouped_works, onEditSession]
    );

    const handleSegmentLongPress = useCallback(
        (record: WorkRecord, session: WorkSession, anchor_rect: DOMRect) => {
            setSegMenuRecord(record);
            setSegMenuSession(session);
            setSegMenuAnchor(anchor_rect);
            setSegMenuOpen(true);
        },
        []
    );

    const handleSegMenuAction = useCallback(
        (key: string) => {
            if (!seg_menu_record || !seg_menu_session) return;
            if (key === "edit_session") {
                onEditSession(seg_menu_record, seg_menu_session);
            } else if (key === "delete_session") {
                const is_last_session =
                    (seg_menu_record.sessions?.length ?? 0) <= 1;

                if (is_last_session) {
                    useWorkStore.getState().softDeleteRecord(seg_menu_record.id);
                    message.success(SUCCESS_MESSAGES.recordTrashed);
                    return;
                }

                useWorkStore
                    .getState()
                    .deleteSession(seg_menu_record.id, seg_menu_session.id);
            }
        },
        [seg_menu_record, seg_menu_session, onEditSession]
    );

    const CARD_MENU_ITEMS: MobileActionMenuItem[] = useMemo(
        () => [
            {
                key: "edit",
                label: GANTT_MOBILE_CONTEXT_MENU.EDIT,
                icon: EditOutlined,
                color: "var(--color-primary)",
                bg: "var(--color-primary-tint)",
            },
            {
                key: "start_timer",
                label: GANTT_MOBILE_CONTEXT_MENU.START_TIMER,
                icon: PlayCircleOutlined,
                color: "var(--color-success)",
                bg: "var(--color-success-tint)",
                haptic: "impact",
            },
            {
                key: "delete",
                label: GANTT_MOBILE_CONTEXT_MENU.DELETE,
                icon: DeleteOutlined,
                color: "var(--color-error)",
                bg: "var(--color-error-tint)",
                haptic: "warning",
            },
        ],
        []
    );

    const SEGMENT_MENU_ITEMS: MobileActionMenuItem[] = useMemo(
        () => [
            {
                key: "edit_session",
                label: GANTT_MOBILE_SEGMENT_MENU.EDIT_SESSION,
                icon: EditOutlined,
                color: "var(--color-primary)",
                bg: "var(--color-primary-tint)",
            },
            {
                key: "delete_session",
                label: GANTT_MOBILE_SEGMENT_MENU.DELETE_SESSION,
                icon: DeleteOutlined,
                color: "var(--color-error)",
                bg: "var(--color-error-tint)",
                haptic: "warning",
            },
        ],
        []
    );

    return {
        card_menu: {
            open: card_menu_open,
            anchor: card_menu_anchor,
            items: CARD_MENU_ITEMS,
            onAction: handleCardMenuAction,
            onClose: () => setCardMenuOpen(false),
        },
        seg_menu: {
            open: seg_menu_open,
            anchor: seg_menu_anchor,
            items: SEGMENT_MENU_ITEMS,
            onAction: handleSegMenuAction,
            onClose: () => setSegMenuOpen(false),
        },
        handleCardLongPress,
        handleSegmentLongPress,
    };
}
