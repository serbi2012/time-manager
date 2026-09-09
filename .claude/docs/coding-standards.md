# 코딩 표준

코드를 작성·수정하는 모든 작업에 적용된다. 예외는 8절에 정의된 절차를 따를 때만 허용한다.

---

## 1. 테스트 용이성 우선

모든 코드는 테스트 가능해야 한다.

- 모든 비즈니스 로직은 **순수 함수**로 분리해 `lib/`에 둔다.
- 부수 효과(Firebase, LocalStorage, 스토어 업데이트)는 **훅** 또는 **스토어**에서만 처리한다.
- 외부 의존성은 주입 가능하게 설계한다.
- 새 기능을 설계할 때 **테스트 케이스를 쓸 수 있는 구조인지 먼저 검토**한다.

체크:
- [ ] 이 함수를 mock 없이 테스트할 수 있는가?
- [ ] 입력과 출력이 명확한가?
- [ ] 부수 효과가 분리되어 있는가?

---

## 2. 관심사 분리

### 파일 크기

| 줄 수 | 조치 |
| --- | --- |
| 300줄 초과 | 분리 검토 |
| 500줄 초과 | **반드시 분리** |

### 한 파일 = 한 컴포넌트

같은 파일에 `function EmptyChart()`와 `function ChartContent()`를 함께 두지 않는다. 각각 `EmptyChart.tsx`, `ChartContent.tsx`로 분리한다.

### JSX 작성 위치 (CRITICAL)

> JSX/DOM 태그는 **컴포넌트의 return 문에서만** 작성한다.

return 문 바깥(로직 영역)에 있는 JSX는 **줄 수와 무관하게 즉시** 별도 컴포넌트로 분리한다.

```tsx
// 금지: useMemo 안의 인라인 JSX
const project_code_options = useMemo(() => {
    return raw_options.map((opt) => ({
        label: (
            <div style={{ display: "flex" }}>
                <span>{opt.label}</span>
            </div>
        ),
    }));
}, []);

// 금지: optionRender / dropdownRender 안의 인라인 JSX
<Select optionRender={(option) => <div style={{}}>{option.label}</div>} />

// 필수: 이름 있는 컴포넌트로 추출
const project_code_options = useMemo(() => {
    return raw_options.map((opt) => ({
        label: <OptionLabel label={opt.label} onClose={() => hideOption(opt.value)} />,
    }));
}, []);

<Select optionRender={(option) => <SelectOptionLabel label={option.label} onClose={handleClose} />} />
```

`shared/ui/form/`에 이미 `SelectOptionLabel`, `AutoCompleteOptionLabel`이 있으니 먼저 재사용을 검토한다.

### 인라인 JSX 블록

Popover `content`, Tooltip `title`, Modal 본문 등 **50줄 이상의 JSX 블록**은 반드시 별도 컴포넌트로 분리한다. 분리 기준은 역할 단위(컨텍스트 메뉴, 툴팁 내용, 바 셀, 행 라벨).

```tsx
// 금지
content={<div style={{}}><strong>…</strong>…</div>}

// 필수
content={<SessionContextMenu work_name={work_name} on_edit={handleEdit} />}
```

### return 문 내 DOM 길이

| 줄 수 | 조치 |
| --- | --- |
| 50줄 초과 | 분리 권장 |
| 100줄 초과 | 반드시 분리 |
| 200줄 초과 | 즉시 분리 (예외 없음) |

### 책임별 위치

| 책임 | 위치 |
| --- | --- |
| UI 렌더링 | `features/*/ui/`, `shared/ui/` |
| 비즈니스 로직 | `lib/` (순수 함수) |
| 상태 관리 | `store/`, `hooks/` |
| API 통신 | `firebase/` |
| 타입 정의 | `shared/types/`, `features/*/model/` |
| 상수 | `shared/constants/`, `features/*/constants/` |
| 디자인 토큰 | `styles/tokens/` (CSS 변수) |
| antd 오버라이드 | `styles/overrides/antd.css` |
| 피처 스타일 | `styles/components/` |
| 애니메이션 | `shared/ui/animation/` |
| className 합성 | `shared/lib/cn.ts` |

---

## 3. 스타일 작성

### Tailwind 유틸리티 클래스 우선 (CRITICAL)

`style={{}}` 인라인 객체와 `CSSProperties` 상수는 **동적 계산 값**에만 허용한다.

```tsx
// 금지
<div style={{ display: "flex", justifyContent: "space-between" }}>
const HEADER_STYLE: React.CSSProperties = { display: "flex", gap: 8 };

// 필수
<div className="flex justify-between items-center">

// 허용: 동적 계산 값
<div className="absolute h-full rounded" style={{ left: `${start_pct}%`, width: `${width_pct}%` }} />
```

