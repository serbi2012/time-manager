/**
 * 키보드 단축키 통합 테스트
 * 
 * 실제 단축키 동작을 검증합니다.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useShortcuts } from "../../../hooks/useShortcuts";
import { useShortcutStore, DEFAULT_SHORTCUTS } from "../../../store/useShortcutStore";

// 스토어 초기화
const resetStore = () => {
    useShortcutStore.setState({
        shortcuts: [...DEFAULT_SHORTCUTS],
    });
};

describe("키보드 단축키 통합 테스트", () => {
    beforeEach(() => {
        resetStore();
    });

    // =====================================================
    // F8 단축키 테스트 (모달 저장)
    // =====================================================
    describe("F8 단축키 (모달 저장)", () => {
        it("F8 키를 누르면 modalSubmit 핸들러가 호출됨", () => {
            const handlers = {
                modalSubmit: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            // F8 키 이벤트 시뮬레이션
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "F8",
                        code: "F8",
                        bubbles: true,
                    })
                );
            });

            expect(handlers.modalSubmit).toHaveBeenCalledTimes(1);
        });

        it("F8 단축키 비활성화 시 핸들러가 호출되지 않음", () => {
            // F8 단축키 비활성화
            useShortcutStore.getState().toggleShortcut("modal-submit");

            const handlers = {
                modalSubmit: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "F8",
                        code: "F8",
                        bubbles: true,
                    })
                );
            });

            expect(handlers.modalSubmit).not.toHaveBeenCalled();
        });
    });

    // =====================================================
    // Alt 조합 단축키 테스트
    // =====================================================
    describe("Alt 조합 단축키", () => {
        it("Alt+N 키를 누르면 새 작업 추가 핸들러가 호출됨", () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "n",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1);
        });

        it("Alt+S 키를 누르면 타이머 토글 핸들러가 호출됨", () => {
            const handlers = {
                toggleTimer: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "s",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.toggleTimer).toHaveBeenCalledTimes(1);
        });

        it("Alt+T 키를 누르면 오늘로 이동 핸들러가 호출됨", () => {
            const handlers = {
                goToday: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "t",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.goToday).toHaveBeenCalledTimes(1);
        });

        it("Alt+P 키를 누르면 새 프리셋 모달 핸들러가 호출됨", () => {
            const handlers = {
                openNewPresetModal: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "p",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.openNewPresetModal).toHaveBeenCalledTimes(1);
        });

        it("Alt+, 키를 누르면 설정 모달 핸들러가 호출됨", () => {
            const handlers = {
                openSettings: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: ",",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.openSettings).toHaveBeenCalledTimes(1);
        });
    });

    // =====================================================
    // 네비게이션 단축키 테스트
    // =====================================================
    describe("네비게이션 단축키", () => {
        it("Alt+1 키를 누르면 일간 기록 페이지로 이동", () => {
            const handlers = {
                goDaily: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "1",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.goDaily).toHaveBeenCalledTimes(1);
        });

        it("Alt+2 키를 누르면 주간 일정 페이지로 이동", () => {
            const handlers = {
                goWeekly: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "2",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.goWeekly).toHaveBeenCalledTimes(1);
        });

        it("Alt+Left 키를 누르면 이전 날짜로 이동", () => {
            const handlers = {
                prevDay: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "ArrowLeft",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.prevDay).toHaveBeenCalledTimes(1);
        });

        it("Alt+Right 키를 누르면 다음 날짜로 이동", () => {
            const handlers = {
                nextDay: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "ArrowRight",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.nextDay).toHaveBeenCalledTimes(1);
        });
    });

    // =====================================================
    // Shift 조합 단축키 테스트
    // =====================================================
    describe("Shift 조합 단축키", () => {
        it("Alt+Shift+S 키를 누르면 수동 동기화 핸들러가 호출됨", () => {
            const handlers = {
                syncData: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "s",
                        altKey: true,
                        shiftKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.syncData).toHaveBeenCalledTimes(1);
        });
    });

    // =====================================================
    // 데이터 단축키 테스트
    // =====================================================
    describe("데이터 단축키", () => {
        it("Alt+E 키를 누르면 데이터 내보내기 핸들러가 호출됨", () => {
            const handlers = {
                exportData: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "e",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.exportData).toHaveBeenCalledTimes(1);
        });

        it("Alt+R 키를 누르면 타이머 초기화 핸들러가 호출됨", () => {
            const handlers = {
                resetTimer: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "r",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });

            expect(handlers.resetTimer).toHaveBeenCalledTimes(1);
        });
    });

    // =====================================================
    // 단축키 키 조합 변경 테스트
    // =====================================================
    describe("단축키 키 조합 변경", () => {
        it("단축키 키 조합을 변경하면 새 키로 동작함", () => {
            // Alt+N을 Alt+Q로 변경
            const result = useShortcutStore.getState().setShortcutKeys("new-work", "Alt+Q");
            expect(result.success).toBe(true);

            const handlers = {
                openNewWorkModal: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            // 기존 Alt+N은 동작하지 않아야 함
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "n",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });
            expect(handlers.openNewWorkModal).not.toHaveBeenCalled();

            // 새 Alt+Q는 동작해야 함
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "q",
                        altKey: true,
                        bubbles: true,
                    })
                );
            });
            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1);
        });

        it("중복된 키 조합으로 변경 시 실패함", () => {
            // Alt+S는 이미 toggleTimer에서 사용 중
            const result = useShortcutStore.getState().setShortcutKeys("new-work", "Alt+S");
            expect(result.success).toBe(false);
            expect(result.message).toContain("이미");
        });
    });

    // =====================================================
    // 다중 핸들러 테스트
    // =====================================================
    describe("다중 핸들러 동시 등록", () => {
        it("여러 핸들러가 등록되어도 각각 독립적으로 동작함", () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
                toggleTimer: vi.fn(),
                goToday: vi.fn(),
                modalSubmit: vi.fn(),
            };

            renderHook(() => useShortcuts(handlers));

            // Alt+N
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "n", altKey: true, bubbles: true })
                );
            });
            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1);
            expect(handlers.toggleTimer).not.toHaveBeenCalled();

            // Alt+S
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "s", altKey: true, bubbles: true })
                );
            });
            expect(handlers.toggleTimer).toHaveBeenCalledTimes(1);
            expect(handlers.goToday).not.toHaveBeenCalled();

            // Alt+T
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "t", altKey: true, bubbles: true })
                );
            });
            expect(handlers.goToday).toHaveBeenCalledTimes(1);

            // F8
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "F8", bubbles: true })
                );
            });
            expect(handlers.modalSubmit).toHaveBeenCalledTimes(1);
        });
    });

    // =====================================================
    // 언마운트 테스트
    // =====================================================
    describe("훅 언마운트", () => {
        it("언마운트 후에는 핸들러가 호출되지 않음", () => {
            const handlers = {
                modalSubmit: vi.fn(),
            };

            const { unmount } = renderHook(() => useShortcuts(handlers));

            // 언마운트 전 동작 확인
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "F8", bubbles: true })
                );
            });
            expect(handlers.modalSubmit).toHaveBeenCalledTimes(1);

            // 언마운트
            unmount();

            // 언마운트 후 동작하지 않아야 함
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "F8", bubbles: true })
                );
            });
            expect(handlers.modalSubmit).toHaveBeenCalledTimes(1); // 여전히 1
        });
    });
});
