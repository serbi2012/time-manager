/**
 * 모바일 레이아웃
 */

import { useRef, useState } from "react";
import { Layout, Spin, message } from "antd";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MobileHeader } from "../../widgets/Header";
import { MobileBottomNav } from "../../widgets/Navigation";
import { useWorkStore } from "../../store/useWorkStore";
import { useAuth } from "../../firebase/useAuth";
import { useSyncStatus } from "../../features/sync";
import {
    syncRecord,
    syncTemplate,
    syncSettings,
} from "../../firebase/syncService";
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
    const file_input_ref = useRef<HTMLInputElement>(null);

    const {
        user,
        loading: auth_loading,
        signInWithGoogle,
        logout,
        isAuthenticated,
    } = useAuth();
    const app_theme = useWorkStore((state) => state.app_theme);
    const transition_enabled = useWorkStore((state) => state.transition_enabled);
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

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch {
            message.error("로그인에 실패했습니다");
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            message.success("로그아웃되었습니다");
        } catch {
            message.error("로그아웃에 실패했습니다");
        }
    };

    const handleExport = () => {
        const state = useWorkStore.getState();
        const export_data = {
            state: {
                records: state.records,
                templates: state.templates,
                timer: state.timer,
                custom_task_options: state.custom_task_options,
                custom_category_options: state.custom_category_options,
            },
            version: 0,
        };

        if (state.records.length === 0 && state.templates.length === 0) {
            message.warning("내보낼 데이터가 없습니다");
            return;
        }

        const blob = new Blob([JSON.stringify(export_data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `time-manager-backup-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success("데이터가 내보내졌습니다");
    };

    const handleImport = () => {
        file_input_ref.current?.click();
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                const data = parsed.state ? parsed.state : parsed;

                if (!data.records) {
                    message.error("유효하지 않은 데이터 형식입니다");
                    return;
                }

                const records = data.records || [];
                const templates = data.templates || [];

                useWorkStore.setState({
                    records,
                    templates,
                    custom_task_options: data.custom_task_options || [],
                    custom_category_options: data.custom_category_options || [],
                });

                if (user && isAuthenticated) {
                    try {
                        await Promise.all(
                            records.map(
                                (record: import("../../types").WorkRecord) =>
                                    syncRecord(record)
                            )
                        );
                        await Promise.all(
                            templates.map(
                                (
                                    template: import("../../types").WorkTemplate
                                ) => syncTemplate(template)
                            )
                        );
                        await syncSettings({
                            custom_task_options: data.custom_task_options || [],
                            custom_category_options:
                                data.custom_category_options || [],
                        });
                        message.success(
                            "데이터를 가져오고 클라우드에 동기화했습니다"
                        );
                    } catch {
                        message.warning(
                            "데이터를 가져왔지만 클라우드 동기화에 실패했습니다"
                        );
                    }
                } else {
                    message.success("데이터를 성공적으로 가져왔습니다");
                }
            } catch {
                message.error("파일을 읽는 중 오류가 발생했습니다");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

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
