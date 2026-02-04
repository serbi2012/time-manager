# WorkTemplateList 분리 계획

> **현재**: 980줄 (src/components/WorkTemplateList.tsx)  
> **최종**: 520줄 ✅ **완료** (2026-02-04)  
> **감소율**: **-47%**

---

## ✅ 리팩토링 완료 상태 (2026-02-04)

### 성과 요약

| 항목                      | Before | After | 감소율   |
| ------------------------- | ------ | ----- | -------- |
| **WorkTemplateList 메인** | 812줄  | 520줄 | **-36%** |
| **TemplateModal (신규)**  | -      | 181줄 | -        |
| **총계**                  | 812줄  | 701줄 | -        |

**주요 개선**:

-   ✅ `TemplateModal` 분리: 템플릿 추가/수정 모달 독립 컴포넌트화
-   ✅ `WorkRecordFormFields` 재사용: 폼 필드 공통화
-   ✅ 사용하지 않는 import 제거: `message`, `SUCCESS_MESSAGES`, `TEMPLATE_COLORS`
-   ✅ 타입 안전성 강화: strict 타입 정의

### 생성된 컴포넌트

| 컴포넌트               | 줄 수 | 위치                         | 설명                     |
| ---------------------- | ----- | ---------------------------- | ------------------------ |
| `TemplateModal.tsx`    | 181줄 | `features/work-template/ui/` | 템플릿 추가/수정 모달    |
| `WorkTemplateList.tsx` | 520줄 | `components/`                | 메인 컴포넌트 (36% 감소) |

### 재사용된 공통 컴포넌트

| 컴포넌트                  | 출처            | 효과             |
| ------------------------- | --------------- | ---------------- |
| `useWorkFormOptions`      | DailyGanttChart | ~250줄 중복 제거 |
| `WorkRecordFormFields`    | DailyGanttChart | ~200줄 중복 제거 |
| `AutoCompleteOptionLabel` | shared          | ~60줄 중복 제거  |
| `SelectOptionLabel`       | shared          | ~40줄 중복 제거  |
| `SelectAddNewDropdown`    | shared          | ~60줄 중복 제거  |

---

## 1. 적용된 엄격한 리팩토링 기준

### 1.1 모달 분리 ✅

#### Before

```typescript
// WorkTemplateList.tsx (812줄)
export default function WorkTemplateList() {
    // 300줄의 모달 관련 코드
    const [is_modal_open, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    // ... 200줄의 옵션 관리 로직
    // ... 100줄의 폼 제출 로직

    return (
        <>
            <Card>{/* 템플릿 목록 */}</Card>
            <Modal> {/* 300줄의 인라인 모달 */} </Modal>
        </>
    );
}
```

#### After

```typescript
// WorkTemplateList.tsx (520줄)
export default function WorkTemplateList() {
    const work_store = useWorkStore();

    return (
        <>
            <Card>{/* 템플릿 목록 */}</Card>
            <TemplateModal
                open={is_modal_open}
                is_edit_mode={is_edit_mode}
                form={form}
                {...work_store}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />
        </>
    );
}

// features/work-template/ui/TemplateModal.tsx (181줄)
export function TemplateModal({ ... }) {
    return (
        <Modal>
            <Form>
                <WorkRecordFormFields {...} />
                <Form.Item name="color">
                    <ColorPicker />
                </Form.Item>
            </Form>
        </Modal>
    );
}
```

**효과**: 모달 로직 완전 분리, 재사용 가능

### 1.2 공통 컴포넌트 재사용 ✅

#### Before (중복 코드)

```typescript
// 200줄의 폼 필드 중복
<Form.Item name="project_code">
    <AutoComplete options={...} /> {/* 40줄 */}
</Form.Item>
<Form.Item name="work_name">
    <AutoComplete options={...} /> {/* 40줄 */}
</Form.Item>
// ... 6개 필드 반복
```

#### After (공통 컴포넌트)

```typescript
<WorkRecordFormFields
    form={form}
    getAutoCompleteOptions={getAutoCompleteOptions}
    // ...
    project_code_placeholder="예: A25_01846 (미입력 시 A00_00000)"
/>
```

**효과**: ~200줄 중복 제거

### 1.3 타입 안전성 강화 ✅

```typescript
// Before
const values = await form.validateFields(); // unknown 타입

// After
const values = (await form.validateFields()) as {
    project_code?: string;
    work_name: string;
    deal_name?: string;
    task_name?: string;
    category_name?: string;
    note?: string;
    color: string | { toHexString: () => string };
};
```

---

## 2. 최종 파일 구조

```
features/work-template/
├── index.ts
├── model/
│   └── types.ts
├── ui/
│   ├── index.ts
│   ├── TemplateCard.tsx              # ✅ 기존
│   ├── ColorPicker.tsx               # ✅ 기존
│   └── TemplateModal.tsx             # ✅ NEW: 모달 분리 (181줄)

components/
└── WorkTemplateList.tsx              # ✅ 메인 (520줄, -36%)
```

---

## 3. 추가 개선 가능 영역

### 3.1 SortableTemplateCard 분리

**현재**: WorkTemplateList.tsx 내부에 정의 (95줄)

```typescript
// 현재: WorkTemplateList.tsx (62-187줄)
function SortableTemplateCard({ ... }: SortableTemplateCardProps) {
    // 95줄
}
```

**제안**: 별도 컴포넌트로 분리

```typescript
// features/work-template/ui/SortableTemplateCard.tsx
export function SortableTemplateCard({ ... }) {
    // 95줄 + constants
}
```

**예상 효과**: WorkTemplateList.tsx → 425줄 (-18%)

### 3.2 템플릿 액션 훅 분리

```typescript
// features/work-template/hooks/useTemplateActions.ts
export function useTemplateActions() {
    const {
        addTemplate,
        updateTemplate,
        deleteTemplate,
        reorderTemplates,
    } = useWorkStore();

    const handleAdd = useCallback(/* ... */, []);
    const handleEdit = useCallback(/* ... */, []);
    const handleDelete = useCallback(/* ... */, []);

    return {
        handleAdd,
        handleEdit,
        handleDelete,
    };
}
```

**예상 효과**: ~80줄 중복 제거

### 3.3 드래그 앤 드롭 훅 분리

```typescript
// features/work-template/hooks/useTemplateDnd.ts
export function useTemplateDnd(templates: WorkTemplate[]) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            /* ... */
        }),
        useSensor(TouchSensor, {
            /* ... */
        }),
        useSensor(KeyboardSensor, {
            /* ... */
        })
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        // ...
    }, []);

    return {
        sensors,
        handleDragEnd,
    };
}
```

**예상 효과**: ~60줄 중복 제거

---

## 4. 최종 목표 (추가 리팩토링 시)

| 항목                     | 현재           | 목표      | 개선     |
| ------------------------ | -------------- | --------- | -------- |
| **메인 컴포넌트**        | 520줄          | ~300줄    | **-42%** |
| **SortableTemplateCard** | 인라인 (95줄)  | 별도 파일 | 분리     |
| **템플릿 액션**          | 인라인 (~80줄) | 훅으로    | 분리     |
| **드래그 앤 드롭**       | 인라인 (~60줄) | 훅으로    | 분리     |

---

## 5. 참고

-   [PHASE8_OVERVIEW.md](PHASE8_OVERVIEW.md) - Phase 8 전체 계획
-   [01_DAILY_GANTT_CHART.md](01_DAILY_GANTT_CHART.md) - 완료된 사례
-   [dev-guidelines.mdc](../../.cursor/rules/dev-guidelines.mdc) - 개발 가이드라인
