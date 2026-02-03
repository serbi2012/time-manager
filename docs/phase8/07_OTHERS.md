# 기타 컴포넌트 분리 계획

> SuggestionBoard (773줄), GuideBook (574줄) 등

---

## 1. SuggestionBoard (773줄)

### 1.1 현재 파일

-   위치: `src/components/SuggestionBoard.tsx`
-   줄 수: 773줄

### 1.2 주요 구조

```typescript
// SuggestionBoard.tsx

// 1. 임포트 (1-50줄)
// 2. 타입 정의 (52-80줄)
//    - Suggestion, SuggestionStatus
// 3. 상수 (82-100줄)
//    - STATUS_CONFIG, STATUS_OPTIONS

// 4. 메인 컴포넌트 (102줄~)

// 상태
- suggestions 목록
- 필터 상태
- 모달 상태
- 폼 상태

// 핸들러
- handleAdd, handleEdit, handleDelete
- handleStatusChange
- handleVote

// 렌더링
- 필터 UI
- 제안 목록
- 상세 모달
- 추가/편집 모달
```

### 1.3 분리 계획

```
features/suggestion/
├── index.ts
├── model/
│   ├── types.ts              # Suggestion, SuggestionStatus
│   └── constants.ts          # STATUS_CONFIG
├── lib/
│   └── suggestion_filters.ts # 필터링 함수
├── hooks/
│   └── useSuggestions.ts     # 제안 목록 관리
└── ui/
    ├── SuggestionBoard/
    │   └── SuggestionBoard.tsx # 메인 (~200줄)
    ├── SuggestionList/
    │   └── SuggestionList.tsx  # 목록
    ├── SuggestionCard/
    │   └── SuggestionCard.tsx  # 카드
    ├── SuggestionFilters/
    │   └── SuggestionFilters.tsx # 필터
    └── SuggestionFormModal/
        └── SuggestionFormModal.tsx # 폼 모달
```

### 1.4 체크리스트

-   [ ] `features/suggestion/` 폴더 생성
-   [ ] `model/types.ts` 생성
-   [ ] `model/constants.ts` 생성
-   [ ] `lib/suggestion_filters.ts` 생성
-   [ ] `hooks/useSuggestions.ts` 생성
-   [ ] UI 컴포넌트 분리
-   [ ] 기존 `components/SuggestionBoard.tsx` 삭제

### 1.5 예상 줄 수

| 항목                   | Before | After |
| ---------------------- | ------ | ----- |
| SuggestionBoard.tsx    | 773    | -     |
| SuggestionBoard (메인) | -      | ~200  |
| model/\*.ts            | -      | ~50   |
| lib/\*.ts              | -      | ~40   |
| hooks/\*.ts            | -      | ~80   |
| ui/\*                  | -      | ~300  |
| **총계**               | 773    | ~670  |

---

## 2. GuideBook (574줄)

### 2.1 현재 파일

-   위치: `src/components/GuideBook.tsx`
-   줄 수: 574줄

### 2.2 주요 구조

```typescript
// GuideBook.tsx

// 1. 임포트 (1-30줄)
// 2. 가이드 콘텐츠 데이터 (32-400줄)
//    - 각 기능별 설명, 단축키 등

// 3. 메인 컴포넌트 (402줄~)

// 상태
- 선택된 섹션
- 검색어

// 렌더링
- 네비게이션 (사이드바)
- 콘텐츠 영역
```

### 2.3 분리 계획

GuideBook은 주로 **정적 콘텐츠**이므로 다른 패턴 적용:

```
features/guide/
├── index.ts
├── content/                  # 콘텐츠 데이터 분리
│   ├── index.ts
│   ├── getting_started.ts    # 시작하기
│   ├── daily_work.ts         # 일간 작업
│   ├── templates.ts          # 템플릿
│   ├── shortcuts.ts          # 단축키
│   └── tips.ts               # 팁
├── hooks/
│   └── useGuideNavigation.ts # 네비게이션 상태
└── ui/
    ├── GuideBook/
    │   └── GuideBook.tsx     # 메인 (~150줄)
    ├── GuideSidebar/
    │   └── GuideSidebar.tsx  # 사이드바
    └── GuideContent/
        └── GuideContent.tsx  # 콘텐츠 렌더러
```

### 2.4 체크리스트

-   [ ] `features/guide/` 폴더 생성
-   [ ] `content/` 콘텐츠 데이터 분리
-   [ ] `hooks/useGuideNavigation.ts` 생성
-   [ ] UI 컴포넌트 분리
-   [ ] 기존 `components/GuideBook.tsx` 삭제

### 2.5 예상 줄 수

| 항목             | Before | After |
| ---------------- | ------ | ----- |
| GuideBook.tsx    | 574    | -     |
| GuideBook (메인) | -      | ~150  |
| content/\*.ts    | -      | ~300  |
| hooks/\*.ts      | -      | ~50   |
| ui/\*            | -      | ~150  |
| **총계**         | 574    | ~650  |

---

## 3. ChangelogModal (115줄)

### 3.1 현재 상태

-   위치: `src/components/ChangelogModal.tsx`
-   줄 수: 115줄 (이미 적절한 크기)

### 3.2 분리 여부

**분리 불필요** - 이미 적절한 크기이며 단일 책임을 가짐.

필요시 `features/changelog/`로 이동만 고려.

---

## 4. DemoComponents (가이드 내 데모)

### 4.1 현재 상태

-   위치: `src/components/guide/DemoComponents.tsx`

### 4.2 분리 계획

GuideBook과 함께 `features/guide/`로 이동:

```
features/guide/
├── ...
└── ui/
    └── DemoComponents/
        └── DemoComponents.tsx
```

---

## 5. 우선순위

| 순서 | 컴포넌트        | 줄 수 | 중요도 | 비고                  |
| ---- | --------------- | ----- | ------ | --------------------- |
| 1    | SuggestionBoard | 773   | 중     | 사용자 피드백 기능    |
| 2    | GuideBook       | 574   | 낮음   | 정적 콘텐츠, 비핵심   |
| 3    | ChangelogModal  | 115   | 낮음   | 분리 불필요           |
| 4    | DemoComponents  | -     | 낮음   | GuideBook과 함께 이동 |

---

## 6. 공통화 활용

### 6.1 SuggestionBoard에서 활용

| 공통 자원    | 사용 위치            |
| ------------ | -------------------- |
| FormModal    | SuggestionFormModal  |
| EmptyState   | 빈 목록 표시         |
| AnimatedList | 제안 목록 애니메이션 |

### 6.2 GuideBook에서 활용

| 공통 자원     | 사용 위치            |
| ------------- | -------------------- |
| HighlightText | 검색 결과 하이라이트 |

---

## 7. 마이그레이션 순서

1. **Step 3에서 진행** (중소형 컴포넌트 분리 단계)
2. SuggestionBoard → GuideBook 순으로 진행
3. ChangelogModal, DemoComponents는 필요시 이동만

---

## 참고

-   [PHASE8_OVERVIEW.md](./PHASE8_OVERVIEW.md) - 전체 개요
-   SuggestionBoard: 사용자 제안 기능
-   GuideBook: 사용 설명서
