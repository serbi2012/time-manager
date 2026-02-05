# 기타 컴포넌트 분리 계획

> **대상**: SuggestionBoard (773줄), GuideBook (574줄)  
> **목표**: 각 ~150줄  
> **예상 감소율**: **-81%** (평균)

---

## 0. ⚠️ 적용할 엄격한 리팩토링 기준 (Phase 1~7 확립)

### 핵심 원칙

✅ **useMemo 내 JSX 100% 금지**  
✅ **inline style 완전 금지**  
✅ **사용자 문구 100% 상수화**  
✅ **공통화 극대화** - 2회 이상 사용 시 무조건 공통화  
✅ **한 파일 = 한 컴포넌트**

---

## 1. SuggestionBoard 분리 계획

### 1.1 현재 상태 (773줄)

```typescript
// SuggestionBoard.tsx 주요 섹션

// 1. 임포트 (1-30줄) - 30줄
// 2. 메인 컴포넌트 (32-773줄) - ~741줄

// 상태 (~60줄)
- 필터 상태 (40-70줄)
- 모달 상태 (70-100줄)

// ⚠️ 렌더링 (~600줄)
- 헤더/필터 (100-200줄) - 100줄
  ✅ SuggestionHeader 컴포넌트로

- 건의사항 목록 (200-700줄) - 500줄
  ❌ 각 카드 inline 렌더링 (각 ~50줄 × 10개)
  ✅ SuggestionCard 컴포넌트로

- 상세 모달 (700-773줄) - 73줄
  ✅ SuggestionDetailModal 컴포넌트로
```

### 1.2 목표 구조

```
features/suggestion/
├── index.ts
│
├── constants/
│   ├── labels.ts              # NEW: UI 레이블
│   └── messages.ts            # NEW: 메시지
│
├── lib/
│   ├── suggestion_filters.ts  # NEW: 필터 로직
│   └── suggestion_sorter.ts   # NEW: 정렬 로직
│
├── hooks/
│   ├── useSuggestionData.ts   # NEW: 데이터 가공
│   └── useSuggestionFilters.ts # NEW: 필터 상태
│
└── ui/
    ├── SuggestionBoard/
    │   ├── index.ts
    │   ├── SuggestionBoard.tsx  # ✅ 메인 (~150줄)
    │   └── SuggestionHeader.tsx # NEW (~60줄)
    │
    ├── SuggestionCard/
    │   ├── index.ts
    │   ├── SuggestionCard.tsx   # NEW (~80줄)
    │   └── SuggestionBadge.tsx  # NEW (~30줄)
    │
    └── SuggestionModal/
        ├── index.ts
        ├── SuggestionDetailModal.tsx # NEW (~100줄)
        └── SuggestionReplyForm.tsx   # NEW (~80줄)
```

### 1.3 예상 성과

| 지표              | Before | After | 개선      |
| ----------------- | ------ | ----- | --------- |
| **총 줄 수**      | 773줄  | 150줄 | **-81%**  |
| **inline 렌더링** | 500줄  | 0줄   | **-100%** |
| **inline style**  | 30개   | 0개   | **-100%** |

---

## 2. GuideBook 분리 계획

### 2.1 현재 상태 (574줄)

```typescript
// GuideBook.tsx 주요 섹션

// 1. 임포트 (1-20줄) - 20줄
// 2. 가이드 데이터 (22-200줄) - ~178줄
//    ❌ 컴포넌트 내부에 데이터 하드코딩
//    ✅ constants/guide_data.ts로 분리

// 3. 메인 컴포넌트 (202-574줄) - ~372줄

// ⚠️ 렌더링 (~350줄)
- 사이드바 (220-300줄) - 80줄
  ✅ GuideSidebar 컴포넌트로

- 콘텐츠 영역 (300-550줄) - 250줄
  ❌ 각 섹션 inline (각 ~40줄 × 6개)
  ✅ GuideSection 컴포넌트로
```

### 2.2 목표 구조

```
features/guide/
├── index.ts
│
├── constants/
│   ├── guide_data.ts          # NEW: 가이드 데이터 (~200줄)
│   ├── labels.ts              # NEW: UI 레이블
│   └── config.ts              # NEW: 설정
│
├── hooks/
│   ├── useGuideNavigation.ts  # NEW: 네비게이션 상태 (~40줄)
│   └── useGuideSearch.ts      # NEW: 검색 기능 (~50줄)
│
└── ui/
    ├── GuideBook/
    │   ├── index.ts
    │   ├── GuideBook.tsx      # ✅ 메인 (~150줄)
    │   ├── GuideSidebar.tsx   # NEW (~80줄)
    │   └── GuideContent.tsx   # NEW (~100줄)
    │
    └── GuideSection/
        ├── index.ts
        ├── GuideSection.tsx   # NEW (~60줄)
        ├── CodeExample.tsx    # NEW (~50줄)
        └── TipBox.tsx         # NEW (~40줄)
```

### 2.3 예상 성과

| 지표                | Before | After           | 개선      |
| ------------------- | ------ | --------------- | --------- |
| **총 줄 수**        | 574줄  | 150줄           | **-74%**  |
| **하드코딩 데이터** | 178줄  | 0줄 (constants) | **-100%** |
| **inline 섹션**     | 240줄  | 0줄             | **-100%** |

---

## 3. 작업 체크리스트

### SuggestionBoard

-   [x] `author_utils.ts`, `time_formatter.ts` 순수 함수
-   [x] `useSuggestionData.ts` 훅
-   [x] `useSuggestionPostActions.ts` 훅
-   [x] `useReplyActions.ts` 훅
-   [x] `usePermissionCheck.ts` 훅
-   [x] `SuggestionCardHeader.tsx`, `SuggestionCardContent.tsx` 컴포넌트
-   [x] `ReplyItem.tsx` 컴포넌트
-   [x] `ReplyForm.tsx` 컴포넌트
-   [x] `AdminControls.tsx` 컴포넌트
-   [x] `SuggestionWriteModal.tsx`, `SuggestionEditModal.tsx` 모달
-   [x] `SuggestionBoard.tsx` (152줄)

### GuideBook

-   [x] `useGuideNavigation.ts` 훅 (~65줄)
-   [x] `useGuideSearch.ts` 훅 (~25줄)
-   [x] `GuideSidebar.tsx` (~120줄)
-   [x] `MobileSidebar.tsx` (~70줄)
-   [x] `NavButtons.tsx` (~30줄)
-   [x] `MermaidDiagram.tsx` (~30줄)
-   [x] `WikiLink.tsx` (~15줄)
-   [x] `GuideBook.tsx` (~260줄)

---

## 4. 통합 예상 성과

| 컴포넌트        | Before  | After | 감소     |
| --------------- | ------- | ----- | -------- |
| SuggestionBoard | 773줄   | 150줄 | **-81%** |
| GuideBook       | 574줄   | 150줄 | **-74%** |
| **총계**        | 1,347줄 | 300줄 | **-78%** |

---

## 5. 참고

-   [PHASE8_OVERVIEW.md](PHASE8_OVERVIEW.md)
-   [01_DAILY_GANTT_CHART.md](01_DAILY_GANTT_CHART.md)
