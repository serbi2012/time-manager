/**
 * useShortcutStore 유닛 테스트
 *
 * 단축키 상태 관리 스토어 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
    useShortcutStore,
    DEFAULT_SHORTCUTS,
    CATEGORY_LABELS,
    type ShortcutDefinition,
} from '../../store/useShortcutStore'

// 스토어 초기화 헬퍼
const resetStore = () => {
    useShortcutStore.setState({
        shortcuts: [...DEFAULT_SHORTCUTS],
    })
    localStorage.clear()
}

describe('useShortcutStore', () => {
    beforeEach(() => {
        resetStore()
    })

    afterEach(() => {
        localStorage.clear()
    })

    // =====================================================
    // 기본 상태 테스트
    // =====================================================
    describe('기본 상태', () => {
        it('초기 단축키 목록이 DEFAULT_SHORTCUTS와 동일', () => {
            const state = useShortcutStore.getState()
            expect(state.shortcuts).toHaveLength(DEFAULT_SHORTCUTS.length)
        })

        it('모든 카테고리가 정의되어 있음', () => {
            const categories = Object.keys(CATEGORY_LABELS)
            expect(categories).toContain('general')
            expect(categories).toContain('timer')
            expect(categories).toContain('navigation')
            expect(categories).toContain('data')
        })

        it('기본 단축키들이 모두 활성화 상태', () => {
            const state = useShortcutStore.getState()
            state.shortcuts.forEach((shortcut) => {
                expect(shortcut.enabled).toBe(true)
            })
        })
    })

    // =====================================================
    // 단축키 CRUD 테스트
    // =====================================================
    describe('단축키 CRUD', () => {
        describe('toggleShortcut', () => {
            it('활성화된 단축키를 비활성화', () => {
                const store = useShortcutStore.getState()
                const shortcut_id = 'new-work'

                // 초기 상태: 활성화
                expect(store.getShortcut(shortcut_id)?.enabled).toBe(true)

                // 토글
                store.toggleShortcut(shortcut_id)

                // 결과: 비활성화
                const updated = useShortcutStore.getState()
                expect(updated.shortcuts.find((s) => s.id === shortcut_id)?.enabled)
                    .toBe(false)
            })

            it('비활성화된 단축키를 활성화', () => {
                const store = useShortcutStore.getState()
                const shortcut_id = 'new-work'

                // 먼저 비활성화
                store.toggleShortcut(shortcut_id)
                expect(
                    useShortcutStore.getState().getShortcut(shortcut_id)?.enabled
                ).toBe(false)

                // 다시 토글
                useShortcutStore.getState().toggleShortcut(shortcut_id)

                // 결과: 활성화
                expect(
                    useShortcutStore.getState().getShortcut(shortcut_id)?.enabled
                ).toBe(true)
            })

            it('토글 시 localStorage에 저장', () => {
                const store = useShortcutStore.getState()
                store.toggleShortcut('new-work')

                const stored = localStorage.getItem('shortcut-settings')
                expect(stored).not.toBeNull()

                const parsed = JSON.parse(stored!)
                const saved_shortcut = parsed.find(
                    (s: ShortcutDefinition) => s.id === 'new-work'
                )
                expect(saved_shortcut.enabled).toBe(false)
            })
        })

        describe('setShortcutEnabled', () => {
            it('특정 단축키를 명시적으로 활성화', () => {
                const store = useShortcutStore.getState()

                // 먼저 비활성화
                store.toggleShortcut('new-work')

                // 명시적 활성화
                useShortcutStore.getState().setShortcutEnabled('new-work', true)

                expect(
                    useShortcutStore.getState().getShortcut('new-work')?.enabled
                ).toBe(true)
            })

            it('특정 단축키를 명시적으로 비활성화', () => {
                const store = useShortcutStore.getState()
                store.setShortcutEnabled('new-work', false)

                expect(
                    useShortcutStore.getState().getShortcut('new-work')?.enabled
                ).toBe(false)
            })
        })

        describe('getShortcut', () => {
            it('ID로 단축키 조회', () => {
                const store = useShortcutStore.getState()
                const shortcut = store.getShortcut('new-work')

                expect(shortcut).toBeDefined()
                expect(shortcut?.id).toBe('new-work')
                expect(shortcut?.name).toBe('새 작업 추가')
                expect(shortcut?.keys).toBe('Alt+N')
            })

            it('존재하지 않는 ID면 undefined 반환', () => {
                const store = useShortcutStore.getState()
                const shortcut = store.getShortcut('non-existent')

                expect(shortcut).toBeUndefined()
            })
        })
    })

    // =====================================================
    // 필터링 테스트
    // =====================================================
    describe('필터링', () => {
        describe('getEnabledShortcuts', () => {
            it('활성화된 단축키만 반환', () => {
                const store = useShortcutStore.getState()

                // 일부 비활성화
                store.toggleShortcut('new-work')
                store.toggleShortcut('new-preset')

                const enabled = useShortcutStore.getState().getEnabledShortcuts()
                expect(enabled.every((s) => s.enabled)).toBe(true)
                expect(enabled.some((s) => s.id === 'new-work')).toBe(false)
                expect(enabled.some((s) => s.id === 'new-preset')).toBe(false)
            })

            it('모두 활성화면 전체 반환', () => {
                const store = useShortcutStore.getState()
                const enabled = store.getEnabledShortcuts()

                expect(enabled).toHaveLength(DEFAULT_SHORTCUTS.length)
            })

            it('모두 비활성화면 빈 배열 반환', () => {
                const store = useShortcutStore.getState()

                // 모두 비활성화
                store.shortcuts.forEach((s) => {
                    store.toggleShortcut(s.id)
                })

                const enabled = useShortcutStore.getState().getEnabledShortcuts()
                expect(enabled).toHaveLength(0)
            })
        })

        describe('getShortcutsByCategory', () => {
            it('general 카테고리 단축키 조회', () => {
                const store = useShortcutStore.getState()
                const general = store.getShortcutsByCategory('general')

                expect(general.length).toBeGreaterThan(0)
                expect(general.every((s) => s.category === 'general')).toBe(true)
            })

            it('timer 카테고리 단축키 조회', () => {
                const store = useShortcutStore.getState()
                const timer = store.getShortcutsByCategory('timer')

                expect(timer.length).toBeGreaterThan(0)
                expect(timer.every((s) => s.category === 'timer')).toBe(true)
            })

            it('navigation 카테고리 단축키 조회', () => {
                const store = useShortcutStore.getState()
                const navigation = store.getShortcutsByCategory('navigation')

                expect(navigation.length).toBeGreaterThan(0)
                expect(navigation.every((s) => s.category === 'navigation')).toBe(
                    true
                )
            })

            it('data 카테고리 단축키 조회', () => {
                const store = useShortcutStore.getState()
                const data = store.getShortcutsByCategory('data')

                expect(data.length).toBeGreaterThan(0)
                expect(data.every((s) => s.category === 'data')).toBe(true)
            })

            it('모든 카테고리 합이 전체 단축키 수와 동일', () => {
                const store = useShortcutStore.getState()
                const general = store.getShortcutsByCategory('general')
                const timer = store.getShortcutsByCategory('timer')
                const navigation = store.getShortcutsByCategory('navigation')
                const data = store.getShortcutsByCategory('data')

                const total =
                    general.length +
                    timer.length +
                    navigation.length +
                    data.length
                expect(total).toBe(DEFAULT_SHORTCUTS.length)
            })
        })

        describe('findByKeys', () => {
            it('키 조합으로 단축키 찾기', () => {
                const store = useShortcutStore.getState()
                const shortcut = store.findByKeys('Alt+N')

                expect(shortcut).toBeDefined()
                expect(shortcut?.id).toBe('new-work')
            })

            it('대소문자 구분 없이 찾기', () => {
                const store = useShortcutStore.getState()
                const shortcut = store.findByKeys('alt+n')

                expect(shortcut).toBeDefined()
                expect(shortcut?.id).toBe('new-work')
            })

            it('비활성화된 단축키는 찾지 않음', () => {
                const store = useShortcutStore.getState()
                store.toggleShortcut('new-work')

                const shortcut = useShortcutStore.getState().findByKeys('Alt+N')
                expect(shortcut).toBeUndefined()
            })

            it('존재하지 않는 키 조합은 undefined', () => {
                const store = useShortcutStore.getState()
                const shortcut = store.findByKeys('Ctrl+Alt+Delete')

                expect(shortcut).toBeUndefined()
            })
        })
    })

    // =====================================================
    // 초기화 테스트
    // =====================================================
    describe('초기화', () => {
        describe('resetToDefault', () => {
            it('모든 단축키를 기본값으로 초기화', () => {
                const store = useShortcutStore.getState()

                // 일부 변경
                store.toggleShortcut('new-work')
                store.toggleShortcut('new-preset')
                store.toggleShortcut('start-stop-timer')

                // 초기화
                useShortcutStore.getState().resetToDefault()

                // 모두 활성화 상태여야 함
                const state = useShortcutStore.getState()
                state.shortcuts.forEach((shortcut) => {
                    expect(shortcut.enabled).toBe(true)
                })
            })

            it('초기화 시 localStorage도 업데이트', () => {
                const store = useShortcutStore.getState()
                store.toggleShortcut('new-work')
                store.resetToDefault()

                const stored = localStorage.getItem('shortcut-settings')
                expect(stored).not.toBeNull()

                const parsed = JSON.parse(stored!)
                const saved = parsed.find(
                    (s: ShortcutDefinition) => s.id === 'new-work'
                )
                expect(saved.enabled).toBe(true)
            })
        })
    })

    // =====================================================
    // localStorage 동기화 테스트
    // =====================================================
    describe('localStorage 동기화', () => {
        it('변경 사항이 localStorage에 저장됨', () => {
            const store = useShortcutStore.getState()
            store.toggleShortcut('new-work')

            const stored = localStorage.getItem('shortcut-settings')
            expect(stored).not.toBeNull()
        })

        it('setShortcuts로 전체 단축키 설정', () => {
            const custom_shortcuts: ShortcutDefinition[] = DEFAULT_SHORTCUTS.map(
                (s) => ({
                    ...s,
                    enabled: false, // 모두 비활성화
                })
            )

            const store = useShortcutStore.getState()
            store.setShortcuts(custom_shortcuts)

            const state = useShortcutStore.getState()
            state.shortcuts.forEach((shortcut) => {
                expect(shortcut.enabled).toBe(false)
            })
        })

        it('setShortcuts 시 localStorage에 저장', () => {
            const custom_shortcuts: ShortcutDefinition[] = DEFAULT_SHORTCUTS.map(
                (s) => ({
                    ...s,
                    enabled: false,
                })
            )

            const store = useShortcutStore.getState()
            store.setShortcuts(custom_shortcuts)

            const stored = localStorage.getItem('shortcut-settings')
            expect(stored).not.toBeNull()

            const parsed = JSON.parse(stored!)
            parsed.forEach((s: ShortcutDefinition) => {
                expect(s.enabled).toBe(false)
            })
        })
    })

    // =====================================================
    // 기본 단축키 정의 검증
    // =====================================================
    describe('기본 단축키 정의', () => {
        it('모든 단축키가 고유한 ID를 가짐', () => {
            const ids = DEFAULT_SHORTCUTS.map((s) => s.id)
            const unique_ids = new Set(ids)
            expect(unique_ids.size).toBe(ids.length)
        })

        it('모든 단축키가 고유한 키 조합을 가짐', () => {
            const keys = DEFAULT_SHORTCUTS.map((s) => s.keys.toLowerCase())
            const unique_keys = new Set(keys)
            expect(unique_keys.size).toBe(keys.length)
        })

        it('모든 단축키가 유효한 카테고리를 가짐', () => {
            const valid_categories = Object.keys(CATEGORY_LABELS)
            DEFAULT_SHORTCUTS.forEach((shortcut) => {
                expect(valid_categories).toContain(shortcut.category)
            })
        })

        it('모든 단축키가 액션을 가짐', () => {
            DEFAULT_SHORTCUTS.forEach((shortcut) => {
                expect(shortcut.action).toBeTruthy()
            })
        })

        it('모든 단축키가 이름과 설명을 가짐', () => {
            DEFAULT_SHORTCUTS.forEach((shortcut) => {
                expect(shortcut.name).toBeTruthy()
                expect(shortcut.description).toBeTruthy()
            })
        })
    })

    // =====================================================
    // 특정 단축키 테스트
    // =====================================================
    describe('특정 단축키', () => {
        it('새 작업 추가 (Alt+N)', () => {
            const shortcut = DEFAULT_SHORTCUTS.find((s) => s.id === 'new-work')
            expect(shortcut).toMatchObject({
                id: 'new-work',
                name: '새 작업 추가',
                keys: 'Alt+N',
                category: 'general',
                action: 'openNewWorkModal',
            })
        })

        it('타이머 시작/중지 (Alt+S)', () => {
            const shortcut = DEFAULT_SHORTCUTS.find(
                (s) => s.id === 'start-stop-timer'
            )
            expect(shortcut).toMatchObject({
                id: 'start-stop-timer',
                name: '타이머 시작/중지',
                keys: 'Alt+S',
                category: 'timer',
                action: 'toggleTimer',
            })
        })

        it('오늘로 이동 (Alt+T)', () => {
            const shortcut = DEFAULT_SHORTCUTS.find((s) => s.id === 'go-today')
            expect(shortcut).toMatchObject({
                id: 'go-today',
                name: '오늘로 이동',
                keys: 'Alt+T',
                category: 'navigation',
                action: 'goToday',
            })
        })

        it('이전/다음 날짜 (Alt+Left/Right)', () => {
            const prev = DEFAULT_SHORTCUTS.find((s) => s.id === 'prev-day')
            const next = DEFAULT_SHORTCUTS.find((s) => s.id === 'next-day')

            expect(prev?.keys).toBe('Alt+Left')
            expect(next?.keys).toBe('Alt+Right')
        })

        it('데이터 내보내기 (Alt+E)', () => {
            const shortcut = DEFAULT_SHORTCUTS.find((s) => s.id === 'export-data')
            expect(shortcut).toMatchObject({
                id: 'export-data',
                name: '데이터 내보내기',
                keys: 'Alt+E',
                category: 'data',
                action: 'exportData',
            })
        })
    })
})
