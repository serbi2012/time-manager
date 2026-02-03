# WeeklySchedule 분리 계획

> **현재**: 641줄 (src/components/WeeklySchedule.tsx)
> **목표**: 메인 컴포넌트 ~200줄 + 하위 모듈들

---

## 1. 현재 구조 분석

### 1.1 파일 위치

-   메인: `src/components/WeeklySchedule.tsx` (641줄)
-   기존 분리: `src/features/weekly-schedule/`

### 1.2 기존 features/weekly-schedule 구조

```
features/weekly-schedule/
├── index.ts
├── lib/
│   ├── index.ts
│   └── copy_formatter.ts     # ✅ 복사 형식 포매터
└── ui/
    ├── index.ts
    ├── CopyFormatSelector.tsx # ✅ 복사 형식 선택
    └── DayColumn.tsx         # ✅ 일별 컬럼
```

### 1.3 메인 컴포넌트 내부 구조

```typescript
// WeeklySchedule.tsx 주요 섹션

// 1. 임포트 (1-28줄) - ~28줄
// 2. 헬퍼 함수 (36-65줄) - ~30줄
//    - DAY_NAMES, formatMinutes

// 3. 타입 정의 (47-66줄) - ~20줄
//    - WorkGroup, DayGroup

// 4. 메인 컴포넌트 시작 (68줄~)

// 상태 (state)
- 주 선택 (72-75줄)
- 편집 상태 (77-82줄)
- 복사 형식 (84줄)
- 관리업무 숨기기 (86줄)

// 파생 데이터 (useMemo)
- week_dates (88-95줄)
- weekly_records (97-110줄)
- day_groups (112-250줄) - 가장 큰 로직 블록

// 핸들러 함수들 (~200줄)
- handleCopy (260-400줄)
- handleEditStatus (400-430줄)
- 기타 핸들러 (430-480줄)

// 렌더링 (~160줄)
- 헤더 (480-530줄)
- 주간 그리드 (530-641줄)
```

---

## 2. 분리 계획

### 2.1 목표 구조

```
features/weekly-schedule/
├── index.ts                       # Public API
├── model/
│   ├── index.ts                   # NEW
│   ├── types.ts                   # NEW: WorkGroup, DayGroup
│   └── constants.ts               # NEW: DAY_NAMES
├── lib/
│   ├── index.ts
│   ├── copy_formatter.ts          # ✅ 기존
│   ├── week_calculator.ts         # NEW: 주간 날짜 계산
│   └── work_grouper.ts            # NEW: 작업 그룹화 로직
├── hooks/
│   ├── index.ts                   # NEW
│   └── useWeeklyData.ts           # NEW: 주간 데이터 관리
└── ui/
    ├── index.ts
    ├── WeeklySchedule/            # NEW: 메인 컴포넌트
    │   ├── index.ts
    │   └── WeeklySchedule.tsx     # ~200줄
    ├── WeeklyHeader/              # NEW
    │   ├── index.ts
    │   └── WeeklyHeader.tsx       # 주 선택, 복사 버튼
    ├── WeeklyGrid/                # NEW
    │   ├── index.ts
    │   └── WeeklyGrid.tsx         # 주간 그리드
    ├── DayColumn.tsx              # ✅ 기존
    └── CopyFormatSelector.tsx     # ✅ 기존
```

### 2.2 분리 단계

#### Step 1: 타입/상수 정리 (model/)

| 항목      | 현재 위치           | 이동 위치          |
| --------- | ------------------- | ------------------ |
| WorkGroup | WeeklySchedule 내부 | model/types.ts     |
| DayGroup  | WeeklySchedule 내부 | model/types.ts     |
| DAY_NAMES | WeeklySchedule 내부 | model/constants.ts |

#### Step 2: 순수 함수 추출 (lib/)

| 함수명          | 현재 위치           | 이동 위치              |
| --------------- | ------------------- | ---------------------- |
| formatMinutes   | WeeklySchedule 내부 | shared/lib/time (기존) |
| week_dates 계산 | WeeklySchedule 내부 | lib/week_calculator.ts |
| day_groups 계산 | WeeklySchedule 내부 | lib/work_grouper.ts    |

#### Step 3: 훅 추출 (hooks/)

| 훅명          | 책임                     | 예상 줄 수 |
| ------------- | ------------------------ | ---------- |
| useWeeklyData | 주간 데이터 계산, 필터링 | ~100       |

#### Step 4: UI 컴포넌트 분리

| 컴포넌트명     | 책임                | 예상 줄 수 |
| -------------- | ------------------- | ---------- |
| WeeklySchedule | 메인 오케스트레이션 | ~200       |
| WeeklyHeader   | 주 선택, 복사 버튼  | ~100       |
| WeeklyGrid     | 주간 그리드 렌더링  | ~100       |

---

## 3. 상세 분리 계획

### 3.1 model/types.ts

```typescript
// 주간 일정 관련 타입

export interface WorkGroup {
    project_code: string;
    work_name: string;
    status: string;
    start_date: string;
    total_minutes: number;
    deals: {
        deal_name: string;
        total_minutes: number;
    }[];
}

export interface DayGroup {
    date: string;
    day_name: string;
    works: WorkGroup[];
}
```

