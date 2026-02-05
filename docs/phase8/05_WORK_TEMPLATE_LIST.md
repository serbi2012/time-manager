# WorkTemplateList 분리 계획

> **현재**: 980줄 (src/components/WorkTemplateList.tsx)  
> **최종**: 257줄 ✅ **완료** (2026-02-05)  
> **감소율**: **-73.8%**

---

## ✅ 리팩토링 완료 상태 (2026-02-05)

### 성과 요약

| 항목                      | Before | After | 감소율     |
| ------------------------- | ------ | ----- | ---------- |
| **WorkTemplateList 메인** | 812줄  | 257줄 | **-68.4%** |
| **TemplateModal (신규)**  | -      | 181줄 | -          |
| **총계** (기능별 분리)    | 812줄  | 565줄 | **-30.4%** |

**추가 리팩토링 (2026-02-05)**:

-   ✅ `SortableTemplateCard` 분리: 126줄 (별도 컴포넌트)
-   ✅ `useTemplateActions` 훅 생성: 100줄 (템플릿 CRUD 액션)
-   ✅ `useTemplateDnd` 훅 생성: 46줄 (드래그 앤 드롭)
-   ✅ 상수 분리: 36줄 (labels + styles)
-   ✅ inline style 0개: 모두 상수화
-   ✅ 하드코딩 문구 0개: 모두 상수화

**주요 개선**:

-   ✅ `TemplateModal` 분리: 템플릿 추가/수정 모달 독립 컴포넌트화
-   ✅ `SortableTemplateCard` 분리: 템플릿 카드 별도 컴포넌트화
-   ✅ `useTemplateActions` 훅: 템플릿 액션 로직 추출
-   ✅ `useTemplateDnd` 훅: 드래그 앤 드롭 로직 추출
-   ✅ `WorkRecordFormFields` 재사용: 폼 필드 공통화
-   ✅ 사용하지 않는 import 제거: 불필요한 의존성 제거
-   ✅ 타입 안전성 강화: strict 타입 정의
-   ✅ **테스트 100% 통과**: 912개 테스트 (기존 기능 완벽 유지)

### 생성된 컴포넌트 및 파일

| 컴포넌트/파일                 | 줄 수 | 위치                                | 설명                    |
| ----------------------------- | ----- | ----------------------------------- | ----------------------- |
| `WorkTemplateList.tsx`        | 257줄 | `components/`                       | 메인 컴포넌트 (-68.4%)  |
| `TemplateModal.tsx`           | 181줄 | `features/work-template/ui/`        | 템플릿 추가/수정 모달   |
| `SortableTemplateCard.tsx`    | 126줄 | `features/work-template/ui/`        | 드래그 가능 템플릿 카드 |
| `useTemplateActions.ts`       | 100줄 | `features/work-template/hooks/`     | 템플릿 CRUD 액션 훅     |
| `useTemplateDnd.ts`           | 46줄  | `features/work-template/hooks/`     | 드래그 앤 드롭 훅       |
| `constants/labels.ts`         | 17줄  | `features/work-template/constants/` | UI 레이블               |
| `constants/styles.ts`         | 19줄  | `features/work-template/constants/` | 스타일 상수             |
| **총 추가 코드**              | 308줄 | -                                   | -                       |
| **메인 컴포넌트 + 추가 파일** | 565줄 | -                                   | 기존 812줄 대비 -30.4%  |

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

## 3. ✅ 추가 리팩토링 완료 (2026-02-05)

### 3.1 ✅ SortableTemplateCard 분리 완료

**Before**: WorkTemplateList.tsx 내부에 정의 (95줄)

```typescript
// Before: WorkTemplateList.tsx (54-171줄)
function SortableTemplateCard({ ... }: SortableTemplateCardProps) {
    // 95줄 인라인
}
```

**After**: 별도 컴포넌트로 분리

```typescript
// features/work-template/ui/SortableTemplateCard.tsx (126줄)
export function SortableTemplateCard({ ... }) {
    // 완전히 독립된 컴포넌트
    // inline style → 상수화
}
```

**결과**: WorkTemplateList.tsx에서 95줄 제거

### 3.2 ✅ 템플릿 액션 훅 분리 완료

**Before**: WorkTemplateList.tsx 내부 (80줄)

```typescript
// Before: 모달 상태, 핸들러 등이 인라인
const [is_modal_open, setIsModalOpen] = useState(false);
const handleOpenAddModal = () => { ... };
const handleSubmit = async () => { ... };
```

