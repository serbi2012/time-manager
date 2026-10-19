import type { ReactElement, ReactNode } from "react";
import {
    render,
    type RenderOptions,
    type RenderResult,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";

export interface RenderWithAntdOptions extends Omit<RenderOptions, "wrapper"> {
    route?: string;
}

interface WrapperProps {
    children: ReactNode;
}

function createAntdWrapper(route?: string) {
    return function AntdWrapper({ children }: WrapperProps) {
        if (route === undefined) {
            return <ConfigProvider locale={koKR}>{children}</ConfigProvider>;
        }
        return (
            <ConfigProvider locale={koKR}>
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </ConfigProvider>
        );
    };
}

export function renderWithAntd(
    ui: ReactElement,
    { route, ...render_options }: RenderWithAntdOptions = {}
): RenderResult {
    return render(ui, { wrapper: createAntdWrapper(route), ...render_options });
}
