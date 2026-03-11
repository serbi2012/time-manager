/**
 * useMobileGanttMenus 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMobileGanttMenus } from "../../../../features/gantt-chart/hooks/useMobileGanttMenus";
import { useWorkStore } from "../../../../store/useWorkStore";
import {
    createMockRecord,
    createMockSession,
} from "../../../helpers/mock_factory";
import type { GroupedWork } from "../../../../features/gantt-chart/lib/slot_calculator";

vi.mock("@ant-design/icons", () => ({
    EditOutlined: () => null,
    PlayCircleOutlined: () => null,
    DeleteOutlined: () => null,
}));

describe("useMobileGanttMenus", () => {
    const mock_record = createMockRecord({
        id: "test-record-1",
        work_name: "테스트 작업",
    });
    const mock_session = createMockSession({
        id: "test-session-1",
        start_time: "09:00",
        end_time: "10:00",
    });
    const mock_grouped_works: GroupedWork[] = [
        {
            key: "test-key",
            record: mock_record,
            sessions: [mock_session],
            first_start: 540,
        },
    ];
    const mock_anchor = new DOMRect(100, 200, 200, 40);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let on_edit_session: any;

    beforeEach(() => {
        on_edit_session = vi.fn();
    });

    it("초기 상태에서 카드 메뉴와 세그먼트 메뉴가 닫혀있다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        expect(result.current.card_menu.open).toBe(false);
        expect(result.current.seg_menu.open).toBe(false);
    });

    it("handleCardLongPress 호출 시 카드 메뉴가 열린다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleCardLongPress(mock_record, mock_anchor);
        });

        expect(result.current.card_menu.open).toBe(true);
        expect(result.current.card_menu.anchor).toBe(mock_anchor);
    });

    it("카드 메뉴에 수정/타이머 시작/삭제 항목이 있다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        const keys = result.current.card_menu.items.map((item) => item.key);
        expect(keys).toContain("edit");
        expect(keys).toContain("start_timer");
        expect(keys).toContain("delete");
    });

    it("카드 메뉴 edit 액션 시 onEditSession이 호출된다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleCardLongPress(mock_record, mock_anchor);
        });

        act(() => {
            result.current.card_menu.onAction("edit");
        });

        expect(on_edit_session).toHaveBeenCalledWith(mock_record, mock_session);
    });

    it("카드 메뉴 start_timer 액션 시 스토어의 startTimer가 호출된다", () => {
        const start_timer_spy = vi.fn();
        vi.spyOn(useWorkStore, "getState").mockReturnValue({
            startTimer: start_timer_spy,
        } as unknown as ReturnType<typeof useWorkStore.getState>);

        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleCardLongPress(mock_record, mock_anchor);
        });

        act(() => {
            result.current.card_menu.onAction("start_timer");
        });

        expect(start_timer_spy).toHaveBeenCalledWith(mock_record.id);
    });

    it("카드 메뉴 delete 액션 시 스토어의 deleteRecord가 호출된다", () => {
        const delete_record_spy = vi.fn();
        vi.spyOn(useWorkStore, "getState").mockReturnValue({
            deleteRecord: delete_record_spy,
        } as unknown as ReturnType<typeof useWorkStore.getState>);

        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleCardLongPress(mock_record, mock_anchor);
        });

        act(() => {
            result.current.card_menu.onAction("delete");
        });

        expect(delete_record_spy).toHaveBeenCalledWith(mock_record.id);
    });

    it("handleSegmentLongPress 호출 시 세그먼트 메뉴가 열린다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleSegmentLongPress(
                mock_record,
                mock_session,
                mock_anchor
            );
        });

        expect(result.current.seg_menu.open).toBe(true);
        expect(result.current.seg_menu.anchor).toBe(mock_anchor);
    });

    it("세그먼트 메뉴에 세션 수정/세션 삭제 항목이 있다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        const keys = result.current.seg_menu.items.map((item) => item.key);
        expect(keys).toContain("edit_session");
        expect(keys).toContain("delete_session");
    });

    it("세그먼트 메뉴 edit_session 액션 시 onEditSession이 호출된다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleSegmentLongPress(
                mock_record,
                mock_session,
                mock_anchor
            );
        });

        act(() => {
            result.current.seg_menu.onAction("edit_session");
        });

        expect(on_edit_session).toHaveBeenCalledWith(mock_record, mock_session);
    });

    it("세그먼트 메뉴 delete_session 액션 시 스토어의 deleteSession이 호출된다", () => {
        const delete_session_spy = vi.fn();
        vi.spyOn(useWorkStore, "getState").mockReturnValue({
            deleteSession: delete_session_spy,
        } as unknown as ReturnType<typeof useWorkStore.getState>);

        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleSegmentLongPress(
                mock_record,
                mock_session,
                mock_anchor
            );
        });

        act(() => {
            result.current.seg_menu.onAction("delete_session");
        });

        expect(delete_session_spy).toHaveBeenCalledWith(
            mock_record.id,
            mock_session.id
        );
    });

    it("카드 메뉴 onClose 호출 시 메뉴가 닫힌다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleCardLongPress(mock_record, mock_anchor);
        });
        expect(result.current.card_menu.open).toBe(true);

        act(() => {
            result.current.card_menu.onClose();
        });
        expect(result.current.card_menu.open).toBe(false);
    });

    it("세그먼트 메뉴 onClose 호출 시 메뉴가 닫힌다", () => {
        const { result } = renderHook(() =>
            useMobileGanttMenus({
                grouped_works: mock_grouped_works,
                onEditSession: on_edit_session,
            })
        );

        act(() => {
            result.current.handleSegmentLongPress(
                mock_record,
                mock_session,
                mock_anchor
            );
        });
        expect(result.current.seg_menu.open).toBe(true);

        act(() => {
            result.current.seg_menu.onClose();
        });
        expect(result.current.seg_menu.open).toBe(false);
    });
});
