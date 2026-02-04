# AdminSessionGrid 분리 계획

> **현재**: 2,278줄 (src/components/AdminSessionGrid.tsx)  
> **목표**: 메인 컴포넌트 ~180줄 + 하위 모듈들  
> **예상 감소율**: **-92%**

---

## 0. ⚠️ 적용할 엄격한 리팩토링 기준 (Phase 1~7 확립)

### 핵심 원칙

✅ **useMemo 내 JSX 100% 금지** - 모두 별도 컴포넌트로  
✅ **inline style 완전 금지** - 모두 constants로  
✅ **사용자 문구 100% 상수화** - 하드코딩 0개  
✅ **공통화 극대화** - 2회 이상 사용 시 무조건 공통화  
✅ **한 파일 = 한 컴포넌트** - SRP 엄격 준수

---

## 1. 현재 구조 분석

### 1.1 기존 분리 상태 (이미 우수)

```
features/admin/
├── lib/                          # ✅ 순수 함수 잘 분리됨
│   ├── conflict_finder.ts        # ✅ 충돌 감지
│   ├── export.ts                 # ✅ 데이터 내보내기
│   ├── integrity.ts              # ✅ 무결성 검사
│   ├── problem_detector.ts       # ✅ 문제 세션 감지
│   └── statistics.ts             # ✅ 통계 계산
└── ui/                           # ✅ UI 컴포넌트 대부분 분리
    ├── AdminDashboard/
    ├── DataExplorer/
    ├── IntegrityCheck/
    ├── RecordsTab/
    ├── SessionsTab/
    ├── Statistics/
    └── TrashManagement/
```

### 1.2 남은 문제점

#### 문제 1: 메인 컴포넌트가 여전히 거대 (2,278줄)

```typescript
// AdminSessionGrid.tsx
// 1. 임포트 (1-58줄) - 58줄
// 2. 타입 정의 (63-92줄) - 30줄

// ❌ 3. 헬퍼 함수 (94-400줄) - ~306줄
//    → 이미 lib/에 있는 함수인데 왜 여기 있음?
detectSessionProblems(); // → lib/problem_detector.ts (이미 있음)
findProblemSessions(); // → lib/problem_detector.ts

// 4. 메인 컴포넌트 (402-2278줄) - ~1,876줄
//    → 탭 패널이 인라인으로 ~1,200줄
```

#### 문제 2: 탭 패널 인라인 렌더링 (~1,200줄)

```typescript
// ❌ 금지된 패턴: return 문 내 탭 패널 인라인 (각 ~200줄)
return (
    <Tabs>
        <TabPane tab="세션 충돌" key="conflicts">
            {/* 200줄의 인라인 JSX */}
        </TabPane>
        <TabPane tab="문제 세션" key="problems">
            {/* 200줄의 인라인 JSX */}
        </TabPane>
        {/* ... 6개 탭 반복 */}
    </Tabs>
);
```

---

## 2. 분리 계획

### 2.1 목표 구조

```
features/admin/
├── index.ts
│
├── constants/
│   ├── index.ts
│   ├── labels.ts                  # NEW: UI 레이블
│   ├── messages.ts                # NEW: 메시지
│   └── config.ts                  # NEW: 설정
│
├── lib/                           # ✅ 이미 완료
│   ├── conflict_finder.ts
│   ├── export.ts
│   ├── integrity.ts
│   ├── problem_detector.ts
│   └── statistics.ts
│
├── hooks/
│   ├── index.ts
│   ├── useAdminData.ts            # NEW: 데이터 가공 (~100줄)
│   ├── useAdminFilters.ts         # NEW: 필터 상태 (~60줄)
│   └── useAdminTabs.ts            # NEW: 탭 상태 (~40줄)
│
└── ui/
    ├── index.ts
    │
    ├── AdminSessionGrid/          # NEW: 메인 컴포넌트
    │   ├── index.ts
    │   ├── AdminSessionGrid.tsx   # ✅ 메인 (~180줄)
    │   └── AdminGridHeader.tsx    # NEW: 헤더 (~80줄)
    │
    ├── AdminTabs/                 # NEW: 탭 패널들
    │   ├── index.ts
    │   ├── ConflictsTab.tsx       # NEW (~150줄)
    │   ├── ProblemsTab.tsx        # NEW (~150줄)
    │   ├── RecordsTab.tsx         # NEW (~150줄)
    │   ├── StatisticsTab.tsx      # NEW (~150줄)
    │   ├── IntegrityTab.tsx       # NEW (~120줄)
    │   └── ExportTab.tsx          # NEW (~100줄)
    │
    ├── AdminDashboard/            # ✅ 기존
    ├── DataExplorer/              # ✅ 기존
    ├── IntegrityCheck/            # ✅ 기존
    ├── RecordsTab/                # ✅ 기존 (재사용)
    ├── SessionsTab/               # ✅ 기존 (재사용)
    ├── Statistics/                # ✅ 기존 (재사용)
    └── TrashManagement/           # ✅ 기존
```

