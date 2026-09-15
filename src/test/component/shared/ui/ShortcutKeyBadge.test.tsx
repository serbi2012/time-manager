/**
 * ShortcutKeyBadge 컴포넌트 테스트
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
    ShortcutKeyBadge,
    InputCapabilityProvider,
} from "@/shared/ui/keyboard";

describe("ShortcutKeyBadge", () => {
    it("Provider가 없으면 단축키를 표시한다", () => {
        render(<ShortcutKeyBadge keys="F8" />);

        expect(screen.getByText("(F8)")).toBeInTheDocument();
    });

    it("키보드가 있는 환경에서는 단축키를 표시한다", () => {
        render(
            <InputCapabilityProvider has_keyboard={true}>
                <ShortcutKeyBadge keys="F8" />
            </InputCapabilityProvider>
        );

        expect(screen.getByText("(F8)")).toBeInTheDocument();
    });

    it("키보드가 없는 환경에서는 아무것도 렌더하지 않는다", () => {
        const { container } = render(
            <InputCapabilityProvider has_keyboard={false}>
                <ShortcutKeyBadge keys="F8" />
            </InputCapabilityProvider>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("키가 비어 있으면 아무것도 렌더하지 않는다", () => {
        const { container } = render(<ShortcutKeyBadge keys="" />);

        expect(container).toBeEmptyDOMElement();
    });

    it("chip 형태는 괄호 없이 표시한다", () => {
        render(<ShortcutKeyBadge keys="F8" variant="chip" />);

        expect(screen.getByText("F8")).toBeInTheDocument();
    });
});
