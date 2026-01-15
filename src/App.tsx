import { ConfigProvider, Layout, Typography, theme, message, Menu } from "antd";
import {
    ClockCircleOutlined,
    CalendarOutlined,
    HomeOutlined,
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
        const store = useWorkStore.getState();
        const template = store.templates.find((t) => t.id === template_id);
        if (!template) return;

        // 기존 타이머가 있으면 중지 (최신 상태 확인)
        if (store.timer.is_running) {
            store.stopTimer();
        }

        // 템플릿 적용 후 거래명에 유니크 ID 추가
        store.applyTemplate(template_id);
        
        // 유니크 ID 생성 (MMdd_HHmm 형식)
        const now = new Date();
        const unique_id = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const unique_deal_name = template.deal_name 
            ? `${template.deal_name}_${unique_id}`
            : `작업_${unique_id}`;
        
        // 거래명 업데이트
        store.setFormData({ deal_name: unique_deal_name });
        
        // 최신 상태로 타이머 시작
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
            </Header>

            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/weekly" element={<WeeklySchedule />} />
            </Routes>
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
