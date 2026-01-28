/**
 * Vitest 전역 설정 파일
 * 테스트 실행 전 자동으로 로드됩니다.
 */
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// 각 테스트 후 DOM 정리
afterEach(() => {
    cleanup()
})

// crypto.randomUUID 모킹 (Node.js 환경에서 필요)
let uuid_counter = 0
vi.stubGlobal('crypto', {
    randomUUID: () => `test-uuid-${++uuid_counter}`,
})

// 테스트 전 카운터 리셋
afterEach(() => {
    uuid_counter = 0
})

// LocalStorage 모킹
const local_storage_mock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        },
        get length() {
            return Object.keys(store).length
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: local_storage_mock,
})

// 테스트 간 LocalStorage 초기화
afterEach(() => {
    localStorage.clear()
})

// =====================================================
// 브라우저 API 모킹
// =====================================================

// matchMedia 모킹 (반응형 테스트용 - Ant Design 호환)
// Ant Design Grid, useBreakpoint, responsiveObserver 등에서 사용됨
// 직접 함수로 할당하여 확실하게 동작하도록 함
window.matchMedia = (query: string): MediaQueryList => {
    return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
    }
}

// ResizeObserver 모킹 (레이아웃 테스트용)
class ResizeObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock)

// IntersectionObserver 모킹 (가시성 테스트용)
class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

// scrollTo 모킹
Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
})

// getComputedStyle 보완 (Ant Design 컴포넌트용)
const original_getComputedStyle = window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
    value: (element: Element) => ({
        ...original_getComputedStyle(element),
        getPropertyValue: (prop: string) => {
            return original_getComputedStyle(element).getPropertyValue(prop) || ''
        },
    }),
})

// =====================================================
// 콘솔 경고 억제 (테스트 출력 정리)
// =====================================================
const original_console_error = console.error
const original_console_warn = console.warn

beforeEach(() => {
    // Ant Design 관련 경고 억제
    console.error = (...args: unknown[]) => {
        const message = args[0]?.toString() || ''
        if (
            message.includes('Warning: ReactDOM.render') ||
            message.includes('Warning: `NaN` is an invalid value') ||
            message.includes('Warning: validateDOMNesting') ||
            message.includes('act(...)') ||
            message.includes('Not implemented: navigation')
        ) {
            return
        }
        original_console_error.apply(console, args)
    }

    console.warn = (...args: unknown[]) => {
        const message = args[0]?.toString() || ''
        if (
            message.includes('componentWillReceiveProps') ||
            message.includes('componentWillMount')
        ) {
            return
        }
        original_console_warn.apply(console, args)
    }
})

afterEach(() => {
    console.error = original_console_error
    console.warn = original_console_warn
})
