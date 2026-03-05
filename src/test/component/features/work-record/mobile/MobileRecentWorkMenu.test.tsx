/**
 * MobileRecentWorkMenu 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileRecentWorkMenu } from "../../../../../features/work-record/ui/Mobile/MobileRecentWorkMenu";
import { MOBILE_FAB_RECENT_TITLE } from "../../../../../features/work-record/constants";

const MOCK_ANCHOR = new DOMRect(300, 500, 56, 56);

const MOCK_RECENT_WORKS = [
    { record_id: "r1", work_name: "프론트엔드 개발", deal_name: "UI 구현" },
    { record_id: "r2", work_name: "백엔드 개발" },
    { record_id: "r3", work_name: "코드 리뷰", deal_name: "PR 검토" },
];

describe("MobileRecentWorkMenu", () => {
    let on_select: ReturnType<typeof vi.fn>;
    let on_close: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        on_select = vi.fn();
        on_close = vi.fn();
    });

    it("open=false일 때 메뉴가 보이지 않는다", () => {
        render(
            <MobileRecentWorkMenu
                open={false}
                anchor_rect={MOCK_ANCHOR}
                recent_works={MOCK_RECENT_WORKS}
                onSelect={on_select}
                onClose={on_close}
            />
        );

        expect(
            screen.queryByText(MOBILE_FAB_RECENT_TITLE)
        ).not.toBeInTheDocument();
    });

    it("open=true일 때 타이틀과 작업 목록이 표시된다", () => {
        render(
            <MobileRecentWorkMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                recent_works={MOCK_RECENT_WORKS}
                onSelect={on_select}
                onClose={on_close}
            />
        );

        expect(
            screen.getByText(MOBILE_FAB_RECENT_TITLE)
        ).toBeInTheDocument();
        expect(screen.getByText("UI 구현")).toBeInTheDocument();
        expect(screen.getByText("백엔드 개발")).toBeInTheDocument();
        expect(screen.getByText("PR 검토")).toBeInTheDocument();
    });

    it("deal_name이 있으면 deal_name이 메인 텍스트로, work_name이 서브 텍스트로 표시된다", () => {
        render(
            <MobileRecentWorkMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                recent_works={[MOCK_RECENT_WORKS[0]]}
                onSelect={on_select}
                onClose={on_close}
            />
        );

        expect(screen.getByText("UI 구현")).toBeInTheDocument();
        expect(screen.getByText("프론트엔드 개발")).toBeInTheDocument();
    });

    it("deal_name이 없으면 work_name만 표시된다", () => {
        render(
            <MobileRecentWorkMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                recent_works={[MOCK_RECENT_WORKS[1]]}
                onSelect={on_select}
                onClose={on_close}
            />
        );

        expect(screen.getByText("백엔드 개발")).toBeInTheDocument();
    });

    it("작업이 없으면 빈 상태 메시지가 표시된다", () => {
        render(
            <MobileRecentWorkMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                recent_works={[]}
                onSelect={on_select}
                onClose={on_close}
            />
        );

        expect(screen.getByText("최근 작업이 없어요")).toBeInTheDocument();
    });

    it("최대 5개 항목만 표시된다", () => {
        const many_works = Array.from({ length: 8 }, (_, i) => ({
            record_id: `r${i}`,
            work_name: `작업 ${i}`,
        }));

        render(
            <MobileRecentWorkMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                recent_works={many_works}
                onSelect={on_select}
                onClose={on_close}
            />
        );

        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(5);
    });

    it("항목 클릭 시 onClose가 호출된다", () => {
        render(
            <MobileRecentWorkMenu
                open={true}
                anchor_rect={MOCK_ANCHOR}
                recent_works={MOCK_RECENT_WORKS}
                onSelect={on_select}
                onClose={on_close}
            />
        );

        fireEvent.click(screen.getByText("UI 구현"));

        expect(on_close).toHaveBeenCalled();
    });
});
