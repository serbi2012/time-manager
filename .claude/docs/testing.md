# 테스트 전략

Vitest 4 + @testing-library/react + Playwright(E2E). 테스트 프로젝트가 `node`와 `dom`(happy-dom) 둘로 나뉘어 있다.

---

## 1. 실행

```bash
pnpm test                    # watch
pnpm test:run                # 단일 실행
pnpm test:coverage           # 커버리지 (임계값 미달 시 실패)
pnpm test:e2e                # Playwright
pnpm test:run src/test/unit  # 특정 경로만
pnpm vitest related --run <바꾼 파일들>   # 바꾼 파일과 관련된 테스트만
pnpm vitest run --project node            # node 프로젝트만
```

커버리지 임계값 (`vitest.config.ts`): Statements 65 / Branches 50 / Functions 60 / Lines 65.
릴리즈 전에는 반드시 `pnpm test:coverage`가 통과해야 한다.

### 실행 시간 원칙

전체 스위트는 약 60초 걸린다(설정·의존성을 바꾼 직후 첫 실행은 사전 번들링 때문에 더 걸린다). 시간의 대부분은 테스트 본문이 아니라 파일마다 반복되는 모듈 import다.

- 개발 중에는 `vitest related --run`으로 관련 테스트만 돌린다
- 전체 스위트는 마지막 코드 변경 뒤 **한 번만** 돌린다. 같은 코드에 다시 돌리지 않는다
- 출력을 `| tail`로 자를 때는 `set -o pipefail`을 쓰거나 로그 파일로 저장한다. 파이프 뒤 명령의 종료 코드로 통과를 판단하지 않는다

### 프로젝트 구성 (`vitest.config.ts`)

| 프로젝트 | 환경 | 대상 | setup |
| --- | --- | --- | --- |
| `node` | node | `unit/`, `store/`, `firebase/`, `utils/` | `setup/common.ts` |
| `dom` | happy-dom | 그 외 전부 | `setup.ts` (+ `setup/common.ts`) |

- `node` 프로젝트 파일이 DOM(`document`, `window`, `KeyboardEvent`, `navigator`)을 써야 하면 파일 첫 줄에 `// @vitest-environment happy-dom`을 둔다
- `setup/common.ts`는 두 프로젝트 공통이다: `crypto.randomUUID`를 `test-uuid-N`으로 고정, localStorage 목, 테스트마다 카운터·목 시퀀스·localStorage 초기화
- `deps.optimizer.client.include`의 라이브러리(antd, framer-motion, lodash-es)는 사전 번들링된다. **이 라이브러리들은 `vi.mock`하지 않는다** ("No default export defined on mock" 에러). 대신 앱 모듈을 목킹한다 — 예: antd `message` 대신 `@/shared/lib/message`
- `@ant-design/icons`, `dayjs`, `react-router-dom`, `@dnd-kit/*`는 사전 번들링하면 깨지거나(아이콘 undefined, dayjs 로케일 인스턴스 분리) 테스트에서 목킹하므로 목록에 넣지 않는다
- `clearMocks`·`restoreMocks`가 켜져 있다. 호출 기록과 `vi.spyOn`은 테스트마다 정리되지만, `vi.mock` 팩토리 안에서 준 기본 구현은 유지된다

---

## 2. 폴더 구조

테스트는 `src/test/` 아래에 소스 구조를 미러링해 둔다.

| 폴더 | 대상 |
| --- | --- |
| `unit/shared/`, `unit/features/*/lib/`, `unit/store/`, `unit/firebase/` | 순수 함수 유닛 테스트 (node) |
| `component/features/<feature>/`, `component/shared/`, `component/widgets/` | UI 컴포넌트 렌더링·상호작용 |
| `hooks/features/`, `hooks/shared/` | 커스텀 훅 |
| `store/` | Zustand 스토어 (node) |
| `integration/keyboard/` | 단축키 등 통합 시나리오 |
| `firebase/` | Firebase 연동 — SDK는 `vi.mock`으로 대체 (node) |
| `utils/` | 공용 유틸 (node) |
| `e2e/` | Playwright 스펙 (`*.spec.ts`, Vitest 대상 아님) |
| `helpers/` | 목 팩토리, 렌더 헬퍼, 스토어 초기화 |
| `setup.ts`, `setup/common.ts` | 전역 셋업 |

컴포넌트 테스트는 `src/components/`의 얇은 래퍼가 아니라 `features/`의 실제 구현을 직접 import한다. 새 테스트는 `src/test/`에 둔다.

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

버그 수정 시에는 **먼저 실패하는 회귀 테스트를 작성**한 뒤 고친다. 고친 코드를 잠시 되돌려 테스트가 실제로 실패하는지 확인한다.

### 의미 없는 테스트 금지

