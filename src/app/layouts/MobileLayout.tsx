/**
 * 모바일 레이아웃
 */

import { useState } from "react";
import { Layout, Spin } from "antd";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MobileHeader } from "../../widgets/Header";
import { MobileBottomNav } from "../../widgets/Navigation";
import { useWorkStore } from "../../store/useWorkStore";
import { useSyncStatus } from "../../features/sync";
import { useAuthHandlers, useDataImportExport } from "../../shared/hooks";
import SettingsModal from "../../components/SettingsModal";
import { DailyPage } from "../../pages/DailyPage/index";
import WeeklySchedule from "../../components/WeeklySchedule";
import SuggestionBoard from "../../components/SuggestionBoard";
import GuideBook from "../../components/GuideBook";
import {
    SlideIn,
    PageTransitionProvider,
    MOBILE_DAILY_DELAYS,
} from "../../shared/ui";
import type { TransitionSpeed } from "../../shared/ui";

/**
 * 모바일 레이아웃
 */
export function MobileLayout() {
    const [is_settings_open, setIsSettingsOpen] = useState(false);

    // 공통 훅 사용
    const {
        user,
        loading: auth_loading,
        isAuthenticated,
        handleLogin,
        handleLogout,
    } = useAuthHandlers();

    const {
        fileInputRef: file_input_ref,
        handleExport,
        handleImport,
        handleFileChange,
    } = useDataImportExport();

    const app_theme = useWorkStore((state) => state.app_theme);
    const transition_enabled = useWorkStore(
        (state) => state.transition_enabled
    );
    const transition_speed = useWorkStore(
        (state) => state.transition_speed
    ) as TransitionSpeed;

    const {
        sync_status,
        initial_load_done,
        is_syncing,
        show_sync_check,
        handleManualSync,
    } = useSyncStatus({ user, is_authenticated: isAuthenticated });

    // 트랜지션 준비 상태: 로딩이 완료되었을 때
    const is_transition_ready = !auth_loading && initial_load_done;

    return (
        <Layout className="app-layout">
            <SlideIn
                direction="top"
                show={is_transition_ready}
                delay={MOBILE_DAILY_DELAYS.header}
                enabled={transition_enabled}
                speed={transition_speed}
            >
                <MobileHeader
                    app_theme={app_theme}
                    user={user}
                    auth_loading={auth_loading}
                    is_authenticated={isAuthenticated}
                    sync_status={sync_status}
                    show_sync_check={show_sync_check}
                    is_syncing={is_syncing}
                    on_login={handleLogin}
                    on_logout={handleLogout}
                    on_manual_sync={handleManualSync}
                    on_settings_open={() => setIsSettingsOpen(true)}
                />
            </SlideIn>

            <AnimatePresence>
                {(auth_loading || (isAuthenticated && !initial_load_done)) && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            gap: 16,
                            background: "#fff",
                            zIndex: 1000,
                        }}
                    >
                        <Spin size="large" />
                        <span style={{ color: "#666" }}>
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
                    <Route path="/suggestions" element={<SuggestionBoard />} />
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
                style={{ display: "none" }}
            />

            <MobileBottomNav />
        </Layout>
    );
}

export default MobileLayout;
