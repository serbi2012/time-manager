import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    ConfigProvider,
    Layout,
    Typography,
    theme,
    message,
    Menu,
    Button,
    Avatar,
    Dropdown,
    Spin,
    Space,
    Drawer,
} from "antd";
import {
    ClockCircleOutlined,
    CalendarOutlined,
    HomeOutlined,
    SettingOutlined,
    GoogleOutlined,
    UserOutlined,
    LogoutOutlined,
    SyncOutlined,
    CloudOutlined,
    CloudSyncOutlined,
    CheckCircleFilled,
    InfoCircleOutlined,
    AppstoreOutlined,
    MessageOutlined,
    BookOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import { useResponsive } from "./hooks/useResponsive";
import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate,
    useLocation,
    Link,
} from "react-router-dom";
import dayjs from "dayjs";
import {
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    WARNING_MESSAGES,
    INFO_MESSAGES,
} from "./shared/constants";
import WorkRecordTable from "./components/WorkRecordTable";
import WorkTemplateList from "./components/WorkTemplateList";
import { DailyGanttChart } from "@/features/gantt-chart";
import WeeklySchedule from "./components/WeeklySchedule";
import SuggestionBoard from "./components/SuggestionBoard";
import GuideBook from "./components/GuideBook";
import { AdminSessionGrid } from "./features/admin";
import SettingsModal from "./components/SettingsModal";
import ChangelogModal from "./components/ChangelogModal";
import { CURRENT_VERSION } from "./constants/changelog";
import { useWorkStore, APP_THEME_COLORS } from "./store/useWorkStore";
import { useAuth } from "./firebase/useAuth";
import { useShortcuts } from "./hooks/useShortcuts";
import {
    loadFromFirebase,
    refreshFromFirebase,
    syncBeforeUnload,
    checkPendingSync,
    autoMergeDuplicateRecords,
    clearSyncState,
    syncRecord,
    syncTemplate,
    syncSettings,
} from "./firebase/syncService";
import "./styles/app.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function MainPage() {
    const { is_mobile } = useResponsive();
    const [is_preset_drawer_open, setIsPresetDrawerOpen] = useState(false);
    const app_theme = useWorkStore((state) => state.app_theme);

    // 프리셋에서 작업 기록에만 추가 (타이머 없이)
    const handleAddRecordOnly = (template_id: string) => {
        const state = useWorkStore.getState();
        const template = state.templates.find((t) => t.id === template_id);
        if (!template) return;

        let deal_name = template.deal_name || "작업";

        // 설정에서 postfix 사용 여부 확인
        if (state.use_postfix_on_preset_add) {
            const now = new Date();
            const random_suffix = Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0");
            const unique_id = `${String(now.getMonth() + 1).padStart(
                2,
                "0"
            )}${String(now.getDate()).padStart(2, "0")}_${String(
                now.getHours()
            ).padStart(2, "0")}${String(now.getMinutes()).padStart(
                2,
                "0"
            )}${String(now.getSeconds()).padStart(2, "0")}_${random_suffix}`;
            deal_name = template.deal_name
                ? `${template.deal_name}_${unique_id}`
                : `작업_${unique_id}`;
        } else {
            // postfix 없이 추가할 때 중복 체크
            const base_deal_name = deal_name;
            const existing_records = state.records.filter(
                (r) =>
                    !r.is_deleted &&
                    !r.is_completed &&
                    r.work_name === template.work_name &&
                    (r.deal_name === base_deal_name ||
                        r.deal_name.match(
                            new RegExp(`^${base_deal_name} \\(\\d+\\)$`)
                        ))
            );

            if (existing_records.length > 0) {
                // 이미 같은 이름의 작업이 있으면 번호 추가
                let max_num = 1;
                existing_records.forEach((r) => {
                    const match = r.deal_name.match(/\((\d+)\)$/);
                    if (match) {
                        max_num = Math.max(max_num, parseInt(match[1]));
                    }
                });
                deal_name = `${base_deal_name} (${max_num + 1})`;
            }
        }

        // 선택된 날짜에 작업 추가 (달력에서 다른 날짜를 보고 있으면 해당 날짜에 추가)
        const target_date = state.selected_date;

        // 새 레코드 생성 (타이머 없이 즉시 추가)
        // start_time/end_time 비워서 간트에 표시되지 않도록
        const new_record = {
            id: crypto.randomUUID(),
            project_code: template.project_code || "A00_00000",
            work_name: template.work_name,
            task_name: template.task_name,
            deal_name: deal_name,
            category_name: template.category_name,
            note: template.note,
            duration_minutes: 0,
            start_time: "",
            end_time: "",
            date: target_date,
            sessions: [],
            is_completed: false,
            is_deleted: false,
        };

        useWorkStore.getState().addRecord(new_record);
        message.success(
            SUCCESS_MESSAGES.workAddedFromTemplate(template.work_name)
        );

        // 모바일에서 드로어 닫기
        if (is_mobile) {
            setIsPresetDrawerOpen(false);
        }
    };

    return (
        <Layout className="app-body">
            {/* 좌측 사이드바: 작업 프리셋 (데스크톱 전용) */}
            <Sider width={300} className="app-sider" theme="light">
                <WorkTemplateList onAddRecordOnly={handleAddRecordOnly} />
            </Sider>

            {/* 메인 컨텐츠 */}
            <Content className="app-content">
                {/* 간트차트 */}
                <div className="gantt-section">
                    <DailyGanttChart />
                </div>

                {/* 메인: 작업 기록 테이블 */}
                <div className="table-section">
                    <WorkRecordTable />
                </div>
            </Content>

            {/* 모바일 프리셋 FAB 버튼 */}
            {is_mobile && (
                <button
                    className="mobile-preset-fab"
                    onClick={() => setIsPresetDrawerOpen(true)}
                    aria-label="프리셋 열기"
                    style={{
                        background: APP_THEME_COLORS[app_theme].gradient,
                        boxShadow: `0 4px 12px ${APP_THEME_COLORS[app_theme].primary}66`,
                    }}
                >
                    <AppstoreOutlined />
                </button>
            )}

            {/* 모바일 프리셋 드로어 */}
            <Drawer
                title="작업 프리셋"
                placement="bottom"
                open={is_preset_drawer_open}
                onClose={() => setIsPresetDrawerOpen(false)}
                className="mobile-preset-drawer"
                styles={{
                    body: { padding: 12 },
                    wrapper: { maxHeight: "70vh" },
                }}
            >
                <WorkTemplateList onAddRecordOnly={handleAddRecordOnly} />
            </Drawer>
        </Layout>
    );
}

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { is_mobile } = useResponsive();
    const [is_settings_open, setIsSettingsOpen] = useState(false);
    const [is_changelog_open, setIsChangelogOpen] = useState(false);
    const [is_syncing, setIsSyncing] = useState(false);
    const file_input_ref = useRef<HTMLInputElement>(null);

    // Firebase Auth
    const {
        user,
        loading: auth_loading,
        signInWithGoogle,
        logout,
        isAuthenticated,
    } = useAuth();

    // 데이터 동기화 상태 관리
    const [sync_status, setSyncStatus] = useState<
        "idle" | "syncing" | "synced" | "error"
    >("idle");

    // 초기 데이터 로딩 완료 여부
    const [initial_load_done, setInitialLoadDone] = useState(false);

    // 동기화 완료 체크 애니메이션 표시
    const [show_sync_check, setShowSyncCheck] = useState(false);
    const sync_check_timeout = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    // 단축키 이벤트 발생 함수들
    const emitEvent = useCallback((event_name: string) => {
        window.dispatchEvent(new CustomEvent(event_name));
    }, []);

    // 단축키 핸들러
    const shortcut_handlers = useMemo(
        () => ({
            openNewWorkModal: () => emitEvent("shortcut:openNewWorkModal"),
            openNewPresetModal: () => emitEvent("shortcut:openNewPresetModal"),
            openSettings: () => setIsSettingsOpen(true),
            showShortcuts: () => {
                setIsSettingsOpen(true);
            },
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
                const prev = dayjs(current)
                    .subtract(1, "day")
                    .format("YYYY-MM-DD");
                useWorkStore.getState().setSelectedDate(prev);
            },
            nextDay: () => {
                const current = useWorkStore.getState().selected_date;
                const next = dayjs(current).add(1, "day").format("YYYY-MM-DD");
                useWorkStore.getState().setSelectedDate(next);
            },
            goDaily: () => navigate("/"),
            goWeekly: () => navigate("/weekly"),
            exportData: () => handleExport(),
            syncData: () => handleManualSync(),
        }),
        [emitEvent, navigate]
    );

    // 단축키 훅 사용
    useShortcuts(shortcut_handlers);

    // 동기화 완료 체크 표시 함수
    const showSyncCheckAnimation = useCallback(() => {
        // 이전 타이머 취소
        if (sync_check_timeout.current) {
            clearTimeout(sync_check_timeout.current);
        }

        setShowSyncCheck(true);

        // 1.5초 후 사라지게
        sync_check_timeout.current = setTimeout(() => {
            setShowSyncCheck(false);
            sync_check_timeout.current = null;
        }, 1500);
    }, []);

    // 로그인 시 데이터 동기화
    useEffect(() => {
        if (user) {
            setSyncStatus("syncing");
            setInitialLoadDone(false);

            // 먼저 미저장 백업이 있는지 확인 후 동기화
            checkPendingSync(user)
                .then(() => loadFromFirebase(user))
                .then((success) => {
                    if (success) {
                        // 동기화 후 중복 레코드 자동 병합
                        const merge_result = autoMergeDuplicateRecords();
                        if (merge_result.merged_count > 0) {
                            message.info(
                                SUCCESS_MESSAGES.duplicateRecordsMerged(
                                    merge_result.deleted_count
                                )
                            );
                        }
                        setSyncStatus("synced");
                        showSyncCheckAnimation();
                    } else {
                        setSyncStatus("error");
                        message.error(ERROR_MESSAGES.dataLoadFailed);
                    }
                    setInitialLoadDone(true);
                })
                .catch(() => {
                    setSyncStatus("error");
                    setInitialLoadDone(true); // 에러가 나도 로딩 완료 처리
                    message.error(ERROR_MESSAGES.syncFailedMessage);
                });
        } else {
            clearSyncState();
            setSyncStatus("idle");
            setInitialLoadDone(true); // 비로그인 상태도 로딩 완료
        }
    }, [user, showSyncCheckAnimation]);

    // 브라우저 종료/새로고침 시 데이터 백업
    useEffect(() => {
        if (!user || !isAuthenticated) return;

        const handleBeforeUnload = () => {
            syncBeforeUnload(user);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [user, isAuthenticated]);

    // 앱 테마 (헤더 색상용)
    const app_theme = useWorkStore((state) => state.app_theme);

    // 수동 새로고침 (서버에서 데이터 다시 로드)
    const handleManualSync = async () => {
        if (!user) return;

        setIsSyncing(true);
        try {
            const success = await refreshFromFirebase(user);
            if (success) {
                message.success(SUCCESS_MESSAGES.dataRefreshed);
                showSyncCheckAnimation();
            } else {
                message.error(ERROR_MESSAGES.refreshFailed);
            }
        } catch {
            message.error("새로고침 실패");
        } finally {
            setIsSyncing(false);
        }
    };

    // 로그인 처리
    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch {
            message.error(ERROR_MESSAGES.loginFailed);
        }
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await logout();
            message.success(SUCCESS_MESSAGES.loggedOut);
        } catch {
            message.error(ERROR_MESSAGES.logoutFailed);
        }
    };

    const ADMIN_EMAIL = "rlaxo0306@gmail.com";
    const is_admin = user?.email === ADMIN_EMAIL;

    // 메뉴 링크 스타일 (기본 a 태그 스타일 제거)
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

    // 유저 드롭다운 메뉴
    const user_menu_items = [
        {
            key: "refresh",
            icon: <SyncOutlined spin={is_syncing} />,
            label: "서버에서 새로고침",
            onClick: handleManualSync,
        },
        {
            key: "divider",
            type: "divider" as const,
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "로그아웃",
            onClick: handleLogout,
            danger: true,
        },
    ];

    // 데이터 내보내기 (Store에서 직접 추출, 기존 JSON 형식 유지)
    const handleExport = () => {
        const state = useWorkStore.getState();

        // 기존 JSON 형식과 동일하게 구성
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
            message.warning(WARNING_MESSAGES.noDataToExport);
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
        message.success(SUCCESS_MESSAGES.dataExportedSuccess);
    };

    // 데이터 가져오기 (게스트 모드에서도 사용 가능)
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

                // 기존 형식 지원 (state 래퍼가 있는 경우와 없는 경우 모두)
                const data = parsed.state ? parsed.state : parsed;

                // 데이터 유효성 검사
                if (!data.records) {
                    message.error(ERROR_MESSAGES.invalidImportFormat);
                    return;
                }

                const records = data.records || [];
                const templates = data.templates || [];

                // Store에 직접 데이터 설정
                useWorkStore.setState({
                    records,
                    templates,
                    custom_task_options: data.custom_task_options || [],
                    custom_category_options: data.custom_category_options || [],
                });

                // Firebase에 개별적으로 동기화 (import 시)
                if (user && isAuthenticated) {
                    try {
                        // 레코드 개별 저장
                        await Promise.all(
                            records.map(
                                (record: import("./types").WorkRecord) =>
                                    syncRecord(record)
                            )
                        );
                        // 템플릿 개별 저장
                        await Promise.all(
                            templates.map(
                                (template: import("./types").WorkTemplate) =>
                                    syncTemplate(template)
                            )
                        );
                        // 설정 저장
                        await syncSettings({
                            custom_task_options: data.custom_task_options || [],
                            custom_category_options:
                                data.custom_category_options || [],
                        });
                        message.success(SUCCESS_MESSAGES.dataImportedAndSynced);
                    } catch {
                        message.warning(
                            WARNING_MESSAGES.dataImportedSyncFailed
                        );
                    }
                } else {
                    message.success(SUCCESS_MESSAGES.dataImportedSuccess);
                }
            } catch {
                message.error(ERROR_MESSAGES.fileReadFailed);
            }
        };
        reader.readAsText(file);

        // 같은 파일 다시 선택 가능하도록 초기화
        event.target.value = "";
    };

    return (
        <Layout className="app-layout">
            {/* 헤더 */}
            <Header
                className="app-header"
                style={{
                    background: APP_THEME_COLORS[app_theme].gradient,
                }}
            >
                <div className="header-content">
                    <ClockCircleOutlined className="header-icon" />
                    <Title level={4} className="header-title">
                        업무 시간 관리
                    </Title>
                </div>
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menu_items}
                    style={{
                        flex: 1,
                        marginLeft: 24,
                        background: "transparent",
                        borderBottom: "none",
                    }}
                    theme="dark"
                />
                <Space size={is_mobile ? "small" : "middle"}>
                    {/* 동기화 상태 표시 */}
                    {isAuthenticated ? (
                        <span
                            style={{
                                color: "rgba(255,255,255,0.65)",
                                fontSize: is_mobile ? 10 : 12,
                            }}
                        >
                            {sync_status === "syncing" && (
                                <>
                                    <SyncOutlined spin />
                                    {!is_mobile && " 동기화 중..."}
                                </>
                            )}
                            {sync_status === "synced" && (
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <CloudSyncOutlined />
                                    {!is_mobile && " 클라우드 연결됨"}
                                    {show_sync_check && (
                                        <CheckCircleFilled
                                            style={{
                                                color: "#52c41a",
                                                fontSize: 14,
                                                animation:
                                                    "syncCheckPop 0.3s ease-out, syncCheckFade 1.5s ease-in-out",
                                            }}
                                        />
                                    )}
                                </span>
                            )}
                            {sync_status === "error" && (
                                <>
                                    <CloudOutlined
                                        style={{ color: "#ff4d4f" }}
                                    />
                                    {!is_mobile && " 동기화 오류"}
                                </>
                            )}
                        </span>
                    ) : (
                        !auth_loading && (
                            <span
                                style={{
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: is_mobile ? 10 : 12,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <UserOutlined />
                                {!is_mobile && " 게스트 모드"}
                            </span>
                        )
                    )}

                    {/* 버전 정보 버튼 (데스크톱 전용) */}
                    {!is_mobile && (
                        <Button
                            type="text"
                            icon={<InfoCircleOutlined />}
                            onClick={() => setIsChangelogOpen(true)}
                            style={{
                                color: "rgba(255,255,255,0.85)",
                                fontSize: 12,
                                padding: "4px 8px",
                                height: "auto",
                            }}
                        >
                            v{CURRENT_VERSION}
                        </Button>
                    )}

                    {/* 설정 버튼 */}
                    <Button
                        type="text"
                        icon={<SettingOutlined />}
                        onClick={() => setIsSettingsOpen(true)}
                        style={{
                            color: "white",
                            fontSize: is_mobile ? 20 : 18,
                        }}
                    />

                    {/* 로그인/유저 정보 */}
                    {auth_loading ? (
                        <Spin size="small" />
                    ) : isAuthenticated && user ? (
                        <Dropdown
                            menu={{ items: user_menu_items }}
                            placement="bottomRight"
                        >
                            <Space style={{ cursor: "pointer" }}>
                                <Avatar
                                    src={user.photoURL}
                                    icon={<UserOutlined />}
                                    size="small"
                                />
                                {!is_mobile && (
                                    <span
                                        style={{ color: "white", fontSize: 13 }}
                                    >
                                        {user.displayName || user.email}
                                    </span>
                                )}
                            </Space>
                        </Dropdown>
                    ) : (
                        <Button
                            type="primary"
                            icon={<GoogleOutlined />}
                            onClick={handleLogin}
                            size="small"
                        >
                            {is_mobile ? "" : "로그인"}
                        </Button>
                    )}
                </Space>
            </Header>

            {/* 초기 데이터 로딩 오버레이 (Auth 로딩 중 또는 데이터 동기화 중) */}
            {(auth_loading || (isAuthenticated && !initial_load_done)) && (
                <div
                    style={{
                        position: "fixed",
                        top: 64,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        gap: 16,
                        background: "rgba(255, 255, 255, 0.9)",
                        zIndex: 1000,
                    }}
                >
                    <Spin size="large" />
                    <span style={{ color: "#666" }}>
                        {auth_loading
                            ? "로그인 확인 중..."
                            : "데이터를 불러오는 중..."}
                    </span>
                </div>
            )}

            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/weekly" element={<WeeklySchedule />} />
                <Route path="/suggestions" element={<SuggestionBoard />} />
                <Route path="/guide" element={<GuideBook />} />
                <Route path="/admin" element={<AdminSessionGrid />} />
            </Routes>

            {/* 설정 모달 */}
            <SettingsModal
                open={is_settings_open}
                onClose={() => setIsSettingsOpen(false)}
                onExport={handleExport}
                onImport={handleImport}
                isAuthenticated={isAuthenticated}
            />

            {/* 업데이트 내역 모달 */}
            <ChangelogModal
                open={is_changelog_open}
                onClose={() => setIsChangelogOpen(false)}
            />

            {/* 파일 입력 (Import용) */}
            <input
                ref={file_input_ref}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {/* 모바일 하단 네비게이션 */}
            {is_mobile && (
                <nav className="mobile-bottom-nav">
                    <button
                        className={`mobile-nav-item ${
                            location.pathname === "/" ? "active" : ""
                        }`}
                        onClick={() => navigate("/")}
                    >
                        <HomeOutlined />
                        <span>일간</span>
                    </button>
                    <button
                        className={`mobile-nav-item ${
                            location.pathname === "/weekly" ? "active" : ""
                        }`}
                        onClick={() => navigate("/weekly")}
                    >
                        <CalendarOutlined />
                        <span>주간</span>
                    </button>
                    <button
                        className={`mobile-nav-item ${
                            location.pathname === "/suggestions" ? "active" : ""
                        }`}
                        onClick={() => navigate("/suggestions")}
                    >
                        <MessageOutlined />
                        <span>건의</span>
                    </button>
                    <button
                        className={`mobile-nav-item ${
                            location.pathname === "/guide" ? "active" : ""
                        }`}
                        onClick={() => navigate("/guide")}
                    >
                        <BookOutlined />
                        <span>설명서</span>
                    </button>
                </nav>
            )}
        </Layout>
    );
}

function App() {
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: theme_color,
                    borderRadius: 8,
                },
            }}
        >
            <BrowserRouter>
                <AppLayout />
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;