---

## 3. 단계별 작업

### Step 1: 헬퍼 함수 제거 ✅

```typescript
// ❌ Before: AdminSessionGrid.tsx (94-400줄)
function detectSessionProblems(sessions: WorkSession[]) {
    // 50줄
}

function findProblemSessions(records: WorkRecord[]) {
    // 30줄
}

// ✅ After: 이미 lib/problem_detector.ts에 있음!
import {
    detectSessionProblems,
    findProblemSessions,
} from "../../lib/problem_detector";
```

**체크리스트**:

-   [ ] 중복 함수 제거
-   [ ] lib/ 함수 import로 대체

### Step 2: 탭 패널 분리 ⚠️ **핵심 작업**

#### 2.1 ConflictsTab.tsx (~150줄)

```typescript
// features/admin/ui/AdminTabs/ConflictsTab.tsx

import { ConflictsView } from "../SessionsTab/ConflictsView";
import {
    ADMIN_TAB_CONFLICTS_TITLE,
    ADMIN_TAB_CONFLICTS_EMPTY,
} from "../../constants";

interface ConflictsTabProps {
    conflicts: SessionConflict[];
    onResolve: (conflict_id: string) => void;
}

export function ConflictsTab({ conflicts, onResolve }: ConflictsTabProps) {
    if (conflicts.length === 0) {
        return <Empty description={ADMIN_TAB_CONFLICTS_EMPTY} />;
    }

    return (
        <div style={TAB_CONTAINER_STYLE}>
            <Text style={TAB_TITLE_STYLE}>{ADMIN_TAB_CONFLICTS_TITLE}</Text>
            <ConflictsView conflicts={conflicts} onResolve={onResolve} />
        </div>
    );
}
```

**체크리스트**:

-   [ ] 150줄 이하
-   [ ] inline style 0개
-   [ ] 하드코딩 문구 0개
-   [ ] 기존 ConflictsView 재사용

#### 2.2 ProblemsTab.tsx (~150줄)

```typescript
// features/admin/ui/AdminTabs/ProblemsTab.tsx

import { ProblemsList } from "../SessionsTab/ProblemsList";

export function ProblemsTab({ problems, onFix }: ProblemsTabProps) {
    return (
        <div style={TAB_CONTAINER_STYLE}>
            <ProblemsList problems={problems} onFix={onFix} />
        </div>
    );
}
```

**체크리스트**:

-   [ ] 기존 ProblemsList 재사용
-   [ ] Props 타입 명시

#### 2.3 StatisticsTab.tsx (~150줄)

```typescript
// features/admin/ui/AdminTabs/StatisticsTab.tsx

import { StatsDashboard } from "../Statistics/StatsDashboard";
import { CategoryAnalysis } from "../Statistics/CategoryAnalysis";

export function StatisticsTab({ date_range }: StatisticsTabProps) {
    return (
        <div style={TAB_CONTAINER_STYLE}>
            <StatsDashboard date_range={date_range} />
            <CategoryAnalysis date_range={date_range} />
        </div>
    );
}
```

### Step 3: 메인 컴포넌트 최종화

#### 3.1 AdminSessionGrid.tsx (최종 ~180줄)

