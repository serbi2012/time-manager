/**
 * SettingsModal 컴포넌트 테스트 (강화 버전)
 *
 * 모달 상태 (열기/닫기), 키보드 이벤트, 탭 전환 등 테스트
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsModal from "@/components/SettingsModal";
import { useShortcutStore, DEFAULT_SHORTCUTS } from "@/store/useShortcutStore";
import { useWorkStore } from "@/store/useWorkStore";
import {
    createMockRecord,
    renderWithAntd,
    resetWorkStore,
} from "@/test/helpers";

const resetStores = () => {
    useShortcutStore.setState({
        shortcuts: [...DEFAULT_SHORTCUTS],
    });
    resetWorkStore();
};

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
    });

    // =====================================================
    // 모달 열기/닫기 테스트
    // =====================================================
    describe("모달 열기/닫기", () => {
        it("open=true일 때 모달이 표시됨", () => {
            renderWithAntd(<SettingsModal {...defaultProps} open={true} />);

            expect(screen.getByText("설정")).toBeInTheDocument();
        });

        it("open=false일 때 모달이 숨겨짐", () => {
            renderWithAntd(<SettingsModal {...defaultProps} open={false} />);

            expect(screen.queryByText("설정")).not.toBeInTheDocument();
        });

        it("X 버튼 클릭 시 onClose가 호출됨", async () => {
            const on_close = vi.fn();
            renderWithAntd(
                <SettingsModal {...defaultProps} onClose={on_close} />
            );

            const close_button = screen.getByRole("button", { name: /close/i });
            fireEvent.click(close_button);

            expect(on_close).toHaveBeenCalledTimes(1);
        });

        it("ESC 키 입력 시 onClose가 호출됨", async () => {
            const on_close = vi.fn();
            renderWithAntd(
                <SettingsModal {...defaultProps} onClose={on_close} />
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
        it("데이터 탭 클릭 시 데이터 관련 내용이 표시됨", async () => {
            const user = userEvent.setup();
            renderWithAntd(<SettingsModal {...defaultProps} />);

            await user.click(screen.getByText("데이터"));

            await waitFor(() => {
                expect(screen.getByText("내보내기")).toBeInTheDocument();
                expect(screen.getByText("가져오기")).toBeInTheDocument();
            });
        });

        it("단축키 탭 클릭 시 단축키 목록이 표시됨", async () => {
            renderWithAntd(<SettingsModal {...defaultProps} />);

            // Note: fireEvent 사용 (Ant Design Table의 responsiveObserver 호환성)
            fireEvent.click(screen.getByText("단축키"));

            await waitFor(() => {
                expect(screen.getByText("새 작업 추가")).toBeInTheDocument();
                expect(screen.getByText("기본값으로 초기화")).toBeInTheDocument();
            });
        });

        it("자동완성 탭 클릭 시 자동완성 옵션이 표시됨", async () => {
            const user = userEvent.setup();
            renderWithAntd(<SettingsModal {...defaultProps} />);

            await user.click(screen.getByText("자동완성"));

            await waitFor(() => {
                expect(screen.getByText(/^작업명/)).toBeInTheDocument();
            });
        });

        it("자동완성 탭에 레코드에서 추출한 옵션이 표시됨", async () => {
            useWorkStore.setState({
                records: [
                    createMockRecord({
                        project_code: "A25_TEST",
                        work_name: "테스트 작업",
                        deal_name: "테스트 거래",
                    }),
                ],
            });
            const user = userEvent.setup({ delay: null });
            renderWithAntd(<SettingsModal {...defaultProps} />);

            await user.click(screen.getByText("자동완성"));

            await waitFor(() => {
                expect(screen.getByText("테스트 작업")).toBeInTheDocument();
                expect(screen.getByText("테스트 거래")).toBeInTheDocument();
                expect(screen.getByText("A25_TEST")).toBeInTheDocument();
            });
        });
    });
});
