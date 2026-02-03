import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { TimeRangeInput } from "./TimeRangeInput";

const meta = {
    title: "Shared/UI/Form/TimeRangeInput",
    component: TimeRangeInput,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <ConfigProvider locale={koKR}>
                <Story />
            </ConfigProvider>
        ),
    ],
    args: {
        onStartChange: fn(),
        onEndChange: fn(),
    },
} satisfies Meta<typeof TimeRangeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 사용 - 09:00 ~ 18:00
 */
export const Default: Story = {
    args: {
        startTime: "09:00",
        endTime: "18:00",
    },
};

/**
 * 오전 시간대
 */
export const Morning: Story = {
    args: {
        startTime: "09:00",
        endTime: "12:00",
    },
};

/**
 * 오후 시간대
 */
export const Afternoon: Story = {
    args: {
        startTime: "13:00",
        endTime: "18:00",
    },
};

/**
 * 컴팩트 모드 (좁은 간격)
 */
export const Compact: Story = {
    args: {
        startTime: "10:00",
        endTime: "11:00",
        compact: true,
    },
};

/**
 * 커스텀 구분자
 */
export const CustomSeparator: Story = {
    args: {
        startTime: "09:00",
        endTime: "18:00",
        separator: "→",
    },
};

/**
 * 커스텀 placeholder
 */
export const CustomPlaceholder: Story = {
    args: {
        startTime: "",
        endTime: "",
        startPlaceholder: "시작 시간",
        endPlaceholder: "종료 시간",
    },
};

/**
 * 넓은 입력 필드
 */
export const WideInputs: Story = {
    args: {
        startTime: "09:00",
        endTime: "18:00",
        inputWidth: 100,
    },
};

/**
 * 비활성화 상태
 */
export const Disabled: Story = {
    args: {
        startTime: "09:00",
        endTime: "18:00",
        disabled: true,
    },
};
