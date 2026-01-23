/**
 * DataTab 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTab } from "../../../../features/settings/ui/tabs/DataTab";

describe("DataTab", () => {
    const default_props = {
        on_export: vi.fn(),
        on_import: vi.fn(),
        is_logged_in: false,
    };

    it("렌더링되어야 함", () => {
        render(<DataTab {...default_props} />);

        expect(screen.getByText("데이터 저장 위치")).toBeInTheDocument();
        expect(screen.getByText("데이터 내보내기")).toBeInTheDocument();
        expect(screen.getByText("데이터 가져오기")).toBeInTheDocument();
    });

    it("로그아웃 상태에서 LocalStorage 태그 표시", () => {
        render(<DataTab {...default_props} is_logged_in={false} />);

        expect(screen.getByText(/LocalStorage/)).toBeInTheDocument();
    });

    it("로그인 상태에서 Firebase Cloud 태그 표시", () => {
        render(<DataTab {...default_props} is_logged_in={true} />);

        expect(screen.getByText(/Firebase Cloud/)).toBeInTheDocument();
    });

    it("로그아웃 상태에서 경고 메시지 표시", () => {
        render(<DataTab {...default_props} is_logged_in={false} />);

        expect(screen.getByText(/브라우저 데이터 삭제 시/)).toBeInTheDocument();
    });

    it("내보내기 버튼 클릭 시 on_export 호출", () => {
        const on_export = vi.fn();
        render(<DataTab {...default_props} on_export={on_export} />);

        const export_button = screen.getByText("내보내기");
        fireEvent.click(export_button);

        expect(on_export).toHaveBeenCalled();
    });
});
