# WeeklySchedule 분리 계획

> **현재**: 641줄 (src/components/WeeklySchedule.tsx)  
> **목표**: 메인 컴포넌트 ~150줄 + 하위 모듈들  
> **예상 감소율**: **-77%**

---

## 0. ⚠️ 적용할 엄격한 리팩토링 기준 (Phase 1~7 확립)

### 핵심 원칙

✅ **useMemo 내 JSX 100% 금지** - 모두 별도 컴포넌트로  
✅ **inline style 완전 금지** - 모두 constants로  
✅ **사용자 문구 100% 상수화** - 하드코딩 0개  
✅ **컬럼 렌더러 별도 컴포넌트** - 각 80줄 이하  
✅ **한 파일 = 한 컴포넌트** - SRP 엄격 준수

---

## 1. 현재 구조 분석

### 1.1 기존 분리 상태

```
features/weekly-schedule/
├── lib/
│   ├── copy_formatter.ts      # ✅ 복사 포맷 생성
│   └── statistics.ts          # ✅ 주간 통계
└── ui/
    ├── DayColumn.tsx          # ✅ 일자별 컬럼
    └── CopyFormatSelector.tsx # ✅ 복사 포맷 선택
```

### 1.2 메인 컴포넌트 분석

```typescript
// WeeklySchedule.tsx (641줄)

// ───────────────────────────────────────────
// 1. 임포트 (1-28줄) - 28줄
// ───────────────────────────────────────────

// ───────────────────────────────────────────
// 2. 메인 컴포넌트 (30-641줄) - ~611줄
// ───────────────────────────────────────────

// 상태 (~60줄)
- 주간 날짜 계산 (40-80줄)
- 복사 포맷 상태 (80-100줄)

// ⚠️ 파생 데이터 (useMemo) - ~200줄
- 주간 레코드 필터링 (100-180줄)
  ❌ 각 날짜별 inline 계산 (7일 × 30줄 = 210줄)

// 렌더링 (~400줄)
- 헤더 (200-280줄) - 80줄
  ✅ WeeklyHeader 컴포넌트로

- 테이블 (280-600줄) - 320줄
  ❌ 각 날짜 컬럼 inline (7일 × 45줄)
  ✅ DayColumn 이미 있지만 더 활용
```

---

## 2. 분리 계획

### 2.1 목표 구조

```
features/weekly-schedule/
├── index.ts
│
├── constants/
│   ├── index.ts
│   ├── labels.ts              # NEW: UI 레이블
│   └── config.ts              # NEW: 설정
│
├── lib/
│   ├── index.ts
│   ├── copy_formatter.ts      # ✅ 기존
│   ├── statistics.ts          # ✅ 기존
│   └── week_calculator.ts     # NEW: 주간 계산
│       ├── getWeekDates()
│       ├── getWeekRange()
│       └── getDayRecords()
│
├── hooks/
│   ├── index.ts
│   ├── useWeeklyData.ts       # NEW: 주간 데이터 (~80줄)
│   ├── useWeeklyStats.ts      # NEW: 주간 통계 (~60줄)
│   └── useCopyFormat.ts       # NEW: 복사 포맷 (~40줄)
│
└── ui/
    ├── index.ts
    │
    ├── WeeklySchedule/        # NEW: 메인 컴포넌트
    │   ├── index.ts
    │   ├── WeeklySchedule.tsx # ✅ 메인 (~150줄)
    │   ├── WeeklyHeader.tsx   # NEW: 헤더 (~80줄)
    │   └── WeeklyTable.tsx    # NEW: 테이블 (~120줄)
    │
    ├── DayColumn/
    │   ├── index.ts
    │   ├── DayColumn.tsx      # ✅ 기존 확장
    │   ├── DayHeader.tsx      # NEW (~40줄)
    │   └── DayRecordList.tsx  # NEW (~60줄)
    │
    └── CopyFormatSelector/
        ├── index.ts
        └── CopyFormatSelector.tsx # ✅ 기존
```

---

## 3. 단계별 작업

### Step 1: 순수 함수 추출 ✅

