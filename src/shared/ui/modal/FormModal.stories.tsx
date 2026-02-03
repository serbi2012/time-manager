import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ConfigProvider, Form, Input, Button, message } from "antd";
import koKR from "antd/locale/ko_KR";
import { FormModal } from "./FormModal";
import { SelectWithAdd } from "../form/SelectWithAdd";

const meta = {
    title: "Shared/UI/Modal/FormModal",
    component: FormModal,
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
        onSubmit: fn(),
        onCancel: fn(),
    },
} satisfies Meta<typeof FormModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// 폼 래퍼 컴포넌트
function FormModalDemo({
    title = "새 작업",
    submitText = "등록",
    submitShortcut,
    loading = false,
}: {
    title?: string;
    submitText?: string;
    submitShortcut?: string;
    loading?: boolean;
}) {
    const [form] = Form.useForm();
    const [open, setOpen] = useState(true);

    const handleSubmit = () => {
        message.success("제출됨!");
        setOpen(false);
    };

    return (
        <>
            <Button type="primary" onClick={() => setOpen(true)}>
                폼 모달 열기
            </Button>
            <FormModal
                title={title}
                open={open}
                form={form}
                onSubmit={handleSubmit}
                onCancel={() => setOpen(false)}
                submitText={submitText}
                submitShortcut={submitShortcut}
                loading={loading}
            >
                <Form.Item
                    name="work_name"
                    label="작업명"
                    rules={[{ required: true, message: "작업명을 입력하세요" }]}
                >
                    <Input placeholder="작업명 입력" />
                </Form.Item>
                <Form.Item name="note" label="비고">
                    <Input.TextArea placeholder="메모" rows={3} />
                </Form.Item>
            </FormModal>
        </>
    );
}

// 스토리에 필요한 기본 args (form은 render 내부에서 생성)
const defaultStoryArgs = {
    children: null as unknown as React.ReactNode,
    form: {} as ReturnType<typeof Form.useForm>[0],
};

/**
 * 기본 폼 모달
 */
export const Default: Story = {
    args: defaultStoryArgs,
    render: () => <FormModalDemo />,
};

/**
 * 단축키 표시
 */
export const WithShortcut: Story = {
    args: defaultStoryArgs,
    render: () => (
        <FormModalDemo
            title="새 작업 등록"
            submitText="등록"
            submitShortcut="F8"
        />
    ),
};

/**
 * 로딩 상태
 */
export const Loading: Story = {
    args: defaultStoryArgs,
    render: () => (
        <FormModalDemo title="저장 중" submitText="저장" loading={true} />
    ),
};

/**
 * 복잡한 폼
 */
export const ComplexForm: Story = {
    args: defaultStoryArgs,
    render: function Render() {
        const [form] = Form.useForm();
        const [open, setOpen] = useState(true);

        const taskOptions = [
            { value: "개발", label: "개발" },
            { value: "기획", label: "기획" },
            { value: "디자인", label: "디자인" },
        ];

        return (
            <>
                <Button type="primary" onClick={() => setOpen(true)}>
                    복잡한 폼 열기
                </Button>
                <FormModal
                    title="작업 등록"
                    open={open}
                    form={form}
                    onSubmit={() => {
                        message.success("등록됨!");
                        setOpen(false);
                    }}
                    onCancel={() => setOpen(false)}
                    submitText="등록"
                    submitShortcut="F8"
                    width={600}
                >
                    <Form.Item name="project_code" label="프로젝트 코드">
                        <Input placeholder="PRJ001" />
                    </Form.Item>
                    <Form.Item
                        name="work_name"
                        label="작업명"
                        rules={[{ required: true, message: "필수 입력" }]}
                    >
                        <Input placeholder="작업명" />
                    </Form.Item>
                    <Form.Item name="task_name" label="업무명">
                        <SelectWithAdd
                            options={taskOptions}
                            placeholder="업무 선택"
                            onAddOption={(v) => message.info(`추가: ${v}`)}
                            addPlaceholder="새 업무"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item name="note" label="비고">
                        <Input.TextArea placeholder="메모" rows={2} />
                    </Form.Item>
                </FormModal>
            </>
        );
    },
};
