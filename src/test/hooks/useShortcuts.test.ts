/**
 * useShortcuts 훅 테스트
 *
 * 키보드 이벤트 변환 및 포맷팅 함수 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
    useShortcuts,
    formatShortcutKey,
    formatShortcutKeyForPlatform,
} from '../../hooks/useShortcuts'
import { useShortcutStore, DEFAULT_SHORTCUTS } from '../../store/useShortcutStore'

// 스토어 초기화
const resetStore = () => {
    useShortcutStore.setState({
        shortcuts: [...DEFAULT_SHORTCUTS],
    })
}

describe('useShortcuts 훅', () => {
    beforeEach(() => {
        resetStore()
    })

    // =====================================================
    // 포맷팅 함수 테스트
    // =====================================================
    describe('formatShortcutKey', () => {
        it('Ctrl → ⌃', () => {
            expect(formatShortcutKey('Ctrl+C')).toBe('⌃ C')
        })

        it('Alt → ⌥', () => {
            expect(formatShortcutKey('Alt+N')).toBe('⌥ N')
        })

        it('Shift → ⇧', () => {
            expect(formatShortcutKey('Shift+S')).toBe('⇧ S')
        })

        it('Meta → ⌘', () => {
            expect(formatShortcutKey('Meta+K')).toBe('⌘ K')
        })

        it('Left → ←', () => {
            expect(formatShortcutKey('Alt+Left')).toBe('⌥ ←')
        })

        it('Right → →', () => {
            expect(formatShortcutKey('Alt+Right')).toBe('⌥ →')
        })

        it('Up → ↑', () => {
            expect(formatShortcutKey('Alt+Up')).toBe('⌥ ↑')
        })

        it('Down → ↓', () => {
            expect(formatShortcutKey('Alt+Down')).toBe('⌥ ↓')
        })

        it('복합 단축키 변환', () => {
            expect(formatShortcutKey('Ctrl+Shift+S')).toBe('⌃ ⇧ S')
            expect(formatShortcutKey('Alt+Shift+S')).toBe('⌥ ⇧ S')
        })

        it('숫자 단축키 변환', () => {
            expect(formatShortcutKey('Alt+1')).toBe('⌥ 1')
            expect(formatShortcutKey('Alt+2')).toBe('⌥ 2')
        })

        it('특수 문자 단축키 변환', () => {
            expect(formatShortcutKey('Alt+,')).toBe('⌥ ,')
            expect(formatShortcutKey('Alt+/')).toBe('⌥ /')
        })
    })

    describe('formatShortcutKeyForPlatform', () => {
        // navigator.platform 모킹
        const original_platform = navigator.platform

        afterEach(() => {
            Object.defineProperty(navigator, 'platform', {
                value: original_platform,
                writable: true,
            })
        })

        it('Mac에서는 기호로 변환', () => {
            Object.defineProperty(navigator, 'platform', {
                value: 'MacIntel',
                writable: true,
            })

            expect(formatShortcutKeyForPlatform('Alt+N')).toBe('⌥ N')
        })

        it('Windows에서는 그대로 표시', () => {
            Object.defineProperty(navigator, 'platform', {
                value: 'Win32',
                writable: true,
            })

            expect(formatShortcutKeyForPlatform('Alt+N')).toBe('Alt+N')
        })

        it('Linux에서는 그대로 표시', () => {
            Object.defineProperty(navigator, 'platform', {
                value: 'Linux x86_64',
                writable: true,
            })

            expect(formatShortcutKeyForPlatform('Alt+N')).toBe('Alt+N')
        })
    })

    // =====================================================
    // 훅 동작 테스트
    // =====================================================
    describe('useShortcuts 훅 동작', () => {
        it('핸들러가 등록됨', () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            }

            const { unmount } = renderHook(() => useShortcuts(handlers))

            // keydown 이벤트 리스너가 등록되었는지 확인
            // (직접 확인은 어렵지만, unmount 시 제거되는지로 간접 확인)
            unmount()
        })

        it('등록된 단축키 키를 누르면 핸들러 호출', () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // Alt+N 키 이벤트 시뮬레이션
            const event = new KeyboardEvent('keydown', {
                key: 'n',
                altKey: true,
                bubbles: true,
            })

            act(() => {
                window.dispatchEvent(event)
            })

            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1)
        })

        it('비활성화된 단축키는 핸들러를 호출하지 않음', () => {
            // 단축키 비활성화
            useShortcutStore.getState().toggleShortcut('new-work')

            const handlers = {
                openNewWorkModal: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // Alt+N 키 이벤트 시뮬레이션
            const event = new KeyboardEvent('keydown', {
                key: 'n',
                altKey: true,
                bubbles: true,
            })

            act(() => {
                window.dispatchEvent(event)
            })

            expect(handlers.openNewWorkModal).not.toHaveBeenCalled()
        })

        it('핸들러가 없는 단축키는 무시', () => {
            const handlers = {
                // openNewWorkModal 핸들러 없음
            }

            renderHook(() => useShortcuts(handlers))

            // Alt+N 키 이벤트 시뮬레이션 (에러 없이 통과해야 함)
            const event = new KeyboardEvent('keydown', {
                key: 'n',
                altKey: true,
                bubbles: true,
            })

            expect(() => {
                act(() => {
                    window.dispatchEvent(event)
                })
            }).not.toThrow()
        })

        it('여러 핸들러 등록 및 호출', () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
                toggleTimer: vi.fn(),
                goToday: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // Alt+N
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'n',
                        altKey: true,
                        bubbles: true,
                    })
                )
            })
            expect(handlers.openNewWorkModal).toHaveBeenCalledTimes(1)

            // Alt+S
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 's',
                        altKey: true,
                        bubbles: true,
                    })
                )
            })
            expect(handlers.toggleTimer).toHaveBeenCalledTimes(1)

            // Alt+T
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 't',
                        altKey: true,
                        bubbles: true,
                    })
                )
            })
            expect(handlers.goToday).toHaveBeenCalledTimes(1)
        })

        it('화살표 키 단축키', () => {
            const handlers = {
                prevDay: vi.fn(),
                nextDay: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // Alt+Left
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'ArrowLeft',
                        altKey: true,
                        bubbles: true,
                    })
                )
            })
            expect(handlers.prevDay).toHaveBeenCalledTimes(1)

            // Alt+Right
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'ArrowRight',
                        altKey: true,
                        bubbles: true,
                    })
                )
            })
            expect(handlers.nextDay).toHaveBeenCalledTimes(1)
        })

        it('Shift 조합 단축키', () => {
            const handlers = {
                syncData: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // Alt+Shift+S
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 's',
                        altKey: true,
                        shiftKey: true,
                        bubbles: true,
                    })
                )
            })
            expect(handlers.syncData).toHaveBeenCalledTimes(1)
        })
    })

    // =====================================================
    // 입력 필드 제외 테스트
    // =====================================================
    describe('입력 필드에서 단축키 비활성화', () => {
        it('INPUT 요소에서는 단축키가 작동하지 않음', () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // INPUT 요소 생성
            const input = document.createElement('input')
            document.body.appendChild(input)
            input.focus()

            // Alt+N 키 이벤트 (INPUT에서 발생)
            const event = new KeyboardEvent('keydown', {
                key: 'n',
                altKey: true,
                bubbles: true,
            })
            Object.defineProperty(event, 'target', { value: input })

            act(() => {
                input.dispatchEvent(event)
            })

            expect(handlers.openNewWorkModal).not.toHaveBeenCalled()

            // 정리
            document.body.removeChild(input)
        })

        it('TEXTAREA 요소에서는 단축키가 작동하지 않음', () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // TEXTAREA 요소 생성
            const textarea = document.createElement('textarea')
            document.body.appendChild(textarea)
            textarea.focus()

            // Alt+N 키 이벤트 (TEXTAREA에서 발생)
            const event = new KeyboardEvent('keydown', {
                key: 'n',
                altKey: true,
                bubbles: true,
            })
            Object.defineProperty(event, 'target', { value: textarea })

            act(() => {
                textarea.dispatchEvent(event)
            })

            expect(handlers.openNewWorkModal).not.toHaveBeenCalled()

            // 정리
            document.body.removeChild(textarea)
        })

        it('contentEditable 요소에서는 단축키가 작동하지 않음', () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // contentEditable 요소 생성
            const div = document.createElement('div')
            div.contentEditable = 'true'
            document.body.appendChild(div)
            div.focus()

            // Alt+N 키 이벤트 (contentEditable에서 발생)
            const event = new KeyboardEvent('keydown', {
                key: 'n',
                altKey: true,
                bubbles: true,
            })
            Object.defineProperty(event, 'target', { value: div })

            act(() => {
                div.dispatchEvent(event)
            })

            expect(handlers.openNewWorkModal).not.toHaveBeenCalled()

            // 정리
            document.body.removeChild(div)
        })
    })

    // =====================================================
    // 이벤트 전파 테스트
    // =====================================================
    describe('이벤트 전파', () => {
        it('단축키 실행 시 이벤트 기본 동작이 방지됨', () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            }

            renderHook(() => useShortcuts(handlers))

            // 기본 동작 방지 여부 확인용 이벤트
            let default_prevented = false
            const original_prevent = Event.prototype.preventDefault
            Event.prototype.preventDefault = function () {
                default_prevented = true
                return original_prevent.call(this)
            }

            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'n',
                        altKey: true,
                        bubbles: true,
                        cancelable: true,
                    })
                )
            })

            expect(default_prevented).toBe(true)

            // 복원
            Event.prototype.preventDefault = original_prevent
        })
    })

    // =====================================================
    // 언마운트 테스트
    // =====================================================
    describe('언마운트', () => {
        it('언마운트 시 이벤트 리스너 제거', () => {
            const handlers = {
                openNewWorkModal: vi.fn(),
            }

            const { unmount } = renderHook(() => useShortcuts(handlers))

            // 언마운트
            unmount()

            // 이벤트 발생
            act(() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'n',
                        altKey: true,
                        bubbles: true,
                    })
                )
            })

            // 핸들러가 호출되지 않아야 함
            expect(handlers.openNewWorkModal).not.toHaveBeenCalled()
        })
    })
})
