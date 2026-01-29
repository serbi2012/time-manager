import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HighlightText } from "../../../../shared/ui/HighlightText";

describe("HighlightText", () => {
    describe("렌더링", () => {
        it("검색어가 없으면 원본 텍스트만 표시됨", () => {
            render(<HighlightText text="테스트 텍스트입니다" search="" />);
            expect(screen.getByText("테스트 텍스트입니다")).toBeInTheDocument();
        });

        it("검색어가 공백만 있으면 원본 텍스트만 표시됨", () => {
            render(<HighlightText text="테스트 텍스트입니다" search="   " />);
            expect(screen.getByText("테스트 텍스트입니다")).toBeInTheDocument();
        });

        it("검색어와 일치하는 부분이 하이라이트됨", () => {
            const { container } = render(
                <HighlightText text="테스트 텍스트입니다" search="텍스트" />
            );
            const marks = container.querySelectorAll("mark");
            expect(marks).toHaveLength(1);
            expect(marks[0].textContent).toBe("텍스트");
        });

        it("여러 일치 부분이 모두 하이라이트됨", () => {
            const { container } = render(
                <HighlightText text="테스트 텍스트 테스트" search="테스트" />
            );
            const marks = container.querySelectorAll("mark");
            expect(marks).toHaveLength(2);
        });
    });

    describe("대소문자 처리", () => {
        it("대소문자 구분 없이 검색됨", () => {
            const { container } = render(
                <HighlightText text="Hello World" search="hello" />
            );
            const marks = container.querySelectorAll("mark");
            expect(marks).toHaveLength(1);
            expect(marks[0].textContent).toBe("Hello");
        });

        it("원본 텍스트의 대소문자가 유지됨", () => {
            const { container } = render(
                <HighlightText text="HELLO world Hello" search="hello" />
            );
            const marks = container.querySelectorAll("mark");
            expect(marks).toHaveLength(2);
            expect(marks[0].textContent).toBe("HELLO");
            expect(marks[1].textContent).toBe("Hello");
        });
    });

    describe("스타일", () => {
        it("기본 하이라이트 스타일이 적용됨", () => {
            const { container } = render(
                <HighlightText text="테스트 텍스트" search="텍스트" />
            );
            const mark = container.querySelector("mark");
            expect(mark).toBeInTheDocument();
            // 인라인 스타일 속성 확인 (HEX 또는 RGB 형식)
            const bg_color = mark?.style.backgroundColor;
            expect(bg_color === "#ffc069" || bg_color === "rgb(255, 192, 105)").toBe(true);
        });

        it("커스텀 하이라이트 스타일이 적용됨", () => {
            const custom_style = { backgroundColor: "yellow", fontWeight: "bold" };
            const { container } = render(
                <HighlightText
                    text="테스트 텍스트"
                    search="텍스트"
                    highlightStyle={custom_style}
                />
            );
            const mark = container.querySelector("mark");
            expect(mark).toBeInTheDocument();
            expect(mark?.style.backgroundColor).toBe("yellow");
        });
    });

    describe("엣지 케이스", () => {
        it("텍스트 전체가 검색어와 일치하면 전체가 하이라이트됨", () => {
            const { container } = render(
                <HighlightText text="검색어" search="검색어" />
            );
            const mark = container.querySelector("mark");
            expect(mark?.textContent).toBe("검색어");
        });

        it("검색어가 텍스트보다 길면 하이라이트 없음", () => {
            const { container } = render(
                <HighlightText text="짧은" search="짧은 텍스트보다 긴 검색어" />
            );
            const marks = container.querySelectorAll("mark");
            expect(marks).toHaveLength(0);
        });

        it("특수문자가 포함된 검색어도 처리됨", () => {
            const { container } = render(
                <HighlightText text="[A26_00397] 작업명" search="[A26" />
            );
            const marks = container.querySelectorAll("mark");
            expect(marks).toHaveLength(1);
            expect(marks[0].textContent).toBe("[A26");
        });
    });
});
