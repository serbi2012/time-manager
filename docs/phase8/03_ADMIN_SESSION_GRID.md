# AdminSessionGrid 분리 계획

> **현재**: 2,278줄 (src/components/AdminSessionGrid.tsx)
> **목표**: 메인 컴포넌트 ~250줄 + 하위 모듈들

---

## 1. 현재 구조 분석

### 1.1 파일 위치

-   메인: `src/components/AdminSessionGrid.tsx` (2,278줄)
-   기존 분리: `src/features/admin/`

### 1.2 기존 features/admin 구조 (이미 잘 분리됨)

```
features/admin/
├── index.ts
├── lib/
│   ├── index.ts
│   ├── conflict_finder.ts      # ✅ findConflicts
│   ├── export.ts               # ✅ 데이터 내보내기
│   ├── integrity.ts            # ✅ 무결성 검사
│   ├── problem_detector.ts     # ✅ 문제 세션 감지
│   ├── statistics.ts           # ✅ 통계 계산
│   └── types.ts
└── ui/
    ├── index.ts
    ├── AdminDashboard/
    │   ├── index.ts
    │   └── StatsOverview.tsx   # ✅
    ├── DataExplorer/
    │   ├── index.ts
    │   ├── RecordsExplorer.tsx # ✅
    │   └── SessionsExplorer.tsx # ✅
    ├── DataExport/
    │   ├── index.ts
    │   └── ExportPanel.tsx     # ✅
    ├── IntegrityCheck/
    │   ├── index.ts
    │   └── IntegrityChecker.tsx # ✅
    ├── RecordsTab/
    │   ├── index.ts
    │   └── DuplicatesView.tsx  # ✅
    ├── SessionsTab/
    │   ├── index.ts
    │   ├── ConflictsView.tsx   # ✅
    │   └── ProblemsList.tsx    # ✅
    ├── Statistics/
    │   ├── index.ts
    │   ├── CategoryAnalysis.tsx # ✅
    │   ├── StatsDashboard.tsx  # ✅ (971줄 - 추가 분리 필요)
    │   └── TimeChart.tsx       # ✅
    └── TrashManagement/
        ├── index.ts
        └── TrashManager.tsx    # ✅
```

### 1.3 메인 컴포넌트 내부 구조

```typescript
// AdminSessionGrid.tsx 주요 섹션

// 1. 임포트 (1-58줄) - ~58줄
// 2. 타입 정의 (63-92줄) - ~30줄
// 3. 헬퍼 함수 (94-400줄) - ~306줄
//    - detectSessionProblems (94-142줄)
//    - findProblemSessions (144-170줄)
//    - 기타 유틸 함수들

// 4. 메인 컴포넌트 시작 (402줄~)

// 상태 (state)
- 날짜 범위 (410-420줄)
- 탭 상태 (420-430줄)
- 필터 상태 (430-450줄)

// 파생 데이터 (useMemo)
- 필터링된 세션 (460-550줄)
- 충돌 감지 (550-600줄)
- 통계 계산 (600-700줄)

// 핸들러 함수들 (~300줄)
- 삭제/수정 핸들러 (700-1000줄)

// 렌더링 (~1,200줄)
- 탭 패널들 (1000-2200줄)
```

---

## 2. 분리 계획

### 2.1 현재 상태 평가

AdminSessionGrid는 이미 features/admin에 **대부분 분리되어 있음**.

**문제점**:

1. 메인 컴포넌트(AdminSessionGrid.tsx)가 여전히 2,278줄
2. 헬퍼 함수들이 메인 파일에 있음
3. 탭 렌더링 로직이 메인에 있음

### 2.2 목표 구조

```
features/admin/
├── index.ts                       # Public API
├── lib/
│   ├── ...                        # ✅ 기존 유지
│   └── session_problems.ts        # NEW: detectSessionProblems 이동
├── hooks/
│   ├── index.ts                   # NEW
│   ├── useAdminData.ts            # NEW: 데이터 필터링/통계
│   └── useAdminActions.ts         # NEW: 삭제/수정 액션
└── ui/
    ├── index.ts
    ├── AdminSessionGrid/          # NEW: 메인 컴포넌트
    │   ├── index.ts
    │   └── AdminSessionGrid.tsx   # ~250줄 (탭 오케스트레이션)
    ├── AdminTabs/                 # NEW: 탭 컴포넌트
    │   ├── index.ts
    │   ├── OverviewTab.tsx        # 개요 탭
    │   ├── SessionsTab.tsx        # 세션 탭 (충돌, 문제)
    │   ├── RecordsTab.tsx         # 레코드 탭 (중복)
    │   ├── StatsTab.tsx           # 통계 탭
    │   ├── ExportTab.tsx          # 내보내기 탭
    │   └── IntegrityTab.tsx       # 무결성 탭
    └── (기존 하위 컴포넌트들)     # ✅ 유지
```