기존 `features/*/constants/styles.ts`의 `CSSProperties` 상수는 마이그레이션 완료 전까지 기존 코드에서 그대로 쓸 수 있다. 새 코드에는 쓰지 않는다.

### 조건부 스타일은 cn()

```tsx
import { cn } from "@/shared/lib/cn";

<div className={cn(
    "rounded-xl p-4 border",
    is_active ? "border-primary bg-white shadow-md" : "border-dashed border-border-default bg-bg-light"
)} />
```

컴포넌트가 `className?: string` prop을 받아 `cn("base…", className)`으로 합성하는 패턴은 허용한다.

### className 작성 순서

```
1. Layout       flex items-center justify-between
2. Sizing       w-full h-14
3. Spacing      px-6 py-4 gap-2
4. Typography   text-sm font-medium text-text-primary
5. Visual       bg-white border rounded-lg shadow-sm
6. Interactive  hover:bg-bg-light transition-colors duration-200
7. Responsive   max-sm:px-3
8. Conditional  is_active && "border-primary"
```

### 스타일 방식 결정 트리

```
새 스타일이 필요하다
├─ 단순 레이아웃/여백/색상/폰트?      → Tailwind 유틸리티 클래스
├─ 조건부/동적 클래스?                → cn() + Tailwind
├─ Ant Design 컴포넌트 오버라이드?    → styles/overrides/antd.css (전역 셀렉터)
├─ 복잡한 의사 셀렉터/중첩?           → styles/components/*.css
├─ JS에서 계산한 동적 값?             → inline style (유일한 예외)
├─ 등장/퇴장 애니메이션?              → framer-motion 프리셋
└─ 반복 keyframe 애니메이션?          → styles/utilities/keyframes.css
```

### 동적 CSS 주입 시 @layer 필수 (CRITICAL)

프로젝트는 Tailwind v4의 CSS Cascade Layers를 쓴다: `@layer base, antd, theme, components, utilities;`

CSS 사양상 **unlayered CSS는 모든 layered CSS보다 항상 우선**한다. `@layer` 없이 주입한 `<style>`은 Tailwind 클래스를 무조건 덮어쓴다.

```typescript
// 금지
style.textContent = `* { transition: scrollbar-color 0.3s ease-out; }`;

// 필수
style.textContent = `@layer base { * { transition: scrollbar-color 0.3s ease-out; } }`;
```

| CSS 유형 | 레이어 |
| --- | --- |
| 리셋/전역 기본값 | `@layer base` |
| Ant Design 오버라이드 | `@layer antd` |
| 컴포넌트 스타일 | `@layer components` |
| 유틸리티 확장 | `@layer utilities` |

### 디자인 토큰 사용

```tsx
// 금지: arbitrary value 남용
<div className="text-[#666] text-[12px] mt-[4px]">

// 필수: 토큰 참조
<div className="text-text-secondary text-sm mt-xs">
```

사용 가능한 토큰의 전체 목록은 `design-system.md` 참조.

---

## 4. 상수화

### 하드코딩 금지 대상

- 사용자에게 보이는 **모든 문구** — 버튼/라벨/제목/힌트/설명/빈 상태 문구. **한 번만 쓰더라도** 상수로 정의한다.
- `message.info` / `message.success` / `message.error` / `message.warning`의 인자.
- 색상 hex, 폰트 크기/굵기 숫자, 여백 px, 매직 넘버.

```typescript
// 금지
message.success("세션이 삭제되었습니다.");
<Text>빈 영역을 드래그하여 작업 추가</Text>
const total_ms = minutes * 60 * 1000;

// 필수
message.success(GANTT_MESSAGE_SESSION_DELETED);
<Text>{GANTT_HINT_DRAG_TO_ADD}</Text>
const total_ms = minutes * MINUTES_PER_HOUR * MS_PER_SECOND;
```

상수 위치와 체계는 `architecture.md` 3절 참조.

---

## 5. 플랫폼 분리

모바일과 데스크탑은 서로 영향을 주지 않는다.

```tsx
// 절대 금지: 컴포넌트 내부에서 플랫폼 분기
const Component = () => {
    const { is_mobile } = useResponsive();
    return is_mobile ? <div className="mobile-layout">…</div> : <div className="desktop-layout">…</div>;
};

// 권장: 진입점에서만 분기
// pages/DailyPage/index.tsx
const DailyPage = () => {
    const { is_mobile } = useResponsive();
    return is_mobile ? <MobileDailyPage /> : <DesktopDailyPage />;
};
```

