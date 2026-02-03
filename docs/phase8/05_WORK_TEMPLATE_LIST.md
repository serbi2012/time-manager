# WorkTemplateList 분리 계획

> **현재**: 980줄 (src/components/WorkTemplateList.tsx)
> **목표**: 메인 컴포넌트 ~200줄 + 하위 모듈들

---

## 1. 현재 구조 분석

### 1.1 파일 위치

-   메인: `src/components/WorkTemplateList.tsx` (980줄)
-   기존 분리: `src/features/work-template/`

### 1.2 기존 features/work-template 구조

```
features/work-template/
├── index.ts
├── model/
│   └── types.ts
└── ui/
    ├── index.ts
    ├── ColorPicker.tsx       # ✅ 색상 선택기
    └── TemplateCard.tsx      # ✅ 템플릿 카드
```

### 1.3 메인 컴포넌트 내부 구조

```typescript
// WorkTemplateList.tsx 주요 섹션

// 1. 임포트 (1-57줄) - ~57줄
// 2. SortableTemplateCard 컴포넌트 (61-180줄) - ~120줄
//    - DnD 로직 포함

// 3. 메인 컴포넌트 시작 (182줄~)

// 상태 (state)
- 검색 상태 (195-200줄)
- 모달 상태 (200-210줄)
- 편집 상태 (210-220줄)

// 파생 데이터 (useMemo)
- filtered_templates (225-260줄)
- 옵션 목록들 (260-350줄)

// 핸들러 함수들 (~250줄)
- handleAdd/Edit/Delete (350-500줄)
- handleDragEnd (500-550줄)
- handleFormSubmit (550-600줄)

// 렌더링 (~350줄)
- 검색/필터 영역 (620-700줄)
- 템플릿 리스트 (700-850줄)
- 추가/편집 모달 (850-980줄)
```

---

## 2. 분리 계획

### 2.1 목표 구조

```
features/work-template/
├── index.ts                       # Public API
├── model/
│   ├── index.ts
│   └── types.ts                   # ✅ 기존
├── lib/
│   ├── index.ts                   # NEW
│   └── template_filters.ts        # NEW: 필터링 함수
├── hooks/
│   ├── index.ts                   # NEW
│   ├── useTemplateList.ts         # NEW: 목록 관리
│   └── useTemplateForm.ts         # NEW: 폼 상태 관리
└── ui/
    ├── index.ts
    ├── WorkTemplateList/          # NEW: 메인 컴포넌트
    │   ├── index.ts
    │   └── WorkTemplateList.tsx   # ~200줄
    ├── TemplateCard.tsx           # ✅ 기존
    ├── ColorPicker.tsx            # ✅ 기존
    ├── TemplateSearch/            # NEW
    │   ├── index.ts
    │   └── TemplateSearch.tsx     # 검색 UI
    ├── SortableTemplateList/      # NEW
    │   ├── index.ts
    │   └── SortableTemplateList.tsx # DnD 리스트
    └── TemplateFormModal/         # NEW
        ├── index.ts
        └── TemplateFormModal.tsx  # 추가/편집 모달
```

### 2.2 분리 단계

#### Step 1: 순수 함수 추출 (lib/)

| 함수명             | 현재 위치             | 이동 위치               |
| ------------------ | --------------------- | ----------------------- |
| 템플릿 필터링 로직 | WorkTemplateList 내부 | lib/template_filters.ts |

#### Step 2: 훅 추출 (hooks/)

| 훅명            | 책임                  | 예상 줄 수 |
| --------------- | --------------------- | ---------- |
| useTemplateList | 목록 필터링, DnD 처리 | ~100       |
| useTemplateForm | 폼 상태, 유효성 검사  | ~80        |

#### Step 3: UI 컴포넌트 분리

| 컴포넌트명           | 책임                | 예상 줄 수 |
| -------------------- | ------------------- | ---------- |
| WorkTemplateList     | 메인 오케스트레이션 | ~200       |
| TemplateSearch       | 검색 UI             | ~60        |
| SortableTemplateList | DnD 리스트          | ~120       |
| TemplateFormModal    | 추가/편집 모달      | ~150       |

---

## 3. 상세 분리 계획

### 3.1 lib/template_filters.ts

```typescript
// 템플릿 필터링 순수 함수

export interface TemplateFilterOptions {
    search_text?: string;
    category?: string;
}

export function filterTemplates(
    templates: WorkTemplate[],
    options: TemplateFilterOptions
): WorkTemplate[] {
    let result = templates;

    if (options.search_text) {
        const search = options.search_text.toLowerCase();
        result = result.filter(
            (t) =>
                t.work_name.toLowerCase().includes(search) ||
                t.project_code?.toLowerCase().includes(search) ||
                t.task_name?.toLowerCase().includes(search)
        );
    }

    if (options.category) {
        result = result.filter((t) => t.category_name === options.category);
    }

    return result;
}
```