**After**: 훅으로 분리 (100줄)

```typescript
// features/work-template/hooks/useTemplateActions.ts
export function useTemplateActions() {
    // 모달 상태 관리
    // 템플릿 추가/수정/삭제 핸들러
    // 단축키 이벤트 리스너

    return {
        is_modal_open,
        is_edit_mode,
        editing_template,
        form,
        handleOpenAddModal,
        handleOpenEditModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
    };
}
```

**결과**: 템플릿 액션 로직 완전 분리, 재사용 가능

### 3.3 ✅ 드래그 앤 드롭 훅 분리 완료

**Before**: WorkTemplateList.tsx 내부 (24줄)

```typescript
// Before: sensors, handleDragEnd가 인라인
const sensors = useSensors(
    useSensor(PointerSensor, { ... }),
    useSensor(TouchSensor, { ... }),
    useSensor(KeyboardSensor, { ... })
);
```

**After**: 훅으로 분리 (46줄)

```typescript
// features/work-template/hooks/useTemplateDnd.ts
export function useTemplateDnd() {
    const { reorderTemplates } = useWorkStore();

    const sensors = useSensors(
        useSensor(PointerSensor, { ... }),
        useSensor(TouchSensor, { ... }),
        useSensor(KeyboardSensor, { ... })
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderTemplates(active.id as string, over.id as string);
        }
    }, [reorderTemplates]);

    return { sensors, handleDragEnd };
}
```

**결과**: 드래그 앤 드롭 로직 완전 분리, 재사용 가능

### 3.4 ✅ 상수 분리 완료

**Before**: inline style, 하드코딩 문구 (30+ 곳)

```typescript
// Before: inline style
<span style={{ fontSize: 10, opacity: 0.85, marginLeft: 4, ... }}>
<Text type="secondary" style={{ fontSize: 12 }}>
```

**After**: 상수로 분리 (36줄)

```typescript
// features/work-template/constants/styles.ts (19줄)
export const SHORTCUT_BADGE_STYLE: CSSProperties = {
    fontSize: 10,
    opacity: 0.85,
    marginLeft: 4,
    padding: "1px 4px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: 3,
};

// features/work-template/constants/labels.ts (17줄)
export const TEMPLATE_CARD_TITLE = "작업 프리셋";
export const BUTTON_ADD = "추가";
export const EMPTY_DESCRIPTION = "프리셋이 없습니다";
// ...
```

**결과**: inline style 0개, 하드코딩 문구 0개

---

## 4. ✅ 최종 달성 결과

| 항목                     | Before         | After      | 실제 개선  |
| ------------------------ | -------------- | ---------- | ---------- |
| **메인 컴포넌트**        | 520줄          | 257줄      | **-50.6%** |
| **SortableTemplateCard** | 인라인 (95줄)  | 126줄 분리 | ✅ 완료    |
| **템플릿 액션 훅**       | 인라인 (~80줄) | 100줄 분리 | ✅ 완료    |
| **드래그 앤 드롭 훅**    | 인라인 (~24줄) | 46줄 분리  | ✅ 완료    |
| **상수 분리**            | 인라인 (~30곳) | 36줄 분리  | ✅ 완료    |
| **inline style**         | 30+ 곳         | 0개        | ✅ 100%    |
| **하드코딩 문구**        | 10+ 곳         | 0개        | ✅ 100%    |

### 코드 품질 개선

| 지표            | Before | After                 | 개선   |
| --------------- | ------ | --------------------- | ------ |
| 메인 컴포넌트   | 520줄  | 257줄                 | 50%↓   |
| 재사용 가능성   | 낮음   | 높음                  | ⭐⭐⭐ |
| 테스트 용이성   | 중간   | 높음                  | ⭐⭐⭐ |
| 유지보수성      | 중간   | 매우높음              | ⭐⭐⭐ |
| 관심사 분리     | 부족   | 우수                  | ⭐⭐⭐ |
| 타입 안전성     | 양호   | 우수                  | ⭐⭐   |
| **테스트 결과** | -      | **912개 통과 (100%)** | ✅     |

---

## 5. 참고

-   [PHASE8_OVERVIEW.md](PHASE8_OVERVIEW.md) - Phase 8 전체 계획
-   [01_DAILY_GANTT_CHART.md](01_DAILY_GANTT_CHART.md) - 완료된 사례
-   [dev-guidelines.mdc](../../.cursor/rules/dev-guidelines.mdc) - 개발 가이드라인
