/**
 * MobileSidebar (Guide) 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileSidebar } from "../../../../../features/guide/ui/MobileSidebar/MobileSidebar";
import { TABLE_OF_CONTENTS } from "@/docs";

const DEFAULT_PROPS = {
    current_section: "overview",
    search_query: "",
    search_results: [],
    on_search: vi.fn(),
    on_menu_click: vi.fn(),
    on_search_result_click: vi.fn(),
};

describe("MobileSidebar", () => {
    it("검색 입력창이 표시된다", () => {
        render(<MobileSidebar {...DEFAULT_PROPS} />);
        expect(screen.getByPlaceholderText("문서 검색...")).toBeInTheDocument();
    });

    it("목차 항목마다 메뉴 칩이 표시된다", () => {
        render(<MobileSidebar {...DEFAULT_PROPS} />);

        expect(screen.getAllByRole("button")).toHaveLength(
            TABLE_OF_CONTENTS.length
        );
    });

    it("메뉴 칩 클릭 시 on_menu_click이 호출된다", () => {
        const on_menu_click = vi.fn();
        render(
            <MobileSidebar {...DEFAULT_PROPS} on_menu_click={on_menu_click} />
        );

        const target_section = TABLE_OF_CONTENTS[1];
        fireEvent.click(
            screen.getByRole("button", { name: target_section.title })
        );

        expect(on_menu_click).toHaveBeenCalledWith(target_section.id);
    });

    it("검색어가 있을 때 결과 없으면 빈 상태가 표시된다", () => {
        render(
            <MobileSidebar
                {...DEFAULT_PROPS}
                search_query="존재하지않는검색어"
                search_results={[]}
            />
        );
        expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
    });

    it("검색 결과가 있으면 결과 목록이 표시된다", () => {
        const results = [
            { id: "overview", title: "개요", preview: "앱 소개", matches: 1 },
        ];
        render(
            <MobileSidebar
                {...DEFAULT_PROPS}
                search_query="개요"
                search_results={results}
            />
        );
        expect(screen.getByText("개요")).toBeInTheDocument();
    });

    it("검색 결과 클릭 시 on_search_result_click이 호출된다", () => {
        const on_click = vi.fn();
        const results = [
            { id: "overview", title: "개요", preview: "앱 소개", matches: 1 },
        ];
        render(
            <MobileSidebar
                {...DEFAULT_PROPS}
                search_query="개요"
                search_results={results}
                on_search_result_click={on_click}
            />
        );

        fireEvent.click(screen.getByText("개요"));
        expect(on_click).toHaveBeenCalledWith("overview", "개요");
    });
});
