/**
 * 앱 진입점
 *
 * 플랫폼별 레이아웃을 완전히 분리하여
 * 모바일 수정이 데스크탑에 영향을 주지 않도록 설계
 */

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./providers";
import { DesktopLayout, MobileLayout } from "./layouts";
import { useResponsive } from "../hooks/useResponsive";
import "../styles/app.css";

/**
 * 플랫폼별 레이아웃 선택 컴포넌트
 */
function AppLayout() {
    const { is_mobile } = useResponsive();

    // 완전히 별도의 컴포넌트 트리 사용
    // 모바일과 데스크탑이 서로 영향을 주지 않음
    if (is_mobile) {
        return <MobileLayout />;
    }

    return <DesktopLayout />;
}

/**
 * 앱 루트 컴포넌트
 */
function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AppLayout />
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
