/**
 * MobilePresetRow 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { MobilePresetRow } from "@/features/work-template/ui/Mobile/MobilePresetRow";
import { MOBILE_PRESET_SHEET } from "@/features/work-template/constants";
import type { WorkTemplate } from "@/shared/types";

const TEMPLATE = {
    id: "t1",
    project_code: "",
    work_name: "부가세 개발",
    task_name: "개발",
    deal_name: "임시저장 적용",
    category_name: "개발",
    note: "",
    color: "#34C759",
    sort_order: 0,
} as WorkTemplate;

function renderRow(overrides: {
    onSelect?: () => void;
    onStart?: () => void;
} = {}) {
    const onSelect = vi.fn(overrides.onSelect);
    const onStart = vi.fn(overrides.onStart);
    const onLongPress = vi.fn();

    render(
        <MobilePresetRow
            template={TEMPLATE}
            onSelect={onSelect}
            onStart={onStart}
            onLongPress={onLongPress}
        />
    );

    return { onSelect, onStart, onLongPress };
}

describe("MobilePresetRow", () => {
    it("거래명을 제목으로, 작업명과 카테고리를 부가 정보로 보여준다", () => {
        renderRow();

        expect(screen.getByText("임시저장 적용")).toBeInTheDocument();
        expect(screen.getByText("부가세 개발 · 개발")).toBeInTheDocument();
    });

    it("행을 누르면 작업만 추가한다", () => {
        const { onSelect, onStart } = renderRow();

        fireEvent.click(screen.getByText("임시저장 적용"));

        expect(onSelect).toHaveBeenCalledWith(TEMPLATE.id);
        expect(onStart).not.toHaveBeenCalled();
    });

    it("시작 버튼을 누르면 타이머까지 시작한다", () => {
        const { onStart } = renderRow();

        fireEvent.click(
            screen.getByRole("button", {
                name: MOBILE_PRESET_SHEET.START_LABEL,
            })
        );

        expect(onStart).toHaveBeenCalledWith(TEMPLATE.id);
    });

    it("시작 버튼을 눌러도 행 탭 동작은 일어나지 않는다", () => {
        const { onSelect, onStart } = renderRow();

        fireEvent.click(
            screen.getByRole("button", {
                name: MOBILE_PRESET_SHEET.START_LABEL,
            })
        );

        expect(onStart).toHaveBeenCalledTimes(1);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("시작 버튼에 접근성 이름이 있다", () => {
        renderRow();

        expect(
            screen.getByLabelText(MOBILE_PRESET_SHEET.START_LABEL)
        ).toBeInTheDocument();
    });
});