### 3.2 hooks/useTemplateList.ts

```typescript
// 템플릿 목록 관리 훅

export interface UseTemplateListReturn {
    // 데이터
    templates: WorkTemplate[];
    filtered_templates: WorkTemplate[];

    // 필터
    search_text: string;
    setSearchText: (text: string) => void;

    // DnD
    handleDragEnd: (event: DragEndEvent) => void;

    // 액션
    deleteTemplate: (id: string) => void;
}

export function useTemplateList(): UseTemplateListReturn {
    const { templates, reorderTemplates, deleteTemplate } = useWorkStore();
    const [search_text, setSearchText] = useState("");
    const debounced_search = useDebouncedValue(search_text, 300);

    const filtered_templates = useMemo(
        () => filterTemplates(templates, { search_text: debounced_search }),
        [templates, debounced_search]
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (over && active.id !== over.id) {
                const old_index = templates.findIndex(
                    (t) => t.id === active.id
                );
                const new_index = templates.findIndex((t) => t.id === over.id);
                reorderTemplates(old_index, new_index);
            }
        },
        [templates, reorderTemplates]
    );

    return {
        templates,
        filtered_templates,
        search_text,
        setSearchText,
        handleDragEnd,
        deleteTemplate,
    };
}
```

### 3.3 hooks/useTemplateForm.ts

```typescript
// 템플릿 폼 관리 훅

export interface UseTemplateFormOptions {
    template?: WorkTemplate; // 편집 시
    onSuccess: () => void;
}

export interface UseTemplateFormReturn {
    form: FormInstance;
    is_loading: boolean;
    handleSubmit: () => void;
    handleCancel: () => void;
}

export function useTemplateForm(
    options: UseTemplateFormOptions
): UseTemplateFormReturn {
    const [form] = Form.useForm();
    const [is_loading, setIsLoading] = useState(false);
    const { addTemplate, updateTemplate } = useWorkStore();

    useEffect(() => {
        if (options.template) {
            form.setFieldsValue(options.template);
        } else {
            form.resetFields();
        }
    }, [options.template, form]);

    const handleSubmit = useCallback(async () => {
        try {
            setIsLoading(true);
            const values = await form.validateFields();

            if (options.template) {
                updateTemplate(options.template.id, values);
                message.success("템플릿이 수정되었습니다");
            } else {
                addTemplate(values);
                message.success("템플릿이 추가되었습니다");
            }

            options.onSuccess();
        } catch (error) {
            // validation error
        } finally {
            setIsLoading(false);
        }
    }, [form, options, addTemplate, updateTemplate]);

    return { form, is_loading, handleSubmit, handleCancel: options.onSuccess };
}
```

### 3.4 ui/WorkTemplateList/WorkTemplateList.tsx (메인)

```typescript
// 메인 컴포넌트 (~200줄)

interface WorkTemplateListProps {
    onAddRecordOnly?: (template_id: string) => void;
}

export default function WorkTemplateList({
    onAddRecordOnly,
}: WorkTemplateListProps) {
    const {
        filtered_templates,
        search_text,
        setSearchText,
        handleDragEnd,
        deleteTemplate,
    } = useTemplateList();

    const [modal_state, setModalState] = useState<{
        visible: boolean;
        editing?: WorkTemplate;
    }>({ visible: false });

    const handleEdit = (template: WorkTemplate) => {
        setModalState({ visible: true, editing: template });
    };

    const handleCloseModal = () => {
        setModalState({ visible: false });
    };

    return (
        <Card
            title="작업 템플릿"
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalState({ visible: true })}
                >
                    추가
                </Button>
            }
        >
            <TemplateSearch value={search_text} onChange={setSearchText} />

            {filtered_templates.length === 0 ? (
                <Empty description="템플릿이 없습니다" />
            ) : (
                <SortableTemplateList
                    templates={filtered_templates}
                    onDragEnd={handleDragEnd}
                    onEdit={handleEdit}
                    onDelete={deleteTemplate}
                    onAddRecordOnly={onAddRecordOnly}
                />
            )}

            <TemplateFormModal
                open={modal_state.visible}
                template={modal_state.editing}
                onClose={handleCloseModal}
            />
        </Card>
    );
}
```

### 3.5 ui/SortableTemplateList/SortableTemplateList.tsx