### 2.3 분리 단계

#### Step 1: 순수 함수 이동 (lib/)

| 함수명                | 현재 위치             | 이동 위치                      |
| --------------------- | --------------------- | ------------------------------ |
| detectSessionProblems | AdminSessionGrid 내부 | lib/problem_detector.ts (병합) |
| findProblemSessions   | AdminSessionGrid 내부 | lib/problem_detector.ts (병합) |

#### Step 2: 훅 추출 (hooks/)

| 훅명            | 책임                  | 예상 줄 수 |
| --------------- | --------------------- | ---------- |
| useAdminData    | 필터링, 통계 계산     | ~100       |
| useAdminActions | 삭제, 수정, 복구 액션 | ~80        |

#### Step 3: 탭 컴포넌트 분리 (ui/AdminTabs/)

| 컴포넌트명   | 책임                           | 예상 줄 수 |
| ------------ | ------------------------------ | ---------- |
| OverviewTab  | 전체 개요                      | ~100       |
| SessionsTab  | 세션 충돌/문제 표시            | ~150       |
| RecordsTab   | 레코드 중복 표시               | ~100       |
| StatsTab     | 통계 (StatsDashboard 래퍼)     | ~80        |
| ExportTab    | 내보내기 (ExportPanel 래퍼)    | ~60        |
| IntegrityTab | 무결성 검사 (IntegrityChecker) | ~60        |

---

## 3. 상세 분리 계획

### 3.1 hooks/useAdminData.ts

```typescript
// 관리자 데이터 관리 훅

export interface UseAdminDataOptions {
    date_range: [string, string];
    include_deleted?: boolean;
}

export interface UseAdminDataReturn {
    // 필터링된 데이터
    filtered_records: WorkRecord[];
    filtered_sessions: SessionWithMeta[];

    // 문제 감지
    problem_sessions: Map<string, ProblemInfo[]>;
    conflicts: ConflictInfo[];

    // 통계
    stats: AdminStats;

    // 로딩 상태
    is_loading: boolean;
}

export function useAdminData(options: UseAdminDataOptions): UseAdminDataReturn {
    const { records } = useWorkStore();

    const filtered_records = useMemo(
        () => filterByDateRange(records, options.date_range),
        [records, options.date_range]
    );

    const problem_sessions = useMemo(
        () => findProblemSessions(filtered_records),
        [filtered_records]
    );

    const conflicts = useMemo(
        () => findConflicts(filtered_records),
        [filtered_records]
    );

    // ...
}
```

### 3.2 ui/AdminSessionGrid/AdminSessionGrid.tsx (메인)

```typescript
// 메인 컴포넌트 (~250줄)

export default function AdminSessionGrid() {
  // 1. 인증 체크
  const { user } = useAuth();
  const is_admin = user?.email === ADMIN_EMAIL;

  if (!is_admin) {
    return <AccessDenied />;
  }

  // 2. 상태
  const [active_tab, setActiveTab] = useState('overview');
  const [date_range, setDateRange] = useState<[Dayjs, Dayjs]>([...]);

  // 3. 데이터 훅
  const { filtered_records, problem_sessions, conflicts, stats } = useAdminData({
    date_range: [date_range[0].format('YYYY-MM-DD'), date_range[1].format('YYYY-MM-DD')],
  });

  // 4. 렌더링
  return (
    <Layout>
      <Content>
        {/* 헤더 */}
        <Card>
          <Title>관리자 대시보드</Title>
          <RangePicker value={date_range} onChange={setDateRange} />
        </Card>

        {/* 탭 */}
        <Tabs activeKey={active_tab} onChange={setActiveTab}>
          <TabPane key="overview" tab="개요">
            <OverviewTab stats={stats} />
          </TabPane>
          <TabPane key="sessions" tab="세션">
            <SessionsTab
              problems={problem_sessions}
              conflicts={conflicts}
            />
          </TabPane>
          <TabPane key="records" tab="레코드">
            <RecordsTab records={filtered_records} />
          </TabPane>
          <TabPane key="stats" tab="통계">
            <StatsTab records={filtered_records} />
          </TabPane>
          <TabPane key="export" tab="내보내기">
            <ExportTab records={filtered_records} />
          </TabPane>
          <TabPane key="integrity" tab="무결성">
            <IntegrityTab />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
}
```

