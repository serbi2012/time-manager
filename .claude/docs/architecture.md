# 아키텍처

Feature-Sliced Design(FSD) 기반. 데스크탑/모바일 컴포넌트 트리 완전 분리.

---

## 1. 레이어와 의존성

```
pages → widgets → features → shared
```

- 상위 레이어는 하위 레이어만 import한다.
- **같은 레이어 간 직접 import 금지.** feature가 다른 feature를 필요로 하면 공통 부분을 `shared/`로 올린다.
- 순환 의존성 절대 금지.
- 각 feature는 `index.ts`(Public API)를 통해서만 외부에 노출한다. 내부 파일을 깊은 경로로 직접 import하지 않는다.

### feature 내부 표준 구조

```
features/<name>/
├── index.ts        Public API — 외부에 노출할 것만 export
├── constants/      해당 feature 전용 라벨/메시지/설정 상수
├── model/          타입, 스토어 슬라이스 타입
├── lib/            순수 함수 (비즈니스 로직) — 테스트 필수
├── hooks/          부수 효과를 포함하는 커스텀 훅
└── ui/             UI 컴포넌트 (Desktop/ Mobile/ 하위 폴더로 분리)
```

---

## 2. 디렉토리 맵

### `src/app/` — 앱 진입점

| 파일 | 역할 |
| --- | --- |
| `App.tsx` | ThemeProvider → BrowserRouter → `useResponsive()`로 Desktop/Mobile 레이아웃 선택 |
| `providers/ThemeProvider.tsx` | Ant Design ConfigProvider 토큰 설정 (borderRadius 12, fontFamily Pretendard) |
| `layouts/DesktopLayout.tsx` | 헤더 + 사이드바 + RouteTransition + Routes |
| `layouts/MobileLayout.tsx` | 모바일 헤더 + 하단 네비 + 라우트 |

**라우트** — 두 레이아웃이 각자 `<Routes>`를 갖는다. **등록된 라우트가 서로 다르다:**

| 경로 | 페이지 | 데스크탑 | 모바일 |
| --- | --- | :---: | :---: |
| `/` | 일간 기록 (DailyPage) | O | O |
| `/weekly` | 주간 일정 (WeeklySchedule) | O | O |
| `/guide` | 사용 설명서 (GuideBook) | O | O |
| `/suggestions` | 건의사항 게시판 | O | **X** |
| `/admin` | 관리자 (내부용, 문서화·CHANGELOG 제외 대상) | O | **X** |

새 라우트를 추가할 때는 **양쪽 레이아웃에 모두 등록**해야 한다. 한쪽만 추가하면 그 플랫폼에서 빈 화면이 된다.
페이지 컴포넌트는 `lazy()` + `Suspense`로 로드된다.

### `src/pages/`

```
pages/
├── DailyPage/
│   ├── index.tsx              is_mobile로 분기하는 진입점
│   ├── DesktopDailyPage.tsx
│   └── MobileDailyPage.tsx
└── WeeklyPage.tsx
```

### `src/widgets/`

| 위젯 | 구성 |
| --- | --- |
| `Header/` | DesktopHeader, MobileHeader, HeaderContent, UserMenu |
| `Navigation/` | DesktopSidebar, MobileBottomNav, MobilePresetDrawer |
| `SyncStatus/` | SyncIndicator |

### `src/features/`

