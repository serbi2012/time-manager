/**
 * 데스크탑 레이아웃
 */

import { useRef, useMemo, useCallback, useState } from "react";
import { Layout, Spin, message } from "antd";
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
import { useAuth } from "../../firebase/useAuth";
import { useSyncStatus } from "../../features/sync";
import { useShortcuts } from "../../hooks/useShortcuts";
import {
    syncRecord,
    syncTemplate,
    syncSettings,
} from "../../firebase/syncService";
import { CURRENT_VERSION } from "../../constants/changelog";
import SettingsModal from "../../components/SettingsModal";
import ChangelogModal from "../../components/ChangelogModal";
import { DailyPage } from "../../pages/DailyPage/index";
import WeeklySchedule from "../../components/WeeklySchedule";
import SuggestionBoard from "../../components/SuggestionBoard";
import GuideBook from "../../components/GuideBook";
import AdminSessionGrid from "../../components/AdminSessionGrid";
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
                message.info("타이머가 중지되었습니다");
            } else {
                message.warning("먼저 작업을 선택하세요");
            }
        },
        resetTimer: () => {
            useWorkStore.getState().resetTimer();
            message.info("타이머가 초기화되었습니다");
        },
        goToday: () => {
            useWorkStore
                .getState()
                .setSelectedDate(dayjs().format("YYYY-MM-DD"));
            message.info("오늘 날짜로 이동했습니다");
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
        exportData: () => {
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
        },
        syncData: () => handleManualSync(),
    };

    useShortcuts(shortcut_handlers);

    const is_admin = user?.email === ADMIN_EMAIL;
    const menu_link_style = { color: "inherit", textDecoration: "none" };

    const menu_items = useMemo(
        () => [
            {
                key: "/",
                icon: <HomeOutlined />,
                label: (
                    <Link to="/" style={menu_link_style}>
                        일간 기록
                    </Link>
                ),
            },
            {
                key: "/weekly",
                icon: <CalendarOutlined />,
                label: (
                    <Link to="/weekly" style={menu_link_style}>
                        주간 일정
                    </Link>
                ),
            },
            {
                key: "/suggestions",
                icon: <MessageOutlined />,
                label: (
                    <Link to="/suggestions" style={menu_link_style}>
                        건의사항
                    </Link>
                ),
            },
            {
                key: "/guide",
                icon: <BookOutlined />,
                label: (
                    <Link to="/guide" style={menu_link_style}>
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
                              <Link to="/admin" style={menu_link_style}>
                                  관리자
                              </Link>
                          ),
                      },
                  ]
                : []),
        ],
        [is_admin]
    );

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
                style={{ display: "none" }}
            />
        </Layout>
    );
}

export default DesktopLayout;
