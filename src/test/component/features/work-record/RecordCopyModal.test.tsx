/**
 * RecordCopyModal 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { RecordCopyModal } from "../../../../features/work-record/ui/RecordCopyModal";
import {
    RECORD_COPY_MODAL,
    RECORD_COPY_COLUMNS,
} from "../../../../features/work-record/constants";
import { useWorkStore } from "../../../../store/useWorkStore";
import type { WorkRecord } from "../../../../shared/types";

const SELECTED_DATE = "2026-09-08";

const write_text = vi.fn();

Object.defineProperty(navigator, "clipboard", {
    value: { writeText: write_text },
    configurable: true,
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

function createRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
    return {
        id: "r1",
        work_name: "작업A",
        deal_name: "거래A",
        task_name: "개발",
        category_name: "환경세팅",
        project_code: "A25_01846",
        date: SELECTED_DATE,
        start_time: "09:00",
        end_time: "10:00",
        duration_minutes: 60,
        note: "비고A",
        is_completed: false,
        sessions: [
            {
                id: "s1",
                date: SELECTED_DATE,
                start_time: "09:00",
                end_time: "10:00",
                duration_minutes: 60,
            },
        ],
        ...overrides,
    };
}

function renderModal(records: WorkRecord[] = [createRecord()]) {
    return render(
        <TestWrapper>
            <RecordCopyModal
                open
                records={records}
                selected_date={SELECTED_DATE}
                onClose={vi.fn()}
            />
        </TestWrapper>
    );
}

describe("RecordCopyModal", () => {
    beforeEach(() => {
        useWorkStore.setState({
            deal_codes: {},
            lunch_start_time: "11:40",
            lunch_end_time: "12:40",
        });
        write_text.mockClear();
    });

    it("모달 제목이 시간관리 형식 보기로 표시된다", () => {
        renderModal();

        expect(screen.getByText(RECORD_COPY_MODAL.TITLE)).toBeInTheDocument();
    });

    it("시간관리 양식 컬럼 헤더가 순서대로 표시된다", () => {
        renderModal();

        const headers = screen
            .getAllByRole("columnheader")
            .map((th) => th.textContent);

        expect(headers).toEqual([...RECORD_COPY_COLUMNS]);
    });

    it("레코드 내용이 표에 표시된다", () => {
        renderModal();

        expect(screen.getByText("작업A")).toBeInTheDocument();
        expect(screen.getByText("개발")).toBeInTheDocument();
        expect(screen.getByText("거래A")).toBeInTheDocument();
        expect(screen.getByText("비고A")).toBeInTheDocument();
    });

    it("시간은 단위 없이 숫자로 표시된다", () => {
        renderModal();

        const row = screen.getByText("작업A").closest("tr")!;

        expect(within(row).getByText("60")).toBeInTheDocument();
    });

    it("카테고리 컬럼 없이 카테고리명만 헤더에 있다", () => {
        renderModal();

        const headers = screen
            .getAllByRole("columnheader")
            .map((th) => th.textContent);

        expect(headers).not.toContain("카테고리");
        expect(headers).toContain("카테고리명");
    });

    it("레코드가 없으면 빈 상태를 표시한다", () => {
        renderModal([]);

        expect(screen.getByText(RECORD_COPY_MODAL.EMPTY)).toBeInTheDocument();
    });

    it("셀을 더블클릭하면 그 값이 클립보드에 복사된다", () => {
        renderModal();

        fireEvent.doubleClick(screen.getByText("작업A"));

        expect(write_text).toHaveBeenCalledWith("작업A");
    });

    it("전체 복사를 누르면 시간관리 양식 표가 복사된다", () => {
        renderModal();

        fireEvent.click(screen.getByText(RECORD_COPY_MODAL.COPY_ALL));

        expect(write_text).toHaveBeenCalledTimes(1);
        expect(write_text.mock.calls[0][0]).toContain("거래코드");
        expect(write_text.mock.calls[0][0]).toContain("카테고리명");
    });

    it("저장된 거래코드가 거래명 왼쪽 칸에 표시된다", () => {
        useWorkStore.setState({ deal_codes: { 거래A: "D-001" } });

        renderModal();

        const cells = Array.from(
            screen.getByText("작업A").closest("tr")!.children
        ).map((cell) => cell.textContent);

        expect(cells[2]).toBe("D-001");
        expect(cells[3]).toBe("거래A");
    });

    it("카테고리명만 표시하고 카테고리 코드 칸은 없다", () => {
        renderModal();

        const cells = Array.from(
            screen.getByText("작업A").closest("tr")!.children
        ).map((cell) => cell.textContent);

        expect(cells).toHaveLength(7);
        expect(cells[4]).toBe("환경세팅");
    });

    it("거래코드 칸을 클릭해 입력하면 스토어에 저장된다", () => {
        renderModal();

        const row = screen.getByText("작업A").closest("tr")!;
        fireEvent.click(row.children[2]);

        const input = screen.getByPlaceholderText(
            RECORD_COPY_MODAL.CODE_PLACEHOLDER
        );
        fireEvent.change(input, { target: { value: "D-777" } });
        fireEvent.blur(input);

        expect(useWorkStore.getState().deal_codes["거래A"]).toBe("D-777");
    });

    it("업무가 작업이면 거래에 작업명, 비고에 거래명이 표시된다", () => {
        renderModal([
            createRecord({
                work_name: "기타 문서 작성",
                task_name: "작업",
                deal_name: "시간관리 및 주간일정작성",
                note: "",
            }),
        ]);

        const cells = Array.from(
            screen.getAllByText("기타 문서 작성")[0].closest("tr")!.children
        ).map((cell) => cell.textContent);

        expect(cells[3]).toBe("기타 문서 작성");
        expect(cells[6]).toBe("시간관리 및 주간일정작성");
    });
});
