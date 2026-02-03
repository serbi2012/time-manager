# WorkRecordTable 분리 계획

> **현재**: 2,966줄 (src/components/WorkRecordTable.tsx)
> **목표**: 메인 컴포넌트 ~300줄 + 하위 모듈들

---

## 1. 현재 구조 분석

### 1.1 파일 위치

-   메인: `src/components/WorkRecordTable.tsx` (2,966줄)
-   기존 분리: `src/features/work-record/`

### 1.2 기존 features/work-record 구조

```
features/work-record/
├── index.ts
├── model/
│   └── types.ts              # RecordSlice 타입
├── lib/
│   ├── index.ts
│   ├── conflict_detector.ts  # 충돌 감지
│   ├── duration_calculator.ts # 시간 계산
│   ├── record_merger.ts      # 레코드 병합
│   └── types.ts
└── ui/
    ├── index.ts
    ├── CompletedRecords/
    │   ├── index.ts
    │   ├── CompletedModal.tsx
    │   └── TrashModal.tsx
    ├── MobileRecordCard/
    │   ├── index.ts
    │   └── MobileRecordCard.tsx
    ├── RecordTable/
    │   ├── index.ts
    │   ├── RecordActions.tsx
    │   └── RecordTableHeader.tsx
    └── SessionEditor/
        ├── index.ts
        └── SessionEditTable.tsx
```

### 1.3 메인 컴포넌트 내부 구조

```typescript
// WorkRecordTable.tsx 주요 섹션

// 1. 임포트 (1-63줄) - ~63줄
// 2. 헬퍼 함수 (64-160줄) - ~97줄
//    - getCategoryColor
//    - getSessionDurationMinutes
//    - getRecordDurationMinutes
//    - getRecordDurationMinutesForDate

// 3. 메인 컴포넌트 시작 (162줄~)

// 상태 (state)
- 검색/필터 상태 (180-200줄)
- 모달 상태 (200-230줄)
- 편집 상태 (230-260줄)
- 타이머 관련 (260-290줄)

// 파생 데이터 (useMemo)
- day_records, filtered_records (300-400줄)
- 통계 계산 (400-500줄)
- 테이블 컬럼 정의 (500-1200줄) - 가장 큰 부분!

// 핸들러 함수들 (~800줄)
- handleEdit/Delete/Complete (1200-1400줄)
- handleTimerStart/Stop (1400-1600줄)
- handleCopy/Move (1600-1800줄)
- handleFormSubmit (1800-2000줄)

// 렌더링 (~900줄)
- 헤더/필터 영역 (2100-2300줄)
- 테이블 영역 (2300-2600줄)
- 모달들 (2600-2900줄)
```

---

## 2. 분리 계획

### 2.1 목표 구조

```
features/work-record/
├── index.ts                       # Public API
├── model/
│   ├── index.ts
│   ├── types.ts                   # ✅ 기존 + 확장
│   └── constants.ts               # NEW: 카테고리 색상 등
├── lib/
│   ├── index.ts
│   ├── conflict_detector.ts       # ✅ 기존
│   ├── duration_calculator.ts     # ✅ 기존
│   ├── record_merger.ts           # ✅ 기존
│   ├── record_filters.ts          # NEW: 필터링 함수
│   ├── record_sorter.ts           # NEW: 정렬 함수
│   └── statistics.ts              # NEW: 통계 계산
├── hooks/
│   ├── index.ts
│   ├── useRecordTable.ts          # NEW: @tanstack/react-table 설정
│   ├── useRecordFilters.ts        # NEW: 필터 상태 관리
│   ├── useRecordSelection.ts      # NEW: 선택 상태 관리
│   ├── useRecordTimer.ts          # NEW: 타이머 연동
│   └── useRecordStats.ts          # NEW: 통계 계산 훅
└── ui/
    ├── index.ts
    ├── WorkRecordTable/           # 메인 컴포넌트
    │   ├── index.ts
    │   └── WorkRecordTable.tsx    # ~300줄 (오케스트레이션)
    ├── RecordTable/               # ✅ 기존 확장
    │   ├── index.ts
    │   ├── RecordActions.tsx      # ✅ 기존
    │   ├── RecordTableHeader.tsx  # ✅ 기존
    │   ├── RecordRow.tsx          # NEW: 행 렌더링
    │   └── RecordCell.tsx         # NEW: 셀 렌더링
    ├── RecordColumns/             # NEW: 컬럼 정의
    │   ├── index.ts
    │   ├── TimeColumn.tsx         # 시간 컬럼
    │   ├── DurationColumn.tsx     # 소요시간 컬럼
    │   ├── StatusColumn.tsx       # 상태 컬럼 (타이머 등)
    │   └── ActionsColumn.tsx      # 액션 버튼 컬럼
    ├── RecordFilters/             # NEW: 필터 UI
    │   ├── index.ts
    │   ├── SearchFilter.tsx       # 검색 필터
    │   ├── DateFilter.tsx         # 날짜 필터
    │   └── CategoryFilter.tsx     # 카테고리 필터
    ├── RecordStats/               # NEW: 통계 UI
    │   ├── index.ts
    │   ├── DailyStats.tsx         # 일간 통계
    │   └── StatsSummary.tsx       # 요약 통계
    ├── RecordModals/              # NEW: 모달 통합
    │   ├── index.ts
    │   ├── RecordEditModal.tsx    # 수정 모달
    │   └── RecordQuickEdit.tsx    # 인라인 편집
    ├── CompletedRecords/          # ✅ 기존 유지
    ├── MobileRecordCard/          # ✅ 기존 유지
    └── SessionEditor/             # ✅ 기존 유지
```

