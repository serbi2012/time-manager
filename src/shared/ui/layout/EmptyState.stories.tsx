import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ConfigProvider, Button, Space } from "antd";
import {
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import koKR from "antd/locale/ko_KR";
import { EmptyState } from "./EmptyState";

const meta = {
    title: "Shared/UI/Layout/EmptyState",
    component: EmptyState,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <ConfigProvider locale={koKR}>
                <div style={{ width: 400, padding: 20 }}>
                    <Story />
                </div>
            </ConfigProvider>
        ),
    ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 빈 상태
 */
export const Default: Story = {
    args: {
        description: "데이터가 없습니다",
    },
};

/**
 * 부가 설명 포함
 */
export const WithSubDescription: Story = {
    args: {
        description: "작업 기록이 없습니다",
        subDescription: "드래그하여 작업을 추가하세요",
    },
};

/**
 * 프리셋 없음
 */
export const NoPresets: Story = {
    args: {
        description: "프리셋이 없습니다",
        subDescription: '"추가" 버튼으로 추가하세요',
        imageType: "simple",
    },
};

/**
 * 검색 결과 없음
 */
export const NoSearchResults: Story = {
    args: {
        description: "검색 결과가 없습니다",
        subDescription: "다른 검색어를 시도해보세요",
        imageType: "simple",
    },
};

/**
 * 완료된 작업 없음
 */
export const NoCompletedTasks: Story = {
    args: {
        description: "완료된 작업이 없습니다",
        imageType: "simple",
    },
};

/**
 * 휴지통 비어있음
 */
export const EmptyTrash: Story = {
    args: {
        description: "휴지통이 비어있습니다",
        imageType: "simple",
    },
};

/**
 * 기본 이미지 타입
 */
export const DefaultImage: Story = {
    args: {
        description: "데이터가 없습니다",
        imageType: "default",
    },
};

/**
 * 심플 이미지 타입
 */
export const SimpleImage: Story = {
    args: {
        description: "데이터가 없습니다",
        imageType: "simple",
    },
};

/**
 * 추가 버튼 포함
 */
export const WithAddButton: Story = {
    args: {
        description: "항목이 없습니다",
        subDescription: "새 항목을 추가하세요",
        action: (
            <Button type="primary" icon={<PlusOutlined />} onClick={fn()}>
                추가하기
            </Button>
        ),
    },
};

/**
 * 여러 액션 버튼
 */
export const WithMultipleActions: Story = {
    args: {
        description: "데이터를 불러올 수 없습니다",
        subDescription: "네트워크 연결을 확인해주세요",
        action: (
            <Space>
                <Button type="primary" icon={<ReloadOutlined />} onClick={fn()}>
                    다시 시도
                </Button>
                <Button onClick={fn()}>설정</Button>
            </Space>
        ),
    },
};

/**
 * 검색 시작
 */
export const StartSearch: Story = {
    args: {
        description: "검색어를 입력하세요",
        imageType: "simple",
        action: (
            <Button icon={<SearchOutlined />} onClick={fn()}>
                검색 시작
            </Button>
        ),
    },
};

/**
 * 커스텀 스타일
 */
export const CustomStyle: Story = {
    args: {
        description: "결과 없음",
        style: {
            padding: 40,
            backgroundColor: "#fafafa",
            borderRadius: 8,
        },
    },
};

/**
 * 커스텀 이미지
 */
export const CustomImage: Story = {
    args: {
        description: "파일이 없습니다",
        image: (
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "#e6f7ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                }}
            >
                📁
            </div>
        ),
    },
};
