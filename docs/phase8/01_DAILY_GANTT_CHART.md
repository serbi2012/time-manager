# DailyGanttChart 분리 계획

> **현재**: 2,918줄 (src/components/DailyGanttChart.tsx)
> **목표**: 메인 컴포넌트 ~300줄 + 하위 모듈들

---

## 1. 현재 구조 분석

### 1.1 파일 위치

-   메인: `src/components/DailyGanttChart.tsx` (2,918줄)
-   기존 분리: `src/features/gantt-chart/`

### 1.2 기존 features/gantt-chart 구조

```
features/gantt-chart/
├── index.ts
├── lib/
│   ├── index.ts
│   ├── slot_calculator.ts    # groupRecordsByDealName, collectOccupiedSlots
│   ├── drag_handler.ts       # handleDragStart, calculateDragResult
│   └── types.ts              # GroupedWork, DragSelection 등
└── ui/
    ├── index.ts
    ├── GanttChart/
    │   ├── index.ts
    │   ├── GanttBar.tsx      # 바 컴포넌트
    │   ├── GanttRow.tsx      # 행 컴포넌트
    │   ├── LunchOverlay.tsx  # 점심시간 오버레이
    │   └── TimeAxis.tsx      # 시간축
    └── ResizeHandle/
        ├── index.ts
        └── ResizeHandle.tsx
```

### 1.3 메인 컴포넌트 내부 구조

```typescript
// DailyGanttChart.tsx 주요 섹션

// 1. 임포트 (1-46줄) - ~46줄
// 2. 타입 정의 (47-79줄) - ~33줄
// 3. 메인 컴포넌트 시작 (81줄~)

// 상태 (state)
- 점심시간 관련 (106-112줄)
- 드래그 선택 (160-163줄)
- 모달/폼 상태 (165-175줄)
- 리사이즈 상태 (177-185줄)
- 편집 모드 상태 (187-195줄)

// 파생 데이터 (useMemo)
- filtered_records (200-230줄)
- grouped_works (232-260줄)
- all_sessions (262-280줄)

// 핸들러 함수들 (~1,500줄)
- handleDragStart/Move/End (300-500줄)
- handleResize 관련 (500-700줄)
- handleAddSession (700-900줄)
- handleEditSession (900-1100줄)
- handleDeleteSession (1100-1200줄)
- handleSubmit (1200-1400줄)
- 기타 핸들러들 (1400-1800줄)

// 렌더링 (~1,100줄)
- 간트 차트 영역 (1900-2400줄)
- 모달들 (2400-2700줄)
- 폼 필드들 (2700-2900줄)
```

---

## 2. 분리 계획

### 2.1 목표 구조

```
features/gantt-chart/
├── index.ts                       # Public API
├── model/
│   ├── index.ts
│   ├── types.ts                   # ✅ 기존 + 확장
│   └── constants.ts               # NEW: 간트 관련 상수
├── lib/
│   ├── index.ts
│   ├── slot_calculator.ts         # ✅ 기존
│   ├── drag_handler.ts            # ✅ 기존
│   ├── resize_calculator.ts       # NEW: 리사이즈 계산
│   ├── position_calculator.ts     # NEW: 위치 계산
│   ├── lunch_calculator.ts        # NEW: 점심시간 계산 (shared에서 이동?)
│   └── session_validator.ts       # NEW: 세션 유효성 검사
├── hooks/
│   ├── index.ts
│   ├── useGanttData.ts            # NEW: 데이터 가공 훅
│   ├── useGanttDrag.ts            # NEW: 드래그 상태 관리
│   ├── useGanttResize.ts          # NEW: 리사이즈 상태 관리
│   ├── useGanttSelection.ts       # NEW: 선택 상태 관리
│   └── useGanttScroll.ts          # NEW: 스크롤/줌 관리
└── ui/
    ├── index.ts
    ├── DailyGanttChart/           # 메인 컴포넌트
    │   ├── index.ts
    │   └── DailyGanttChart.tsx    # ~300줄 (오케스트레이션만)
    ├── GanttChart/                # ✅ 기존 유지
    │   ├── index.ts
    │   ├── GanttBar.tsx
    │   ├── GanttRow.tsx
    │   ├── LunchOverlay.tsx
    │   └── TimeAxis.tsx
    ├── GanttHeader/               # NEW
    │   ├── index.ts
    │   └── GanttHeader.tsx        # 날짜 선택, 필터
    ├── GanttTimeline/             # NEW
    │   ├── index.ts
    │   └── GanttTimeline.tsx      # 시간축 + 바 영역
    ├── QuickAddPopover/           # NEW
    │   ├── index.ts
    │   └── QuickAddPopover.tsx    # 빠른 추가 팝오버
    ├── SessionEditModal/          # NEW
    │   ├── index.ts
    │   └── SessionEditModal.tsx   # 세션 편집 모달
    ├── ResizeHandle/              # ✅ 기존 유지
    │   ├── index.ts
    │   └── ResizeHandle.tsx
    └── CurrentTimeLine/           # NEW
        ├── index.ts
        └── CurrentTimeLine.tsx    # 현재 시간 표시선
```