### 2.2 분리 단계

#### Step 1: 순수 함수 추출 (lib/)

| 함수명                    | 현재 위치            | 이동 위치                  | 줄 수 |
| ------------------------- | -------------------- | -------------------------- | ----- |
| getCategoryColor          | WorkRecordTable 내부 | model/constants.ts         | ~15   |
| getSessionDurationMinutes | WorkRecordTable 내부 | lib/duration_calculator.ts | ~15   |
| getRecordDurationMinutes  | WorkRecordTable 내부 | lib/duration_calculator.ts | ~30   |
| 필터링 로직               | WorkRecordTable 내부 | lib/record_filters.ts      | ~50   |
| 정렬 로직                 | WorkRecordTable 내부 | lib/record_sorter.ts       | ~30   |
| 통계 계산                 | WorkRecordTable 내부 | lib/statistics.ts          | ~80   |

#### Step 2: 커스텀 훅 추출 (hooks/)

| 훅명               | 책임                       | 예상 줄 수 |
| ------------------ | -------------------------- | ---------- |
| useRecordTable     | @tanstack/react-table 설정 | ~150       |
| useRecordFilters   | 필터 상태 관리             | ~80        |
| useRecordSelection | 선택 상태 관리             | ~60        |
| useRecordTimer     | 타이머 연동                | ~100       |
| useRecordStats     | 통계 계산                  | ~60        |

#### Step 3: UI 컴포넌트 분리 (ui/)

| 컴포넌트명      | 책임                        | 예상 줄 수 |
| --------------- | --------------------------- | ---------- |
| WorkRecordTable | 메인 오케스트레이션         | ~300       |
| RecordRow       | 행 렌더링                   | ~100       |
| TimeColumn      | 시간 컬럼                   | ~80        |
| DurationColumn  | 소요시간 컬럼 (타이머 표시) | ~100       |
| StatusColumn    | 상태 컬럼                   | ~60        |
| ActionsColumn   | 액션 버튼 컬럼              | ~80        |
| SearchFilter    | 검색 필터                   | ~60        |
| DateFilter      | 날짜 필터                   | ~80        |
| DailyStats      | 일간 통계                   | ~100       |
| RecordEditModal | 수정 모달                   | ~150       |

---

## 3. 상세 분리 계획

### 3.1 lib/record_filters.ts

```typescript
// 레코드 필터링 순수 함수

export interface RecordFilterOptions {
  search_text?: string;
  category?: string;
  date_range?: [string, string];
  include_completed?: boolean;
  include_deleted?: boolean;
}

export function filterRecords(
  records: WorkRecord[],
  options: RecordFilterOptions
): WorkRecord[] { ... }

export function filterBySearchText(
  records: WorkRecord[],
  search_text: string
): WorkRecord[] { ... }

export function filterByDate(
  records: WorkRecord[],
  target_date: string
): WorkRecord[] { ... }
```

### 3.2 hooks/useRecordTable.ts

```typescript
// @tanstack/react-table 기반 테이블 훅

import { useReactTable, getCoreRowModel, ... } from '@tanstack/react-table';

export interface UseRecordTableOptions {
  records: WorkRecord[];
  columns: ColumnDef<WorkRecord>[];
  onRowClick?: (record: WorkRecord) => void;
  onSelectionChange?: (ids: string[]) => void;
}

export function useRecordTable(options: UseRecordTableOptions) {
  const table = useReactTable({
    data: options.records,
    columns: options.columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // ...
  });

  return {
    table,
    // 편의 메서드들
    selectedRows: ...,
    sortedRecords: ...,
  };
}
```

### 3.3 ui/WorkRecordTable/WorkRecordTable.tsx (메인)

