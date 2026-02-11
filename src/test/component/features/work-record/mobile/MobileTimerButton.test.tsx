/**
 * MobileTimerButton 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileTimerButton } from "../../../../../features/work-record/ui/Mobile/MobileTimerButton";

describe("MobileTimerButton", () => {
    it("비활성 상태에서 렌더링된다", () => {
        render(<MobileTimerButton is_active={false} onToggle={vi.fn()} />);

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
    });

    it("활성 상태에서 pulse 클래스를 가진다", () => {
        render(<MobileTimerButton is_active={true} onToggle={vi.fn()} />);

        const button = screen.getByRole("button");
        expect(button.className).toContain("mobile-timer-pulse");
    });

    it("비활성 상태에서 pulse 클래스가 없다", () => {
        render(<MobileTimerButton is_active={false} onToggle={vi.fn()} />);

        const button = screen.getByRole("button");
        expect(button.className).not.toContain("mobile-timer-pulse");
    });

    it("클릭 시 onToggle이 호출된다", () => {
        const on_toggle = vi.fn();
        render(<MobileTimerButton is_active={false} onToggle={on_toggle} />);

        fireEvent.click(screen.getByRole("button"));
        expect(on_toggle).toHaveBeenCalledTimes(1);
    });

    it("활성 상태에서 클릭해도 onToggle이 호출된다", () => {
        const on_toggle = vi.fn();
        render(<MobileTimerButton is_active={true} onToggle={on_toggle} />);

        fireEvent.click(screen.getByRole("button"));
        expect(on_toggle).toHaveBeenCalledTimes(1);
    });
});
