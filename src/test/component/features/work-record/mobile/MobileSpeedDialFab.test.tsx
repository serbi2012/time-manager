/**
 * MobileSpeedDialFab 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileSpeedDialFab } from "../../../../../features/work-record/ui/Mobile/MobileSpeedDialFab";
import { MOBILE_RECORD_LABEL } from "../../../../../features/work-record/constants";

describe("MobileSpeedDialFab", () => {
    const default_props = {
        on_add_record: vi.fn(),
        on_open_preset: vi.fn(),
        app_theme: "blue" as const,
    };

    function getMainButton() {
        const buttons = screen.getAllByRole("button");
        return buttons[buttons.length - 1];
    }

    function getMiniFabGroup(label: string) {
        const group = screen.getByText(label).parentElement;
        if (!group) throw new Error("미니 FAB 영역을 찾을 수 없음");
        return group;
    }

    it("메인 버튼 클릭 시 미니 FAB가 펼쳐지고 다시 누르면 접힌다", () => {
        render(<MobileSpeedDialFab {...default_props} />);

        const new_record_group = getMiniFabGroup(
            MOBILE_RECORD_LABEL.SPEED_DIAL_NEW_RECORD
        );
        const preset_group = getMiniFabGroup(
            MOBILE_RECORD_LABEL.SPEED_DIAL_PRESET
        );
        expect(new_record_group).toHaveClass("pointer-events-none");
        expect(preset_group).toHaveClass("pointer-events-none");

        fireEvent.click(getMainButton());

        expect(new_record_group).toHaveClass("opacity-100");
        expect(preset_group).toHaveClass("opacity-100");
        expect(getMainButton().style.transform).toBe("rotate(45deg)");

        fireEvent.click(getMainButton());

        expect(new_record_group).toHaveClass("pointer-events-none");
        expect(getMainButton().style.transform).toBe("rotate(0deg)");
    });

    it("새 작업 미니 FAB 클릭 시 on_add_record가 호출된다", () => {
        const on_add_record = vi.fn();
        render(
            <MobileSpeedDialFab
                {...default_props}
                on_add_record={on_add_record}
            />
        );

        fireEvent.click(getMainButton());
        const new_record_group = getMiniFabGroup(
            MOBILE_RECORD_LABEL.SPEED_DIAL_NEW_RECORD
        );
        const new_record_btn = new_record_group.querySelector("button")!;
        fireEvent.click(new_record_btn);

        expect(on_add_record).toHaveBeenCalledTimes(1);
        expect(new_record_group).toHaveClass("pointer-events-none");
    });

    it("프리셋 미니 FAB 클릭 시 on_open_preset이 호출된다", () => {
        const on_open_preset = vi.fn();
        render(
            <MobileSpeedDialFab
                {...default_props}
                on_open_preset={on_open_preset}
            />
        );

        const preset_label = screen.getByText(
            MOBILE_RECORD_LABEL.SPEED_DIAL_PRESET
        );
        const preset_btn = preset_label.parentElement!.querySelector("button")!;
        fireEvent.click(preset_btn);

        expect(on_open_preset).toHaveBeenCalledTimes(1);
    });
});
