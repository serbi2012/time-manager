/**
 * WorkFormFields Storybook 스토리
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Button, Space, message } from "antd";
import {
    WorkFormFields,
    useWorkForm,
    type WorkFormData,
} from "./WorkFormFields";

const meta: Meta<typeof WorkFormFields> = {
    title: "Shared/Form/WorkFormFields",
    component: WorkFormFields,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "작업 폼 필드 공통 컴포넌트입니다. DailyGanttChart, WorkRecordTable, WorkTemplateList에서 중복되던 폼 필드 패턴을 통합했습니다.",
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// 스토리용 래퍼 컴포넌트
// ============================================================================

interface StoryWrapperProps {
    layout?: "default" | "compact" | "inline";
    visibleFields?: (keyof WorkFormData)[];
    disabled?: boolean;
    defaultValues?: Partial<WorkFormData>;
}

function StoryWrapper({
    layout = "default",
    visibleFields,
    disabled,
    defaultValues,
}: StoryWrapperProps) {
    const form = useWorkForm({ defaultValues });
    const { control, handleSubmit, reset } = form;

    const onSubmit = handleSubmit((data) => {
        message.success(`폼 제출됨: ${JSON.stringify(data, null, 2)}`);
        console.log("Form submitted:", data);
    });

    return (
        <form onSubmit={onSubmit}>
            <WorkFormFields
                control={control}
                layout={layout}
                visibleFields={visibleFields}
                disabled={disabled}
            />
            <Space style={{ marginTop: 16 }}>
                <Button type="primary" htmlType="submit">
                    제출
                </Button>
                <Button onClick={() => reset()}>리셋</Button>
            </Space>
        </form>
    );
}

// ============================================================================
// 스토리
// ============================================================================

/**
 * 기본 레이아웃
 */
export const Default: Story = {
    render: () => <StoryWrapper />,
};

/**
 * 컴팩트 레이아웃 (2열)
 */
export const CompactLayout: Story = {
    render: () => <StoryWrapper layout="compact" />,
    parameters: {
        docs: {
            description: {
                story: "2열 레이아웃입니다. 화면 공간을 효율적으로 사용합니다.",
            },
        },
    },
};

/**
 * 인라인 레이아웃
 */
export const InlineLayout: Story = {
    render: () => <StoryWrapper layout="inline" />,
    parameters: {
        docs: {
            description: {
                story: "인라인 레이아웃입니다. 빠른 입력이 필요한 경우에 사용합니다.",
            },
        },
    },
};

/**
 * 일부 필드만 표시
 */
export const PartialFields: Story = {
    render: () => (
        <StoryWrapper
            visibleFields={["project_code", "work_name", "task_name"]}
        />
    ),
    parameters: {
        docs: {
            description: {
                story: "visibleFields를 사용하여 특정 필드만 표시합니다. 간단한 입력 폼에 유용합니다.",
            },
        },
    },
};

/**
 * 비활성화 상태
 */
export const Disabled: Story = {
    render: () => (
        <StoryWrapper
            disabled={true}
            defaultValues={{
                project_code: "A25_01846",
                work_name: "5.6 프레임워크 FE",
                task_name: "개발",
                deal_name: "테스트 케이스 확인",
                category_name: "프로젝트",
                note: "읽기 전용 폼입니다",
            }}
        />
    ),
    parameters: {
        docs: {
            description: {
                story: "모든 필드가 비활성화된 상태입니다. 읽기 전용으로 표시할 때 사용합니다.",
            },
        },
    },
};

/**
 * 기본값이 있는 폼
 */
export const WithDefaultValues: Story = {
    render: () => (
        <StoryWrapper
            defaultValues={{
                project_code: "A25_01846",
                work_name: "5.6 프레임워크 FE",
                task_name: "개발",
                category_name: "프로젝트",
            }}
        />
    ),
    parameters: {
        docs: {
            description: {
                story: "기본값이 설정된 폼입니다. 수정 모드에서 사용합니다.",
            },
        },
    },
};

/**
 * 필수 필드만
 */
export const RequiredFieldsOnly: Story = {
    render: () => <StoryWrapper visibleFields={["work_name"]} />,
    parameters: {
        docs: {
            description: {
                story: "필수 필드인 작업명만 표시합니다.",
            },
        },
    },
};

/**
 * 프로젝트 코드 + 작업명
 */
export const ProjectAndWork: Story = {
    render: () => (
        <StoryWrapper visibleFields={["project_code", "work_name"]} />
    ),
    parameters: {
        docs: {
            description: {
                story: "프로젝트 코드와 작업명만 표시합니다. 템플릿 추가 시 유용합니다.",
            },
        },
    },
};
