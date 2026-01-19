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
} from "@ant-design/icons";
import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate,
    useLocation,
} from "react-router-dom";
import dayjs from "dayjs";
import WorkRecordTable from "./components/WorkRecordTable";
import WorkTemplateList from "./components/WorkTemplateList";
import DailyGanttChart from "./components/DailyGanttChart";
import WeeklySchedule from "./components/WeeklySchedule";
import SettingsModal from "./components/SettingsModal";
import { useWorkStore } from "./store/useWorkStore";
import { useShortcutStore } from "./store/useShortcutStore";
import { useAuth } from "./firebase/useAuth";
import { useShortcuts } from "./hooks/useShortcuts";
import {
    syncToFirebase,
    syncFromFirebase,
    startRealtimeSync,
    stopRealtimeSync,
    syncImmediately,
    syncBeforeUnload,
    checkPendingSync,
} from "./firebase/syncService";
import "./App.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function MainPage() {
    // 프리셋에서 작업 기록에만 추가 (타이머 없이)
    const handleAddRecordOnly = (template_id: string) => {
        const template = useWorkStore
            .getState()
            .templates.find((t) => t.id === template_id);
        if (!template) return;

        // 유니크 ID 생성
        const now = new Date();
        const random_suffix = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
        const unique_id = `${String(now.getMonth() + 1).padStart(
            2,
            "0"
        )}${String(now.getDate()).padStart(2, "0")}_${String(
            now.getHours()
        ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
            now.getSeconds()
        ).padStart(2, "0")}_${random_suffix}`;
        const unique_deal_name = template.deal_name
            ? `${template.deal_name}_${unique_id}`
            : `작업_${unique_id}`;

        const today_date = dayjs().format("YYYY-MM-DD");

        // 새 레코드 생성 (타이머 없이 즉시 추가)
        // start_time/end_time 비워서 간트에 표시되지 않도록
        const new_record = {
            id: crypto.randomUUID(),
            project_code: template.project_code || "A00_00000",
            work_name: template.work_name,
            task_name: template.task_name,
            deal_name: unique_deal_name,
            category_name: template.category_name,
            note: template.note,
            duration_minutes: 0,
            start_time: "",
            end_time: "",
            date: today_date,
            sessions: [],
            is_completed: false,
            is_deleted: false,
        };

        useWorkStore.getState().addRecord(new_record);
        message.success(`"${template.work_name}" 작업이 추가되었습니다`);
    };

    return (
        <Layout className="app-body">
            {/* 좌측 사이드바: 작업 프리셋 */}
            <Sider width={300} className="app-sider" theme="light">
                <WorkTemplateList
                    onAddRecordOnly={handleAddRecordOnly}
                />
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
        </Layout>
    );
}

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [is_settings_open, setIsSettingsOpen] = useState(false);
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

            // 먼저 미저장 백업이 있는지 확인 후 동기화
            checkPendingSync(user)
                .then(() => syncFromFirebase(user))
                .then(() => {
                    setSyncStatus("synced");
                    startRealtimeSync(user);
                    showSyncCheckAnimation();
                })
                .catch(() => {
                    setSyncStatus("error");
                    message.error("데이터 동기화에 실패했습니다");
                });
        } else {
            stopRealtimeSync();
            setSyncStatus("idle");
        }

        return () => {
            stopRealtimeSync();
        };
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

    // 데이터 변경 시 Firebase에 자동 저장
    const records = useWorkStore((state) => state.records);
    const templates = useWorkStore((state) => state.templates);
    const custom_task_options = useWorkStore(
        (state) => state.custom_task_options
    );
    const custom_category_options = useWorkStore(
        (state) => state.custom_category_options
    );
    const hidden_autocomplete_options = useWorkStore(
        (state) => state.hidden_autocomplete_options
    );
    const shortcuts = useShortcutStore((state) => state.shortcuts);

    useEffect(() => {
        if (user && isAuthenticated && sync_status === "synced") {
            // 데이터 변경 시 즉시 저장 후 체크 애니메이션 표시
            syncImmediately(user).then(() => {
                showSyncCheckAnimation();
            });
        }
    }, [
        records,
        templates,
        custom_task_options,
        custom_category_options,
        hidden_autocomplete_options,
        shortcuts,
        user,
        isAuthenticated,
        sync_status,
        showSyncCheckAnimation,
    ]);

    // 수동 동기화
    const handleManualSync = async () => {
        if (!user) return;

        setIsSyncing(true);
        try {
            await syncToFirebase(user);
            message.success("동기화 완료");
        } catch {
            message.error("동기화 실패");
        } finally {
            setIsSyncing(false);
        }
    };

    // 로그인 처리
    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch {
            message.error("로그인에 실패했습니다");
        }
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await logout();
            message.success("로그아웃되었습니다");
        } catch {
            message.error("로그아웃에 실패했습니다");
        }
    };

    const menu_items = [
        {
            key: "/",
            icon: <HomeOutlined />,
            label: "일간 기록",
        },
        {
            key: "/weekly",
            icon: <CalendarOutlined />,
            label: "주간 일정",
        },
    ];

    // 유저 드롭다운 메뉴
    const user_menu_items = [
        {
            key: "sync",
            icon: <SyncOutlined spin={is_syncing} />,
            label: "수동 동기화",
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

    // 데이터 가져오기
    const handleImport = () => {
        if (!isAuthenticated) {
            message.warning("로그인 후 데이터를 가져올 수 있습니다");
            return;
        }
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
                    message.error("유효하지 않은 데이터 형식입니다");
                    return;
                }

                // Store에 직접 데이터 설정
                useWorkStore.setState({
                    records: data.records || [],
                    templates: data.templates || [],
                    custom_task_options: data.custom_task_options || [],
                    custom_category_options: data.custom_category_options || [],
                });

                // Firebase에 동기화 (import 시 강제 저장)
                if (user && isAuthenticated) {
                    try {
                        await syncToFirebase(user, { force: true });
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

        // 같은 파일 다시 선택 가능하도록 초기화
        event.target.value = "";
    };

    return (
        <Layout className="app-layout">
            {/* 헤더 */}
            <Header className="app-header">
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
                    onClick={({ key }) => navigate(key)}
                    style={{
                        flex: 1,
                        marginLeft: 24,
                        background: "transparent",
                        borderBottom: "none",
                    }}
                    theme="dark"
                />
                <Space size="middle">
                    {/* 동기화 상태 표시 */}
                    {isAuthenticated && (
                        <span
                            style={{
                                color: "rgba(255,255,255,0.65)",
                                fontSize: 12,
                            }}
                        >
                            {sync_status === "syncing" && (
                                <>
                                    <SyncOutlined spin /> 동기화 중...
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
                                    <CloudSyncOutlined /> 클라우드 연결됨
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
                                    />{" "}
                                    동기화 오류
                                </>
                            )}
                        </span>
                    )}

                    {/* 설정 버튼 */}
                    <Button
                        type="text"
                        icon={<SettingOutlined />}
                        onClick={() => setIsSettingsOpen(true)}
                        style={{ color: "white", fontSize: 18 }}
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
                                <span style={{ color: "white", fontSize: 13 }}>
                                    {user.displayName || user.email}
                                </span>
                            </Space>
                        </Dropdown>
                    ) : (
                        <Button
                            type="primary"
                            icon={<GoogleOutlined />}
                            onClick={handleLogin}
                            size="small"
                        >
                            로그인
                        </Button>
                    )}
                </Space>
            </Header>

            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/weekly" element={<WeeklySchedule />} />
            </Routes>

            {/* 설정 모달 */}
            <SettingsModal
                open={is_settings_open}
                onClose={() => setIsSettingsOpen(false)}
                onExport={handleExport}
                onImport={handleImport}
                isAuthenticated={isAuthenticated}
            />

            {/* 파일 입력 (Import용) */}
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

function App() {
  return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#1890ff",
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