```typescript
// features/admin/ui/AdminSessionGrid/AdminSessionGrid.tsx

import { useAdminData } from "../../hooks/useAdminData";
import { useAdminFilters } from "../../hooks/useAdminFilters";
import { useAdminTabs } from "../../hooks/useAdminTabs";
import {
    ConflictsTab,
    ProblemsTab,
    RecordsTab,
    StatisticsTab,
    IntegrityTab,
    ExportTab,
} from "../AdminTabs";

export function AdminSessionGrid() {
    const work_store = useWorkStore();

    // ✅ 훅으로 데이터 가공
    const data = useAdminData({
        records: work_store.records,
        date_range: filters.date_range,
    });

    // ✅ 훅으로 필터 상태
    const filters = useAdminFilters();

    // ✅ 훅으로 탭 상태
    const tabs = useAdminTabs();

    return (
        <div>
            <AdminGridHeader
                date_range={filters.date_range}
                onDateRangeChange={filters.setDateRange}
            />

            <Tabs activeKey={tabs.active_key} onChange={tabs.setActiveKey}>
                <TabPane tab={ADMIN_TAB_CONFLICTS} key="conflicts">
                    <ConflictsTab
                        conflicts={data.conflicts}
                        onResolve={/* ... */}
                    />
                </TabPane>

                <TabPane tab={ADMIN_TAB_PROBLEMS} key="problems">
                    <ProblemsTab problems={data.problems} onFix={/* ... */} />
                </TabPane>

                {/* ... 4개 탭 더 (각 10줄 이하) */}
            </Tabs>
        </div>
    );
}
```

**최종 체크리스트**:

-   [ ] 메인 컴포넌트 180줄 이하
-   [ ] 탭 패널 모두 별도 컴포넌트
-   [ ] inline JSX 0개
-   [ ] 하드코딩 문구 0개

---

## 4. 예상 성과

### 4.1 코드 품질 지표

| 지표               | Before       | After (예상)   | 목표 개선 |
| ------------------ | ------------ | -------------- | --------- |
| **총 줄 수**       | 2,278줄      | 180줄          | **-92%**  |
| **헬퍼 함수**      | 306줄 (중복) | 0줄 (lib 사용) | **-100%** |
| **탭 패널 inline** | 1,200줄      | 0줄            | **-100%** |
| **inline style**   | 40개         | 0개            | **-100%** |
| **하드코딩 문구**  | 60개         | 0개            | **-100%** |

### 4.2 재사용 효과

| 컴포넌트         | 기존 위치                        | 재사용    |
| ---------------- | -------------------------------- | --------- |
| `ConflictsView`  | `features/admin/ui/SessionsTab/` | ✅ 재사용 |
| `ProblemsList`   | `features/admin/ui/SessionsTab/` | ✅ 재사용 |
| `StatsDashboard` | `features/admin/ui/Statistics/`  | ✅ 재사용 |
| `DuplicatesView` | `features/admin/ui/RecordsTab/`  | ✅ 재사용 |

---

## 5. 작업 체크리스트

### Phase 1: 중복 헬퍼 함수 제거 ✅

-   [ ] 헬퍼 함수 중복 확인 (lib/에 이미 있음)
-   [ ] 중복 함수 삭제
-   [ ] lib/ import로 대체

### Phase 2: 탭 패널 분리 ⚠️ **핵심**

-   [ ] `ConflictsTab.tsx` (150줄)
-   [ ] `ProblemsTab.tsx` (150줄)
-   [ ] `RecordsTab.tsx` (150줄)
-   [ ] `StatisticsTab.tsx` (150줄)
-   [ ] `IntegrityTab.tsx` (120줄)
-   [ ] `ExportTab.tsx` (100줄)

### Phase 3: 훅 분리 ✅

-   [ ] `useAdminData.ts` (데이터 가공)
-   [ ] `useAdminFilters.ts` (필터 상태)
-   [ ] `useAdminTabs.ts` (탭 상태)

### Phase 4: 메인 컴포넌트 최종화 ✅

-   [ ] `AdminSessionGrid.tsx` (180줄 이하)
-   [ ] 모든 체크리스트 확인
-   [ ] 테스트 실행
-   [ ] 린트 에러 0개

---

## 6. 참고

-   [PHASE8_OVERVIEW.md](PHASE8_OVERVIEW.md) - Phase 8 전체 계획
-   [01_DAILY_GANTT_CHART.md](01_DAILY_GANTT_CHART.md) - 완료된 사례
-   [dev-guidelines.mdc](../../.cursor/rules/dev-guidelines.mdc) - 개발 가이드라인
