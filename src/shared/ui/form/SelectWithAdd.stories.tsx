import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { SelectWithAdd } from "./SelectWithAdd";

const meta = {
    title: "Shared/UI/Form/SelectWithAdd",
    component: SelectWithAdd,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <ConfigProvider locale={koKR}>
                <div style={{ width: 300 }}>
                    <Story />
                </div>
            </ConfigProvider>
        ),
    ],
    args: {
        onAddOption: fn(),
        onHideOption: fn(),
        onChange: fn(),
    },
} satisfies Meta<typeof SelectWithAdd>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
    { value: "개발", label: "개발" },
    { value: "기획", label: "기획" },
    { value: "디자인", label: "디자인" },
    { value: "회의", label: "회의" },
    { value: "기타", label: "기타" },
];

/**
 * 기본 사용 - 모든 기능 활성화
 */
export const Default: Story = {
    args: {
        options: defaultOptions,
        placeholder: "업무 선택",
        addPlaceholder: "새 업무명",
        allowClear: true,
        style: { width: "100%" },
    },
};

/**
 * 새 옵션 추가만 (숨기기 버튼 없음)
 */
export const AddOnly: Story = {
    args: {
        options: defaultOptions,
        placeholder: "카테고리 선택",
        addPlaceholder: "새 카테고리",
        showHideButton: false,
        allowClear: true,
        style: { width: "100%" },
    },
};

/**
 * 숨기기 버튼만 (추가 영역 없음)
 */
export const HideOnly: Story = {
    args: {
        options: defaultOptions,
        placeholder: "옵션 선택",
        showAddArea: false,
        showHideButton: true,
        allowClear: true,
        style: { width: "100%" },
    },
};

/**
 * 일반 Select (추가/숨기기 없음)
 */
export const PlainSelect: Story = {
    args: {
        options: defaultOptions,
        placeholder: "선택하세요",
        showAddArea: false,
        showHideButton: false,
        allowClear: true,
        style: { width: "100%" },
    },
};

/**
 * 긴 옵션 목록
 */
export const ManyOptions: Story = {
    args: {
        options: [
            { value: "option1", label: "첫 번째 옵션" },
            { value: "option2", label: "두 번째 옵션" },
            { value: "option3", label: "세 번째 옵션" },
            { value: "option4", label: "네 번째 옵션" },
            { value: "option5", label: "다섯 번째 옵션" },
            { value: "option6", label: "여섯 번째 옵션" },
            { value: "option7", label: "일곱 번째 옵션" },
            { value: "option8", label: "여덟 번째 옵션" },
        ],
        placeholder: "옵션 선택",
        addPlaceholder: "새 옵션",
        allowClear: true,
        style: { width: "100%" },
    },
};

/**
 * 비활성화 상태
 */
export const Disabled: Story = {
    args: {
        options: defaultOptions,
        placeholder: "비활성화됨",
        disabled: true,
        style: { width: "100%" },
    },
};
