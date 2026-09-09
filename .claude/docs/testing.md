# 테스트 전략

Vitest + @testing-library/react + Playwright(E2E). 환경은 happy-dom.

---

## 1. 실행

```bash
pnpm test                    # watch
pnpm test:run                # 단일 실행
pnpm test:coverage           # 커버리지 (임계값 미달 시 실패)
pnpm test:e2e                # Playwright
pnpm test:run src/test/unit  # 특정 경로만
```

커버리지 임계값 (`vitest.config.ts`): Statements 65 / Branches 50 / Functions 60 / Lines 65.
릴리즈 전에는 반드시 `pnpm test:coverage`가 통과해야 한다.

---

## 2. 폴더 구조

테스트는 `src/test/` 아래에 소스 구조를 미러링해 둔다.

| 폴더 | 대상 |
| --- | --- |
| `unit/shared/`, `unit/features/*/lib/`, `unit/store/`, `unit/firebase/` | 순수 함수 유닛 테스트 |
| `component/features/`, `component/shared/`, `component/widgets/` | UI 컴포넌트 렌더링·상호작용 |
| `components/` | 레거시 `src/components/` 통합 테스트 |
| `hooks/features/`, `hooks/shared/` | 커스텀 훅 |
| `store/` | Zustand 스토어 |
| `integration/keyboard/` | 단축키 등 통합 시나리오 |
| `snapshot/` | 레이아웃·테이블 구조 스냅샷 |
| `firebase/` | Firebase 연동 (MSW 모킹) |
| `e2e/` | Playwright 스펙 |
| `helpers/` | 목 팩토리, 렌더 헬퍼, 커스텀 매처 |
| `setup.ts`, `setup/msw.setup.ts` | 전역 셋업, MSW 핸들러 |

`shared/ui/`의 일부 컴포넌트는 co-located 테스트(`DataTable.test.tsx` 등)를 쓴다. 새 테스트는 원칙적으로 `src/test/`에 둔다.

---

## 3. 필수 테스트 대상

| 대상 | 유형 | 필수 |
| --- | --- | --- |
| `lib/`의 순수 함수 | 유닛 | 필수 |
| 커스텀 훅 | 훅 테스트 | 필수 |
| 폼 컴포넌트 | 상호작용 | 필수 |
| 모달 | 열기/닫기/제출 상태 | 필수 |
| 단축키 | 키보드 이벤트 | 필수 |
| 스토어 액션 | 상태 변경 | 필수 |
| 레이아웃 | 스냅샷 | 권장 |

버그 수정 시에는 **먼저 실패하는 회귀 테스트를 작성**한 뒤 고친다.

---

## 4. 테스트 헬퍼

`@/test/helpers`에서 전부 가져온다. 테스트 파일 안에 목 데이터를 하드코딩하지 않는다.

### 목 팩토리 (`mock_factory.ts`)

```typescript
import { createMockRecord, createMockSession, createMockTemplate, SCENARIOS } from "@/test/helpers";

createMockRecord({ work_name: "테스트 작업" });
createMockRecords(10, { date: "2026-01-15" });
createMockSession({ start_time: "09:00", end_time: "10:00" });
createMockTemplate({ color: "#3182F6" });
createMockWeeklyRecords(week_start_date);
createMockRecordsForDateRange(start, end);
```

`SCENARIOS`에 준비된 시나리오:

| 시나리오 | 내용 |
| --- | --- |
| `emptyDay()` | 빈 하루 |
| `busyDay(date?)` | 레코드 10개 |
| `withConflicts(date?)` | 09:00-10:00 / 09:30-10:30 시간 충돌 |
| `completedRecords(count)` | 완료된 레코드 |
| `deletedRecords(count)` | 휴지통 레코드 |
| `longSession(date?)` | 480분 단일 세션 |
| `multiSession(date?, n)` | 다중 세션 레코드 |

### 렌더 헬퍼 (`test_utils.tsx`)

```typescript
import { render, screen, userEvent } from "@/test/helpers";

// render는 renderWithProviders의 별칭 — Provider가 이미 감싸져 있고 user를 함께 반환한다
const { user } = render(<SettingsModal open />);
await user.click(screen.getByRole("button", { name: /닫기/ }));
```

옵션: `initialRoute`, `useMemoryRouter`(MemoryRouter로 감쌈), `withoutWrapper`(Provider 없이).

기타: `wait(ms)`, `waitForAnimation(ms)`, `waitForElement(...)`, `waitForAnimations(el)`,
`createF8Event()`, `createEscapeEvent()`, `createCtrlSEvent()`, `resetStore(store, initial_state)`.

### 커스텀 매처 (`custom_matchers.ts` — import만으로 등록됨)

```typescript
expect("09:30").toBeValidTimeFormat();
expect("2026-01-15").toBeValidDateFormat();
expect(record).toBeValidWorkRecord();
expect(session).toBeValidWorkSession();
expect("09:30").toBeWithinTimeRange("09:00", "10:00");
```

---

## 5. 작성 규칙

### 네이밍 — 행동 기반, 한글

```typescript
// 권장
it("F8 키를 누르면 타이머가 시작된다", () => {});
it("빈 입력 시 에러 메시지가 표시된다", () => {});

// 금지 — 구현 기반
it("handleClick이 호출된다", () => {});
it("state가 true가 된다", () => {});
```

### AAA 패턴

```typescript
it("작업을 추가하면 목록에 표시된다", async () => {
    // Arrange
    const { user } = render(<WorkRecordTable records={[]} />);

    // Act
    await user.click(screen.getByText("추가"));
    await user.type(screen.getByLabelText("작업명"), "새 작업");
    await user.click(screen.getByText("저장"));

    // Assert
    expect(screen.getByText("새 작업")).toBeInTheDocument();
});
```

### 유형별 예시

**유닛**
```typescript
describe("timeToMinutes", () => {
    it("09:30을 570분으로 변환한다", () => {
        expect(timeToMinutes("09:30")).toBe(570);
    });
});
```

**모달** — 열기 / 버튼 닫기 / ESC 닫기 / 제출 4가지를 모두 검증한다.

```typescript
it("ESC 키를 누르면 모달이 닫힌다", () => {
    render(<SettingsModal open onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
});
```

**단축키**
```typescript
it("F8 키를 누르면 타이머가 시작된다", () => {
    render(<App />);
    fireEvent.keyDown(document, { key: "F8", code: "F8" });
    expect(screen.getByTestId("timer")).toHaveTextContent(/\d{2}:\d{2}/);
});
```

**스냅샷** — 레이아웃, 복잡한 테이블/리스트, 디자인 시스템 컴포넌트에만. 날짜·ID 같은 동적 값은 반드시 고정한다. 스냅샷이 자주 깨지면 범위를 좁힌다.

---

## 6. 주의사항

- `vitest.config.ts`에 `mockReset: true`가 켜져 있다. 각 테스트마다 mock이 초기화되므로 `beforeEach`에서 다시 설정한다.
- Zustand 스토어는 테스트 간 상태가 남는다. `resetStore(useWorkStore, initial_state)`로 정리한다.
- Firebase 호출은 MSW(`src/test/setup/msw.setup.ts`)로 가로챈다. 실제 네트워크를 타지 않는다.
- 시간 계산 테스트는 점심시간 설정에 의존한다. 기본값을 가정하지 말고 필요한 값을 명시적으로 주입한다.
- `testTimeout`은 10초다. 애니메이션 대기가 필요하면 `waitForAnimation()`을 쓴다.