### 2.2 분리 단계

#### Step 1: 순수 함수 추출 (lib/)

| 함수명                     | 현재 위치            | 이동 위치                  | 줄 수 |
| -------------------------- | -------------------- | -------------------------- | ----- |
| calculateDurationExcluding | DailyGanttChart 내부 | lib/lunch_calculator.ts    | ~30   |
| 리사이즈 계산 로직         | DailyGanttChart 내부 | lib/resize_calculator.ts   | ~100  |
| 위치 계산 로직             | DailyGanttChart 내부 | lib/position_calculator.ts | ~50   |
| 세션 유효성 검사           | DailyGanttChart 내부 | lib/session_validator.ts   | ~50   |

#### Step 2: 커스텀 훅 추출 (hooks/)

| 훅명              | 책임                     | 예상 줄 수 |
| ----------------- | ------------------------ | ---------- |
| useGanttData      | 레코드 필터링, 그룹화    | ~80        |
| useGanttDrag      | 드래그 상태, 핸들러      | ~150       |
| useGanttResize    | 리사이즈 상태, 핸들러    | ~120       |
| useGanttSelection | 선택 영역, 드래그 선택   | ~100       |
| useGanttScroll    | 스크롤 위치, 자동 스크롤 | ~60        |

#### Step 3: UI 컴포넌트 분리 (ui/)

| 컴포넌트명       | 책임                    | 예상 줄 수 |
| ---------------- | ----------------------- | ---------- |
| DailyGanttChart  | 메인 오케스트레이션     | ~300       |
| GanttHeader      | 날짜 선택, 필터 버튼    | ~100       |
| GanttTimeline    | 타임라인 영역 (바 + 축) | ~150       |
| QuickAddPopover  | 빠른 추가 팝오버        | ~150       |
| SessionEditModal | 세션 편집 모달          | ~200       |
| CurrentTimeLine  | 현재 시간 표시          | ~40        |

---

## 3. 상세 분리 계획

### 3.1 lib/resize_calculator.ts

```typescript
// 리사이즈 계산 순수 함수

export interface ResizeResult {
  new_start: number;
  new_end: number;
  is_valid: boolean;
  error_message?: string;
}

export function calculateResizeResult(
  handle: 'left' | 'right',
  current_value: number,
  original_start: number,
  original_end: number,
  occupied_slots: TimeSlot[],
  min_duration: number
): ResizeResult { ... }

export function validateResizePosition(
  new_value: number,
  handle: 'left' | 'right',
  other_value: number,
  occupied_slots: TimeSlot[],
  session_id: string
): boolean { ... }
```

### 3.2 hooks/useGanttDrag.ts

```typescript
// 드래그 상태 관리 훅

export interface UseGanttDragOptions {
  records: WorkRecord[];
  selected_date: string;
  onSessionCreate: (data: SessionCreateData) => void;
  onSessionMove: (data: SessionMoveData) => void;
}

export interface UseGanttDragReturn {
  drag_state: DragState;
  handleDragStart: (e: MouseEvent, start_mins: number) => void;
  handleDragMove: (e: MouseEvent) => void;
  handleDragEnd: () => void;
  isDragging: boolean;
}

export function useGanttDrag(options: UseGanttDragOptions): UseGanttDragReturn { ... }
```

### 3.3 ui/DailyGanttChart/DailyGanttChart.tsx (메인)

```typescript
// 메인 컴포넌트 (~300줄)

export default function DailyGanttChart() {
  // 1. 훅 사용 (상태 및 로직은 훅에 위임)
  const { filtered_records, grouped_works } = useGanttData();
  const { drag_state, handleDragStart, handleDragEnd } = useGanttDrag();
  const { resize_state, handleResizeStart, handleResizeEnd } = useGanttResize();
  const { selection, handleSelect } = useGanttSelection();

  // 2. 모달 상태
  const [modal_state, setModalState] = useState<ModalState>({ ... });

  // 3. 렌더링 (컴포넌트 조합)
  return (
    <div className="gantt-container">
      <GanttHeader
        date={selected_date}
        onDateChange={...}
        filters={...}
      />

      <GanttTimeline
        grouped_works={grouped_works}
        drag_state={drag_state}
        resize_state={resize_state}
        onDragStart={handleDragStart}
        onResizeStart={handleResizeStart}
      />

      <QuickAddPopover
        visible={modal_state.quick_add_visible}
        position={modal_state.position}
        onSubmit={handleQuickAdd}
        onClose={() => setModalState({ ...modal_state, quick_add_visible: false })}
      />

      <SessionEditModal
        visible={modal_state.edit_visible}
        session={modal_state.editing_session}
        onSubmit={handleSessionUpdate}
        onClose={() => setModalState({ ...modal_state, edit_visible: false })}
      />
    </div>
  );
}
```

---

## 4. 공통 컴포넌트 활용

### 4.1 이미 사용 가능한 공통 자원

