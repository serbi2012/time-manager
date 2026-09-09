# CLAUDE.md — 업무 시간 관리 (Time Manager)

실시간 타이머 기반 업무 시간 측정·관리 웹앱. React 19 + TypeScript + Vite + Zustand + Firebase.
Feature-Sliced Design 아키텍처, 데스크탑/모바일 컴포넌트 트리 완전 분리.

---

## 문서 라우팅 (작업 시작 전 반드시 확인)

| 이런 작업을 할 때                                | 먼저 읽을 문서                        |
| ------------------------------------------------ | ------------------------------------- |
| 코드를 작성/수정하는 모든 작업                   | `.claude/docs/coding-standards.md`    |
| UI 스타일·색상·폰트·여백·문구 작성               | `.claude/docs/design-system.md`       |
| 구조 파악, 새 파일 위치 결정, 데이터 모델 확인   | `.claude/docs/architecture.md`        |
| 라우트·설정·단축키·토큰 추가 등 정형화된 변경    | `.claude/docs/recipes.md`             |
| 테스트 작성                                      | `.claude/docs/testing.md`             |
| UI 신규 생성·리디자인·레이아웃 변경              | `.claude/docs/ui-mockup.md`           |
| 모바일 UI/로직 변경                              | `.claude/docs/mobile.md`              |
| 페이지·라우트·탭 전환 애니메이션                 | `.claude/docs/transitions.md`         |
| 단축키·포커스·모달 키보드 처리                   | `.claude/docs/keyboard-focus.md`      |
| 릴리즈 준비, 버전 업, CHANGELOG                  | `.claude/docs/release.md`             |
| 기능 추가/수정 후 사용 설명서·데모 반영          | `.claude/docs/docs-sync.md`           |
| 알려진 버그·미완료 리팩토링 확인                 | `.claude/docs/backlog.md`             |

슬래시 커맨드: `/release`(릴리즈 준비), `/mockup`(목업 프리뷰), `/sync-docs`(문서·데모 동기화)

---

## 명령어

```bash
pnpm dev              # 개발 서버 (http://localhost:5173)
pnpm build            # 프로덕션 빌드
pnpm typecheck        # 타입 검사 (tsc -b)
pnpm lint             # ESLint
pnpm test             # 테스트 watch
pnpm test:run         # 테스트 단일 실행
pnpm test:coverage    # 커버리지 (임계값: Stmts 65 / Branch 50 / Funcs 60 / Lines 65)
pnpm test:e2e         # Playwright E2E
pnpm storybook        # Storybook (:6006)
pnpm mockup           # 목업 서버 (:3456)
```

패키지 매니저는 **pnpm 10** 고정. `npm`/`yarn` 사용 금지.
경로 별칭: `@/` → `src/` (vite.config.ts, vitest.config.ts, tsconfig 모두 등록됨)

---

## 절대 규칙 (Non-Negotiable)

아래 9개는 어떤 상황에서도 타협하지 않는다. 상세 근거와 예시는 `.claude/docs/coding-standards.md`.

1. **테스트 가능성 우선** — 모든 비즈니스 로직은 `lib/`에 순수 함수로. 부수 효과는 훅/스토어에서만.
2. **파일 300줄 초과 시 분리 검토, 500줄 초과 시 반드시 분리.** 한 파일 = 한 컴포넌트.
3. **JSX는 컴포넌트 return 문에서만.** `useMemo`/`optionRender`/`content={<div>…</div>}` 안의 인라인 JSX는 줄 수와 무관하게 즉시 별도 컴포넌트로 분리.
4. **모바일/데스크탑 완전 분리.** 컴포넌트 안에서 `is_mobile`로 분기 금지. 진입점에서 `Mobile*.tsx` / `Desktop*.tsx`를 고른다.
5. **스타일은 Tailwind 유틸리티 클래스 우선.** `style={{}}`과 `CSSProperties` 상수는 **동적 계산 값**에만. 조건부는 `cn()`.
6. **하드코딩 금지** — 색상 hex, 폰트 크기/굵기 숫자, 여백 px, 사용자에게 보이는 모든 문구(`message.*` 인자 포함). 전부 디자인 토큰 또는 `shared/constants/`의 상수로.
7. **단방향 의존성** — `pages → widgets → features → shared`. feature 간 직접 import 금지, 순환 의존성 금지.
8. **`any` 금지.** 불가피하면 `unknown`. 타입 단언(`as`) 최소화.
9. **키보드 입력은 매니저로.** `window.addEventListener("keydown")`이나 `onKeyDown`으로 단축키를 처리하지 않는다. 모달은 `useModalKeyboard`, 확인창은 `ConfirmPopconfirm`, 그 외는 `useShortcut`.

### 금지 패턴

