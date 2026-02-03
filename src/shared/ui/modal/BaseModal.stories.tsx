import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ConfigProvider, Button, Typography } from "antd";
import koKR from "antd/locale/ko_KR";
import { BaseModal } from "./BaseModal";

const { Paragraph } = Typography;

const meta = {
    title: "Shared/UI/Modal/BaseModal",
    component: BaseModal,
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
        onOk: fn(),
        onCancel: fn(),
    },
} satisfies Meta<typeof BaseModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 모달
 */
export const Default: Story = {
    args: {
        title: "기본 모달",
        open: true,
        children: (
            <Paragraph>
                이것은 기본 모달입니다. 애니메이션이 적용되어 부드럽게
                나타납니다.
            </Paragraph>
        ),
    },
};

/**
 * 인터랙티브 데모
 */
export const Interactive: Story = {
    args: {
        title: "인터랙티브 모달",
        open: false,
        children: null,
    },
    render: function Render() {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button type="primary" onClick={() => setOpen(true)}>
                    모달 열기
                </Button>
                <BaseModal
                    title="인터랙티브 모달"
                    open={open}
                    onOk={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                >
                    <Paragraph>
                        버튼을 클릭하여 모달을 열고 닫을 수 있습니다.
                    </Paragraph>
                </BaseModal>
            </>
        );
    },
};

/**
 * 커스텀 버튼 텍스트
 */
export const CustomButtons: Story = {
    args: {
        title: "저장 확인",
        open: true,
        okText: "저장",
        cancelText: "취소",
        children: <Paragraph>변경사항을 저장하시겠습니까?</Paragraph>,
    },
};

/**
 * 푸터 없음
 */
export const NoFooter: Story = {
    args: {
        title: "알림",
        open: true,
        footer: null,
        children: (
            <Paragraph>
                푸터가 없는 모달입니다. 닫기 버튼(X)으로만 닫을 수 있습니다.
            </Paragraph>
        ),
    },
};

/**
 * 넓은 모달
 */
export const WideModal: Story = {
    args: {
        title: "넓은 모달",
        open: true,
        width: 800,
        children: (
            <Paragraph>
                width 속성을 사용하여 모달의 너비를 조정할 수 있습니다. 이
                모달은 800px 너비입니다.
            </Paragraph>
        ),
    },
};

/**
 * 로딩 상태
 */
export const Loading: Story = {
    args: {
        title: "로딩 중",
        open: true,
        confirmLoading: true,
        children: (
            <Paragraph>
                확인 버튼이 로딩 상태입니다. 작업 처리 중일 때 사용합니다.
            </Paragraph>
        ),
    },
};
