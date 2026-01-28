/**
 * HeaderContent 스냅샷 테스트
 * UI 구조 변경 감지
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HeaderContent } from "../../../widgets/Header/HeaderContent";

// useNavigate 모킹
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe("HeaderContent 스냅샷", () => {
    it("기본 렌더링 구조가 유지됨", () => {
        const { container } = render(
            <MemoryRouter>
                <HeaderContent />
            </MemoryRouter>
        );

        expect(container.firstChild).toMatchSnapshot();
    });
});