### 3.2 lib/week_calculator.ts

```typescript
// 주간 날짜 계산 순수 함수

import dayjs, { Dayjs } from "dayjs";

/**
 * 주의 시작일(월요일)부터 7일간의 날짜 배열 생성
 */
export function getWeekDates(week_start: Dayjs): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        dates.push(week_start.add(i, "day").format("YYYY-MM-DD"));
    }
    return dates;
}

/**
 * 이전 주의 시작일 계산
 */
export function getPrevWeekStart(current: Dayjs): Dayjs {
    return current.subtract(1, "week");
}

/**
 * 다음 주의 시작일 계산
 */
export function getNextWeekStart(current: Dayjs): Dayjs {
    return current.add(1, "week");
}

/**
 * 현재 주의 시작일(월요일) 계산
 */
export function getCurrentWeekStart(): Dayjs {
    return dayjs().startOf("isoWeek");
}
```

### 3.3 lib/work_grouper.ts

```typescript
// 작업 그룹화 순수 함수

import type { WorkRecord } from "@/types";
import type { WorkGroup, DayGroup } from "../model/types";

/**
 * 레코드를 날짜별 → 작업별로 그룹화
 */
export function groupRecordsByDay(
    records: WorkRecord[],
    week_dates: string[],
    hide_management: boolean
): DayGroup[] {
    return week_dates.map((date) => {
        const day_records = records.filter(
            (r) => r.date === date || r.sessions?.some((s) => s.date === date)
        );

        // 관리업무 필터링
        const filtered = hide_management
            ? day_records.filter((r) => r.category_name !== "관리")
            : day_records;

        // 작업별 그룹화
        const works = groupByWork(filtered, date);

        return {
            date,
            day_name: DAY_NAMES[dayjs(date).day()],
            works,
        };
    });
}

function groupByWork(records: WorkRecord[], date: string): WorkGroup[] {
    // 작업별 그룹화 로직
    // ...
}

/**
 * 일별 총 시간 계산
 */
export function calculateDayTotal(day: DayGroup): number {
    return day.works.reduce((sum, w) => sum + w.total_minutes, 0);
}

/**
 * 주간 총 시간 계산
 */
export function calculateWeekTotal(days: DayGroup[]): number {
    return days.reduce((sum, d) => sum + calculateDayTotal(d), 0);
}
```

### 3.4 hooks/useWeeklyData.ts

```typescript
// 주간 데이터 관리 훅

export interface UseWeeklyDataOptions {
    hide_management?: boolean;
}

export interface UseWeeklyDataReturn {
    // 주 선택
    week_start: Dayjs;
    setWeekStart: (date: Dayjs) => void;
    goToPrevWeek: () => void;
    goToNextWeek: () => void;
    goToCurrentWeek: () => void;

    // 데이터
    week_dates: string[];
    day_groups: DayGroup[];
    week_total: number;

    // 필터
    hide_management: boolean;
    setHideManagement: (value: boolean) => void;
}

export function useWeeklyData(
    options: UseWeeklyDataOptions = {}
): UseWeeklyDataReturn {
    const { records } = useWorkStore();

    const [week_start, setWeekStart] = useState(getCurrentWeekStart());
    const [hide_management, setHideManagement] = useState(
        options.hide_management ?? false
    );

    const week_dates = useMemo(() => getWeekDates(week_start), [week_start]);

    const weekly_records = useMemo(() => {
        const start = week_dates[0];
        const end = week_dates[6];
        return records.filter((r) => r.date >= start && r.date <= end);
    }, [records, week_dates]);

    const day_groups = useMemo(
        () => groupRecordsByDay(weekly_records, week_dates, hide_management),
        [weekly_records, week_dates, hide_management]
    );

    const week_total = useMemo(
        () => calculateWeekTotal(day_groups),
        [day_groups]
    );

    const goToPrevWeek = useCallback(() => {
        setWeekStart((prev) => getPrevWeekStart(prev));
    }, []);

    const goToNextWeek = useCallback(() => {
        setWeekStart((prev) => getNextWeekStart(prev));
    }, []);

    const goToCurrentWeek = useCallback(() => {
        setWeekStart(getCurrentWeekStart());
    }, []);

    return {
        week_start,
        setWeekStart,
        goToPrevWeek,
        goToNextWeek,
        goToCurrentWeek,
        week_dates,
        day_groups,
        week_total,
        hide_management,
        setHideManagement,
    };
}
```

### 3.5 ui/WeeklySchedule/WeeklySchedule.tsx (메인)

