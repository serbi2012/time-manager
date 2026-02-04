# WorkRecordTable 분리 계획

> **현재**: 2,966줄 (src/components/WorkRecordTable.tsx)  
> **목표**: 메인 컴포넌트 ~200줄 + 하위 모듈들  
> **예상 감소율**: **-93%**

---

## 0. ⚠️ 적용할 엄격한 리팩토링 기준 (Phase 1~7에서 확립)

### 0.1 JSX 작성 위치 **절대 규칙**

✅ **useMemo 내 JSX 100% 금지** - 모두 별도 컴포넌트로  
✅ **return 문 내 50줄 이상 JSX 금지** - 컴포넌트 분리  
✅ **Popover content, Tooltip title 등 모두 별도 컴포넌트**  
✅ **한 파일 = 한 React 컴포넌트 함수**

### 0.2 inline style **완전 금지**

✅ **모든 inline style 객체는 상수화**  
✅ **2회 이상 사용 스타일은 shared/ui/form/styles.ts**  
✅ **매직 넘버/색상 금지** (160, #666, 12 등 → 상수로)

### 0.3 사용자 문구 **100% 상수화**

✅ **모든 UI 텍스트는 constants로**  
✅ **message.xxx 인자 상수화**  
✅ **Empty description, Tooltip title 등 상수화**

### 0.4 공통화 (DRY) **극대화**

✅ **2회 이상 사용 코드는 무조건 공통화**  
✅ **useWorkFormOptions 훅 재사용** (DailyGanttChart에서 생성)  
✅ **WorkRecordFormFields 컴포넌트 재사용**

---

## 1. 현재 구조 분석

### 1.1 파일 위치

-   메인: `src/components/WorkRecordTable.tsx` (2,966줄)
-   기존 분리: `src/features/work-record/`

### 1.2 줄 수 분포 분석

```typescript
// WorkRecordTable.tsx 상세 분포

// ═══════════════════════════════════════════
// 1. 임포트 (1-63줄) - ~63줄
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// 2. 헬퍼 함수 (64-160줄) - ~97줄
// ═══════════════════════════════════════════
// ❌ 순수 함수인데 컴포넌트 내부에 있음
getCategoryColor()              // 15줄 → lib/category_utils.ts
getSessionDurationMinutes()     // 20줄 → lib/duration_calculator.ts
getRecordDurationMinutes()      // 30줄 → lib/duration_calculator.ts
getRecordDurationMinutesForDate() // 32줄 → lib/duration_calculator.ts

// ═══════════════════════════════════════════
// 3. 메인 컴포넌트 시작 (162줄~)
// ═══════════════════════════════════════════

// ───────────────────────────────────────────
// 상태 (state) - ~90줄
// ───────────────────────────────────────────
- 검색/필터 상태 (180-200줄) - 20줄
  ❌ 훅으로 분리 → useRecordFilters
- 모달 상태 (200-230줄) - 30줄
  ❌ 훅으로 분리 → useRecordModals
- 편집 상태 (230-260줄) - 30줄
  ❌ 훅으로 분리 → useRecordEdit
- 타이머 관련 (260-290줄) - 30줄
  ❌ 이미 useWorkStore에 있음

// ───────────────────────────────────────────
// 파생 데이터 (useMemo) - ~200줄
// ───────────────────────────────────────────
- day_records (300-350줄) - 50줄
  ✅ useRecordData 훅으로
- filtered_records (350-400줄) - 50줄
  ✅ useRecordData 훅으로
- 통계 계산 (400-500줄) - 100줄
  ✅ useRecordStats 훅으로

// ───────────────────────────────────────────
// ⚠️ 테이블 컬럼 정의 (500-1200줄) - ~700줄 !!
// ───────────────────────────────────────────
// ❌ 가장 큰 문제! 컬럼 렌더러 함수가 inline
const columns = useMemo(() => [
    {
        title: "프로젝트 코드",
        render: (_, record) => {
            // 80줄의 inline JSX !!
            return (
                <div>
                    {record.is_editing ? (
                        <AutoComplete /* 40줄 */ />
                    ) : (
                        <Tooltip /* 30줄 */ />
                    )}
                </div>
            );
        },
    },
    // ... 8개 컬럼 반복 (각 80~120줄)
], [/* 수십 개 의존성 */]);

// ✅ 분리 방법
// features/work-record/ui/RecordTable/columns/
// ├── ProjectCodeColumn.tsx        (80줄)
// ├── WorkNameColumn.tsx           (100줄)
// ├── DurationColumn.tsx           (90줄)
// ├── SessionsColumn.tsx           (120줄)
// ├── CategoryColumn.tsx           (80줄)
// ├── NoteColumn.tsx               (70줄)
// └── ActionsColumn.tsx            (80줄)

// ───────────────────────────────────────────
// 핸들러 함수들 (1200-2000줄) - ~800줄
// ───────────────────────────────────────────
- handleEdit/Delete/Complete (1200-1400줄) - 200줄
  ✅ useRecordActions 훅으로
- handleTimerStart/Stop (1400-1600줄) - 200줄
  ✅ 이미 useWorkStore에 있음
- handleCopy/Move (1600-1800줄) - 200줄
  ✅ useRecordActions 훅으로
- handleFormSubmit (1800-2000줄) - 200줄
  ✅ useRecordForm 훅으로

// ───────────────────────────────────────────
// 렌더링 (2100-2900줄) - ~800줄
// ───────────────────────────────────────────
- 헤더/필터 영역 (2100-2300줄) - 200줄
  ✅ RecordTableHeader 컴포넌트로 (80줄)
  ✅ RecordFilters 컴포넌트로 (70줄)
  ✅ DailyStats 컴포넌트로 (80줄)

- 테이블 영역 (2300-2600줄) - 300줄
  ✅ RecordTable 컴포넌트로 (150줄)

- 모달들 (2600-2900줄) - 300줄
  ❌ 각 모달 인라인 폼 150줄씩
  ✅ RecordAddModal 컴포넌트로 (130줄) - WorkRecordFormFields 사용
  ✅ RecordEditModal 컴포넌트로 (160줄) - WorkRecordFormFields 사용
```

---

## 2. 분리 계획

### 2.1 목표 구조

```
features/work-record/
├── index.ts                               # Public API
│
├── constants/
│   ├── index.ts                           # 통합 export
│   ├── labels.ts                          # NEW: UI 레이블
│   ├── messages.ts                        # NEW: 메시지
│   ├── styles.ts                          # NEW: 스타일 상수
│   └── config.ts                          # NEW: 설정
│
├── model/
│   ├── index.ts
│   ├── types.ts                           # ✅ 기존 + 확장
│   └── constants.ts                       # NEW → constants/로 이동
│
├── lib/
│   ├── index.ts
│   ├── conflict_detector.ts               # ✅ 기존
│   ├── duration_calculator.ts             # ✅ 기존 + 확장
│   │   ├── getSessionDurationMinutes()    # NEW: 헬퍼에서 이동
│   │   ├── getRecordDurationMinutes()     # NEW: 헬퍼에서 이동
│   │   └── getRecordDurationMinutesForDate() # NEW: 헬퍼에서 이동
│   ├── record_merger.ts                   # ✅ 기존
│   ├── category_utils.ts                  # NEW: 카테고리 유틸
│   │   └── getCategoryColor()             # NEW: 헬퍼에서 이동
│   ├── record_filters.ts                  # NEW: 필터 로직
│   │   ├── filterBySearch()
│   │   ├── filterByCategory()
│   │   └── filterByCompleted()
│   └── record_sorter.ts                   # NEW: 정렬 로직
│       ├── sortByDuration()
│       └── sortByStartTime()
│
├── hooks/
│   ├── index.ts
│   ├── useRecordData.ts                   # NEW: 데이터 가공 (~100줄)
│   │   ├── day_records
│   │   ├── filtered_records
│   │   └── sorted_records
│   ├── useRecordStats.ts                  # NEW: 통계 계산 (~80줄)
│   │   ├── total_duration
│   │   ├── completed_count
│   │   └── category_breakdown
│   ├── useRecordFilters.ts                # NEW: 필터 상태 (~60줄)
│   ├── useRecordModals.ts                 # NEW: 모달 상태 (~50줄)
│   ├── useRecordEdit.ts                   # NEW: 편집 상태 (~70줄)
│   ├── useRecordActions.ts                # NEW: 액션 핸들러 (~150줄)
│   └── useRecordForm.ts                   # NEW: 폼 제출 (~80줄)
│
└── ui/
    ├── index.ts
    │
    ├── RecordTable/                       # NEW: 메인 컴포넌트
    │   ├── index.ts
    │   ├── RecordTable.tsx                # ✅ 메인 (~200줄)
    │   ├── RecordTableHeader.tsx          # ✅ 기존 확장 (~80줄)
    │   ├── RecordFilters.tsx              # NEW: 필터 영역 (~70줄)
    │   ├── DailyStats.tsx                 # NEW: 통계 패널 (~80줄)
    │   └── RecordRow.tsx                  # NEW: 테이블 행 (~100줄)
    │
    ├── RecordColumns/                     # NEW: 컬럼 렌더러
    │   ├── index.ts
    │   ├── ProjectCodeColumn.tsx          # NEW (~80줄)
    │   ├── WorkNameColumn.tsx             # NEW (~100줄)
    │   ├── DurationColumn.tsx             # NEW (~90줄)
    │   ├── SessionsColumn.tsx             # NEW (~120줄)
    │   ├── CategoryColumn.tsx             # NEW (~80줄)
    │   ├── NoteColumn.tsx                 # NEW (~70줄)
    │   └── ActionsColumn.tsx              # NEW (~80줄)
    │
    ├── RecordModals/                      # NEW: 모달들
    │   ├── index.ts
    │   ├── RecordAddModal.tsx             # ✅ 완료 (130줄) ← WorkRecordFormFields 사용
    │   └── RecordEditModal.tsx            # ✅ 완료 (162줄) ← WorkRecordFormFields 사용
    │
    ├── RecordActions/                     # ✅ 기존 확장
    │   ├── index.ts
    │   ├── RecordActions.tsx              # ✅ 기존
    │   ├── RecordActionMenu.tsx           # NEW: 액션 메뉴 (~60줄)
    │   └── RecordBulkActions.tsx          # NEW: 일괄 액션 (~80줄)
    │
    ├── SessionEditor/                     # ✅ 기존
    │   ├── index.ts
    │   └── SessionEditTable.tsx           # ✅ 기존
    │
    ├── CompletedRecords/                  # ✅ 기존
    │   ├── index.ts
    │   ├── CompletedModal.tsx             # ✅ 기존
    │   └── TrashModal.tsx                 # ✅ 기존
    │
    └── MobileRecordCard/                  # ✅ 기존
        ├── index.ts
        └── MobileRecordCard.tsx           # ✅ 기존
```

### 2.2 재사용할 공통 컴포넌트 (shared/)

```
shared/ui/form/
├── hooks/
│   └── useWorkFormOptions.tsx             # ✅ DailyGanttChart에서 생성
├── WorkRecordFormFields.tsx              # ✅ DailyGanttChart에서 생성
├── AutoCompleteOptionLabel.tsx           # ✅ 재사용
├── SelectOptionLabel.tsx                 # ✅ 재사용
├── SelectAddNewDropdown.tsx              # ✅ 재사용
└── styles.ts                             # ✅ 재사용
```

---

## 3. 단계별 분리 작업

### Step 1: 순수 함수 추출 ✅ 준비

#### 1.1 duration_calculator.ts 확장

```typescript
// features/work-record/lib/duration_calculator.ts

// ✅ 기존 함수들 유지
export function calculateSessionDuration(session: WorkSession): number {
    /* 기존 */
}

// NEW: 컴포넌트에서 이동
export function getSessionDurationMinutes(
    session: WorkSession,
    lunch_start: string,
    lunch_end: string
): number {
    // 점심시간 제외 계산
}

export function getRecordDurationMinutes(
    record: WorkRecord,
    lunch_start: string,
    lunch_end: string
): number {
    // 레코드 전체 시간 계산
}

export function getRecordDurationMinutesForDate(
    record: WorkRecord,
    date: string,
    lunch_start: string,
    lunch_end: string
): number {
    // 특정 날짜의 레코드 시간 계산
}
```

**체크리스트**:

-   [ ] 순수 함수로 추출 (외부 상태 참조 0개)
-   [ ] 유닛 테스트 작성 (커버리지 100%)
-   [ ] 타입 명시 (any 금지)

#### 1.2 category_utils.ts 신규

```typescript
// features/work-record/lib/category_utils.ts

export const CATEGORY_COLORS: Record<string, string> = {
    개발: "#1890ff",
    문서작업: "#52c41a",
    회의: "#faad14",
    환경세팅: "#722ed1",
    코드리뷰: "#eb2f96",
    테스트: "#13c2c2",
    기타: "#8c8c8c",
} as const;

export function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["기타"];
}

export function getCategoryBadgeStyle(category: string): CSSProperties {
    return {
        backgroundColor: getCategoryColor(category),
        color: "#fff",
        // ...
    };
}
```

**체크리스트**:

-   [ ] 매직 컬러 0개 (모두 상수화)
-   [ ] 순수 함수 (부수 효과 없음)
-   [ ] 유닛 테스트 작성

### Step 2: 커스텀 훅 추출

#### 2.1 useRecordData.ts (~100줄)

```typescript
// features/work-record/hooks/useRecordData.ts

import { useMemo } from "react";
import type { WorkRecord } from "@/shared/types";

export interface UseRecordDataParams {
    records: WorkRecord[];
    selected_date: string;
    search_keyword: string;
    selected_category: string | null;
    show_completed: boolean;
}

export interface UseRecordDataResult {
    day_records: WorkRecord[];
    filtered_records: WorkRecord[];
    sorted_records: WorkRecord[];
}

/**
 * 레코드 데이터 가공 훅
 * 날짜 필터링 → 검색 필터링 → 카테고리 필터링 → 정렬
 */
export function useRecordData({
    records,
    selected_date,
    search_keyword,
    selected_category,
    show_completed,
}: UseRecordDataParams): UseRecordDataResult {
    // 1. 날짜 필터링
    const day_records = useMemo(() =>
        records.filter(r => r.date === selected_date && !r.is_deleted)
    , [records, selected_date]);

    // 2. 검색 필터링
    const filtered_records = useMemo(() => {
        let result = day_records;

        if (search_keyword) {
            result = result.filter(r => /* 검색 로직 */);
        }

        if (selected_category) {
            result = result.filter(r => r.category_name === selected_category);
        }

        if (!show_completed) {
            result = result.filter(r => !r.is_completed);
        }

        return result;
    }, [day_records, search_keyword, selected_category, show_completed]);

    // 3. 정렬
    const sorted_records = useMemo(() =>
        [...filtered_records].sort((a, b) => /* 정렬 로직 */)
    , [filtered_records]);

    return {
        day_records,
        filtered_records,
        sorted_records,
    };
}
```

**체크리스트**:

-   [ ] useMemo 의존성 정확히 명시
-   [ ] 타입 안전성 (any 금지)
-   [ ] 훅 테스트 작성 (renderHook)

#### 2.2 useRecordStats.ts (~80줄)

```typescript
// features/work-record/hooks/useRecordStats.ts

export interface RecordStats {
    total_duration: number;
    completed_count: number;
    incomplete_count: number;
    category_breakdown: Record<string, number>;
    today_vs_yesterday: {
        today: number;
        yesterday: number;
        diff: number;
    };
}

export function useRecordStats(
    records: WorkRecord[],
    selected_date: string,
    lunch_start: string,
    lunch_end: string
): RecordStats {
    return useMemo(() => {
        const today_records = records.filter(/* ... */);
        const yesterday_records = records.filter(/* ... */);

        return {
            total_duration: /* 계산 */,
            completed_count: /* 계산 */,
            // ...
        };
    }, [records, selected_date, lunch_start, lunch_end]);
}
```

### Step 3: 컬럼 렌더러 분리 ⚠️ **가장 중요!**

#### 3.1 ProjectCodeColumn.tsx (~80줄)

```typescript
// features/work-record/ui/RecordColumns/ProjectCodeColumn.tsx

interface ProjectCodeColumnProps {
    record: WorkRecord;
    is_editing: boolean;
    onEdit: (id: string) => void;
    onSave: (id: string, value: string) => void;
}

export function ProjectCodeColumn({
    record,
    is_editing,
    onEdit,
    onSave,
}: ProjectCodeColumnProps) {
    if (is_editing) {
        return (
            <AutoComplete
                value={record.project_code}
                onChange={(value) => onSave(record.id, value)}
                options={/* ... */}
                style={PROJECT_CODE_INPUT_STYLE}
            />
        );
    }

    return (
        <Tooltip title={record.project_code || PROJECT_CODE_EMPTY_TEXT}>
            <Text style={PROJECT_CODE_TEXT_STYLE}>
                {record.project_code || PROJECT_CODE_PLACEHOLDER}
            </Text>
        </Tooltip>
    );
}
```

**체크리스트**:

-   [ ] inline style 0개 (모두 상수)
-   [ ] 하드코딩 문구 0개 (모두 constants)
-   [ ] Props 타입 명시
-   [ ] 80줄 이하

#### 3.2 DurationColumn.tsx (~90줄)

```typescript
// features/work-record/ui/RecordColumns/DurationColumn.tsx

import { formatDuration } from "@/shared/lib/time";
import { getRecordDurationMinutes } from "../../lib/duration_calculator";

interface DurationColumnProps {
    record: WorkRecord;
    lunch_start: string;
    lunch_end: string;
}

export function DurationColumn({
    record,
    lunch_start,
    lunch_end,
}: DurationColumnProps) {
    const duration = getRecordDurationMinutes(record, lunch_start, lunch_end);

    return (
        <div style={DURATION_CONTAINER_STYLE}>
            <Text style={DURATION_TEXT_STYLE}>{formatDuration(duration)}</Text>
            {duration >= 480 && (
                <Badge
                    count={DURATION_OVERTIME_BADGE_TEXT}
                    style={DURATION_OVERTIME_BADGE_STYLE}
                />
            )}
        </div>
    );
}
```

**체크리스트**:

-   [ ] 순수 함수(lib/) 사용
-   [ ] inline style 0개
-   [ ] 매직 넘버 상수화 (480 → MINUTES_IN_8_HOURS)

#### 3.3 ActionsColumn.tsx (~80줄)

```typescript
// features/work-record/ui/RecordColumns/ActionsColumn.tsx

interface ActionsColumnProps {
    record: WorkRecord;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onComplete: (id: string) => void;
    onCopy: (id: string) => void;
}

export function ActionsColumn({
    record,
    onEdit,
    onDelete,
    onComplete,
    onCopy,
}: ActionsColumnProps) {
    return (
        <Space size="small">
            <Tooltip title={RECORD_ACTION_EDIT_TOOLTIP}>
                <Button
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record.id)}
                    size="small"
                />
            </Tooltip>

            <Popconfirm
                title={RECORD_ACTION_DELETE_CONFIRM_TITLE}
                description={RECORD_ACTION_DELETE_CONFIRM_DESC}
                onConfirm={() => onDelete(record.id)}
            >
                <Tooltip title={RECORD_ACTION_DELETE_TOOLTIP}>
                    <Button icon={<DeleteOutlined />} danger size="small" />
                </Tooltip>
            </Popconfirm>

            {/* ... */}
        </Space>
    );
}
```

**체크리스트**:

-   [ ] Popconfirm title/description 상수화
-   [ ] Tooltip title 상수화
-   [ ] 콜백 함수 명확히 타입 정의

### Step 4: 메인 컴포넌트 리팩토링

#### 4.1 RecordTable.tsx (최종 ~200줄)

```typescript
// features/work-record/ui/RecordTable/RecordTable.tsx

import { useRecordData } from "../../hooks/useRecordData";
import { useRecordStats } from "../../hooks/useRecordStats";
import { useRecordFilters } from "../../hooks/useRecordFilters";
import { useRecordActions } from "../../hooks/useRecordActions";
// ...

export function RecordTable() {
    const work_store = useWorkStore();

    // ✅ 훅으로 데이터 가공
    const { day_records, filtered_records, sorted_records } = useRecordData({
        records: work_store.records,
        selected_date: work_store.selected_date,
        search_keyword: filters.search,
        selected_category: filters.category,
        show_completed: filters.show_completed,
    });

    // ✅ 훅으로 통계 계산
    const stats = useRecordStats(
        sorted_records,
        work_store.selected_date,
        work_store.lunch_start_time,
        work_store.lunch_end_time
    );

    // ✅ 훅으로 필터 상태
    const filters = useRecordFilters();

    // ✅ 훅으로 액션 핸들러
    const actions = useRecordActions(work_store);

    // ✅ 컬럼 정의 (inline render 없음!)
    const columns = useMemo(
        () => [
            {
                title: RECORD_TABLE_COLUMN_PROJECT_CODE,
                dataIndex: "project_code",
                render: (_, record) => (
                    <ProjectCodeColumn
                        record={record}
                        is_editing={editing_id === record.id}
                        onEdit={actions.handleEdit}
                        onSave={actions.handleSave}
                    />
                ),
            },
            // ... 8개 컬럼 (각 10줄 이하)
        ],
        [editing_id, actions]
    );

    return (
        <div>
            <RecordTableHeader />
            <RecordFilters {...filters} />
            <DailyStats stats={stats} />

            <Table
                columns={columns}
                dataSource={sorted_records}
                rowKey="id"
                // ...
            />

            <RecordAddModal {...modals.add} />
            <RecordEditModal {...modals.edit} />
        </div>
    );
}
```

**최종 체크리스트**:

-   [ ] 메인 컴포넌트 200줄 이하
-   [ ] useMemo 내 JSX 0개
-   [ ] inline style 0개
-   [ ] 하드코딩 문구 0개
-   [ ] 모든 로직 훅/lib로 분리

---

## 4. 예상 성과

### 4.1 코드 품질 지표

| 지표               | Before  | After (예상)  | 목표 개선 |
| ------------------ | ------- | ------------- | --------- |
| **총 줄 수**       | 2,966줄 | 200줄         | **-93%**  |
| **컬럼 정의**      | 700줄   | 80줄 (10줄×8) | **-89%**  |
| **useMemo 내 JSX** | 8곳     | 0곳           | **-100%** |
| **inline style**   | 60개    | 0개           | **-100%** |
| **하드코딩 문구**  | 90개    | 0개           | **-100%** |
| **공통 컴포넌트**  | 0개     | +12개         | **+∞**    |

### 4.2 재사용 효과

| 컴포넌트               | 사용 횟수           | 절감 효과 |
| ---------------------- | ------------------- | --------- |
| `useWorkFormOptions`   | 재사용              | ~250줄    |
| `WorkRecordFormFields` | 재사용              | ~200줄    |
| `ProjectCodeColumn`    | 2곳 (Table, Mobile) | ~60줄     |
| `DurationColumn`       | 3곳                 | ~120줄    |
| `ActionsColumn`        | 2곳                 | ~80줄     |

---

## 5. 작업 체크리스트

### Phase 1: 순수 함수 추출 ✅

-   [ ] `duration_calculator.ts` 확장 (4개 함수)
-   [ ] `category_utils.ts` 신규 (2개 함수)
-   [ ] `record_filters.ts` 신규 (3개 함수)
-   [ ] `record_sorter.ts` 신규 (2개 함수)
-   [ ] 유닛 테스트 작성 (커버리지 100%)

### Phase 2: 커스텀 훅 추출 ✅

-   [ ] `useRecordData.ts` (데이터 가공)
-   [ ] `useRecordStats.ts` (통계 계산)
-   [ ] `useRecordFilters.ts` (필터 상태)
-   [ ] `useRecordModals.ts` (모달 상태)
-   [ ] `useRecordEdit.ts` (편집 상태)
-   [ ] `useRecordActions.ts` (액션 핸들러)
-   [ ] `useRecordForm.ts` (폼 제출)
-   [ ] 훅 테스트 작성

### Phase 3: 컬럼 렌더러 분리 ⚠️ **핵심**

-   [ ] `ProjectCodeColumn.tsx` (80줄)
-   [ ] `WorkNameColumn.tsx` (100줄)
-   [ ] `DurationColumn.tsx` (90줄)
-   [ ] `SessionsColumn.tsx` (120줄)
-   [ ] `CategoryColumn.tsx` (80줄)
-   [ ] `NoteColumn.tsx` (70줄)
-   [ ] `ActionsColumn.tsx` (80줄)
-   [ ] 컬럼 컴포넌트 테스트

### Phase 4: UI 컴포넌트 분리 ✅

-   [ ] `RecordTableHeader.tsx` (80줄)
-   [ ] `RecordFilters.tsx` (70줄)
-   [ ] `DailyStats.tsx` (80줄)
-   [ ] `RecordRow.tsx` (100줄)

### Phase 5: 메인 컴포넌트 최종화 ✅

-   [ ] `RecordTable.tsx` (200줄 이하)
-   [ ] 모든 체크리스트 확인
-   [ ] 테스트 실행 (914개 통과)
-   [ ] 린트 에러 0개

---

## 6. 참고

-   [PHASE8_OVERVIEW.md](PHASE8_OVERVIEW.md) - Phase 8 전체 계획
-   [01_DAILY_GANTT_CHART.md](01_DAILY_GANTT_CHART.md) - 이미 완료된 사례
-   [dev-guidelines.mdc](../../.cursor/rules/dev-guidelines.mdc) - 개발 가이드라인
-   [REFACTORING_PROGRESS.md](../REFACTORING_PROGRESS.md) - 진행 상황
