import { useMemo, type ReactNode } from "react";

import { InputCapabilityContext } from "./input_capability_context";

interface InputCapabilityProviderProps {
    has_keyboard: boolean;
    children: ReactNode;
}

/**
 * 단축키 표시와 자동 포커스 여부를 한 곳에서 정한다
 * 레이아웃 진입점에서만 사용한다
 */
export function InputCapabilityProvider({
    has_keyboard,
    children,
}: InputCapabilityProviderProps) {
    const value = useMemo(() => ({ has_keyboard }), [has_keyboard]);

    return (
        <InputCapabilityContext.Provider value={value}>
            {children}
        </InputCapabilityContext.Provider>
    );
}
