/**
 * SettingsModal 컴포넌트 테스트 (강화 버전)
 *
 * 모달 상태 (열기/닫기), 키보드 이벤트, 탭 전환 등 테스트
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import SettingsModal from "../../../../components/SettingsModal";
import { useShortcutStore, DEFAULT_SHORTCUTS } from "../../../../store/useShortcutStore";
import { useWorkStore } from "../../../../store/useWorkStore";

// 스토어 초기화
const resetStores = () => {
    useShortcutStore.setState({
        shortcuts: [...DEFAULT_SHORTCUTS],
    });
    useWorkStore.setState({
        records: [],
        templates: [],
        custom_task_options: [],
        custom_category_options: [],
        hidden_autocomplete_options: {
            work_name: [],
            task_name: [],
            deal_name: [],
            project_code: [],
            task_option: [],
            category_option: [],
        },
    });
};

// 테스트용 래퍼 컴포넌트
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
);

// 기본 props
const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    isAuthenticated: false,
};

describe("SettingsModal 상태 테스트", () => {
    beforeEach(() => {
        resetStores();
        vi.clearAllMocks();
    });

    // =====================================================
    // 모달 열기/닫기 테스트
    // =====================================================
    describe("모달 열기/닫기", () => {
        it("open=true일 때 모달이 표시됨", () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} open={true} />
                </TestWrapper>
            );

            expect(screen.getByText("설정")).toBeInTheDocument();
        });

        it("open=false일 때 모달이 숨겨짐", () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} open={false} />
                </TestWrapper>
            );

            expect(screen.queryByText("설정")).not.toBeInTheDocument();
        });

        it("X 버튼 클릭 시 onClose가 호출됨", async () => {
            const on_close = vi.fn();
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} onClose={on_close} />
                </TestWrapper>
            );

            const close_button = screen.getByRole("button", { name: /close/i });
            fireEvent.click(close_button);

            expect(on_close).toHaveBeenCalledTimes(1);
        });

        it("ESC 키 입력 시 onClose가 호출됨", async () => {
            const on_close = vi.fn();
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} onClose={on_close} />
                </TestWrapper>
            );

            // ESC 키 이벤트
            fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

            await waitFor(() => {
                expect(on_close).toHaveBeenCalled();
            });
        });
    });

    // =====================================================
    // 탭 네비게이션 테스트
    // =====================================================
    describe("탭 네비게이션", () => {
        it("기본적으로 테마 탭이 표시됨", () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            );

            // 테마 탭 컨텐츠가 표시되어야 함 (테마 색상 관련 요소)
            expect(screen.getByText("테마")).toBeInTheDocument();
        });

        it("데이터 탭 클릭 시 데이터 관련 내용이 표시됨", async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            );

            await user.click(screen.getByText("데이터"));

            await waitFor(() => {
                expect(screen.getByText("내보내기")).toBeInTheDocument();
                expect(screen.getByText("가져오기")).toBeInTheDocument();
            });
        });

        it("단축키 탭 클릭 시 단축키 목록이 표시됨", async () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            );

            // Note: fireEvent 사용 (Ant Design Table의 responsiveObserver 호환성)
            fireEvent.click(screen.getByText("단축키"));

            await waitFor(() => {
                expect(screen.getByText("새 작업 추가")).toBeInTheDocument();
                expect(screen.getByText("기본값으로 초기화")).toBeInTheDocument();
            });
        });

        it("자동완성 탭 클릭 시 자동완성 옵션이 표시됨", async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            );

            await user.click(screen.getByText("자동완성"));

            await waitFor(() => {
                expect(screen.getByText(/^작업명/)).toBeInTheDocument();
            });
        });
    });

    // =====================================================
    // 데이터 탭 상호작용 테스트
    // =====================================================
    describe("데이터 탭 상호작용", () => {
        it("내보내기 버튼 클릭 시 onExport가 호출됨", async () => {
            const user = userEvent.setup();
            const on_export = vi.fn();
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} onExport={on_export} />
                </TestWrapper>
            );

            await user.click(screen.getByText("데이터"));

            await waitFor(() => {
                expect(screen.getByText("내보내기")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("내보내기"));
            expect(on_export).toHaveBeenCalledTimes(1);
        });

        it("로그인 상태에 따라 저장소 상태가 다르게 표시됨", async () => {
            const user = userEvent.setup();

            // 비로그인 상태
            const { rerender } = render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} isAuthenticated={false} />
                </TestWrapper>
            );

            await user.click(screen.getByText("데이터"));

            await waitFor(() => {
                expect(screen.getByText("로컬 저장")).toBeInTheDocument();
            });

            // 로그인 상태
            rerender(
                <TestWrapper>
                    <SettingsModal {...defaultProps} isAuthenticated={true} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText("클라우드 연결됨")).toBeInTheDocument();
            });
        });
    });

    // =====================================================
    // 단축키 탭 상호작용 테스트
    // Note: fireEvent 사용 (Ant Design Table의 responsiveObserver 호환성)
    // =====================================================
    describe("단축키 탭 상호작용", () => {
        it("단축키 토글 스위치가 동작함", async () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            );

            fireEvent.click(screen.getByText("단축키"));

            await waitFor(() => {
                expect(screen.getAllByRole("switch").length).toBeGreaterThan(0);
            });

            // 초기 상태 확인
            const initial_state = useShortcutStore.getState();
            const new_work_shortcut = initial_state.getShortcut("new-work");
            expect(new_work_shortcut?.enabled).toBe(true);

            // 첫 번째 스위치 토글
            const switches = screen.getAllByRole("switch");
            fireEvent.click(switches[0]);

            // 스토어 상태 변경 확인
            const updated_state = useShortcutStore.getState();
            const updated_shortcut = updated_state.getShortcut("new-work");
            expect(updated_shortcut?.enabled).toBe(false);
        });

        it("단축키 키 조합이 표시됨", async () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            );

            fireEvent.click(screen.getByText("단축키"));

            await waitFor(() => {
                expect(screen.getByText("Alt+N")).toBeInTheDocument();
            });
        });
    });

    // =====================================================
    // 모달 포커스 트래핑 테스트
    // =====================================================
    describe("접근성", () => {
        it("모달에 role=dialog가 있음", async () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            );

            // Ant Design Modal은 role="dialog"를 자동으로 추가함
            await waitFor(() => {
                const dialogs = document.querySelectorAll('[role="dialog"]');
                expect(dialogs.length).toBeGreaterThan(0);
            });
        });

        it("모달 제목이 설정으로 표시됨", () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByText("설정")).toBeInTheDocument();
        });
    });
});