아래 패턴은 실패할 수 없거나, 아무것도 지켜주지 못하면서 변경 비용만 늘린다. 리뷰에서 발견하면 고치거나 지운다.

| 금지 | 이유 / 대안 |
| --- | --- |
| `if (el) { expect(...) }` 처럼 조건 안에 단언 | 요소를 못 찾으면 조용히 통과한다. `getBy*`로 찾아서 없으면 실패하게 한다 |
| `expect(true).toBe(true)`, `typeof x === "boolean"`, `getBy*` 직후 `toBeInTheDocument`만 | 실패할 수 없다 |
| 상수 값을 그대로 다시 적는 테스트 | 아무것도 검증하지 않고 문구 변경만 어렵게 한다 |
| 앱에서 쓰지 않는 코드의 테스트 | 코드와 함께 지운다 (테스트만 지우면 커버리지가 떨어진다) |
| 테스트 파일 안에서 함수를 다시 구현해 그걸 테스트 | 실제 모듈을 import한다 |
| 컴포넌트 테스트 파일에서 스토어 액션을 직접 검증 | `store/` 테스트에 둔다. 같은 동작을 두 곳에서 검증하지 않는다 |
| 이름과 단언이 다른 테스트 ("클릭 시"인데 클릭 없음 등) | 이름이 약속한 동작을 검증한다 |
| antd 내부 클래스·해시가 박힌 스냅샷 | antd를 올릴 때마다 깨진다. 역할·텍스트로 검증한다 |
| 실제 현재 시각(`dayjs()`, `new Date()`), 랜덤 값에 의존 | `vi.setSystemTime`, `Math.random` 목으로 고정한다 |
| 같은 모양의 케이스를 여러 `it`으로 복붙 | `it.each`로 합친다 |

---

## 4. 테스트 헬퍼

`@/test/helpers`에서 전부 가져온다. 테스트 파일 안에 목 데이터를 하드코딩하지 않는다.

### 목 팩토리 (`mock_factory.ts`)

```typescript
import { createMockRecord, createMockSession, createMockTemplate } from "@/test/helpers/mock_factory";

createMockRecord({ work_name: "테스트 작업" });
createMockSession({ start_time: "09:00", end_time: "10:00" });
createMockTemplate({ color: "#3182F6" });
```

랜덤 값 없이 순번 기반으로 만든다. 같은 테스트는 항상 같은 데이터를 받는다. 기본 날짜는 `2026-01-19`이고, 순번은 테스트마다 `resetMockSequence()`로 초기화된다(`setup/common.ts`).

`node` 프로젝트 테스트는 배럴(`@/test/helpers`)이 아니라 `@/test/helpers/mock_factory`를 직접 import한다. 배럴은 RTL·antd를 함께 불러온다.

### 렌더 헬퍼 (`test_utils.tsx`)

```typescript
import { renderWithAntd } from "@/test/helpers";

renderWithAntd(<SettingsModal open onClose={on_close} />);
renderWithAntd(<HeaderContent />, { route: "/weekly" });
```

antd `ConfigProvider`(ko_KR)로 감싼다. `route`를 주면 `MemoryRouter`로도 감싼다. 클릭·입력이 필요하면 테스트 안에서 `userEvent.setup()`을 직접 호출한다.

### 스토어 초기화 (`store_reset.ts`)

```typescript
import { resetWorkStore } from "@/test/helpers";

beforeEach(() => {
    resetWorkStore({ selected_date: "2026-01-19" });
});
```

`useWorkStore.getInitialState()`에 override를 덮어쓴다. 초기 상태 객체를 테스트 파일에 복사하지 않는다.

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
    const user = userEvent.setup();
    renderWithAntd(<WorkRecordTable records={[]} />);

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
    renderWithAntd(<SettingsModal open onClose={onClose} />);
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

**스냅샷** — 쓰지 않는다. antd 렌더 결과에는 버전마다 바뀌는 클래스 해시가 들어가 의미 없이 깨진다. 구조 대신 역할·텍스트·상호작용 결과를 검증한다.

---

## 6. 주의사항

- `clearMocks`·`restoreMocks`가 켜져 있어 `vi.clearAllMocks()`·`vi.restoreAllMocks()`를 따로 부를 필요가 없다. 테스트마다 다른 반환값이 필요하면 그 테스트 안에서 `mockReturnValue`를 준다.
- Zustand 스토어는 테스트 간 상태가 남는다. `resetWorkStore()`로 정리한다.
- Firebase SDK와 `syncService`는 `vi.mock`으로 대체한다. 실제 네트워크를 타지 않는다.
- 시간 계산 테스트는 점심시간 설정에 의존한다. 기본값을 가정하지 말고 필요한 값을 명시적으로 주입한다.
- `testTimeout`은 10초다. 애니메이션 종료를 기다릴 때는 고정 시간 대기 대신 `findBy*`·`waitFor`로 결과를 기다린다.
