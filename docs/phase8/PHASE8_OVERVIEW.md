# Phase 8: 거대 컴포넌트 분리 - 전체 계획

> **목표**: 300~500줄 이상의 거대 컴포넌트를 150~300줄 단위로 분리
> **원칙**: 공통화 최대 활용, 테스트 용이성 확보, 모바일/데스크탑 독립성 유지

---

## 1. 대상 컴포넌트 현황

| 순서 | 컴포넌트         | 현재 줄 수 | 목표 줄 수 | 복잡도 | 계획 문서                  |
| ---- | ---------------- | ---------- | ---------- | ------ | -------------------------- |
| 1    | WorkRecordTable  | 2,966      | ~300       | 높음   | [01_DAILY_GANTT_CHART.md]  |
| 2    | DailyGanttChart  | 2,918      | ~300       | 높음   | [02_WORK_RECORD_TABLE.md]  |
| 3    | AdminSessionGrid | 2,278      | ~250       | 중간   | [03_ADMIN_SESSION_GRID.md] |
| 4    | SettingsModal    | 1,330      | ~200       | 낮음   | [04_SETTINGS_MODAL.md]     |
| 5    | WorkTemplateList | 980        | ~200       | 중간   | [05_WORK_TEMPLATE_LIST.md] |
| 6    | StatsDashboard   | 971        | ~200       | 중간   | (admin에 이미 분리됨)      |
| 7    | SuggestionBoard  | 773        | ~200       | 낮음   | [07_OTHERS.md]             |
| 8    | WeeklySchedule   | 641        | ~200       | 낮음   | [06_WEEKLY_SCHEDULE.md]    |
| 9    | GuideBook        | 574        | ~200       | 낮음   | [07_OTHERS.md]             |

**총 분리 대상**: 약 13,400줄 → 약 2,000줄 (메인 컴포넌트 기준)

---

## 2. 공통화 전략

### 2.1 이미 구축된 공통 자원 (Phase 1~7)

| 분류          | 위치                   | 내용                                                       |
| ------------- | ---------------------- | ---------------------------------------------------------- |
| **공통 UI**   | `shared/ui/form/`      | SelectWithAdd, AutoCompleteWithHide, TimeRangeInput        |
|               | `shared/ui/modal/`     | BaseModal, FormModal, RecordListModal                      |
|               | `shared/ui/layout/`    | LoadingOverlay, EmptyState                                 |
|               | `shared/ui/animation/` | AnimatedPresence, AnimatedList, SkeletonLoader             |
| **공통 훅**   | `shared/hooks/`        | useRecordCreation, useAutoCompleteOptions, useAuthHandlers |
| **순수 함수** | `shared/lib/time/`     | timeToMinutes, minutesToTime, formatDuration               |
|               | `shared/lib/session/`  | getSessionMinutes, calculateSessionDuration                |
|               | `shared/lib/record/`   | generateDealName, createNewRecord                          |
| **상수**      | `shared/constants/`    | UI 텍스트, 스타일 토큰, 시간 상수                          |

### 2.2 Phase 8에서 추가 공통화 예정

| 분류            | 위치                       | 추출 대상                                   |
| --------------- | -------------------------- | ------------------------------------------- |
| **폼 필드**     | `shared/ui/form/`          | WorkFormFields (react-hook-form + zod 통합) |
| **테이블**      | `shared/ui/table/`         | DataTable (@tanstack/react-table 래퍼)      |
| **컬럼 렌더러** | `shared/ui/table/columns/` | TimeColumn, DurationColumn, ActionsColumn   |
| **훅**          | `shared/hooks/`            | useTableSelection, useInlineEdit            |
| **순수 함수**   | `features/*/lib/`          | 각 컴포넌트의 비즈니스 로직                 |

### 2.3 중복 패턴 분석

#### 패턴 1: Select + 옵션 추가 + 숨기기 (이미 공통화됨)

-   **기존**: DailyGanttChart, WorkRecordTable, WorkTemplateList 각 ~80줄
-   **공통**: `SelectWithAdd`, `AutoCompleteWithHide`

#### 패턴 2: 폼 필드 그룹 (Phase 8에서 공통화)

```
project_code + work_name + task_name + category_name + note
```

-   **기존**: DailyGanttChart, WorkRecordTable, WorkTemplateList 각 ~150줄
-   **공통화 예정**: `WorkFormFields` (react-hook-form 기반)

#### 패턴 3: 테이블 + 필터 + 페이지네이션

-   **기존**: WorkRecordTable, AdminSessionGrid 각 ~500줄
-   **공통화 예정**: `DataTable` (@tanstack/react-table 래퍼)

#### 패턴 4: 시간 계산 함수

-   **기존**: 각 컴포넌트 내 중복
-   **공통**: `shared/lib/time/`, `shared/lib/session/`

