/**
 * Vitest 전역 설정 파일
 * 테스트 실행 전 자동으로 로드됩니다.
 */
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
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
