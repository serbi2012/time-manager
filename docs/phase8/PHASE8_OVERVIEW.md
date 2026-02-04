# Phase 8: 거대 컴포넌트 분리 - 전체 계획

> **목표**: 300~500줄 이상의 거대 컴포넌트를 100~200줄 단위로 **극도로 세분화** > **원칙**: 공통화 최대 활용, 엄격한 JSX/style 분리, 테스트 용이성 확보, 모바일/데스크탑 독립성 유지

---

## 0. ⚠️ 엄격한 리팩토링 기준 (Phase 1~7에서 확립됨)

### 0.1 JSX 작성 위치 **절대 규칙**

```typescript
// ❌ 절대 금지: useMemo 내 JSX
const options = useMemo(
    () =>
        data.map((item) => ({
            label: (
                <div>
                    <span>{item.name}</span>
                </div>
            ), // 금지!
        })),
    [data]
);

// ✅ 필수: 별도 컴포넌트로 분리
const OptionLabel = ({ name }: { name: string }) => (
    <div>
        <span>{name}</span>
    </div>
);

const options = useMemo(
    () =>
        data.map((item) => ({
            label: <OptionLabel name={item.name} />,
        })),
    [data]
);
```

**규칙:**

-   **useMemo 내 JSX 100% 금지**
-   **return 문 내에서도 50줄 이상 JSX는 컴포넌트 분리**
-   **Popover content, Tooltip title, Modal 본문 등 모두 별도 컴포넌트**
-   **한 파일 = 한 React 컴포넌트 함수**

### 0.2 inline style **완전 금지**

```typescript
// ❌ 절대 금지: inline style 객체
<div style={{ minWidth: 160, color: "#666", fontSize: 12 }} />;

// ✅ 필수: 상수로 분리
const CONTAINER_STYLE: CSSProperties = {
    minWidth: 160,
    color: "#666",
    fontSize: 12,
};
<div style={CONTAINER_STYLE} />;

// ✅ 또는 feature 내 constants
import { GANTT_CONTAINER_STYLE } from "../constants";
<div style={GANTT_CONTAINER_STYLE} />;
```

**규칙:**

