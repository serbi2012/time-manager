/**
 * DataTab 컴포넌트 테스트
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { DataTab } from "../../../../features/settings/ui/tabs/DataTab";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

describe("DataTab", () => {
    const default_props = {
        onExport: vi.fn(),
        onImport: vi.fn(),
        isAuthenticated: false,
    };

    it("렌더링되어야 함", () => {
        render(
            <TestWrapper>
                <DataTab {...default_props} />
            </TestWrapper>
        );

        expect(screen.getByText("시간 설정")).toBeInTheDocument();
        expect(screen.getByText("데이터 관리")).toBeInTheDocument();
        expect(screen.getByText("내보내기")).toBeInTheDocument();
        expect(screen.getByText("가져오기")).toBeInTheDocument();
    });

    it("로그아웃 상태에서 로컬 저장 표시", () => {
        render(
            <TestWrapper>
                <DataTab {...default_props} isAuthenticated={false} />
            </TestWrapper>
        );

        expect(screen.getByText("로컬 저장")).toBeInTheDocument();
    });

    it("로그인 상태에서 클라우드 연결됨 표시", () => {
        render(
            <TestWrapper>
                <DataTab {...default_props} isAuthenticated={true} />
            </TestWrapper>
        );

        expect(screen.getByText("클라우드 연결됨")).toBeInTheDocument();
    });

    it("점심시간 섹션 표시", () => {
        render(
            <TestWrapper>
                <DataTab {...default_props} />
            </TestWrapper>
        );

        expect(screen.getByText("점심시간")).toBeInTheDocument();
    });

    it("내보내기 버튼 클릭 시 onExport 호출", () => {
        const onExport = vi.fn();
        render(
            <TestWrapper>
                <DataTab {...default_props} onExport={onExport} />
            </TestWrapper>
        );

        const export_button = screen.getByText("내보내기");
        fireEvent.click(export_button);

        expect(onExport).toHaveBeenCalled();
    });
});
