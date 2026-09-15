/**
 * 모바일 레이아웃 본문
 * 동기화 상태는 SyncStatusProvider가 한 번만 구독하고 컨텍스트로 내려준다
 */

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Layout } from "antd";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { MobileBottomNav } from "../../widgets/Navigation";
import { useWorkStore } from "../../store/useWorkStore";
import { useSyncStatusContext } from "../../features/sync";
import { useDataImportExport } from "../../shared/hooks";
import { setHapticsEnabled } from "@/shared/lib/haptic";
import { DailyPage } from "../../pages/DailyPage/index";
import {
    RouteTransition,
    PageTransitionProvider,
    MobileListSkeleton,
} from "../../shared/ui";
import type { TransitionSpeed } from "../../shared/ui";

const WeeklySchedule = lazy(() => import("../../components/WeeklySchedule"));
const GuideBook = lazy(() => import("../../components/GuideBook"));
const SettingsModal = lazy(() => import("../../components/SettingsModal"));

interface MobileLayoutContentProps {
    auth_loading: boolean;
    is_authenticated: boolean;
}

export function MobileLayoutContent({
    auth_loading,
    is_authenticated,
}: MobileLayoutContentProps) {
    const [is_settings_open, setIsSettingsOpen] = useState(false);

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

    const haptics_enabled = useWorkStore((state) => state.haptics_enabled);

    const { initial_load_done } = useSyncStatusContext();

    useEffect(() => {
        setHapticsEnabled(haptics_enabled);
    }, [haptics_enabled]);

    const is_transition_ready = !auth_loading && initial_load_done;

    const handleOpenSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    const handleCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
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
                {(auth_loading || (is_authenticated && !initial_load_done)) && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-bg-light z-[1000] overflow-hidden"
                    >
                        <MobileListSkeleton />
                    </motion.div>
                )}
            </AnimatePresence>

            <PageTransitionProvider
                is_ready={is_transition_ready}
                transition_enabled={transition_enabled}
                transition_speed={transition_speed}
            >
                <RouteTransition>
                    <Suspense fallback={null}>
                        <Routes>
                            <Route path="/" element={<DailyPage />} />
                            <Route path="/weekly" element={<WeeklySchedule />} />
                            <Route path="/guide" element={<GuideBook />} />
                        </Routes>
                    </Suspense>
                </RouteTransition>
            </PageTransitionProvider>

            <Suspense fallback={null}>
                {is_settings_open && (
                    <SettingsModal
                        open={is_settings_open}
                        onClose={handleCloseSettings}
                        onExport={handleExport}
                        onImport={handleImport}
                        isAuthenticated={is_authenticated}
                    />
                )}
            </Suspense>

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
