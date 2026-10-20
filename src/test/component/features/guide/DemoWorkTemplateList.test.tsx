import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithAntd } from "@/test/helpers";
import { DemoWorkTemplateList } from "@/components/guide/DemoWorkTemplateList";
import { DEMO_TEMPLATES } from "@/components/guide/demo_data";

describe("DemoWorkTemplateList", () => {
    it("실제 사이드바처럼 개수 대신 접기 버튼을 표시한다", () => {
        renderWithAntd(<DemoWorkTemplateList />);

        expect(
            screen.getByRole("button", { name: "사이드바 접기" })
        ).toBeInTheDocument();
        expect(
            screen.queryByText(`${DEMO_TEMPLATES.length}개`)
        ).not.toBeInTheDocument();
    });
});
