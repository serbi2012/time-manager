/**
 * 데스크탑 레이아웃
 */

import { useMemo, useCallback, useState } from "react";
import { Layout, Spin } from "antd";
import { message } from "@/shared/lib/message";
import {
    useNavigate,
    useLocation,
    Routes,
    Route,
    Link,
} from "react-router-dom";
import {
    HomeOutlined,
    CalendarOutlined,
    MessageOutlined,
    BookOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import { DesktopHeader } from "../../widgets/Header";
import { useWorkStore } from "../../store/useWorkStore";
import { useSyncStatus } from "../../features/sync";
import { useShortcuts } from "../../hooks/useShortcuts";
import { useAuthHandlers, useDataImportExport } from "../../shared/hooks";
import {
    INFO_MESSAGES,
    WARNING_MESSAGES,
    FEATURE_FLAGS,
} from "../../shared/constants";
import { CURRENT_VERSION } from "../../constants/changelog";
import SettingsModal from "../../components/SettingsModal";
import ChangelogModal from "../../components/ChangelogModal";
import { DailyPage } from "../../pages/DailyPage/index";
import WeeklySchedule from "../../components/WeeklySchedule";
import SuggestionBoard from "../../components/SuggestionBoard";
import GuideBook from "../../components/GuideBook";
import { AdminSessionGrid } from "../../features/admin";
import {
    SlideIn,
    PageTransitionProvider,
    DESKTOP_DAILY_DELAYS,
} from "../../shared/ui";
import type { TransitionSpeed } from "../../shared/ui";

const ADMIN_EMAIL = "rlaxo0306@gmail.com";

/**
 * 데스크탑 레이아웃
 */
export function DesktopLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [is_settings_open, setIsSettingsOpen] = useState(false);
    const [is_changelog_open, setIsChangelogOpen] = useState(false);

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

    // 단축키 이벤트 발생 함수
    const emitEvent = useCallback((event_name: string) => {
        window.dispatchEvent(new CustomEvent(event_name));
    }, []);

    // 단축키 핸들러 - React Compiler가 자동으로 최적화
    const shortcut_handlers = {
        openNewWorkModal: () => emitEvent("shortcut:openNewWorkModal"),
        openNewPresetModal: () => emitEvent("shortcut:openNewPresetModal"),
        openSettings: () => setIsSettingsOpen(true),
        showShortcuts: () => setIsSettingsOpen(true),
        toggleTimer: () => {
            const timer = useWorkStore.getState().timer;
            if (timer.is_running) {
                useWorkStore.getState().stopTimer();
                message.info(INFO_MESSAGES.timerStopped);
            } else {
                message.warning(WARNING_MESSAGES.selectWorkFirst);
            }
        },
        resetTimer: () => {
            useWorkStore.getState().resetTimer();
            message.info(INFO_MESSAGES.timerReset);
        },
        goToday: () => {
            useWorkStore
                .getState()
                .setSelectedDate(dayjs().format("YYYY-MM-DD"));
            message.info(INFO_MESSAGES.movedToToday);
        },
        prevDay: () => {
            const current = useWorkStore.getState().selected_date;
            const prev = dayjs(current).subtract(1, "day").format("YYYY-MM-DD");
            useWorkStore.getState().setSelectedDate(prev);
        },
        nextDay: () => {
            const current = useWorkStore.getState().selected_date;
            const next = dayjs(current).add(1, "day").format("YYYY-MM-DD");
            useWorkStore.getState().setSelectedDate(next);
        },
        goDaily: () => navigate("/"),
        goWeekly: () => navigate("/weekly"),
        exportData: handleExport,
        syncData: () => handleManualSync(),
    };

    useShortcuts(shortcut_handlers);

    const is_admin = user?.email === ADMIN_EMAIL;

    const menu_items = useMemo(
        () => [
            {
                key: "/",
                icon: <HomeOutlined />,
                label: (
                    <Link to="/" className="text-inherit no-underline">
                        일간 기록
                    </Link>
                ),
            },
            {
                key: "/weekly",
                icon: <CalendarOutlined />,
                label: (
                    <Link to="/weekly" className="text-inherit no-underline">
                        주간 일정
                    </Link>
                ),
            },
            ...(FEATURE_FLAGS.suggestions.visible
                ? [
                      {
                          key: "/suggestions",
                          icon: <MessageOutlined />,
                          label: (
                              <Link
                                  to="/suggestions"
                                  className="text-inherit no-underline"
                              >
                                  건의사항
                              </Link>
                          ),
                      },
                  ]
                : []),
            {
                key: "/guide",
                icon: <BookOutlined />,
                label: (
                    <Link to="/guide" className="text-inherit no-underline">
                        사용 설명서
                    </Link>
                ),
            },
            ...(is_admin
                ? [
                      {
                          key: "/admin",
                          icon: <ToolOutlined />,
                          label: (
                              <Link
                                  to="/admin"
                                  className="text-inherit no-underline"
                              >
                                  관리자
                              </Link>
                          ),
                      },
                  ]
                : []),
        ],
        [is_admin]
    );

    // 트랜지션 준비 상태: 로딩이 완료되었을 때
    const is_transition_ready = !auth_loading && initial_load_done;

    return (
        <Layout className="app-layout">
            <SlideIn
                direction="top"
                show={is_transition_ready}
                delay={DESKTOP_DAILY_DELAYS.header}
                enabled={transition_enabled}
                speed={transition_speed}
            >
                <DesktopHeader
                    app_theme={app_theme}
                    menu_items={menu_items}
                    current_path={location.pathname}
                    user={user}
                    auth_loading={auth_loading}
                    is_authenticated={isAuthenticated}
                    sync_status={sync_status}
                    show_sync_check={show_sync_check}
                    is_syncing={is_syncing}
                    current_version={CURRENT_VERSION}
                    on_login={handleLogin}
                    on_logout={handleLogout}
                    on_manual_sync={handleManualSync}
                    on_settings_open={() => setIsSettingsOpen(true)}
                    on_changelog_open={() => setIsChangelogOpen(true)}
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
                        <span className="text-[#666]">
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
                    <Route path="/admin" element={<AdminSessionGrid />} />
                </Routes>
            </PageTransitionProvider>

            <SettingsModal
                open={is_settings_open}
                onClose={() => setIsSettingsOpen(false)}
                onExport={handleExport}
                onImport={handleImport}
                isAuthenticated={isAuthenticated}
            />

            <ChangelogModal
                open={is_changelog_open}
                onClose={() => setIsChangelogOpen(false)}
            />

            <input
                ref={file_input_ref}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
            />
        </Layout>
    );
}

export default DesktopLayout;