```typescript
// 메인 컴포넌트 (~200줄)

export default function WeeklySchedule() {
    const { is_mobile } = useResponsive();

    const {
        week_start,
        goToPrevWeek,
        goToNextWeek,
        goToCurrentWeek,
        week_dates,
        day_groups,
        week_total,
        hide_management,
        setHideManagement,
    } = useWeeklyData();

    const [copy_format, setCopyFormat] = useState<1 | 2>(2);
    const [editable_data, setEditableData] = useState<
        Record<string, { status: string }>
    >({});

    const handleCopy = useCallback(() => {
        const formatted = formatForCopy(day_groups, copy_format, editable_data);
        navigator.clipboard.writeText(formatted);
        message.success("클립보드에 복사되었습니다");
    }, [day_groups, copy_format, editable_data]);

    return (
        <Layout>
            <Content style={{ padding: is_mobile ? 8 : 24 }}>
                <WeeklyHeader
                    week_start={week_start}
                    onPrevWeek={goToPrevWeek}
                    onNextWeek={goToNextWeek}
                    onCurrentWeek={goToCurrentWeek}
                    onCopy={handleCopy}
                    copy_format={copy_format}
                    onCopyFormatChange={setCopyFormat}
                    hide_management={hide_management}
                    onHideManagementChange={setHideManagement}
                />

                <WeeklyGrid
                    day_groups={day_groups}
                    week_dates={week_dates}
                    editable_data={editable_data}
                    onEditStatus={(key, status) =>
                        setEditableData((prev) => ({
                            ...prev,
                            [key]: { status },
                        }))
                    }
                />

                <Card>
                    <Text strong>주간 총계: {formatDuration(week_total)}</Text>
                </Card>
            </Content>
        </Layout>
    );
}
```

### 3.6 ui/WeeklyHeader/WeeklyHeader.tsx

```typescript
// 주간 헤더 (~100줄)

interface WeeklyHeaderProps {
    week_start: Dayjs;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onCurrentWeek: () => void;
    onCopy: () => void;
    copy_format: 1 | 2;
    onCopyFormatChange: (format: 1 | 2) => void;
    hide_management: boolean;
    onHideManagementChange: (value: boolean) => void;
}

export function WeeklyHeader({
    week_start,
    onPrevWeek,
    onNextWeek,
    onCurrentWeek,
    onCopy,
    copy_format,
    onCopyFormatChange,
    hide_management,
    onHideManagementChange,
}: WeeklyHeaderProps) {
    const week_end = week_start.add(6, "day");

    return (
        <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
                <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                >
                    <Title level={4}>
                        {week_start.format("YYYY.MM.DD")} ~{" "}
                        {week_end.format("MM.DD")}
                    </Title>
                    <Space>
                        <Button icon={<LeftOutlined />} onClick={onPrevWeek} />
                        <Button
                            icon={<CalendarOutlined />}
                            onClick={onCurrentWeek}
                        >
                            이번 주
                        </Button>
                        <Button icon={<RightOutlined />} onClick={onNextWeek} />
                    </Space>
                </div>

                <Divider />

                <Space>
                    <CopyFormatSelector
                        value={copy_format}
                        onChange={onCopyFormatChange}
                    />
                    <Button icon={<CopyOutlined />} onClick={onCopy}>
                        복사
                    </Button>
                    <Checkbox
                        checked={hide_management}
                        onChange={(e) =>
                            onHideManagementChange(e.target.checked)
                        }
                    >
                        관리업무 숨기기
                    </Checkbox>
                </Space>
            </Space>
        </Card>
    );
}
```

---

## 4. 마이그레이션 체크리스트

### 4.1 타입/상수 정리

-   [ ] `model/types.ts` 생성
-   [ ] `model/constants.ts` 생성

### 4.2 순수 함수 추출

-   [ ] `lib/week_calculator.ts` 생성
    -   [ ] getWeekDates, getPrevWeekStart 등
    -   [ ] 테스트 작성
-   [ ] `lib/work_grouper.ts` 생성
    -   [ ] groupRecordsByDay 함수
    -   [ ] 테스트 작성

### 4.3 훅 추출

-   [ ] `hooks/useWeeklyData.ts` 생성
    -   [ ] 테스트 작성

### 4.4 UI 컴포넌트 분리

-   [ ] `ui/WeeklySchedule/` 생성
-   [ ] `ui/WeeklyHeader/` 생성
-   [ ] `ui/WeeklyGrid/` 생성

### 4.5 정리

-   [ ] index.ts 업데이트
-   [ ] 기존 `components/WeeklySchedule.tsx` 삭제
-   [ ] import 경로 업데이트
-   [ ] 테스트 마이그레이션

---

## 5. 예상 결과

### 5.1 줄 수 비교

| 항목                  | Before | After |
| --------------------- | ------ | ----- |
| WeeklySchedule.tsx    | 641    | -     |
| WeeklySchedule (메인) | -      | ~200  |
| model/\*.ts           | -      | ~40   |
| lib/\*.ts             | 기존   | +100  |
| hooks/\*.ts           | -      | ~100  |
| ui/WeeklyHeader       | -      | ~100  |
| ui/WeeklyGrid         | -      | ~100  |
| **총계**              | 641    | ~640  |

### 5.2 개선 효과

-   날짜 계산 로직 재사용 가능
-   그룹화 로직 테스트 가능
-   헤더/그리드 독립적 관리

---

## 참고

-   [PHASE8_OVERVIEW.md](./PHASE8_OVERVIEW.md) - 전체 개요
-   기존 features/weekly-schedule 활용