| 공통 자원              | 사용 위치                         |
| ---------------------- | --------------------------------- |
| SelectWithAdd          | QuickAddPopover, SessionEditModal |
| AutoCompleteWithHide   | QuickAddPopover, SessionEditModal |
| FormModal              | SessionEditModal                  |
| timeToMinutes          | lib/, hooks/                      |
| formatDuration         | GanttBar, 통계 표시               |
| useAutoCompleteOptions | 폼 컴포넌트들                     |

### 4.2 Phase 8에서 추가 활용 예정

| 공통 자원      | 사용 위치                         |
| -------------- | --------------------------------- |
| WorkFormFields | QuickAddPopover, SessionEditModal |

---

## 5. 마이그레이션 체크리스트

### 5.1 순수 함수 추출

-   [ ] `lib/resize_calculator.ts` 생성
    -   [ ] calculateResizeResult 함수
    -   [ ] validateResizePosition 함수
    -   [ ] 테스트 작성
-   [ ] `lib/position_calculator.ts` 생성
    -   [ ] calculateBarPosition 함수
    -   [ ] 테스트 작성
-   [ ] `lib/session_validator.ts` 생성
    -   [ ] validateSessionTime 함수
    -   [ ] 테스트 작성

### 5.2 훅 추출

-   [ ] `hooks/useGanttData.ts` 생성
    -   [ ] 레코드 필터링 로직
    -   [ ] 그룹화 로직
    -   [ ] 테스트 작성
-   [ ] `hooks/useGanttDrag.ts` 생성
    -   [ ] 드래그 상태 관리
    -   [ ] 드래그 핸들러
    -   [ ] 테스트 작성
-   [ ] `hooks/useGanttResize.ts` 생성
    -   [ ] 리사이즈 상태 관리
    -   [ ] 리사이즈 핸들러
    -   [ ] 테스트 작성
-   [ ] `hooks/useGanttSelection.ts` 생성
    -   [ ] 선택 상태 관리
    -   [ ] 테스트 작성

### 5.3 UI 컴포넌트 분리

-   [ ] `ui/DailyGanttChart/` 생성
    -   [ ] 메인 컴포넌트 (~300줄)
-   [ ] `ui/GanttHeader/` 생성
    -   [ ] 날짜 선택, 필터 UI
-   [ ] `ui/GanttTimeline/` 생성
    -   [ ] 타임라인 영역
-   [ ] `ui/QuickAddPopover/` 생성
    -   [ ] 빠른 추가 팝오버
-   [ ] `ui/SessionEditModal/` 생성
    -   [ ] 세션 편집 모달
-   [ ] `ui/CurrentTimeLine/` 생성
    -   [ ] 현재 시간 표시선

### 5.4 정리

-   [ ] index.ts 업데이트
-   [ ] 기존 `components/DailyGanttChart.tsx` 삭제
-   [ ] import 경로 업데이트 (사용처)
-   [ ] 테스트 마이그레이션
-   [ ] 스토리북 스토리 작성

---

## 6. 테스트 계획

### 6.1 순수 함수 테스트

```typescript
// test/unit/features/gantt-chart/lib/resize_calculator.test.ts
describe('calculateResizeResult', () => {
  it('왼쪽 핸들 드래그 시 시작 시간이 변경된다', () => { ... });
  it('충돌하는 위치로 리사이즈하면 에러를 반환한다', () => { ... });
  it('최소 duration 미만으로 줄이면 에러를 반환한다', () => { ... });
});
```

### 6.2 훅 테스트

```typescript
// test/hooks/features/gantt-chart/useGanttDrag.test.ts
describe('useGanttDrag', () => {
  it('드래그 시작 시 drag_state가 업데이트된다', () => { ... });
  it('드래그 종료 시 onSessionCreate가 호출된다', () => { ... });
});
```

### 6.3 컴포넌트 테스트

```typescript
// test/component/features/gantt-chart/DailyGanttChart.test.tsx
describe('DailyGanttChart', () => {
  it('레코드가 간트 바로 렌더링된다', () => { ... });
  it('드래그로 새 세션을 추가할 수 있다', () => { ... });
});
```

---

## 7. 예상 결과

### 7.1 줄 수 비교

| 항목                    | Before | After  |
| ----------------------- | ------ | ------ |
| DailyGanttChart.tsx     | 2,918  | -      |
| DailyGanttChart (메인)  | -      | ~300   |
| lib/\*.ts (순수 함수)   | 기존   | +230   |
| hooks/\*.ts             | -      | ~510   |
| ui/GanttHeader.tsx      | -      | ~100   |
| ui/GanttTimeline.tsx    | -      | ~150   |
| ui/QuickAddPopover.tsx  | -      | ~150   |
| ui/SessionEditModal.tsx | -      | ~200   |
| **총계**                | 2,918  | ~1,640 |

### 7.2 테스트 용이성

-   Before: 단일 파일에 모든 로직 → 테스트 어려움
-   After: 순수 함수 + 훅 분리 → 개별 테스트 가능

### 7.3 유지보수성

-   Before: 수정 시 사이드 이펙트 위험
-   After: 관심사 분리로 영향 범위 제한

---

## 참고

-   [PHASE8_OVERVIEW.md](./PHASE8_OVERVIEW.md) - 전체 개요
-   기존 features/gantt-chart 코드 분석 필요
