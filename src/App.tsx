import { useState, useRef } from "react";
import { ConfigProvider, Layout, Typography, theme, message, Menu, Button, Modal, Space, Divider } from "antd";
import {
    ClockCircleOutlined,
    CalendarOutlined,
    HomeOutlined,
    SettingOutlined,
    DownloadOutlined,
    UploadOutlined,
    InfoCircleOutlined,
    DatabaseOutlined,
} from "@ant-design/icons";
import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate,
    useLocation,
} from "react-router-dom";
import WorkRecordTable from "./components/WorkRecordTable";
import WorkTemplateList from "./components/WorkTemplateList";
import DailyGanttChart from "./components/DailyGanttChart";
import WeeklySchedule from "./components/WeeklySchedule";
import { useWorkStore } from "./store/useWorkStore";
import "./App.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function MainPage() {
    // 프리셋에서 작업 기록에 추가 (타이머 시작)
    const handleAddToRecord = (template_id: string) => {
        // 템플릿 찾기
        const template = useWorkStore.getState().templates.find((t) => t.id === template_id);
        if (!template) return;

        // 기존 타이머가 있으면 중지 (매번 최신 상태 확인)
        if (useWorkStore.getState().timer.is_running) {
            useWorkStore.getState().stopTimer();
        }

        // 템플릿 적용 (최신 상태에서)
        useWorkStore.getState().applyTemplate(template_id);
        
        // 유니크 ID 생성 (MMdd_HHmmss_xxx 형식 - 초 + 랜덤 3자리)
        const now = new Date();
        const random_suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const unique_id = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}_${random_suffix}`;
        const unique_deal_name = template.deal_name 
            ? `${template.deal_name}_${unique_id}`
            : `작업_${unique_id}`;
        
        // 거래명 업데이트 (최신 상태에서)
        useWorkStore.getState().setFormData({ deal_name: unique_deal_name });
        
        // 타이머 시작 (최신 상태에서)
        useWorkStore.getState().startTimer(template_id);
        message.success(`"${template.work_name}" 작업이 시작되었습니다`);
    };

    return (
        <Layout className="app-body">
            {/* 좌측 사이드바: 작업 프리셋 */}
            <Sider width={300} className="app-sider" theme="light">
                <WorkTemplateList onAddToRecord={handleAddToRecord} />
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
    const file_input_ref = useRef<HTMLInputElement>(null);

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

    // 데이터 내보내기
    const handleExport = () => {
        const storage_data = localStorage.getItem("work-time-storage");
        if (!storage_data) {
            message.warning("내보낼 데이터가 없습니다");
            return;
        }

        const blob = new Blob([storage_data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `time-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success("데이터가 내보내졌습니다");
    };

    // 데이터 가져오기
    const handleImport = () => {
        file_input_ref.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                
                // 데이터 유효성 검사
                if (!parsed.state || !parsed.state.records) {
                    message.error("유효하지 않은 데이터 형식입니다");
                    return;
                }

                // LocalStorage에 저장
                localStorage.setItem("work-time-storage", content);
                
                // 스토어 동기화
                useWorkStore.getState().syncFromStorage();
                
                message.success("데이터를 성공적으로 가져왔습니다. 페이지를 새로고침합니다.");
                
                // 페이지 새로고침으로 완전히 동기화
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
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
                <Button
                    type="text"
                    icon={<SettingOutlined />}
                    onClick={() => setIsSettingsOpen(true)}
                    className="settings-button"
                />
            </Header>

            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/weekly" element={<WeeklySchedule />} />
            </Routes>

            {/* 설정 모달 */}
            <Modal
                title={
                    <Space>
                        <SettingOutlined />
                        <span>설정</span>
                    </Space>
                }
                open={is_settings_open}
                onCancel={() => setIsSettingsOpen(false)}
                footer={null}
                width={420}
                className="settings-modal"
                centered
            >
                <div className="settings-section-title">
                    <DatabaseOutlined /> 데이터 관리
                </div>
                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                        block
                        className="settings-action-button export-button"
                    >
                        데이터 내보내기 (Export)
                    </Button>
                    <Button
                        icon={<UploadOutlined />}
                        onClick={handleImport}
                        block
                        className="settings-action-button import-button"
                    >
                        데이터 가져오기 (Import)
                    </Button>
                    <input
                        ref={file_input_ref}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </Space>
                <div className="settings-hint">
                    <InfoCircleOutlined />
                    <Typography.Text style={{ fontSize: 13, color: "#8c6d1f" }}>
                        가져오기 시 기존 데이터가 새 데이터로 대체됩니다. 중요한 데이터는 먼저 내보내기를 권장합니다.
                    </Typography.Text>
                </div>
            </Modal>
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