- 모바일 전용: `Mobile*.tsx`, 데스크탑 전용: `Desktop*.tsx`
- 공통 로직은 `shared/` 또는 `hooks/`에서 공유한다.
- 모바일 작업의 상세 규칙은 `mobile.md` 참조.

---

## 6. 코드 품질

### DRY

- 2회 이상 쓰이는 로직 → `shared/lib/` 또는 `hooks/`
- 2회 이상 쓰이는 UI → `shared/ui/`
- 공통 타입 → `shared/types/`, 공통 상수 → `shared/constants/`

단, 추출로 복잡도가 오히려 늘어나면 하지 않는다.

### 명시적 의존성

```typescript
// 금지: 순수 함수 내부에서 전역 상태 참조
function calculateTotal() {
    const records = useWorkStore.getState().records;
    return records.reduce(…);
}

// 권장
function calculateTotal(records: WorkRecord[]) {
    return records.reduce(…);
}
```

### 타입 안전성

- `any` 금지. 불가피하면 `unknown`.
- 타입 단언(`as`) 최소화.
- nullable 값은 명시적으로 처리.
- ESLint에서 미사용 변수/import는 **error**다. `_` 접두사만 예외.

### 에러 처리

- 빈 catch 블록 금지. try-catch에는 로깅이 따른다.
- 사용자에게 의미 있는 메시지를 보여준다(문구는 상수로).
- 로딩/에러/성공 상태를 UI에서 모두 처리한다.

### Props 설계

- 5개 초과 → 객체 그룹화 검토
- 10개 초과 → 컴포넌트 분리 검토
- 콜백은 `on` 접두사, boolean은 긍정형(`is_visible`, `isHidden` 아님)

### 상태 위치

| 범위 | 위치 |
| --- | --- |
| 단일 컴포넌트 | `useState` |
| 부모-자식 | props (2단계 이내) |
| 형제 간 | 부모로 끌어올리기 |
| 전역 | Zustand 스토어 |
| 서버 | Firebase + 동기화 훅 |

### 렌더링 최적화

- 비용이 큰 계산 → `useMemo`
- 자식에 전달하는 콜백 → `useCallback`
- 리스트는 안정적인 `key` 사용 (인덱스 금지)

---

## 7. 금지 패턴

**절대 금지**

1. God Component (500줄 이상)
2. 3단계 이상 prop drilling
3. 복붙 중복
4. 매직 넘버
5. 순수 함수 내 암묵적 전역 상태 참조
6. 모바일/데스크탑 코드 결합
7. 순환 의존성
8. 테스트 불가능한 구조
9. 키보드 이벤트 직접 등록 (`window.addEventListener("keydown")`, `onKeyDown`으로 단축키 처리) — `.claude/docs/keyboard-focus.md`의 매니저를 쓴다

**경고**

1. `any` 타입
2. 주석으로 코드 비활성화
3. 방치된 TODO
4. 방치된 `console.log`
5. 하드코딩 문자열

---

## 8. 예외 처리 절차

규칙의 예외가 꼭 필요하면:

1. 왜 예외가 필요한지 **응답에서 설명**한다(코드 주석이 아니라).
2. 예외 범위를 최소화한다.
3. 향후 개선 방향을 함께 제시한다.

---

## 9. 개발 프로세스

**새 기능**: 설계 검토(테스트 가능성·분리 가능성) → 프로토타입 → 사용자 확인 → 구현 → 테스트 작성 → 체크리스트 확인

**버그 수정**: 재현 → **실패하는 테스트 케이스 작성** → 수정 → 통과 확인

**리팩토링**: 기존 동작 테스트 확보 → 관심사 분리 → 테스트 통과 확인 → 필요 시 최적화

---

## 10. 리뷰 체크리스트

필수:
- [ ] 테스트 가능한 구조인가
- [ ] 파일이 300줄을 넘지 않는가
- [ ] 모바일/데스크탑이 분리되어 있는가
- [ ] 중복 코드가 없는가
- [ ] 순수 함수로 분리 가능한 로직이 남아 있지 않은가
- [ ] 타입이 명시적인가 (`any` 없음)
- [ ] `pnpm lint` 통과
- [ ] 하드코딩된 문자열/숫자/색상이 상수·토큰으로 정의되어 있는가
- [ ] return 문 바깥에 JSX가 없는가

권장:
- [ ] 네이밍이 명확한가
- [ ] 주석 없이도 코드가 이해되는가
- [ ] 에러 처리가 적절한가
- [ ] 불필요한 리렌더링이 없는가
