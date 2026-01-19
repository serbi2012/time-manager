/**
 * shortcut_events 유틸리티 테스트
 *
 * 커스텀 이벤트 발생/구독 테스트
 */
import { describe, it, expect, vi } from 'vitest'
import {
    SHORTCUT_EVENTS,
    emitShortcutEvent,
    addShortcutListener,
} from '../../utils/shortcut_events'

describe('shortcut_events 유틸리티', () => {
    // =====================================================
    // SHORTCUT_EVENTS 상수 테스트
    // =====================================================
    describe('SHORTCUT_EVENTS 상수', () => {
        it('모든 이벤트 키가 정의됨', () => {
            expect(SHORTCUT_EVENTS.OPEN_NEW_WORK_MODAL).toBeDefined()
            expect(SHORTCUT_EVENTS.OPEN_NEW_PRESET_MODAL).toBeDefined()
            expect(SHORTCUT_EVENTS.OPEN_SETTINGS).toBeDefined()
            expect(SHORTCUT_EVENTS.SHOW_SHORTCUTS).toBeDefined()
            expect(SHORTCUT_EVENTS.TOGGLE_TIMER).toBeDefined()
            expect(SHORTCUT_EVENTS.RESET_TIMER).toBeDefined()
            expect(SHORTCUT_EVENTS.GO_TODAY).toBeDefined()
            expect(SHORTCUT_EVENTS.PREV_DAY).toBeDefined()
            expect(SHORTCUT_EVENTS.NEXT_DAY).toBeDefined()
            expect(SHORTCUT_EVENTS.GO_DAILY).toBeDefined()
            expect(SHORTCUT_EVENTS.GO_WEEKLY).toBeDefined()
            expect(SHORTCUT_EVENTS.EXPORT_DATA).toBeDefined()
            expect(SHORTCUT_EVENTS.SYNC_DATA).toBeDefined()
        })

        it('모든 이벤트가 shortcut: 접두사를 가짐', () => {
            Object.values(SHORTCUT_EVENTS).forEach((event_name) => {
                expect(event_name).toMatch(/^shortcut:/)
            })
        })

        it('모든 이벤트 이름이 고유함', () => {
            const event_names = Object.values(SHORTCUT_EVENTS)
            const unique_names = new Set(event_names)
            expect(unique_names.size).toBe(event_names.length)
        })
    })

    // =====================================================
    // emitShortcutEvent 테스트
    // =====================================================
    describe('emitShortcutEvent', () => {
        it('커스텀 이벤트를 발생시킴', () => {
            const handler = vi.fn()
            window.addEventListener(
                SHORTCUT_EVENTS.OPEN_NEW_WORK_MODAL,
                handler
            )

            emitShortcutEvent(SHORTCUT_EVENTS.OPEN_NEW_WORK_MODAL)

            expect(handler).toHaveBeenCalledTimes(1)

            window.removeEventListener(
                SHORTCUT_EVENTS.OPEN_NEW_WORK_MODAL,
                handler
            )
        })

        it('여러 리스너에게 이벤트 전달', () => {
            const handler1 = vi.fn()
            const handler2 = vi.fn()

            window.addEventListener(SHORTCUT_EVENTS.TOGGLE_TIMER, handler1)
            window.addEventListener(SHORTCUT_EVENTS.TOGGLE_TIMER, handler2)

            emitShortcutEvent(SHORTCUT_EVENTS.TOGGLE_TIMER)

            expect(handler1).toHaveBeenCalledTimes(1)
            expect(handler2).toHaveBeenCalledTimes(1)

            window.removeEventListener(SHORTCUT_EVENTS.TOGGLE_TIMER, handler1)
            window.removeEventListener(SHORTCUT_EVENTS.TOGGLE_TIMER, handler2)
        })

        it('리스너가 없어도 에러 없이 실행', () => {
            expect(() => {
                emitShortcutEvent('non-existent-event')
            }).not.toThrow()
        })
    })

    // =====================================================
    // addShortcutListener 테스트
    // =====================================================
    describe('addShortcutListener', () => {
        it('이벤트 리스너를 등록하고 cleanup 함수 반환', () => {
            const handler = vi.fn()
            const cleanup = addShortcutListener(
                SHORTCUT_EVENTS.GO_TODAY,
                handler
            )

            // 타입 확인
            expect(typeof cleanup).toBe('function')

            // 이벤트 발생
            emitShortcutEvent(SHORTCUT_EVENTS.GO_TODAY)
            expect(handler).toHaveBeenCalledTimes(1)

            // cleanup 호출
            cleanup()
        })

        it('cleanup 호출 후 리스너가 제거됨', () => {
            const handler = vi.fn()
            const cleanup = addShortcutListener(
                SHORTCUT_EVENTS.PREV_DAY,
                handler
            )

            // 이벤트 발생 - 호출됨
            emitShortcutEvent(SHORTCUT_EVENTS.PREV_DAY)
            expect(handler).toHaveBeenCalledTimes(1)

            // cleanup
            cleanup()

            // 이벤트 발생 - 호출되지 않음
            emitShortcutEvent(SHORTCUT_EVENTS.PREV_DAY)
            expect(handler).toHaveBeenCalledTimes(1) // 여전히 1번
        })

        it('여러 리스너를 독립적으로 관리', () => {
            const handler1 = vi.fn()
            const handler2 = vi.fn()

            const cleanup1 = addShortcutListener(
                SHORTCUT_EVENTS.NEXT_DAY,
                handler1
            )
            const cleanup2 = addShortcutListener(
                SHORTCUT_EVENTS.NEXT_DAY,
                handler2
            )

            // 둘 다 호출됨
            emitShortcutEvent(SHORTCUT_EVENTS.NEXT_DAY)
            expect(handler1).toHaveBeenCalledTimes(1)
            expect(handler2).toHaveBeenCalledTimes(1)

            // handler1만 제거
            cleanup1()

            // handler2만 호출됨
            emitShortcutEvent(SHORTCUT_EVENTS.NEXT_DAY)
            expect(handler1).toHaveBeenCalledTimes(1) // 여전히 1번
            expect(handler2).toHaveBeenCalledTimes(2)

            // handler2도 제거
            cleanup2()
        })
    })

    // =====================================================
    // 실제 사용 시나리오 테스트
    // =====================================================
    describe('실제 사용 시나리오', () => {
        it('모달 열기 이벤트 흐름', () => {
            const modal_states = {
                new_work: false,
                new_preset: false,
                settings: false,
            }

            // 리스너 등록
            const cleanups = [
                addShortcutListener(SHORTCUT_EVENTS.OPEN_NEW_WORK_MODAL, () => {
                    modal_states.new_work = true
                }),
                addShortcutListener(
                    SHORTCUT_EVENTS.OPEN_NEW_PRESET_MODAL,
                    () => {
                        modal_states.new_preset = true
                    }
                ),
                addShortcutListener(SHORTCUT_EVENTS.OPEN_SETTINGS, () => {
                    modal_states.settings = true
                }),
            ]

            // 이벤트 발생
            emitShortcutEvent(SHORTCUT_EVENTS.OPEN_NEW_WORK_MODAL)
            expect(modal_states.new_work).toBe(true)
            expect(modal_states.new_preset).toBe(false)
            expect(modal_states.settings).toBe(false)

            emitShortcutEvent(SHORTCUT_EVENTS.OPEN_SETTINGS)
            expect(modal_states.settings).toBe(true)

            // 정리
            cleanups.forEach((c) => c())
        })

        it('날짜 네비게이션 이벤트 흐름', () => {
            let current_date = new Date('2026-01-19')

            const cleanups = [
                addShortcutListener(SHORTCUT_EVENTS.PREV_DAY, () => {
                    current_date = new Date(
                        current_date.getTime() - 24 * 60 * 60 * 1000
                    )
                }),
                addShortcutListener(SHORTCUT_EVENTS.NEXT_DAY, () => {
                    current_date = new Date(
                        current_date.getTime() + 24 * 60 * 60 * 1000
                    )
                }),
                addShortcutListener(SHORTCUT_EVENTS.GO_TODAY, () => {
                    current_date = new Date('2026-01-19')
                }),
            ]

            // 이전 날짜로 이동
            emitShortcutEvent(SHORTCUT_EVENTS.PREV_DAY)
            expect(current_date.toISOString().split('T')[0]).toBe('2026-01-18')

            // 다음 날짜로 이동
            emitShortcutEvent(SHORTCUT_EVENTS.NEXT_DAY)
            emitShortcutEvent(SHORTCUT_EVENTS.NEXT_DAY)
            expect(current_date.toISOString().split('T')[0]).toBe('2026-01-20')

            // 오늘로 이동
            emitShortcutEvent(SHORTCUT_EVENTS.GO_TODAY)
            expect(current_date.toISOString().split('T')[0]).toBe('2026-01-19')

            // 정리
            cleanups.forEach((c) => c())
        })

        it('타이머 제어 이벤트 흐름', () => {
            let timer_state = {
                is_running: false,
                start_time: null as number | null,
            }

            const cleanups = [
                addShortcutListener(SHORTCUT_EVENTS.TOGGLE_TIMER, () => {
                    if (timer_state.is_running) {
                        timer_state = { is_running: false, start_time: null }
                    } else {
                        timer_state = {
                            is_running: true,
                            start_time: Date.now(),
                        }
                    }
                }),
                addShortcutListener(SHORTCUT_EVENTS.RESET_TIMER, () => {
                    timer_state = { is_running: false, start_time: null }
                }),
            ]

            // 타이머 시작
            emitShortcutEvent(SHORTCUT_EVENTS.TOGGLE_TIMER)
            expect(timer_state.is_running).toBe(true)
            expect(timer_state.start_time).not.toBeNull()

            // 타이머 정지
            emitShortcutEvent(SHORTCUT_EVENTS.TOGGLE_TIMER)
            expect(timer_state.is_running).toBe(false)

            // 타이머 시작 후 리셋
            emitShortcutEvent(SHORTCUT_EVENTS.TOGGLE_TIMER)
            expect(timer_state.is_running).toBe(true)

            emitShortcutEvent(SHORTCUT_EVENTS.RESET_TIMER)
            expect(timer_state.is_running).toBe(false)
            expect(timer_state.start_time).toBeNull()

            // 정리
            cleanups.forEach((c) => c())
        })
    })
})