| feature | lib (순수 함수) | hooks | 비고 |
| --- | --- | --- | --- |
| `timer` | — | — | 타입만 존재. 로직은 `store/slices/timer/` |
| `work-record` | conflict_detector, record_merger, record_filters, record_stats, duration_calculator, category_utils, markdown_formatter | useRecordData, useRecordActions, useRecordEdit, useRecordModals, useRecordFilters, useRecordStats, useRecordTimer, useRecordColumns, useLongPress | 가장 큰 feature |
| `work-template` | — | useTemplateActions, useTemplateDnd | @dnd-kit 정렬 |
| `gantt-chart` | bar_calculator, slot_calculator, drag_handler, conflict_detector, session_validator, lunch_calculator, mobile_segment_calculator | useGanttData, useGanttDrag, useGanttResize, useGanttTime, useMobileGanttMenus | |
| `weekly-schedule` | copy_formatter, weekly_copy_text, week_calculator, week_grouper | useWeeklyData, useCopyFormat | |
| `settings` | shortcut_key | useSettingsTab | `ui/tabs/`에 탭별 컴포넌트 |
| `admin` | problem_detector, conflict_finder, duplicate_finder, integrity, export, statistics/* | useAdminData, useAdminActions, useAdminFilters, useAdminTabs, useSessionAnalysis | 내부용 |
| `sync` | — | useSyncStatus | `initial_load_done` 제공 |
| `guide` | — | useGuideNavigation, useGuideSearch | `src/docs/*.md` 렌더 |
| `suggestion` | author_utils, time_formatter | useSuggestionData, useSuggestionPostActions, useReplyActions, usePermissionCheck | Firestore 별도 컬렉션 |

### `src/shared/`

```
shared/
├── lib/
│   ├── time/       calculators(timeToMinutes/minutesToTime), formatters(formatDuration/formatTimer),
│   │               validators(isValidTimeFormat/isStartBeforeEnd), date_utils, overlap
│   ├── lunch/      lunch_calculator — 점심시간 제외 계산
│   ├── session/    session_utils — getSessionMinutes, calculateTotalMinutes, createSession, sortSessionsByTime
│   ├── record/     record_creator, deal_name_generator
│   ├── data/       export, import (JSON 백업/복원)
│   ├── cn.ts       clsx + tailwind-merge className 합성
│   ├── message.ts  antd message 래퍼
│   ├── haptic.ts   모바일 진동 피드백
│   └── scrollbar.ts
├── ui/
│   ├── (루트) TimeInput, DateInput, CategoryTag, DurationDisplay, TimerDisplay,
│   │          HighlightText, MobileActionMenu
│   ├── form/        WorkFormFields, AutoCompleteWithHide, SelectWithAdd, TimeRangeInput, useWorkForm
│   ├── table/       DataTable (TanStack Table 래퍼) + Header/Body/SortIcon/useDataTable
│   ├── modal/       BaseModal, FormModal, RecordListModal
│   ├── layout/      EmptyState, LoadingOverlay
│   ├── animation/   framer-motion 프리셋 — config/, primitives/, interactions/, feedback/, hooks/
│   ├── transitions/ 페이지 전환 시스템 (→ transitions.md)
│   └── cursor-tracking/ Spotlight·Tilt·Magnetic 등 커서 추종 효과
├── types/       domain, timer, shortcut, suggestion
├── hooks/       useResponsive, useAutoCompleteOptions, useRecordCreation, useDataImportExport,
│                useAuthHandlers, useLongPress, useDebouncedValue, useMousePosition,
│                useSpotlight, useMagnetic
├── constants/   → 3절 참조
└── config/      constants.ts, theme.ts (레거시 호환 re-export)
```

### `src/store/`

```
store/
├── useWorkStore.ts     6개 슬라이스 조합 + persist 미들웨어
├── useShortcutStore.ts 단축키 설정 스토어
├── constants.ts        기본값 (하위 호환 re-export)
├── types/store.ts      슬라이스별 State/Action 인터페이스
├── slices/
│   ├── records.ts      레코드 CRUD, 세션 조작, 휴지통, 완료 처리
│   ├── templates.ts    템플릿 CRUD, 정렬
│   ├── timer/          index, start, stop, switch, update (파일 분리됨)
│   ├── settings.ts     테마, 점심시간, 트랜지션, 자동완성 옵션
│   ├── form.ts         입력 폼 데이터
│   └── ui.ts           선택 날짜, 파생 셀렉터(getFilteredRecords 등)
└── lib/                record_merger, record_recalculator, session_updater, timer_helpers
```

**persist**: LocalStorage 키 `work-time-storage`. `partialize`로 records, templates, timer, 커스텀 옵션, 테마, 점심시간, 트랜지션·커서 설정만 저장한다. `form_data`와 `selected_date`는 저장하지 않는다.

> `partialize` 목록에 없는 새 설정 필드는 새로고침 시 사라진다. 영속이 필요하면 반드시 추가할 것.

### `src/firebase/`

| 파일 | 역할 |
| --- | --- |
| `config.ts` | Firebase 초기화 |
| `useAuth.ts` | Google 로그인/로그아웃, 사용자 상태 |
| `firestore.ts` | 레코드/템플릿 CRUD |
| `syncService.ts`, `sync_helpers.ts` | 실시간 동기화 (onSnapshot) |
| `migration.ts` | 게스트(LocalStorage) → 클라우드 마이그레이션 |
| `suggestionService.ts` | 건의사항 컬렉션 |

### `src/components/` — 진입점 래퍼 + 데모

FSD 마이그레이션은 사실상 끝났고, 남은 파일 대부분은 **얇은 래퍼**다. 실제 구현은 `features/`에 있으니 **여기가 아니라 features를 고쳐야 한다.**

| 파일 | 실체 |
| --- | --- |
| `WorkRecordTable.tsx` (21줄) | `is_mobile`로 `features/work-record/ui/{Desktop,Mobile}` 선택 |
| `WorkTemplateList.tsx` (23줄) | 동일 패턴, `features/work-template` |
| `WeeklySchedule.tsx` (5줄) | `features/weekly-schedule` re-export |
| `SettingsModal.tsx` (5줄) | `features/settings/ui/SettingsModal` re-export |
| `GuideBook.tsx` (1줄) | `features/guide` re-export |
| `SuggestionBoard.tsx` (1줄) | `features/suggestion` re-export |
| `ChangelogModal.tsx` (128줄) | **실제 구현.** `src/constants/changelog.ts`를 렌더 |
| `guide/Demo*.tsx`, `guide/demo_data.ts` (948줄) | `/guide` 문서용 데모 컴포넌트. 유지 대상 (→ docs-sync.md) |
| `WorkRecordTable.tsx.backup` (3119줄) | 분리 전 원본 백업. 빌드에 포함되지 않음 |

**신규 코드를 여기에 추가하지 않는다.** 진입점 래퍼는 기존 import 경로를 유지하기 위한 것이므로 그대로 둔다.

---

## 3. 상수 체계

모든 상수는 `src/shared/constants/`에서 정의하고 `index.ts` 단일 진입점으로 접근한다.

```
shared/constants/
├── index.ts        Public API
├── app/            storage_keys, defaults, admin, feature_flags
├── enums/          theme, status, shortcut, ui  (const 객체 + 타입 패턴)
├── time/           units(MINUTES_PER_HOUR, MS_PER_SECOND), work_hours, durations
├── style/          colors(SEMANTIC_COLORS), spacing, z_index
└── ui/             buttons, messages, labels, modals, placeholders
```

enum 대신 const 객체 + 타입 패턴을 쓴다:

```typescript
export const AppTheme = {
    Blue: "blue",
    Green: "green",
} as const;
export type AppTheme = (typeof AppTheme)[keyof typeof AppTheme];
```

feature 전용 상수는 `features/<name>/constants/`에 둔다. 두 곳 이상에서 쓰이면 `shared/constants/`로 올린다.

기존 import 경로 `@/store/constants`, `@/shared/config/`는 re-export로 동작하지만, **새 코드는 `@/shared/constants`를 쓴다.**

---

## 4. 데이터 모델

`src/shared/types/domain.ts`가 원본이다.

```typescript
interface WorkSession {
    id: string;
    date: string;              // YYYY-MM-DD
    start_time: string;        // HH:mm
    end_time: string;          // HH:mm, 빈 문자열이면 진행 중
    duration_minutes: number;
    is_overnight?: boolean;    // 자정을 넘긴 새벽 근무
}

interface WorkRecord {
    id: string;
    project_code: string;      // 예: A25_01846
    work_name: string;         // 작업명
    task_name: string;         // 업무명 (개발/분석/…)
    deal_name: string;         // 거래명/상세작업
    category_name: string;     // 카테고리
    duration_minutes: number;  // 세션 합계
    note: string;
    start_time: string;        // 첫 세션 시작
    end_time: string;          // 마지막 세션 종료
    date: string;
    sessions: WorkSession[];
    is_completed: boolean;
    completed_at?: string;
    is_deleted?: boolean;      // 휴지통 (soft delete, 30일 보관)
    deleted_at?: string;
}

interface WorkTemplate {
    id: string;
    project_code: string; work_name: string; task_name: string;
    deal_name: string; category_name: string; note: string;
    color: string;             // HEX
    created_at: string;
    sort_order: number;        // 드래그앤드롭 정렬
}

interface WorkFormData {
    project_code: string; work_name: string; task_name: string;
    deal_name: string; category_name: string; note: string;
}

interface TimerState {
    is_running: boolean;
    start_time: number | null;         // epoch ms
    active_template_id: string | null;
    active_form_data: WorkFormData | null;
    active_record_id: string | null;
    active_session_id: string | null;
}
```

### 핵심 불변식

1. `WorkRecord.duration_minutes`는 항상 `sessions`의 합과 일치해야 한다. 세션을 직접 조작했다면 `store/lib/record_recalculator.ts`로 재계산한다.
2. `end_time`이 빈 문자열인 세션은 **진행 중**을 뜻한다. 레코드당 최대 1개만 존재할 수 있다.
3. 소요 시간 계산은 **점심시간을 제외**한다(`shared/lib/lunch`). 점심 시간대는 설정에서 변경 가능하므로 상수로 가정하지 말고 스토어의 `getLunchTimeMinutes()`를 쓴다.
4. 삭제는 기본이 soft delete(`is_deleted`)다. `permanentlyDeleteRecord`만 실제로 지운다.
5. `is_overnight` 세션은 `end_time < start_time`이 정상이다. 시간 비교 로직에서 이 케이스를 빠뜨리지 말 것.

---

## 5. 스토어 액션 인덱스

`src/store/types/store.ts`가 원본. 자주 쓰는 것만:

| 슬라이스 | 주요 액션 |
| --- | --- |
| records | addRecord, updateRecord, softDeleteRecord, restoreRecord, permanentlyDeleteRecord, updateSession, deleteSession, markAsCompleted |
| templates | addTemplate, updateTemplate, deleteTemplate, reorderTemplates, applyTemplate |
| timer | startTimer, startTimerForRecord, stopTimer, switchTemplate, getElapsedSeconds, updateTimerStartTime |
| settings | setAppTheme, setLunchTime, getLunchTimeMinutes, setTransitionEnabled, setTransitionSpeed, addCustomTaskOption, hideAutoCompleteOption |
| ui | setSelectedDate, getFilteredRecords, getIncompleteRecords, getCompletedRecords, getAutoCompleteOptions, getProjectCodeOptions |

`updateSession`과 `updateTimerStartTime`은 `{ success, adjusted, message? }`를 반환한다. 충돌 시 자동 조정될 수 있으므로 **반환값을 반드시 확인하고 사용자에게 알린다.**

---

## 6. 자주 쓰는 공유 함수

```typescript
// shared/lib/time
timeToMinutes("09:30")          // 570
minutesToTime(570)              // "09:30"
formatDuration(90)              // "1시간 30분"
formatTimer(3661)               // "01:01"
isValidTimeFormat("09:30")      // true
isStartBeforeEnd("09:00", "10:00")

// shared/lib/lunch
calculateDurationExcludingLunch(660, 780)   // 점심 제외 분
isInLunchTime(720)

// shared/lib/session
getSessionMinutes(session)
calculateTotalMinutes(sessions)
createSession(start_ts, end_ts)
sortSessionsByTime(sessions)

// shared/lib/cn
cn("base", is_active && "active")   // clsx + tailwind-merge
```

---

## 7. 빌드/설정

| 항목 | 값 |
| --- | --- |
| 별칭 | `@/` → `src/` |
| 빌드 타겟 | es2022 |
| 수동 청크 | vendor-react, vendor-antd, vendor-firebase, vendor-motion |
| external | mermaid (CDN 로드) |
| PWA | vite-plugin-pwa, registerType: autoUpdate |
| 배포 | Vercel (`vercel.json`) |
| 테스트 환경 | happy-dom, setup: `src/test/setup.ts` |
