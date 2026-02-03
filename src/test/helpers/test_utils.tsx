/**
 * 테스트 유틸리티
 * 커스텀 렌더러 및 유틸리티 함수
 */
import { ReactElement, ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";

// ============================================================================
// Provider 래퍼
// ============================================================================

interface ProvidersProps {
    children: ReactNode;
}

function AllProviders({ children }: ProvidersProps) {
    return (
        <ConfigProvider locale={koKR}>
            <BrowserRouter>{children}</BrowserRouter>
        </ConfigProvider>
    );
}

function MemoryRouterProvider({ children }: ProvidersProps) {
    return (
        <ConfigProvider locale={koKR}>
            <MemoryRouter>{children}</MemoryRouter>
        </ConfigProvider>
    );
}

// ============================================================================
// 커스텀 렌더러
// ============================================================================

export interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    /** 초기 라우트 경로 */
    initialRoute?: string;
    /** MemoryRouter 사용 여부 */
    useMemoryRouter?: boolean;
    /** 래퍼 사용 안함 */
    withoutWrapper?: boolean;
}

export interface CustomRenderResult extends RenderResult {
    /** userEvent 인스턴스 */
    user: ReturnType<typeof userEvent.setup>;
}

/**
 * Provider가 포함된 커스텀 렌더러
 */
export function renderWithProviders(
    ui: ReactElement,
    options: CustomRenderOptions = {}
): CustomRenderResult {
    const {
        useMemoryRouter = false,
        withoutWrapper = false,
        ...renderOptions
    } = options;

    const Wrapper = withoutWrapper
        ? ({ children }: ProvidersProps) => <>{children}</>
        : useMemoryRouter
        ? MemoryRouterProvider
        : AllProviders;

    const result = render(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    });

    return {
        ...result,
        user: userEvent.setup(),
    };
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 특정 시간만큼 대기
 */
export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 애니메이션 완료 대기 (기본 500ms)
 */
export async function waitForAnimation(ms = 500): Promise<void> {
    await wait(ms);
}

/**
 * 요소가 보일 때까지 대기
 */
export async function waitForElement(
    container: HTMLElement,
    selector: string,
    timeout = 3000
): Promise<Element | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const element = container.querySelector(selector);
        if (element) return element;
        await wait(50);
    }

    return null;
}

/**
 * 모든 애니메이션 완료 대기
 */
export async function waitForAnimations(element: HTMLElement): Promise<void> {
    const animations = element.getAnimations();
    await Promise.all(animations.map((animation) => animation.finished));
}

// ============================================================================
// 이벤트 헬퍼
// ============================================================================

/**
 * 키보드 이벤트 시뮬레이션
 */
export function createKeyboardEvent(
    key: string,
    options: Partial<KeyboardEventInit> = {}
): KeyboardEvent {
    return new KeyboardEvent("keydown", {
        key,
        code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
        bubbles: true,
        cancelable: true,
        ...options,
    });
}

/**
 * F8 키 이벤트 (타이머 시작/정지)
 */
export function createF8Event(): KeyboardEvent {
    return createKeyboardEvent("F8", { code: "F8" });
}

/**
 * Escape 키 이벤트 (모달 닫기)
 */
export function createEscapeEvent(): KeyboardEvent {
    return createKeyboardEvent("Escape", { code: "Escape" });
}

/**
 * Ctrl+S 이벤트 (저장)
 */
export function createCtrlSEvent(): KeyboardEvent {
    return createKeyboardEvent("s", { code: "KeyS", ctrlKey: true });
}

// ============================================================================
// 스토어 헬퍼
// ============================================================================

/**
 * Zustand 스토어 상태 리셋
 * 테스트 간 상태 격리를 위해 사용
 */
export function resetStore<T extends object>(
    store: { setState: (state: Partial<T>) => void; getInitialState?: () => T },
    initialState?: Partial<T>
): void {
    if (store.getInitialState) {
        store.setState(store.getInitialState());
    }
    if (initialState) {
        store.setState(initialState);
    }
}

// ============================================================================
// Re-export
// ============================================================================

export * from "@testing-library/react";
export { userEvent };
export { renderWithProviders as render };