God Component(500줄+) / 3단계 이상 prop drilling / 복붙 / 매직 넘버 / 순수 함수 내 전역 상태 참조 / 플랫폼 결합 / 순환 의존성 / 테스트 불가능한 구조 / 키보드 리스너 직접 등록

---

## 코드 스타일

| 대상            | 규칙                | 예시                                    |
| --------------- | ------------------- | --------------------------------------- |
| 들여쓰기        | **스페이스 4칸**    | 이 프로젝트의 기존 코드 전체가 4칸이다  |
| 변수            | `snake_case`        | `selected_date`, `work_name`            |
| 함수            | `camelCase`         | `handleAddWork`, `formatDuration`       |
| 컴포넌트        | `PascalCase`        | `WorkRecordTable`                       |
| 상수            | `UPPER_SNAKE_CASE`  | `DEFAULT_TASK_OPTIONS`                  |
| 타입/인터페이스 | `PascalCase`        | `WorkRecord`, `TimerState`              |
| 컴포넌트 파일   | `PascalCase.tsx`    | `MobileRecordCard.tsx`                  |
| 훅 파일         | `camelCase.ts`      | `useGanttDrag.ts`                       |
| 유틸/타입 파일  | `snake_case.ts`     | `conflict_detector.ts`, `domain.ts`     |
| 테스트 파일     | `*.test.ts(x)`      | `calculators.test.ts`                   |

**주석**: 새로 작성하거나 수정하는 코드에는 설명 주석(`//`, `/* */`, JSDoc)과 `TODO`를 넣지 않는다.
기존 파일의 JSDoc 헤더는 요청 없이 지우거나 고치지 않는다(최소 변경).
예외는 `@ts-ignore`·`eslint-disable` 같은 도구 지시자뿐이다.

**Git 커밋**: 변경 내용만 담는다. `Co-Authored-By: Claude`, `🤖 Generated with Claude Code` 등 도구 서명을 붙이지 않는다.

---

## 아키텍처 요약

```
src/
├── app/          앱 진입점 — App.tsx, providers/ThemeProvider, layouts/{Desktop,Mobile}Layout
├── pages/        페이지 — DailyPage/{index,Desktop*,Mobile*}, WeeklyPage
├── widgets/      조합 위젯 — Header, Navigation, SyncStatus
├── features/     기능 모듈 — timer, work-record, work-template, gantt-chart,
│                 weekly-schedule, settings, admin, sync, guide, suggestion
│                 각 feature: constants/ hooks/ lib/ model/ ui/ + index.ts(Public API)
├── shared/       공유 — lib/(time,lunch,session,record,data) ui/ types/ hooks/ constants/ config/
├── store/        Zustand — useWorkStore(슬라이스 6종), useShortcutStore
├── firebase/     config, firestore, syncService, migration, suggestionService, useAuth
├── styles/       tokens/ overrides/ components/ utilities/ + global.css
├── docs/         /guide 페이지에 렌더되는 사용 설명서 마크다운
├── constants/    changelog.ts (버전 히스토리 — 릴리즈 시 갱신)
├── components/   features/로 가는 얇은 진입점 래퍼 + /guide 데모. 실제 구현은 features에 있다
│                 예외: ChangelogModal.tsx만 여기가 실제 구현
└── test/         unit/ component/ hooks/ store/ integration/ snapshot/ e2e/ helpers/
```

라우트: `/`(일간) `/weekly` `/guide`는 양쪽, `/suggestions` `/admin`은 **데스크탑에만** 등록되어 있다.
브레이크포인트: 모바일 `max-width: 480px`, 데스크탑 `min-width: 1024px`

상세 구조·데이터 모델·스토어 슬라이스 인터페이스는 `.claude/docs/architecture.md` 참조.

---

## 작업 전 체크리스트

- [ ] 이 변경이 UI 신규/리디자인인가? → 목업 먼저 (`.claude/docs/ui-mockup.md`)
- [ ] 모바일 파일을 건드리는가? → 안전 등급 확인 (`.claude/docs/mobile.md`)
- [ ] 새 파일을 만드는가? → 레이어와 위치가 맞는지 (`.claude/docs/architecture.md`)
- [ ] 건드리는 영역에 알려진 이슈나 미완료 리팩토링이 있는가? (`.claude/docs/backlog.md`)
- [ ] `lib/`에 순수 함수를 추가했는가? → 유닛 테스트 필수

## 작업 후 체크리스트

- [ ] `pnpm lint` 통과
- [ ] `pnpm test:run` 통과 (변경 기능에 대한 테스트 추가/수정 포함)
- [ ] 파일 300줄 이하, 인라인 JSX 없음, 하드코딩 문자열/색상/px 없음
- [ ] 사용자에게 보이는 기능이 바뀌었으면 `src/docs/`의 설명서도 갱신 (`.claude/docs/docs-sync.md`)
