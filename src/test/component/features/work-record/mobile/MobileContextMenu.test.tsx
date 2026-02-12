/**
 * MobileContextMenu 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MobileContextMenu } from "../../../../../features/work-record/ui/Mobile/MobileContextMenu";
import { MOBILE_CONTEXT_MENU_LABEL } from "../../../../../features/work-record/constants";

describe("MobileContextMenu", () => {
    const default_props = {
        open: false,
        anchor_rect: null,
        onEdit: vi.fn(),
        onComplete: vi.fn(),
        onDelete: vi.fn(),
        onClose: vi.fn(),
    };

    it("open=false일 때 메뉴가 렌더링되지 않는다", () => {
        render(<MobileContextMenu {...default_props} open={false} />);

        expect(
            screen.queryByText(MOBILE_CONTEXT_MENU_LABEL.EDIT)
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(MOBILE_CONTEXT_MENU_LABEL.COMPLETE)
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(MOBILE_CONTEXT_MENU_LABEL.DELETE)
        ).not.toBeInTheDocument();
    });

    it("open=true일 때 수정/완료/삭제 버튼이 표시된다", () => {
        render(<MobileContextMenu {...default_props} open={true} />);

        expect(
            screen.getByText(MOBILE_CONTEXT_MENU_LABEL.EDIT)
        ).toBeInTheDocument();
        expect(
            screen.getByText(MOBILE_CONTEXT_MENU_LABEL.COMPLETE)
        ).toBeInTheDocument();
        expect(
            screen.getByText(MOBILE_CONTEXT_MENU_LABEL.DELETE)
        ).toBeInTheDocument();
    });

    it("수정 버튼 클릭 시 onEdit이 호출된다", async () => {
        const onEdit = vi.fn();
        render(
            <MobileContextMenu
                {...default_props}
                open={true}
                onEdit={onEdit}
            />
        );

        fireEvent.click(screen.getByText(MOBILE_CONTEXT_MENU_LABEL.EDIT));

        await waitFor(() => {
            expect(onEdit).toHaveBeenCalledTimes(1);
        });
    });

    it("완료 버튼 클릭 시 onComplete이 호출된다", async () => {
        const onComplete = vi.fn();
        render(
            <MobileContextMenu
                {...default_props}
                open={true}
                onComplete={onComplete}
            />
        );

        fireEvent.click(screen.getByText(MOBILE_CONTEXT_MENU_LABEL.COMPLETE));

        await waitFor(() => {
            expect(onComplete).toHaveBeenCalledTimes(1);
        });
    });

    it("삭제 버튼 클릭 시 onDelete가 호출된다", async () => {
        const onDelete = vi.fn();
        render(
            <MobileContextMenu
                {...default_props}
                open={true}
                onDelete={onDelete}
            />
        );

        fireEvent.click(screen.getByText(MOBILE_CONTEXT_MENU_LABEL.DELETE));

        await waitFor(() => {
            expect(onDelete).toHaveBeenCalledTimes(1);
        });
    });
});
