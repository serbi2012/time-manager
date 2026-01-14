import { ConfigProvider, Layout, Typography, theme, message } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import WorkRecordTable from "./components/WorkRecordTable";
import WorkTemplateList from "./components/WorkTemplateList";
import DailyGanttChart from "./components/DailyGanttChart";
import { useWorkStore } from "./store/useWorkStore";
import "./App.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
    const { templates, timer, applyTemplate, startTimer, stopTimer } =
        useWorkStore();

    // 프리셋에서 작업 기록에 추가 (타이머 시작)
    const handleAddToRecord = (template_id: string) => {
        const template = templates.find((t) => t.id === template_id);
        if (!template) return;

        // 기존 타이머가 있으면 중지
        if (timer.is_running) {
            stopTimer();
        }

        // 템플릿 적용 후 타이머 시작
        applyTemplate(template_id);
        startTimer(template_id);
        message.success(`"${template.work_name}" 작업이 시작되었습니다`);
    };

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
            <Layout className="app-layout">
                {/* 헤더 */}
                <Header className="app-header">
                    <div className="header-content">
                        <ClockCircleOutlined className="header-icon" />
                        <Title level={4} className="header-title">
                            업무 시간 관리
                        </Title>
                    </div>
                </Header>

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
            </Layout>
        </ConfigProvider>
    );
}

export default App;
