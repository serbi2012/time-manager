# 사용 설명서 동기화 규칙

## 개요

이 프로젝트는 `/guide` 경로에 마크다운 기반 사용 설명서를 제공합니다.
**기능이 추가되거나 수정되면 반드시 해당 문서도 함께 업데이트해야 합니다.**

## 문서 파일 위치

```
src/docs/
├── index.ts           # 문서 목차 및 내보내기
├── getting-started.md # 시작하기
├── daily-record.md    # 일간 기록
├── work-preset.md     # 작업 프리셋
├── weekly-schedule.md # 주간 일정
├── suggestions.md     # 건의사항
├── settings.md        # 설정
└── shortcuts.md       # 단축키 목록
```

## 문서-기능 매핑

| 기능 영역                   | 관련 문서            | 관련 컴포넌트/모듈                                                     |
| --------------------------- | -------------------- | ---------------------------------------------------------------------- |
| 작업 기록, 타이머, 간트차트 | `daily-record.md`    | `components/WorkRecordTable.tsx`, `features/gantt-chart/`              |
| 작업 프리셋                 | `work-preset.md`     | `components/WorkTemplateList.tsx`, `features/work-template/`           |
| 주간 일정, 복사 기능        | `weekly-schedule.md` | `components/WeeklySchedule.tsx`, `features/weekly-schedule/`           |
| 건의사항 게시판             | `suggestions.md`     | `components/SuggestionBoard.tsx`                                       |
| 설정, 데이터 관리, 동기화   | `settings.md`        | `components/SettingsModal.tsx`, `features/settings/ui/tabs/`           |
| 키보드 단축키               | `shortcuts.md`       | `hooks/useShortcuts.ts`, `store/useShortcutStore.ts`                   |
| 로그인, 앱 개요             | `getting-started.md` | `app/App.tsx`, `app/layouts/`, `firebase/useAuth.ts`                   |

## 변경 유형별 문서 업데이트

### 1. 새 기능 추가 시

1. 해당 문서 파일에 새 섹션 추가
2. 필요시 Mermaid 다이어그램으로 프로세스 설명
3. 관련 문서에 위키 링크 추가: `[링크텍스트](wiki:section-id)`
4. `DemoComponents.tsx`에 UI 데모 추가 (필요시)

### 2. 기존 기능 수정 시

1. 변경된 동작 설명 업데이트
2. 스크린샷/다이어그램이 있다면 갱신
3. 관련 테이블(컬럼 설명 등) 업데이트

### 3. 기능 제거 시

1. 해당 설명 제거 또는 "지원 중단" 표시
2. 다른 문서의 관련 링크 정리

### 4. 단축키 변경 시

1. `shortcuts.md`의 단축키 테이블 업데이트
2. 관련 문서의 단축키 언급 부분도 수정

## 문서 작성 가이드

### 마크다운 문법

```markdown
# 제목 (h1) - 페이지 제목

## 제목 (h2) - 주요 섹션

### 제목 (h3) - 하위 섹션

**굵은 글씨** - 강조
`코드` - 인라인 코드, 단축키

| 컬럼1 | 컬럼2 |
| ----- | ----- |
| 값1   | 값2   |

> 💡 **팁**: 유용한 정보

[링크텍스트](wiki:section-id) - 내부 위키 링크
```

### Mermaid 다이어그램

프로세스 설명에 Mermaid 사용:

```markdown
\`\`\`mermaid
flowchart LR
A[시작] --> B[처리] --> C[완료]
\`\`\`
```

### 데모 컴포넌트 삽입

실제 UI 미리보기 삽입:

```markdown
:::demo WorkRecordTable:::
:::demo WorkTemplateList:::
:::demo DailyGanttChart:::
```

## 새 문서 추가 시

1. `src/docs/` 폴더에 `.md` 파일 생성
2. `src/docs/index.ts` 업데이트:
    - import 추가
    - `TABLE_OF_CONTENTS` 배열에 항목 추가
    - `DOCS` 배열에 항목 추가