### 3.3 ui/AdminTabs/SessionsTab.tsx

```typescript
// 세션 탭 (~150줄)

interface SessionsTabProps {
    problems: Map<string, ProblemInfo[]>;
    conflicts: ConflictInfo[];
}

export function SessionsTab({ problems, conflicts }: SessionsTabProps) {
    const [view, setView] = useState<"conflicts" | "problems">("conflicts");

    return (
        <Card>
            <Segmented
                options={[
                    { value: "conflicts", label: `충돌 (${conflicts.length})` },
                    { value: "problems", label: `문제 (${problems.size})` },
                ]}
                value={view}
                onChange={setView}
            />

            {view === "conflicts" ? (
                <ConflictsView conflicts={conflicts} />
            ) : (
                <ProblemsList problems={problems} />
            )}
        </Card>
    );
}
```

---

## 4. StatsDashboard 추가 분리 (971줄)

StatsDashboard.tsx도 큰 편이므로 추가 분리 검토:

```
features/admin/ui/Statistics/
├── index.ts
├── StatsDashboard.tsx        # 메인 (~200줄)
├── TimeChart.tsx             # ✅ 기존
├── CategoryAnalysis.tsx      # ✅ 기존
├── TrendChart.tsx            # NEW: 추세 차트
├── SummaryCards.tsx          # NEW: 요약 카드들
└── PeriodSelector.tsx        # NEW: 기간 선택
```

---

## 5. 마이그레이션 체크리스트

### 5.1 순수 함수 이동

-   [ ] `detectSessionProblems` → `lib/problem_detector.ts`에 병합
-   [ ] `findProblemSessions` → `lib/problem_detector.ts`에 병합
-   [ ] 테스트 확인/업데이트

### 5.2 훅 추출

-   [ ] `hooks/useAdminData.ts` 생성
    -   [ ] 필터링 로직
    -   [ ] 통계 계산 로직
    -   [ ] 테스트 작성
-   [ ] `hooks/useAdminActions.ts` 생성
    -   [ ] 삭제/수정/복구 액션
    -   [ ] 테스트 작성

### 5.3 탭 컴포넌트 분리

-   [ ] `ui/AdminTabs/` 폴더 생성
-   [ ] `OverviewTab.tsx` 생성
-   [ ] `SessionsTab.tsx` 생성
-   [ ] `RecordsTab.tsx` 생성
-   [ ] `StatsTab.tsx` 생성
-   [ ] `ExportTab.tsx` 생성
-   [ ] `IntegrityTab.tsx` 생성

### 5.4 메인 컴포넌트 리팩토링

-   [ ] `ui/AdminSessionGrid/` 생성
-   [ ] 메인 컴포넌트 250줄 이내로 축소

### 5.5 정리

-   [ ] index.ts 업데이트
-   [ ] 기존 `components/AdminSessionGrid.tsx` 삭제
-   [ ] import 경로 업데이트
-   [ ] 테스트 마이그레이션

---

## 6. 예상 결과

### 6.1 줄 수 비교

| 항목                    | Before | After |
| ----------------------- | ------ | ----- |
| AdminSessionGrid.tsx    | 2,278  | -     |
| AdminSessionGrid (메인) | -      | ~250  |
| hooks/\*.ts             | -      | ~180  |
| ui/AdminTabs/\*.tsx     | -      | ~550  |
| **총계**                | 2,278  | ~980  |

### 6.2 개선 효과

-   기존 features/admin 구조 활용으로 빠른 분리 가능
-   탭 컴포넌트 독립으로 유지보수 용이
-   순수 함수 테스트 가능

---

## 참고

-   [PHASE8_OVERVIEW.md](./PHASE8_OVERVIEW.md) - 전체 개요
-   기존 features/admin 구조 대부분 재사용
