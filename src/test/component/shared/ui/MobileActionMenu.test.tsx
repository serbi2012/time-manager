/**
 * MobileActionMenu 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
    MobileActionMenu,
    type MobileActionMenuItem,
} from "../../../../shared/ui/MobileActionMenu";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const MOCK_ITEMS: MobileActionMenuItem[] = [
    {
        key: "edit",
        label: "수정",
        icon: EditOutlined,
        color: "var(--color-primary)",
        bg: "rgba(49,130,246,0.08)",
    },
    {
        key: "delete",
        label: "삭제",
        icon: DeleteOutlined,
        color: "var(--color-error)",
        bg: "rgba(240,68,82,0.08)",
        haptic_ms: 15,
    },
];

const MOCK_ANCHOR = new DOMRect(100, 200, 200, 40);

describe("MobileActionMenu", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let on_action: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let on_close: any;

    beforeEach(() => {
        on_action = vi.fn();
        on_close = vi.fn();
    });

    it("open=false일 때 메뉴가 렌더링되지 않는다", () => {
        render(
            <MobileActionMenu
                open={false}
                anchor_rect={MOCK_ANCHOR}
                items={MOCK_ITEMS}
                onAction={on_action}
                onClose={on_close}
            />
        );

        expect(screen.queryByText("수정")).not.toBeInTheDocument();
        expect(screen.queryByText("삭제")).not.toBeInTheDocument();
    });

    it("open=true일 때 모든 메뉴 항목이 표시된다", () => {
        render(
            <MobileActionMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                items={MOCK_ITEMS}
                onAction={on_action}
                onClose={on_close}
            />
        );

        expect(screen.getByText("수정")).toBeInTheDocument();
        expect(screen.getByText("삭제")).toBeInTheDocument();
    });

    it("메뉴 항목 클릭 시 onClose가 호출된다", () => {
        render(
            <MobileActionMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                items={MOCK_ITEMS}
                onAction={on_action}
                onClose={on_close}
            />
        );

        fireEvent.click(screen.getByText("수정"));

        expect(on_close).toHaveBeenCalled();
    });

    it("빈 items 배열일 때 메뉴 콘텐츠가 없다", () => {
        render(
            <MobileActionMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                items={[]}
                onAction={on_action}
                onClose={on_close}
            />
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("anchor_rect가 null이어도 기본 위치로 렌더링된다", () => {
        render(
            <MobileActionMenu
                open={true}
                anchor_rect={null}
                items={MOCK_ITEMS}
                onAction={on_action}
                onClose={on_close}
            />
        );

        expect(screen.getByText("수정")).toBeInTheDocument();
    });
});