#### 패턴 5: 모달 + 폼 제출

-   **기존**: DailyGanttChart, WorkRecordTable, WorkTemplateList 각 ~100줄
-   **공통**: `FormModal`

---

## 3. 기존 features 구조 활용

### 3.1 이미 분리된 구조

```
features/
├── admin/                    # AdminSessionGrid 일부 분리됨
│   ├── lib/                  # ✅ 순수 함수 완료
│   └── ui/                   # ✅ 대부분 분리됨
├── gantt-chart/              # DailyGanttChart 일부 분리됨
│   ├── lib/                  # ✅ slot_calculator, drag_handler
│   └── ui/                   # ⚠️ GanttBar, GanttRow만 분리
├── work-record/              # WorkRecordTable 일부 분리됨
│   ├── lib/                  # ✅ conflict_detector, duration_calculator
│   └── ui/                   # ⚠️ SessionEditTable, RecordActions만 분리
├── settings/                 # SettingsModal 일부 분리됨
│   └── ui/tabs/              # ✅ AnimationTab 등 분리
├── weekly-schedule/          # WeeklySchedule 일부 분리됨
│   ├── lib/                  # ✅ copy_formatter
│   └── ui/                   # ⚠️ DayColumn, CopyFormatSelector만 분리
└── work-template/            # WorkTemplateList 일부 분리됨
    └── ui/                   # ⚠️ TemplateCard, ColorPicker만 분리
```

### 3.2 분리 완료 후 목표 구조

```
features/
├── gantt-chart/
│   ├── model/types.ts
│   ├── lib/
│   │   ├── slot_calculator.ts      # ✅ 기존
│   │   ├── drag_handler.ts         # ✅ 기존
│   │   ├── resize_calculator.ts    # NEW
│   │   └── position_calculator.ts  # NEW
│   ├── hooks/
│   │   ├── useGanttDrag.ts         # NEW
│   │   ├── useGanttResize.ts       # NEW
│   │   └── useGanttSelection.ts    # NEW
│   └── ui/
│       ├── GanttChart/             # 메인 컴포넌트 (~300줄)
│       ├── GanttHeader/            # NEW
│       ├── GanttTimeline/          # NEW
│       ├── QuickAddPopover/        # NEW
│       └── GanttChart/ (기존 하위) # ✅ 기존
│
├── work-record/
│   ├── model/types.ts
│   ├── lib/
│   │   ├── conflict_detector.ts    # ✅ 기존
│   │   ├── duration_calculator.ts  # ✅ 기존
│   │   ├── record_filters.ts       # NEW
│   │   └── record_sorter.ts        # NEW
│   ├── hooks/
│   │   ├── useRecordTable.ts       # NEW (@tanstack/react-table)
│   │   ├── useRecordSelection.ts   # NEW
│   │   └── useRecordFilters.ts     # NEW
│   └── ui/
│       ├── RecordTable/            # 메인 컴포넌트 (~300줄)
│       ├── RecordRow/              # NEW
│       ├── RecordEditModal/        # NEW
│       ├── DailyStats/             # NEW
│       └── (기존 하위)             # ✅ 기존
│
└── (다른 features도 유사하게 확장)
```

---

## 4. 분리 우선순위 및 의존성

