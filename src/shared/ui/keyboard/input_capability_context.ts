import { createContext } from "react";

export interface InputCapability {
    /** 물리 키보드로 조작하는 환경인가 */
    has_keyboard: boolean;
}

/** Provider가 없으면 키보드가 있는 것으로 본다 (데스크탑 기본값) */
export const DEFAULT_INPUT_CAPABILITY: InputCapability = {
    has_keyboard: true,
};

export const InputCapabilityContext = createContext<InputCapability>(
    DEFAULT_INPUT_CAPABILITY
);