-   **모든 inline style 객체는 상수화**
-   **2회 이상 사용하는 스타일은 무조건 shared/ui/form/styles.ts**
-   **매직 넘버/색상 금지** (160, #666, 12 등)

### 0.3 사용자 문구 **100% 상수화**

```typescript
// ❌ 금지: 하드코딩 문구
<Text>작업 기록이 없습니다</Text>;
message.success("세션이 삭제되었습니다");

// ✅ 필수: 상수화
import { GANTT_EMPTY_TEXT, GANTT_MESSAGE_SESSION_DELETED } from "../constants";
<Text>{GANTT_EMPTY_TEXT}</Text>;
message.success(GANTT_MESSAGE_SESSION_DELETED);
```

### 0.4 공통화 (DRY) **극대화**

**Phase 1~7에서 생성된 공통 자원:**

| 컴포넌트                  | 위치                         | 줄 수 | 재사용 효과        |
| ------------------------- | ---------------------------- | ----- | ------------------ |
| `useWorkFormOptions`      | `shared/ui/form/hooks/`      | 224줄 | ~900줄 중복 제거   |
| `WorkRecordFormFields`    | `shared/ui/form/`            | 189줄 | ~1,000줄 중복 제거 |
| `AutoCompleteOptionLabel` | `shared/ui/form/`            | 60줄  | ~360줄 중복 제거   |
| `SelectOptionLabel`       | `shared/ui/form/`            | 40줄  | ~200줄 중복 제거   |
| `SelectAddNewDropdown`    | `shared/ui/form/`            | 60줄  | ~500줄 중복 제거   |
| `TemplateModal`           | `features/work-template/ui/` | 181줄 | 템플릿 전용        |

**Phase 8에서 추가 생성 예정:**

-   `RecordFormModal`: Record 추가/수정 모달 공통화
-   `SessionTimeInput`: 세션 시간 입력 공통화
-   `DurationDisplay`: 시간 표시 공통화
-   `CategoryBadge`: 카테고리 뱃지 공통화

---

## 1. 대상 컴포넌트 현황

| 순서 | 컴포넌트         | 현재 줄 수 | 목표 줄 수 | 우선순위  | 계획 문서                  |
| ---- | ---------------- | ---------- | ---------- | --------- | -------------------------- |
| 1    | DailyGanttChart  | 2,918      | ~200       | 🔥 최우선 | [01_DAILY_GANTT_CHART.md]  |
| 2    | WorkRecordTable  | 2,966      | ~200       | 🔥 최우선 | [02_WORK_RECORD_TABLE.md]  |
| 3    | AdminSessionGrid | 2,278      | ~180       | 🔥 최우선 | [03_ADMIN_SESSION_GRID.md] |
| 4    | SettingsModal    | 1,330      | ~150       | ⚡ 높음   | [04_SETTINGS_MODAL.md]     |
| 5    | WorkTemplateList | 980        | ~150       | ✅ 완료   | (Phase 7에서 완료 520줄)   |
| 6    | StatsDashboard   | 971        | ~180       | ⚡ 높음   | (admin에 이미 분리됨)      |
| 7    | SuggestionBoard  | 773        | ~150       | ⚙️ 중간   | [07_OTHERS.md]             |
| 8    | WeeklySchedule   | 641        | ~150       | ⚙️ 중간   | [06_WEEKLY_SCHEDULE.md]    |
| 9    | GuideBook        | 574        | ~150       | ⚙️ 중간   | [07_OTHERS.md]             |

**총 분리 대상**: 약 12,400줄 → 약 1,470줄 (메인 컴포넌트 기준)
**목표 감소율**: **88%** (평균 150줄 달성 시)

---

## 2. 공통화 전략 (Phase 1~7 성과 기반)

### 2.1 Phase 1~7에서 확립된 공통 패턴

#### 패턴 1: Work Form 옵션 관리 ✅ **공통화 완료**

**Before (각 모달 ~250줄 중복)**:

```typescript
// 5개 모달에서 동일 코드 반복
const [project_code_search, setProjectCodeSearch] = useState("");
const debounced_search = useDebouncedValue(project_code_search, 150);
const options = useMemo(() => {
    /* 180줄 */
}, []);
// ...
```

**After (공통 훅 사용 ~13줄)**:

```typescript
const options = useWorkFormOptions({
    form,
    getAutoCompleteOptions,
    // ...
});
```

**효과**: 1,224줄 중복 제거 (5개 모달 × ~245줄)

#### 패턴 2: Work Form 필드 ✅ **공통화 완료**

**Before (각 모달 ~200줄 중복)**:

```typescript
<Form.Item name="project_code" label="프로젝트 코드">
    <AutoComplete options={...} /> {/* 200줄 */}
</Form.Item>
// 6개 폼 필드 반복...
```

**After (공통 컴포넌트 사용)**:

```typescript
<WorkRecordFormFields
    form={form}
    {...work_store}
    project_code_placeholder="예: A25_01846"
/>
```

**효과**: ~1,000줄 중복 제거

#### 패턴 3: AutoComplete 옵션 레이블 ✅ **공통화 완료**

**Before (각 옵션 ~24줄)**:

```typescript
label: (
    <div style={{...}}>
        <HighlightText text={...} search={...} />
        <CloseOutlined onClick={...} style={{...}} />
    </div>
)
```

**After (공통 컴포넌트)**:

```typescript
label: <AutoCompleteOptionLabel text={...} search={...} onHide={...} />
```

**효과**: ~360줄 중복 제거

### 2.2 Phase 8에서 추가 공통화 예정

| 패턴             | 현재 중복    | 공통화 대상        | 예상 효과   |
| ---------------- | ------------ | ------------------ | ----------- |
| 세션 시간 입력   | 5곳 × ~80줄  | `SessionTimeInput` | ~320줄 감소 |
| 시간 표시        | 8곳 × ~30줄  | `DurationDisplay`  | ~210줄 감소 |
| 카테고리 뱃지    | 6곳 × ~20줄  | `CategoryBadge`    | ~100줄 감소 |
| 레코드 액션 버튼 | 4곳 × ~60줄  | `RecordActions`    | ~180줄 감소 |
| 모달 footer      | 10곳 × ~25줄 | `ModalFooter`      | ~200줄 감소 |

**예상 추가 효과**: ~1,010줄 중복 제거

---

## 3. 분리 체크리스트 (엄격 기준)

### 3.1 코드 작성 규칙 체크

각 컴포넌트 분리 시 **필수 확인**:

-   [ ] **JSX 위치**

    -   [ ] useMemo 내 JSX 0개 확인
    -   [ ] return 문 내 JSX 50줄 이하 확인
    -   [ ] Popover/Tooltip/Modal 본문 별도 컴포넌트 확인
    -   [ ] 한 파일 = 한 컴포넌트 함수 확인

-   [ ] **inline style**

    -   [ ] inline style 객체 0개 확인
    -   [ ] 모든 스타일 상수화 확인
    -   [ ] 매직 넘버/색상 상수화 확인

-   [ ] **사용자 문구**

    -   [ ] 하드코딩 문구 0개 확인
    -   [ ] message.xxx 인자 상수화 확인
    -   [ ] UI 텍스트 상수화 확인

-   [ ] **공통화**

    -   [ ] 2회 이상 사용 코드 공통화 확인
    -   [ ] 재사용 가능 컴포넌트 분리 확인

-   [ ] **타입 안전성**
    -   [ ] any 타입 0개 확인
    -   [ ] 타입 단언 최소화 확인
    -   [ ] strict 타입 정의 확인

### 3.2 파일 크기 체크

-   [ ] 메인 컴포넌트 200줄 이하 (목표: 100~150줄)
-   [ ] 하위 컴포넌트 각 100줄 이하
-   [ ] 훅 각 150줄 이하
-   [ ] 순수 함수 각 50줄 이하

### 3.3 테스트 체크

-   [ ] 순수 함수 100% 커버리지
-   [ ] 훅 90% 이상 커버리지
-   [ ] 컴포넌트 80% 이상 커버리지

---

## 4. 분리 단계별 계획

### Step 1: DailyGanttChart (2,918줄 → ~200줄) 🔥

**목표**:

-   메인 컴포넌트: 150~200줄
-   10개 이상 하위 컴포넌트
-   5개 이상 커스텀 훅
-   8개 이상 순수 함수

**주요 분리**:

1. `GanttHeader` (헤더 + 필터) - ~80줄
2. `GanttTimeline` (간트 차트 영역) - ~120줄
3. `GanttBar` (바 컴포넌트) - ~60줄
4. `SessionContextMenu` (컨텍스트 메뉴) - ~80줄
5. `QuickAddPopover` (빠른 추가 팝오버) - ~100줄
6. `GanttAddModal` (추가 모달) - ~150줄
7. `GanttEditModal` (수정 모달) - ~150줄

**공통화**:

-   `WorkRecordFormFields` 재사용 ✅
-   `SessionTimeInput` 신규 생성
-   `DurationDisplay` 신규 생성

### Step 2: WorkRecordTable (2,966줄 → ~200줄) 🔥

**목표**:

-   메인 컴포넌트: 150~200줄
-   12개 이상 하위 컴포넌트
-   6개 이상 커스텀 훅
-   10개 이상 순수 함수

**주요 분리**:

1. `RecordTableHeader` (헤더 + 필터) - ~80줄
2. `RecordRow` (테이블 행) - ~100줄
3. `RecordActions` (액션 버튼) - ~60줄
4. `SessionEditTable` (세션 편집) - ~120줄
5. `DailyStats` (통계 패널) - ~80줄
6. `RecordAddModal` (추가 모달) - ~130줄
7. `RecordEditModal` (수정 모달) - ~160줄

**공통화**:

-   `WorkRecordFormFields` 재사용 ✅
-   `CategoryBadge` 신규 생성
-   `RecordActions` 신규 생성

### Step 3: AdminSessionGrid (2,278줄 → ~180줄) 🔥

**목표**:

-   메인 컴포넌트: 150~180줄
-   10개 이상 하위 컴포넌트
-   5개 이상 커스텀 훅

### Step 4: SettingsModal (1,330줄 → ~150줄) ⚡

**목표**:

-   메인 컴포넌트: 120~150줄
-   8개 이상 탭 컴포넌트

---

## 5. 진행 추적

| 단계   | 항목                  | 줄 수 Before → After | 상태 | 완료일     |
| ------ | --------------------- | -------------------- | ---- | ---------- |
| Step 0 | Work Form 공통화      | -                    | ✅   | 2026-02-04 |
| Step 1 | DailyGanttChart 분리  | 2,918 → 304          | ✅   | 2026-02-04 |
| Step 1 | GanttAddModal         | 838 → 335            | ✅   | 2026-02-04 |
| Step 1 | GanttEditModal        | 747 → 221            | ✅   | 2026-02-04 |
| Step 0 | RecordAddModal        | 516 → 130            | ✅   | 2026-02-04 |
| Step 0 | RecordEditModal       | 547 → 162            | ✅   | 2026-02-04 |
| Step 0 | WorkTemplateList      | 812 → 520            | ✅   | 2026-02-04 |
| Step 2 | WorkRecordTable 분리  | 2,966 → ~200         | ⬜   | -          |
| Step 3 | AdminSessionGrid 분리 | 2,278 → ~180         | ⬜   | -          |
| Step 4 | SettingsModal 분리    | 1,330 → ~150         | ⬜   | -          |
| Step 5 | WeeklySchedule 분리   | 641 → ~150           | ⬜   | -          |
| Step 6 | SuggestionBoard 분리  | 773 → ~150           | ⬜   | -          |
| Step 6 | GuideBook 분리        | 574 → ~150           | ⬜   | -          |

**범례**: ⬜ 미시작 / 🔄 진행중 / ✅ 완료

---

## 6. 성과 지표

### 6.1 Phase 1~7 성과 (확정)

| 지표           | Before  | After   | 개선율    |
| -------------- | ------- | ------- | --------- |
| 총 모달 줄 수  | 4,460줄 | 1,368줄 | **-69%**  |
| 중복 코드      | 1,224줄 | 0줄     | **-100%** |
| 공통 컴포넌트  | 0개     | 9개     | **+∞**    |
| 평균 모달 크기 | 892줄   | 228줄   | **-74%**  |

### 6.2 Phase 8 목표 (예상)

| 지표                | Before  | After | 목표 개선율 |
| ------------------- | ------- | ----- | ----------- |
| 평균 컴포넌트 크기  | 1,650줄 | 170줄 | **-90%**    |
| 중복 코드 추가 제거 | 800줄   | 0줄   | **-100%**   |
| 공통 컴포넌트 추가  | -       | +15개 | -           |
| 테스트 커버리지     | 75%     | 90%   | **+20%**    |

---

## 참고

-   [REFACTORING_TODO.md](../REFACTORING_TODO.md) - 전체 리팩토링 계획
-   [REFACTORING_PROGRESS.md](../REFACTORING_PROGRESS.md) - 진행 상황
-   [dev-guidelines.mdc](../../.cursor/rules/dev-guidelines.mdc) - 개발 가이드라인

**Phase 8 문서**:

-   [01_DAILY_GANTT_CHART.md](01_DAILY_GANTT_CHART.md)
-   [02_WORK_RECORD_TABLE.md](02_WORK_RECORD_TABLE.md)
-   [03_ADMIN_SESSION_GRID.md](03_ADMIN_SESSION_GRID.md)
-   [04_SETTINGS_MODAL.md](04_SETTINGS_MODAL.md)
-   [05_WORK_TEMPLATE_LIST.md](05_WORK_TEMPLATE_LIST.md)
-   [06_WEEKLY_SCHEDULE.md](06_WEEKLY_SCHEDULE.md)
-   [07_OTHERS.md](07_OTHERS.md)