```typescript
// index.ts 예시
import new_doc from "./new-doc.md?raw";

export const TABLE_OF_CONTENTS = [
    // ... 기존 항목
    { id: "new-doc", title: "새 문서" },
];

export const DOCS = [
    // ... 기존 항목
    { id: "new-doc", title: "새 문서", content: new_doc },
];
```

## 체크리스트

기능 변경 후 다음을 확인하세요:

-   [ ] 관련 문서 내용 업데이트
-   [ ] 위키 링크가 올바르게 작동하는지 확인
-   [ ] 데모 컴포넌트가 필요하면 추가/수정
-   [ ] `changelog.ts`에 변경 내역 추가
-   [ ] 버전 번호 업데이트 (필요시)

## 주의사항

-   유치한 비유나 과도한 이모지 사용 자제
-   기술적으로 정확하고 간결하게 작성
-   실제 UI와 문서 설명이 일치하는지 확인
-   **관리자 기능(`/admin`, `AdminSessionGrid.tsx` 등)은 문서화하지 않음** - 내부 디버깅/관리 용도

---

# 부록: 데모 컴포넌트 동기화

`/guide`(사용 설명서)는 마크다운 안에서 `:::demo <이름>:::` 표기로 실제 UI와 똑같이 생긴 데모를 렌더한다.
**UI가 바뀌면 데모도 함께 고쳐야 한다.**

## 파일 구성

```
src/components/guide/
├── DemoComponents.tsx        DEMO_COMPONENTS 레지스트리 + DemoRenderer
├── DemoWorkRecordTable.tsx   작업 기록 테이블 데모
├── DemoWorkTemplateList.tsx  작업 프리셋 목록 데모
├── DemoDailyGanttChart.tsx   간트차트 데모
├── DemoMiscComponents.tsx    DemoEmptyState, DemoShortcutsTable, DemoSettingsPanel
└── demo_data.ts              더미 데이터
```

## 등록된 데모와 대응하는 실제 UI

| `:::demo` 이름 | 데모 파일 | 실제 UI |
| --- | --- | --- |
| `WorkRecordTable` | `DemoWorkRecordTable.tsx` | `features/work-record/ui/Desktop/` |
| `WorkTemplateList` | `DemoWorkTemplateList.tsx` | `features/work-template/ui/Desktop/` |
| `DailyGanttChart` | `DemoDailyGanttChart.tsx` | `features/gantt-chart/ui/DailyGanttChart/` |
| `EmptyState` | `DemoMiscComponents.tsx` | `shared/ui/layout/EmptyState.tsx` |
| `ShortcutsTable` | `DemoMiscComponents.tsx` | `features/settings/ui/tabs/ShortcutsTab.tsx` |
| `SettingsPanel` | `DemoMiscComponents.tsx` | `features/settings/ui/` |

## 변경 시 체크리스트

1. 테이블 컬럼 추가/삭제 → `DemoWorkRecordTable`의 `columns` 배열과 `demo_data.ts`의 더미 데이터
2. 카드/리스트 레이아웃 변경 → 해당 데모 파일의 JSX
3. 버튼/아이콘 추가/삭제 → 데모에도 동일하게
4. 스타일 클래스 변경 → `src/styles/components/demo.css`
5. 새 데모가 필요하면 → 파일 생성 후 `DemoComponents.tsx`의 `DEMO_COMPONENTS`에 등록

## 데모 작성 규칙

1. **완전한 격리** — `useWorkStore` 등 실제 스토어를 절대 쓰지 않는다
2. **더미 데이터** — `demo_data.ts`의 데이터만 사용
3. **읽기 전용** — 버튼은 `disabled` 또는 빈 핸들러
4. **시각적 일치** — 레이아웃·스타일·아이콘이 실제 UI와 같아 보이는 것이 목적. 기능 구현은 불필요
5. 관리자 전용 컴포넌트(`AdminSessionGrid` 등)는 데모 대상이 아니다
