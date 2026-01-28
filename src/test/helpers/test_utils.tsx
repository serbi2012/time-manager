/**
 * 테스트 유틸리티 및 커스텀 렌더링 헬퍼
 */

/* eslint-disable react-refresh/only-export-components */

import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { MemoryRouterProps } from "react-router-dom";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { vi } from "vitest";

// =====================================================
// 래퍼 컴포넌트
// =====================================================

interface AllProvidersProps {
    children: ReactNode;
    routerProps?: MemoryRouterProps;
}

/**
 * 모든 Provider를 포함한 테스트 래퍼
 */
function AllProviders({ children, routerProps }: AllProvidersProps) {
    return (
        <ConfigProvider locale={koKR}>
            <MemoryRouter {...routerProps}>
                {children}
            </MemoryRouter>
        </ConfigProvider>
    );
}

/**
 * Ant Design Provider만 포함한 테스트 래퍼
 */
function AntdProvider({ children }: { children: ReactNode }) {
    return (
        <ConfigProvider locale={koKR}>
            {children}
        </ConfigProvider>
    );
}

// =====================================================
// 커스텀 렌더링 함수
// =====================================================

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    routerProps?: MemoryRouterProps;
    withRouter?: boolean;
}

/**
 * 커스텀 렌더 함수 (Provider 자동 포함)
 */
export function renderWithProviders(
    ui: ReactElement,
    options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
    const { routerProps, withRouter = true, ...renderOptions } = options;

    const Wrapper = ({ children }: { children: ReactNode }) => {
        if (withRouter) {
            return (
                <AllProviders routerProps={routerProps}>
                    {children}
                </AllProviders>
            );
        }
        return <AntdProvider>{children}</AntdProvider>;
    };

    const user = userEvent.setup();
    const result = render(ui, { wrapper: Wrapper, ...renderOptions });

    return { ...result, user };
}

/**
 * Antd만 포함한 렌더 (라우터 불필요 시)
 */
export function renderWithAntd(
    ui: ReactElement,
    options: Omit<RenderOptions, "wrapper"> = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
    return renderWithProviders(ui, { ...options, withRouter: false });
}

// =====================================================
// 키보드 이벤트 헬퍼
// =====================================================

interface KeyEventOptions {
    key: string;
    code?: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
}

/**
 * 키보드 이벤트 발생시키기
 */
export function fireKeyboardEvent(
    element: Element | Window | Document,
    eventType: "keydown" | "keyup" | "keypress",
    options: KeyEventOptions
) {
    const event = new KeyboardEvent(eventType, {
        key: options.key,
        code: options.code ?? options.key,
        ctrlKey: options.ctrlKey ?? false,
        altKey: options.altKey ?? false,
        shiftKey: options.shiftKey ?? false,
        metaKey: options.metaKey ?? false,
        bubbles: true,
        cancelable: true,
    });

    element.dispatchEvent(event);
    return event;
}

/**
 * 단축키 이벤트 발생 (Alt+키)
 */
export function fireShortcut(key: string, modifiers: Partial<Omit<KeyEventOptions, "key">> = {}) {
    return fireKeyboardEvent(window, "keydown", {
        key,
        altKey: modifiers.altKey ?? true,
        ctrlKey: modifiers.ctrlKey ?? false,
        shiftKey: modifiers.shiftKey ?? false,
        metaKey: modifiers.metaKey ?? false,
    });
}

/**
 * ESC 키 이벤트
 */
export function fireEscapeKey(element: Element | Document = document) {
    return fireKeyboardEvent(element, "keydown", { key: "Escape", code: "Escape" });
}

/**
 * Enter 키 이벤트
 */
export function fireEnterKey(element: Element | Document = document) {
    return fireKeyboardEvent(element, "keydown", { key: "Enter", code: "Enter" });
}

// =====================================================
// 모달 테스트 헬퍼
// =====================================================

/**
 * 모달이 열렸는지 확인
 */
export function isModalOpen(): boolean {
    const modal = document.querySelector(".ant-modal");
    return modal !== null && !modal.classList.contains("ant-modal-hidden");
}

/**
 * 모달 닫기 버튼 찾기
 */
export function findModalCloseButton(): HTMLButtonElement | null {
    return document.querySelector(".ant-modal-close") as HTMLButtonElement | null;
}

/**
 * 모달 오버레이(마스크) 찾기
 */
export function findModalMask(): HTMLDivElement | null {
    return document.querySelector(".ant-modal-mask") as HTMLDivElement | null;
}

/**
 * 특정 텍스트를 포함한 모달 찾기
 */
export function findModalByTitle(title: string): HTMLDivElement | null {
    const modals = document.querySelectorAll(".ant-modal");
    for (const modal of modals) {
        const titleElement = modal.querySelector(".ant-modal-title");
        if (titleElement?.textContent?.includes(title)) {
            return modal as HTMLDivElement;
        }
    }
    return null;
}

// =====================================================
// 비동기 헬퍼
// =====================================================

/**
 * 지정된 시간만큼 대기
 */
export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 다음 틱까지 대기
 */
export function nextTick(): Promise<void> {
    return wait(0);
}

/**
 * 애니메이션 프레임 대기
 */
export function nextFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

// =====================================================
// 스토어 모킹 헬퍼
// =====================================================

/**
 * Zustand 스토어 모킹을 위한 타입 정의
 */
export type StoreMock<T> = {
    getState: () => T;
    setState: (partial: Partial<T>) => void;
    subscribe: ReturnType<typeof vi.fn>;
};

/**
 * 간단한 스토어 모킹 생성
 */
export function createMockStore<T extends object>(initialState: T): StoreMock<T> {
    let state = { ...initialState };
    return {
        getState: () => state,
        setState: (partial: Partial<T>) => {
            state = { ...state, ...partial };
        },
        subscribe: vi.fn(),
    };
}

// =====================================================
// matchMedia 모킹 헬퍼
// =====================================================

/**
 * matchMedia를 특정 조건으로 모킹
 */
export function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}

/**
 * 모바일 뷰포트로 모킹
 */
export function mockMobileViewport() {
    mockMatchMedia(true);
}

/**
 * 데스크탑 뷰포트로 모킹
 */
export function mockDesktopViewport() {
    mockMatchMedia(false);
}

// =====================================================
// 내보내기
// =====================================================

export { userEvent };