```typescript
// 메인 컴포넌트 (~300줄)

export default function WorkRecordTable() {
  // 1. 훅 사용
  const { filtered_records, stats } = useRecordStats();
  const { filters, setFilters } = useRecordFilters();
  const { table, selectedRows } = useRecordTable({ records: filtered_records, columns });
  const { timer_state, handleTimerToggle } = useRecordTimer();

  // 2. 모달 상태
  const [modal_state, setModalState] = useState<ModalState>({ ... });

  // 3. 렌더링 (컴포넌트 조합)
  return (
    <Card>
      {/* 헤더 영역 */}
      <RecordTableHeader
        onAdd={() => setModalState({ ...modal_state, add_visible: true })}
        onShowCompleted={() => ...}
      />

      {/* 필터 영역 */}
      <RecordFilters
        filters={filters}
        onChange={setFilters}
      />

      {/* 통계 영역 */}
      <DailyStats stats={stats} />

      {/* 테이블 영역 */}
      <Table
        columns={columns}
        dataSource={table.getRowModel().rows}
        // ...
      />

      {/* 모달들 */}
      <RecordEditModal ... />
      <CompletedModal ... />
      <TrashModal ... />
    </Card>
  );
}
```

### 3.4 ui/RecordColumns/DurationColumn.tsx

```typescript
// 소요시간 컬럼 (타이머 표시 포함)

interface DurationColumnProps {
    record: WorkRecord;
    timer?: TimerState;
    onTimerToggle?: (record_id: string) => void;
}

export function DurationColumn({
    record,
    timer,
    onTimerToggle,
}: DurationColumnProps) {
    const is_running = timer?.record_id === record.id && timer?.is_running;
    const duration = getRecordDurationMinutes(record);

    return (
        <Space>
            {is_running ? (
                <AnimatedNumber value={timer.elapsed_seconds} format="timer" />
            ) : (
                <Text>{formatDuration(duration)}</Text>
            )}
            {onTimerToggle && (
                <Button
                    icon={
                        is_running ? (
                            <PauseCircleOutlined />
                        ) : (
                            <PlayCircleOutlined />
                        )
                    }
                    onClick={() => onTimerToggle(record.id)}
                />
            )}
        </Space>
    );
}
```

---

## 4. @tanstack/react-table 도입

### 4.1 현재 컬럼 정의 (Ant Design Table)

현재 ~700줄의 컬럼 정의가 있음:

-   project_code, work_name, task_name, deal_name, category_name
-   start_time, end_time, duration_minutes
-   actions (타이머, 편집, 삭제, 복사 등)

### 4.2 새 컬럼 정의 (@tanstack/react-table)

```typescript
// features/work-record/hooks/useRecordColumns.ts

export function useRecordColumns(): ColumnDef<WorkRecord>[] {
    return useMemo(
        () => [
            {
                id: "project_code",
                header: "프로젝트",
                accessorKey: "project_code",
                cell: ({ getValue }) => <ProjectCell value={getValue()} />,
            },
            {
                id: "work_name",
                header: "작업명",
                accessorKey: "work_name",
                cell: ({ getValue, row }) => (
                    <HighlightText text={getValue()} search={search_text} />
                ),
            },
            {
                id: "duration",
                header: "소요시간",
                accessorFn: (row) => getRecordDurationMinutes(row),
                cell: ({ row }) => <DurationColumn record={row.original} />,
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => <ActionsColumn record={row.original} />,
            },
            // ...
        ],
        [search_text]
    );
}
```

### 4.3 마이그레이션 전략

1. 먼저 @tanstack/react-table 기반 훅 생성
2. 기존 Ant Design Table과 병행 운영 (feature flag)
3. 테스트 후 완전 전환
4. Ant Design Table 코드 제거

---

## 5. 공통 컴포넌트 활용

### 5.1 이미 사용 가능한 공통 자원

| 공통 자원            | 사용 위치                  |
| -------------------- | -------------------------- |
| SelectWithAdd        | RecordEditModal            |
| AutoCompleteWithHide | RecordEditModal            |
| FormModal            | RecordEditModal            |
| RecordListModal      | CompletedModal, TrashModal |
| formatDuration       | DurationColumn             |
| AnimatedNumber       | 타이머 표시                |
| HighlightText        | 검색 결과 하이라이트       |

### 5.2 Phase 8에서 추가 활용 예정

| 공통 자원      | 사용 위치              |
| -------------- | ---------------------- |
| WorkFormFields | RecordEditModal        |
| DataTable      | 테이블 렌더링 (선택적) |

---

## 6. 마이그레이션 체크리스트

### 6.1 순수 함수 추출

-   [ ] `lib/record_filters.ts` 생성
    -   [ ] filterRecords 함수
    -   [ ] filterBySearchText 함수
    -   [ ] 테스트 작성