```
┌─────────────────────────────────────────────────────────────┐
│                      분리 순서 및 의존성                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Step 1] 공통 컴포넌트 추가 구축                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WorkFormFields (shared/ui/form/)                    │   │
│  │  DataTable (shared/ui/table/)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  [Step 2] 거대 컴포넌트 분리 (병렬 가능)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │ DailyGantt  │  │ WorkRecord  │  │ AdminSession    │     │
│  │ Chart       │  │ Table       │  │ Grid            │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘     │
│                           ↓                                 │
│  [Step 3] 중소형 컴포넌트 분리                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │ Settings    │  │ WorkTemp    │  │ Weekly          │     │
│  │ Modal       │  │ lateList    │  │ Schedule        │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘     │
│                           ↓                                 │
│  [Step 4] 기타 컴포넌트 정리                                 │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │ Suggestion  │  │ GuideBook   │                          │
│  │ Board       │  │             │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 분리 체크리스트

### 5.1 공통 컴포넌트 추가 (Step 1) ✅

-   [x] `shared/ui/form/WorkFormFields.tsx` 생성
    -   [x] react-hook-form + zod 스키마 통합
    -   [x] 테스트 작성 (16개 테스트 케이스)
    -   [x] Storybook 스토리 작성 (8개 스토리)
-   [x] `shared/ui/table/DataTable.tsx` 생성
    -   [x] @tanstack/react-table 래퍼
    -   [x] 정렬, 필터, 페이지네이션 지원
    -   [x] 테스트 작성 (21개 테스트 케이스)

### 5.2 거대 컴포넌트 분리 (Step 2)

#### DailyGanttChart (2,918줄)

-   [ ] `features/gantt-chart/lib/` 순수 함수 추출
-   [ ] `features/gantt-chart/hooks/` 커스텀 훅 추출
-   [ ] `features/gantt-chart/ui/` 컴포넌트 분리
-   [ ] 메인 컴포넌트 300줄 이내로 축소
-   [ ] 테스트 마이그레이션
-   [ ] 기존 `components/DailyGanttChart.tsx` 삭제

#### WorkRecordTable (2,966줄)

-   [ ] `features/work-record/lib/` 순수 함수 추출
-   [ ] `features/work-record/hooks/` 커스텀 훅 추출
-   [ ] `features/work-record/ui/` 컴포넌트 분리
-   [ ] 메인 컴포넌트 300줄 이내로 축소
-   [ ] 테스트 마이그레이션
-   [ ] 기존 `components/WorkRecordTable.tsx` 삭제

#### AdminSessionGrid (2,278줄)

-   [ ] `features/admin/ui/` 추가 분리
-   [ ] 메인 컴포넌트 250줄 이내로 축소
-   [ ] 테스트 마이그레이션
-   [ ] 기존 `components/AdminSessionGrid.tsx` 삭제

### 5.3 중소형 컴포넌트 분리 (Step 3)

-   [ ] SettingsModal (1,330줄 → 200줄)
-   [ ] WorkTemplateList (980줄 → 200줄)
-   [ ] WeeklySchedule (641줄 → 200줄)

### 5.4 기타 컴포넌트 정리 (Step 4)

-   [ ] SuggestionBoard (773줄 → 200줄)
-   [ ] GuideBook (574줄 → 200줄)

---

## 6. 테스트 전략

### 6.1 분리 전 테스트 확보

각 컴포넌트 분리 전:

1. 기존 테스트 실행하여 통과 확인
2. 스냅샷 테스트 추가 (UI 구조 보존 검증)
3. E2E 테스트로 핵심 플로우 커버

### 6.2 분리 후 테스트 마이그레이션

1. 순수 함수 → `test/unit/features/*/lib/`
2. 훅 → `test/hooks/features/*/`
3. 컴포넌트 → `test/component/features/*/ui/`
4. 기존 테스트 경로 업데이트

### 6.3 테스트 커버리지 목표

| 영역               | 현재 | 목표 |
| ------------------ | ---- | ---- |
| 순수 함수 (lib/)   | 90%  | 100% |
| 커스텀 훅 (hooks/) | 70%  | 90%  |
| UI 컴포넌트        | 50%  | 80%  |

---

## 7. 각 컴포넌트 계획 문서

| 문서                       | 대상               | 상태 |
| -------------------------- | ------------------ | ---- |
| [01_DAILY_GANTT_CHART.md]  | DailyGanttChart    | ⬜   |
| [02_WORK_RECORD_TABLE.md]  | WorkRecordTable    | ⬜   |
| [03_ADMIN_SESSION_GRID.md] | AdminSessionGrid   | ⬜   |
| [04_SETTINGS_MODAL.md]     | SettingsModal      | ⬜   |
| [05_WORK_TEMPLATE_LIST.md] | WorkTemplateList   | ⬜   |
| [06_WEEKLY_SCHEDULE.md]    | WeeklySchedule     | ⬜   |
| [07_OTHERS.md]             | SuggestionBoard 등 | ⬜   |

---

## 8. 진행 추적

| 단계   | 항목                  | 상태 | 완료일     |
| ------ | --------------------- | ---- | ---------- |
| Step 1 | WorkFormFields 공통화 | ✅   | 2026-02-03 |
| Step 1 | DataTable 공통화      | ✅   | 2026-02-03 |
| Step 2 | DailyGanttChart 분리  | ⬜   | -          |
| Step 2 | WorkRecordTable 분리  | ⬜   | -          |
| Step 2 | AdminSessionGrid 분리 | ⬜   | -          |
| Step 3 | SettingsModal 분리    | ⬜   | -          |
| Step 3 | WorkTemplateList 분리 | ⬜   | -          |
| Step 3 | WeeklySchedule 분리   | ⬜   | -          |
| Step 4 | SuggestionBoard 분리  | ⬜   | -          |
| Step 4 | GuideBook 분리        | ⬜   | -          |

**범례**: ⬜ 미시작 / 🔄 진행중 / ✅ 완료

---

## 참고

-   [REFACTORING_TODO.md](../REFACTORING_TODO.md) - 전체 리팩토링 계획
-   [REFACTORING_PROGRESS.md](../REFACTORING_PROGRESS.md) - 진행 상황
-   [dev-guidelines.mdc](../../.cursor/rules/dev-guidelines.mdc) - 개발 가이드라인