```typescript
// DnD 리스트 (~120줄)

interface SortableTemplateListProps {
    templates: WorkTemplate[];
    onDragEnd: (event: DragEndEvent) => void;
    onEdit: (template: WorkTemplate) => void;
    onDelete: (id: string) => void;
    onAddRecordOnly?: (id: string) => void;
}

export function SortableTemplateList({
    templates,
    onDragEnd,
    onEdit,
    onDelete,
    onAddRecordOnly,
}: SortableTemplateListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
        >
            <SortableContext
                items={templates.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                {templates.map((template) => (
                    <SortableTemplateCard
                        key={template.id}
                        template={template}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddRecordOnly={onAddRecordOnly}
                    />
                ))}
            </SortableContext>
        </DndContext>
    );
}
```

### 3.6 ui/TemplateFormModal/TemplateFormModal.tsx

```typescript
// 템플릿 폼 모달 (~150줄)

interface TemplateFormModalProps {
    open: boolean;
    template?: WorkTemplate;
    onClose: () => void;
}

export function TemplateFormModal({
    open,
    template,
    onClose,
}: TemplateFormModalProps) {
    const { form, is_loading, handleSubmit, handleCancel } = useTemplateForm({
        template,
        onSuccess: onClose,
    });

    const {
        projectOptions,
        taskSelectOptions,
        categoryOptions,
        addTaskOption,
    } = useAutoCompleteOptions();

    return (
        <FormModal
            title={template ? "템플릿 수정" : "새 템플릿"}
            open={open}
            form={form}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            confirmLoading={is_loading}
        >
            <Form.Item name="project_code" label="프로젝트 코드">
                <AutoCompleteWithHide options={projectOptions} />
            </Form.Item>

            <Form.Item
                name="work_name"
                label="작업명"
                rules={[{ required: true }]}
            >
                <Input />
            </Form.Item>

            <Form.Item name="task_name" label="업무명">
                <SelectWithAdd
                    options={taskSelectOptions}
                    onAddOption={addTaskOption}
                />
            </Form.Item>

            <Form.Item name="category_name" label="카테고리">
                <Select options={categoryOptions} />
            </Form.Item>

            <Form.Item name="color" label="색상">
                <ColorPicker />
            </Form.Item>

            <Form.Item name="note" label="비고">
                <Input.TextArea />
            </Form.Item>
        </FormModal>
    );
}
```

---

## 4. 공통 컴포넌트 활용

### 4.1 이미 사용 가능한 공통 자원

| 공통 자원              | 사용 위치                      |
| ---------------------- | ------------------------------ |
| SelectWithAdd          | TemplateFormModal              |
| AutoCompleteWithHide   | TemplateFormModal              |
| FormModal              | TemplateFormModal              |
| useAutoCompleteOptions | TemplateFormModal              |
| HighlightText          | TemplateCard (검색 하이라이트) |
| useDebouncedValue      | useTemplateList                |

---

## 5. 마이그레이션 체크리스트

### 5.1 순수 함수 추출

-   [ ] `lib/template_filters.ts` 생성
    -   [ ] filterTemplates 함수
    -   [ ] 테스트 작성

### 5.2 훅 추출

-   [ ] `hooks/useTemplateList.ts` 생성
    -   [ ] 목록 관리 로직
    -   [ ] 테스트 작성
-   [ ] `hooks/useTemplateForm.ts` 생성
    -   [ ] 폼 상태 관리
    -   [ ] 테스트 작성

### 5.3 UI 컴포넌트 분리

-   [ ] `ui/WorkTemplateList/` 생성
    -   [ ] 메인 컴포넌트 (~200줄)
-   [ ] `ui/TemplateSearch/` 생성
-   [ ] `ui/SortableTemplateList/` 생성
-   [ ] `ui/TemplateFormModal/` 생성

### 5.4 정리

-   [ ] index.ts 업데이트
-   [ ] 기존 `components/WorkTemplateList.tsx` 삭제
-   [ ] import 경로 업데이트
-   [ ] 테스트 마이그레이션

---

## 6. 예상 결과

### 6.1 줄 수 비교

| 항목                    | Before | After |
| ----------------------- | ------ | ----- |
| WorkTemplateList.tsx    | 980    | -     |
| WorkTemplateList (메인) | -      | ~200  |
| lib/template_filters.ts | -      | ~30   |
| hooks/\*.ts             | -      | ~180  |
| ui/SortableTemplateList | -      | ~120  |
| ui/TemplateFormModal    | -      | ~150  |
| ui/TemplateSearch       | -      | ~60   |
| **총계**                | 980    | ~740  |

---

## 참고

-   [PHASE8_OVERVIEW.md](./PHASE8_OVERVIEW.md) - 전체 개요
-   기존 features/work-template 활용