-   [ ] `lib/record_sorter.ts` 생성
    -   [ ] sortRecords 함수
    -   [ ] 테스트 작성
-   [ ] `lib/statistics.ts` 생성
    -   [ ] calculateDailyStats 함수
    -   [ ] 테스트 작성
-   [ ] `model/constants.ts` 생성
    -   [ ] CATEGORY_COLORS
    -   [ ] 기타 상수

### 6.2 훅 추출

-   [ ] `hooks/useRecordTable.ts` 생성
    -   [ ] @tanstack/react-table 설정
    -   [ ] 테스트 작성
-   [ ] `hooks/useRecordFilters.ts` 생성
    -   [ ] 필터 상태 관리
    -   [ ] 테스트 작성
-   [ ] `hooks/useRecordSelection.ts` 생성
    -   [ ] 선택 상태 관리
    -   [ ] 테스트 작성
-   [ ] `hooks/useRecordTimer.ts` 생성
    -   [ ] 타이머 연동 로직
    -   [ ] 테스트 작성
-   [ ] `hooks/useRecordStats.ts` 생성
    -   [ ] 통계 계산 로직
    -   [ ] 테스트 작성

### 6.3 UI 컴포넌트 분리

-   [ ] `ui/WorkRecordTable/` 생성
    -   [ ] 메인 컴포넌트 (~300줄)
-   [ ] `ui/RecordColumns/` 생성
    -   [ ] TimeColumn.tsx
    -   [ ] DurationColumn.tsx
    -   [ ] StatusColumn.tsx
    -   [ ] ActionsColumn.tsx
-   [ ] `ui/RecordFilters/` 생성
    -   [ ] SearchFilter.tsx
    -   [ ] DateFilter.tsx
    -   [ ] CategoryFilter.tsx
-   [ ] `ui/RecordStats/` 생성
    -   [ ] DailyStats.tsx
    -   [ ] StatsSummary.tsx
-   [ ] `ui/RecordModals/` 생성
    -   [ ] RecordEditModal.tsx

### 6.4 정리

-   [ ] index.ts 업데이트
-   [ ] 기존 `components/WorkRecordTable.tsx` 삭제
-   [ ] import 경로 업데이트 (사용처)
-   [ ] 테스트 마이그레이션
-   [ ] 스토리북 스토리 작성

---

## 7. 테스트 계획

### 7.1 순수 함수 테스트

```typescript
// test/unit/features/work-record/lib/record_filters.test.ts
describe('filterRecords', () => {
  it('검색어로 필터링한다', () => { ... });
  it('카테고리로 필터링한다', () => { ... });
  it('날짜 범위로 필터링한다', () => { ... });
});

// test/unit/features/work-record/lib/statistics.test.ts
describe('calculateDailyStats', () => {
  it('일간 총 시간을 계산한다', () => { ... });
  it('카테고리별 시간을 계산한다', () => { ... });
});
```

### 7.2 훅 테스트

```typescript
// test/hooks/features/work-record/useRecordTable.test.ts
describe('useRecordTable', () => {
  it('정렬이 적용된다', () => { ... });
  it('필터가 적용된다', () => { ... });
  it('선택이 동작한다', () => { ... });
});
```

### 7.3 컴포넌트 테스트

```typescript
// test/component/features/work-record/WorkRecordTable.test.tsx
describe('WorkRecordTable', () => {
  it('레코드가 테이블에 렌더링된다', () => { ... });
  it('검색 필터가 동작한다', () => { ... });
  it('타이머 시작/정지가 동작한다', () => { ... });
});
```

---

## 8. 예상 결과

### 8.1 줄 수 비교

| 항목                    | Before | After  |
| ----------------------- | ------ | ------ |
| WorkRecordTable.tsx     | 2,966  | -      |
| WorkRecordTable (메인)  | -      | ~300   |
| lib/\*.ts (순수 함수)   | 기존   | +160   |
| hooks/\*.ts             | -      | ~450   |
| ui/RecordColumns/\*.tsx | -      | ~320   |
| ui/RecordFilters/\*.tsx | -      | ~200   |
| ui/RecordStats/\*.tsx   | -      | ~150   |
| ui/RecordModals/\*.tsx  | -      | ~150   |
| **총계**                | 2,966  | ~1,730 |

### 8.2 개선 효과

-   테이블 로직: @tanstack/react-table로 표준화
-   컬럼 정의: 재사용 가능한 컴포넌트로 분리
-   필터 로직: 순수 함수로 테스트 용이
-   통계 계산: 별도 훅으로 분리

---

## 참고

-   [PHASE8_OVERVIEW.md](./PHASE8_OVERVIEW.md) - 전체 개요
-   [@tanstack/react-table 문서](https://tanstack.com/table/latest)
