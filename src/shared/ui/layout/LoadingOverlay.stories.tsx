import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ConfigProvider, Button, Space } from "antd";
import koKR from "antd/locale/ko_KR";
import { LoadingOverlay } from "./LoadingOverlay";

const meta = {
    title: "Shared/UI/Layout/LoadingOverlay",
    component: LoadingOverlay,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <ConfigProvider locale={koKR}>
                <div style={{ height: "400px", position: "relative" }}>
                    <Story />
                </div>
            </ConfigProvider>
        ),
    ],
} satisfies Meta<typeof LoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 로딩 오버레이
 */
export const Default: Story = {
    args: {
        loading: true,
        message: "로딩 중...",
    },
};

/**
 * 인터랙티브 데모
 */
export const Interactive: Story = {
    args: {
        loading: false,
    },
    render: function Render() {
        const [loading, setLoading] = useState(false);

        const handleLoad = () => {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
        };

        return (
            <div style={{ padding: 20 }}>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    <Button
                        type="primary"
                        onClick={handleLoad}
                        disabled={loading}
                    >
                        데이터 로드 (2초)
                    </Button>
                    <p>버튼을 클릭하면 로딩 오버레이가 2초간 표시됩니다.</p>
                </Space>
                <LoadingOverlay
                    loading={loading}
                    message="데이터를 불러오는 중..."
                />
            </div>
        );
    },
};

/**
 * 로그인 확인 중
 */
export const AuthLoading: Story = {
    args: {
        loading: true,
        message: "로그인 확인 중...",
    },
};

/**
 * 데이터 로딩
 */
export const DataLoading: Story = {
    args: {
        loading: true,
        message: "데이터를 불러오는 중...",
    },
};

/**
 * 메시지 없음
 */
export const NoMessage: Story = {
    args: {
        loading: true,
        message: "",
    },
};

/**
 * 작은 스피너
 */
export const SmallSpinner: Story = {
    args: {
        loading: true,
        message: "처리 중...",
        spinSize: "small",
    },
};

/**
 * 커스텀 배경색
 */
export const CustomBackground: Story = {
    args: {
        loading: true,
        message: "로딩 중...",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    decorators: [
        (Story) => (
            <ConfigProvider locale={koKR}>
                <div
                    style={{
                        height: "400px",
                        position: "relative",
                        color: "white",
                    }}
                >
                    <Story />
                </div>
            </ConfigProvider>
        ),
    ],
};

/**
 * 상단 오프셋 (헤더 제외)
 */
export const WithTopOffset: Story = {
    args: {
        loading: true,
        message: "컨텐츠 로딩 중...",
        topOffset: 64,
    },
    render: function Render() {
        return (
            <div style={{ height: "400px" }}>
                <div
                    style={{
                        height: 64,
                        backgroundColor: "#1890ff",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 20,
                    }}
                >
                    헤더 영역 (64px)
                </div>
                <div
                    style={{
                        position: "relative",
                        height: "calc(100% - 64px)",
                    }}
                >
                    <LoadingOverlay
                        loading={true}
                        message="컨텐츠 로딩 중..."
                        topOffset={64}
                    />
                </div>
            </div>
        );
    },
};

/**
 * 자동 완료
 */
export const AutoComplete: Story = {
    args: {
        loading: true,
        message: "3초 후 완료됩니다...",
    },
    render: function Render() {
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const timer = setTimeout(() => setLoading(false), 3000);
            return () => clearTimeout(timer);
        }, []);

        return (
            <div style={{ padding: 20, height: "100%" }}>
                {!loading && (
                    <div>
                        <h2>로딩 완료!</h2>
                        <p>3초 후 자동으로 로딩이 완료됩니다.</p>
                    </div>
                )}
                <LoadingOverlay
                    loading={loading}
                    message="3초 후 완료됩니다..."
                />
            </div>
        );
    },
};
