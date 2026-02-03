import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { AutoCompleteWithHide } from "./AutoCompleteWithHide";

const meta = {
    title: "Shared/UI/Form/AutoCompleteWithHide",
    component: AutoCompleteWithHide,
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
        onHideOption: fn(),
        onChange: fn(),
    },
} satisfies Meta<typeof AutoCompleteWithHide>;

export default meta;
type Story = StoryObj<typeof meta>;

const projectOptions = [
    { value: "PRJ001", label: "프로젝트 A" },
    { value: "PRJ002", label: "프로젝트 B" },
    { value: "PRJ003", label: "프로젝트 C" },
    { value: "PRJ004", label: "프로젝트 D" },
];

/**
 * 기본 사용 - 숨기기 버튼 포함
 */
export const Default: Story = {
    args: {
        options: projectOptions,
        placeholder: "프로젝트 코드 입력",
        showHideButton: true,
        style: { width: "100%" },
    },
};

/**
 * 숨기기 버튼 없음
 */
export const WithoutHideButton: Story = {
    args: {
        options: projectOptions,
        placeholder: "프로젝트 코드 입력",
        showHideButton: false,
        style: { width: "100%" },
    },
};

/**
 * 검색어 하이라이트
 */
export const WithSearchHighlight: Story = {
    args: {
        options: projectOptions,
        placeholder: "프로젝트 코드 입력",
        searchValue: "프로젝트",
        showHideButton: true,
        style: { width: "100%" },
    },
};

/**
 * 빈 옵션 목록
 */
export const EmptyOptions: Story = {
    args: {
        options: [],
        placeholder: "옵션 없음",
        showHideButton: true,
        style: { width: "100%" },
    },
};

/**
 * 긴 옵션 목록
 */
export const ManyOptions: Story = {
    args: {
        options: [
            { value: "client1", label: "클라이언트 A 프로젝트" },
            { value: "client2", label: "클라이언트 B 프로젝트" },
            { value: "client3", label: "클라이언트 C 프로젝트" },
            { value: "internal1", label: "내부 개발 프로젝트 1" },
            { value: "internal2", label: "내부 개발 프로젝트 2" },
            { value: "research", label: "R&D 연구 프로젝트" },
        ],
        placeholder: "프로젝트 검색",
        showHideButton: true,
        style: { width: "100%" },
    },
};

/**
 * 비활성화 상태
 */
export const Disabled: Story = {
    args: {
        options: projectOptions,
        placeholder: "비활성화됨",
        disabled: true,
        style: { width: "100%" },
    },
};
