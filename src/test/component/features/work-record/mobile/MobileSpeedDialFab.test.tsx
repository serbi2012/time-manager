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

    it("메인 FAB 버튼이 렌더링된다", () => {
        render(<MobileSpeedDialFab {...default_props} />);

        expect(getMainButton()).toBeInTheDocument();
    });

    it("메인 버튼 클릭 시 미니 FAB 라벨이 존재한다", () => {
        render(<MobileSpeedDialFab {...default_props} />);

        expect(
            screen.getByText(MOBILE_RECORD_LABEL.SPEED_DIAL_NEW_RECORD)
        ).toBeInTheDocument();
        expect(
            screen.getByText(MOBILE_RECORD_LABEL.SPEED_DIAL_PRESET)
        ).toBeInTheDocument();
    });

    it("새 작업 미니 FAB 클릭 시 on_add_record가 호출된다", () => {
        const on_add_record = vi.fn();
        render(
            <MobileSpeedDialFab
                {...default_props}
                on_add_record={on_add_record}
            />
        );

        const new_record_label = screen.getByText(
            MOBILE_RECORD_LABEL.SPEED_DIAL_NEW_RECORD
        );
        const new_record_btn =
            new_record_label.parentElement!.querySelector("button")!;
        fireEvent.click(new_record_btn);

        expect(on_add_record).toHaveBeenCalledTimes(1);
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