```typescript
// features/weekly-schedule/lib/week_calculator.ts

export function getWeekDates(base_date: string): string[] {
    // 주간 날짜 배열 반환 (7일)
}

export function getWeekRange(base_date: string): {
    start: string;
    end: string;
} {
    // 주간 시작/끝 날짜
}

export function getDayRecords(
    records: WorkRecord[],
    date: string
): WorkRecord[] {
    // 특정 날짜 레코드 필터링
}
```

**체크리스트**:

-   [ ] 순수 함수 (외부 상태 참조 0개)
-   [ ] 유닛 테스트 작성
-   [ ] 타입 명시

### Step 2: 커스텀 훅 추출 ✅

```typescript
// features/weekly-schedule/hooks/useWeeklyData.ts

export function useWeeklyData(selected_date: string) {
    const { records } = useWorkStore();

    const week_dates = useMemo(
        () => getWeekDates(selected_date),
        [selected_date]
    );

    const daily_records = useMemo(
        () =>
            week_dates.map((date) => ({
                date,
                records: getDayRecords(records, date),
            })),
        [records, week_dates]
    );

    return {
        week_dates,
        daily_records,
    };
}
```

### Step 3: UI 컴포넌트 분리 ✅

#### 3.1 WeeklyHeader.tsx (~80줄)

```typescript
// features/weekly-schedule/ui/WeeklySchedule/WeeklyHeader.tsx

export function WeeklyHeader({ week_range, onPrev, onNext }: Props) {
    return (
        <div style={WEEKLY_HEADER_CONTAINER_STYLE}>
            <Button onClick={onPrev} icon={<LeftOutlined />} />

            <Text style={WEEKLY_HEADER_TITLE_STYLE}>
                {WEEKLY_HEADER_TITLE_FORMAT(week_range.start, week_range.end)}
            </Text>

            <Button onClick={onNext} icon={<RightOutlined />} />

            <CopyFormatSelector />
        </div>
    );
}
```

**체크리스트**:

-   [ ] 80줄 이하
-   [ ] inline style 0개
-   [ ] 하드코딩 문구 0개

#### 3.2 WeeklyTable.tsx (~120줄)

```typescript
// features/weekly-schedule/ui/WeeklySchedule/WeeklyTable.tsx

export function WeeklyTable({ daily_records }: Props) {
    return (
        <div style={WEEKLY_TABLE_CONTAINER_STYLE}>
            {daily_records.map(({ date, records }) => (
                <DayColumn key={date} date={date} records={records} />
            ))}
        </div>
    );
}
```

### Step 4: 메인 컴포넌트 최종화 ✅

```typescript
// features/weekly-schedule/ui/WeeklySchedule/WeeklySchedule.tsx (~150줄)

export function WeeklySchedule() {
    const { selected_date } = useWorkStore();

    // ✅ 훅으로 데이터 가공
    const data = useWeeklyData(selected_date);
    const stats = useWeeklyStats(data.daily_records);
    const copy_format = useCopyFormat();

    return (
        <div>
            <WeeklyHeader
                week_range={data.week_range}
                onPrev={/* ... */}
                onNext={/* ... */}
            />

            <WeeklyTable daily_records={data.daily_records} />

            <WeeklyStats stats={stats} />
        </div>
    );
}
```

---

## 4. 예상 성과

| 지표              | Before | After (예상) | 목표 개선 |
| ----------------- | ------ | ------------ | --------- |
| **총 줄 수**      | 641줄  | 150줄        | **-77%**  |
| **inline 계산**   | 210줄  | 0줄 (훅으로) | **-100%** |
| **inline style**  | 25개   | 0개          | **-100%** |
| **하드코딩 문구** | 40개   | 0개          | **-100%** |

---

## 5. 작업 체크리스트

-   [ ] `week_calculator.ts` 신규 (3개 함수)
-   [ ] `useWeeklyData.ts` 훅 (데이터 가공)
-   [ ] `useWeeklyStats.ts` 훅 (통계 계산)
-   [ ] `WeeklyHeader.tsx` (80줄)
-   [ ] `WeeklyTable.tsx` (120줄)
-   [ ] `WeeklySchedule.tsx` (150줄)
-   [ ] 테스트 작성
-   [ ] 린트 확인

---

## 6. 참고

-   [PHASE8_OVERVIEW.md](PHASE8_OVERVIEW.md)
-   [01_DAILY_GANTT_CHART.md](01_DAILY_GANTT_CHART.md)
