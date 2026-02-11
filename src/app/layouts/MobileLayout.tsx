/**
 * 모바일 레이아웃
 */

import { useState, useEffect, useCallback } from "react";
import { Layout, Spin } from "antd";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MobileBottomNav } from "../../widgets/Navigation";
import { useWorkStore } from "../../store/useWorkStore";
import { useSyncStatus } from "../../features/sync";
import { useAuthHandlers, useDataImportExport } from "../../shared/hooks";
import SettingsModal from "../../components/SettingsModal";
import { DailyPage } from "../../pages/DailyPage/index";
import WeeklySchedule from "../../components/WeeklySchedule";
import GuideBook from "../../components/GuideBook";
import { PageTransitionProvider } from "../../shared/ui";
import type { TransitionSpeed } from "../../shared/ui";

/**
 * 모바일 레이아웃
 */
export function MobileLayout() {
    const [is_settings_open, setIsSettingsOpen] = useState(false);

    // 공통 훅 사용
    const { user, loading: auth_loading, isAuthenticated } = useAuthHandlers();

    const {
        fileInputRef: file_input_ref,
        handleExport,
        handleImport,
        handleFileChange,
    } = useDataImportExport();

    const transition_enabled = useWorkStore(
        (state) => state.transition_enabled
    );
    const transition_speed = useWorkStore(
        (state) => state.transition_speed
    ) as TransitionSpeed;

    const { initial_load_done } = useSyncStatus({
        user,
        is_authenticated: isAuthenticated,
    });

    // 트랜지션 준비 상태: 로딩이 완료되었을 때
    const is_transition_ready = !auth_loading && initial_load_done;

    const handleOpenSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    useEffect(() => {
        window.addEventListener("openSettings", handleOpenSettings);
        return () => {
            window.removeEventListener("openSettings", handleOpenSettings);
        };
    }, [handleOpenSettings]);

    return (
        <Layout className="app-layout">
            <AnimatePresence>
                {(auth_loading || (isAuthenticated && !initial_load_done)) && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 flex flex-col items-center justify-center gap-lg bg-white z-[1000]"
                    >
                        <Spin size="large" />
                        <span className="!text-[#666]">
                            {auth_loading
                                ? "로그인 확인 중..."
                                : "데이터를 불러오는 중..."}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <PageTransitionProvider
                is_ready={is_transition_ready}
                transition_enabled={transition_enabled}
                transition_speed={transition_speed}
            >
                <Routes>
                    <Route path="/" element={<DailyPage />} />
                    <Route path="/weekly" element={<WeeklySchedule />} />
                    <Route path="/guide" element={<GuideBook />} />
                </Routes>
            </PageTransitionProvider>

            <SettingsModal
                open={is_settings_open}
                onClose={() => setIsSettingsOpen(false)}
                onExport={handleExport}
                onImport={handleImport}
                isAuthenticated={isAuthenticated}
            />

            <input
                ref={file_input_ref}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
            />

            <MobileBottomNav />
        </Layout>
    );
}

export default MobileLayout;
