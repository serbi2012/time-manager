/**
 * RecordFooter 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecordFooter } from "../../../../../features/work-record/ui/Desktop/RecordFooter";
import { RECORD_BUTTON } from "../../../../../features/work-record/constants";

describe("RecordFooter", () => {
    const default_props = {
        record_count: 5,
        onOpenCompleted: vi.fn(),
        onOpenTrash: vi.fn(),
        onCopyRecords: vi.fn(),
    };

    it("레코드 건수가 표시된다", () => {
        render(<RecordFooter {...default_props} />);

        expect(
            screen.getByText((_, element) => {
                return element?.textContent === "총 5건";
            })
        ).toBeInTheDocument();
    });

    it("완료 목록 버튼이 표시된다", () => {
        render(<RecordFooter {...default_props} />);

        expect(
            screen.getByText(`${RECORD_BUTTON.VIEW_COMPLETED} 목록`)
        ).toBeInTheDocument();
    });

    it("휴지통 버튼이 표시된다", () => {
        render(<RecordFooter {...default_props} />);

        expect(screen.getByText(RECORD_BUTTON.VIEW_TRASH)).toBeInTheDocument();
    });

    it("내역 복사 버튼이 표시된다", () => {
        render(<RecordFooter {...default_props} />);

        expect(
            screen.getByText(RECORD_BUTTON.COPY_RECORDS)
        ).toBeInTheDocument();
    });

    it("완료 목록 버튼 클릭 시 onOpenCompleted가 호출된다", () => {
        const on_open_completed = vi.fn();
        render(
            <RecordFooter
                {...default_props}
                onOpenCompleted={on_open_completed}
            />
        );

        fireEvent.click(
            screen.getByText(`${RECORD_BUTTON.VIEW_COMPLETED} 목록`)
        );

        expect(on_open_completed).toHaveBeenCalledTimes(1);
    });

    it("휴지통 버튼 클릭 시 onOpenTrash가 호출된다", () => {
        const on_open_trash = vi.fn();
        render(<RecordFooter {...default_props} onOpenTrash={on_open_trash} />);

        fireEvent.click(screen.getByText(RECORD_BUTTON.VIEW_TRASH));

        expect(on_open_trash).toHaveBeenCalledTimes(1);
    });

    it("내역 복사 버튼 클릭 시 onCopyRecords가 호출된다", () => {
        const on_copy_records = vi.fn();
        render(
            <RecordFooter {...default_props} onCopyRecords={on_copy_records} />
        );

        fireEvent.click(screen.getByText(RECORD_BUTTON.COPY_RECORDS));

        expect(on_copy_records).toHaveBeenCalledTimes(1);
    });

    it("레코드 건수가 0이면 0건으로 표시된다", () => {
        render(<RecordFooter {...default_props} record_count={0} />);

        expect(
            screen.getByText((_, element) => {
                return element?.textContent === "총 0건";
            })
        ).toBeInTheDocument();
    });
});
