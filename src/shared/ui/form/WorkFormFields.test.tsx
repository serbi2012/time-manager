/**
 * WorkFormFields 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    WorkFormFields,
    useWorkForm,
    workFormSchema,
    DEFAULT_WORK_FORM_DATA,
    type WorkFormData,
} from "./WorkFormFields";

// ============================================================================
// 스토어 모킹
// ============================================================================

vi.mock("../../store/useWorkStore", () => ({
    useWorkStore: vi.fn((selector) => {
        const mock_state = {
            records: [],
            templates: [],
            custom_task_options: ["개발", "분석", "기획"],
            custom_category_options: ["프로젝트", "유지보수", "회의"],
            hidden_autocomplete_options: {
                project_code: [],
                work_name: [],
                task_name: [],
                deal_name: [],
                task_option: [],
                category_option: [],
            },
            getAutoCompleteOptions: vi.fn(() => []),
            getProjectCodeOptions: vi.fn(() => [
                { value: "A25_01846", label: "A25_01846" },
                { value: "A25_01847", label: "A25_01847" },
            ]),
            hideAutoCompleteOption: vi.fn(),
            unhideAutoCompleteOption: vi.fn(),
            addCustomTaskOption: vi.fn(),
            addCustomCategoryOption: vi.fn(),
            removeCustomTaskOption: vi.fn(),
            removeCustomCategoryOption: vi.fn(),
        };
        return selector(mock_state);
    }),
}));

// ============================================================================
// 테스트용 래퍼 컴포넌트
// ============================================================================

interface TestWrapperProps {
    defaultValues?: Partial<WorkFormData>;
    onSubmit?: (data: WorkFormData) => void;
    layout?: "default" | "compact" | "inline";
    visibleFields?: (keyof WorkFormData)[];
    disabled?: boolean;
}

function TestWrapper({
    defaultValues,
    onSubmit = vi.fn(),
    layout,
    visibleFields,
    disabled,
}: TestWrapperProps) {
    const { control, handleSubmit } = useWorkForm({ defaultValues });

    return (
        <form onSubmit={handleSubmit(onSubmit)} data-testid="test-form">
            <WorkFormFields
                control={control}
                layout={layout}
                visibleFields={visibleFields}
                disabled={disabled}
            />
            <button type="submit" data-testid="submit-button">
                제출
            </button>
        </form>
    );
}

// ============================================================================
// Zod 스키마 테스트
// ============================================================================

describe("workFormSchema", () => {
    it("유효한 데이터를 통과시킨다", () => {
        const valid_data = {
            project_code: "A25_01846",
            work_name: "테스트 작업",
            task_name: "개발",
            deal_name: "상세 작업",
            category_name: "프로젝트",
            note: "메모",
        };

        const result = workFormSchema.safeParse(valid_data);
        expect(result.success).toBe(true);
    });

    it("work_name이 빈 문자열이면 실패한다", () => {
        const invalid_data = {
            project_code: "A25_01846",
            work_name: "",
            task_name: "개발",
            deal_name: "",
            category_name: "",
            note: "",
        };

        const result = workFormSchema.safeParse(invalid_data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("작업명을 입력하세요");
        }
    });

    it("선택 필드는 빈 문자열이어도 통과한다", () => {
        const data = {
            project_code: "",
            work_name: "테스트 작업",
            task_name: "",
            deal_name: "",
            category_name: "",
            note: "",
        };

        const result = workFormSchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it("모든 필드가 필수이며 올바르게 파싱된다", () => {
        const full_data = {
            project_code: "A25_01846",
            work_name: "테스트",
            task_name: "개발",
            deal_name: "상세작업",
            category_name: "프로젝트",
            note: "메모",
        };
        const result = workFormSchema.parse(full_data);

        expect(result).toEqual(full_data);
    });
});

// ============================================================================
// DEFAULT_WORK_FORM_DATA 테스트
// ============================================================================

describe("DEFAULT_WORK_FORM_DATA", () => {
    it("모든 필드가 빈 문자열이다", () => {
        expect(DEFAULT_WORK_FORM_DATA).toEqual({
            project_code: "",
            work_name: "",
            task_name: "",
            deal_name: "",
            category_name: "",
            note: "",
        });
    });
});

// ============================================================================
// WorkFormFields 컴포넌트 테스트
// ============================================================================

describe("WorkFormFields", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("렌더링", () => {
        it("기본 레이아웃에서 모든 필드가 표시된다", () => {
            render(<TestWrapper />);

            expect(screen.getByText("프로젝트 코드")).toBeInTheDocument();
            expect(screen.getByText("작업명")).toBeInTheDocument();
            expect(screen.getByText("거래명 (상세 작업)")).toBeInTheDocument();
            expect(screen.getByText("업무명")).toBeInTheDocument();
            expect(screen.getByText("카테고리")).toBeInTheDocument();
            expect(screen.getByText("비고")).toBeInTheDocument();
        });

        it("visibleFields가 지정되면 해당 필드만 표시된다", () => {
            render(
                <TestWrapper visibleFields={["project_code", "work_name"]} />
            );

            expect(screen.getByText("프로젝트 코드")).toBeInTheDocument();
            expect(screen.getByText("작업명")).toBeInTheDocument();
            expect(
                screen.queryByText("거래명 (상세 작업)")
            ).not.toBeInTheDocument();
            expect(screen.queryByText("업무명")).not.toBeInTheDocument();
            expect(screen.queryByText("카테고리")).not.toBeInTheDocument();
            expect(screen.queryByText("비고")).not.toBeInTheDocument();
        });

        it("disabled가 true이면 모든 필드가 비활성화된다", () => {
            render(<TestWrapper disabled={true} />);

            // AutoComplete/Select는 ant-select-disabled 클래스로 확인
            const selects = document.querySelectorAll(".ant-select-disabled");
            expect(selects.length).toBeGreaterThan(0);

            // TextArea는 disabled 속성으로 확인
            const textarea = screen.getByPlaceholderText("추가 메모");
            expect(textarea).toBeDisabled();
        });

        it("기본값이 폼에 표시된다", () => {
            render(
                <TestWrapper
                    defaultValues={{
                        project_code: "A25_01846",
                        work_name: "테스트 작업",
                    }}
                />
            );

            // Ant Design AutoComplete는 value를 input에 넣음
            const inputs = screen.getAllByRole("combobox");
            // 첫 번째 input이 project_code, 두 번째가 work_name
            expect(inputs[0]).toHaveValue("A25_01846");
            expect(inputs[1]).toHaveValue("테스트 작업");
        });
    });

    describe("유효성 검사", () => {
        it("work_name이 비어있으면 에러 메시지가 표시된다", async () => {
            const on_submit = vi.fn();
            render(<TestWrapper onSubmit={on_submit} />);

            const submit_button = screen.getByTestId("submit-button");
            fireEvent.click(submit_button);

            await waitFor(() => {
                expect(
                    screen.getByText("작업명을 입력하세요")
                ).toBeInTheDocument();
            });

            expect(on_submit).not.toHaveBeenCalled();
        });

        it("work_name이 입력되면 폼 제출이 성공한다", async () => {
            const on_submit = vi.fn();
            const user = userEvent.setup();
            render(<TestWrapper onSubmit={on_submit} />);

            // Ant Design AutoComplete는 combobox role을 사용
            const inputs = screen.getAllByRole("combobox");
            // 두 번째 combobox가 work_name (첫 번째는 project_code)
            const work_name_input = inputs[1];
            await user.type(work_name_input, "테스트 작업");

            const submit_button = screen.getByTestId("submit-button");
            await user.click(submit_button);

            await waitFor(() => {
                expect(on_submit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        work_name: "테스트 작업",
                    }),
                    expect.anything()
                );
            });
        });
    });

    describe("레이아웃", () => {
        it("compact 레이아웃이 적용된다", () => {
            const { container } = render(<TestWrapper layout="compact" />);

            // compact 레이아웃에서는 Col span이 12인 요소가 있어야 함
            const cols = container.querySelectorAll(".ant-col-12");
            expect(cols.length).toBeGreaterThan(0);
        });

        it("default 레이아웃이 적용된다", () => {
            const { container } = render(<TestWrapper layout="default" />);

            // default 레이아웃에서는 Col span이 24인 요소가 있어야 함
            const cols = container.querySelectorAll(".ant-col-24");
            expect(cols.length).toBeGreaterThan(0);
        });
    });
});

// ============================================================================
// useWorkForm 훅 테스트
// ============================================================================

describe("useWorkForm", () => {
    it("기본값이 올바르게 설정된다", () => {
        let form_values: WorkFormData | undefined;

        function TestComponent() {
            const { getValues } = useWorkForm();
            form_values = getValues();
            return null;
        }

        render(<TestComponent />);

        expect(form_values).toEqual(DEFAULT_WORK_FORM_DATA);
    });

    it("커스텀 기본값이 적용된다", () => {
        let form_values: WorkFormData | undefined;

        function TestComponent() {
            const { getValues } = useWorkForm({
                defaultValues: {
                    project_code: "CUSTOM",
                    work_name: "커스텀 작업",
                },
            });
            form_values = getValues();
            return null;
        }

        render(<TestComponent />);

        expect(form_values).toEqual({
            ...DEFAULT_WORK_FORM_DATA,
            project_code: "CUSTOM",
            work_name: "커스텀 작업",
        });
    });

    it("reset이 올바르게 동작한다", async () => {
        let form: ReturnType<typeof useWorkForm> | undefined;

        function TestComponent() {
            form = useWorkForm({
                defaultValues: { work_name: "초기값" },
            });
            return null;
        }

        render(<TestComponent />);

        // 값 변경
        form?.setValue("work_name", "변경된 값");
        expect(form?.getValues("work_name")).toBe("변경된 값");

        // 리셋
        form?.reset();
        expect(form?.getValues("work_name")).toBe("초기값");
    });
});
