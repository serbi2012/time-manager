# 단축키 · 포커스 매니저

키보드 입력과 포커스는 각각 하나의 매니저가 관리한다. **컴포넌트에서 `window.addEventListener("keydown")`을 직접 붙이거나 `onKeyDown`으로 단축키를 처리하지 않는다.**

---

## 1. 왜 매니저인가

이전에는 F8(모달 저장)이 세 가지 방식으로 흩어져 있었다.

- `<Form onKeyDown>` — 폼 밖(모달 여백, Select 드롭다운, DatePicker 패널)에 포커스가 있으면 안 먹음
- `window.addEventListener` — 모달과 무관하게 살아 있음
- 아예 처리 없음

전역 단축키는 입력란에서 통째로 막혀 있었고, 모달이 열려 있어도 그대로 동작했다. 포커스는 관리 주체가 없어 모달을 열어도 커서가 첫 입력으로 가지 않고, 확인창의 Enter도 동작하지 않았다.

---

## 2. 단축키 매니저

`src/shared/lib/shortcuts/`

| 파일 | 역할 |
| --- | --- |
| `types.ts` | `ShortcutBinding`, 스코프·입력정책 타입 |
| `key_matcher.ts` | 키 정규화·매칭·표시 (순수 함수) |
| `binding_resolver.ts` | 어떤 바인딩을 실행할지 판정 (순수 함수) |
| `shortcut_manager.ts` | 바인딩 레지스트리 + 레이어 스택 + 단일 리스너 |

### 동작 규칙

리스너는 **`window`에 capture 단계로 단 하나**만 등록된다. capture라서 포털로 렌더되는 antd 드롭다운·피커 안에서도 키가 잡힌다.

키가 눌리면 `resolveBinding`이 다음 순서로 판정한다.

1. **레이어**: 열린 레이어가 있으면 **최상단 레이어의 바인딩만** 후보다. `global` 스코프는 전부 차단된다.
2. **입력 정책**: 입력란(`input`/`textarea`/`select`/contenteditable)에 포커스가 있으면 `input_policy: "allow"`인 것만 후보다.
3. **우선순위**: 후보가 여럿이면 `priority`가 큰 것, 같으면 나중에 등록된 것.

`input_policy`를 생략하면 **수식어(Ctrl/Alt/Shift/Meta)가 있으면 `allow`, 없으면 `block`** 으로 자동 결정된다. `Alt+N`은 타이핑과 겹치지 않으니 입력 중에도 동작하고, `Delete` 같은 단일 키는 막힌다.

`event.repeat`(키 꾹 누르기)는 무시한다.

### 스코프

| 스코프 | 의미 |
| --- | --- |
| `global` | 앱 전역. 레이어가 하나라도 열리면 동작하지 않는다 |
| `layer` | 모달·확인창 전용. `layer_id`가 최상단일 때만 동작한다 |

---

## 3. 포커스 매니저

`src/shared/lib/focus/`

| 파일 | 역할 |
| --- | --- |
| `focusable.ts` | 포커스 가능 요소 탐색, 첫 포커스 대상 선정, 최상단 모달 본문 찾기 |
| `focus_manager.ts` | 포커스 스택(열기 전 위치 기억 → 닫을 때 복원), `focusInto` |

- 레이어를 열면 그 순간의 `document.activeElement`를 기억하고, 닫을 때 되돌린다. 사라진 요소면 조용히 넘어간다.
- 첫 포커스 대상은 **텍스트 입력 우선**, 없으면 첫 포커스 가능 요소. 모달 닫기(X) 버튼은 후보에서 뺀다.
- 컨테이너를 넘기지 않으면 `findTopmostModalBody()`로 화면 최상단 모달을 찾는다. 그래서 각 모달이 ref를 배선하지 않아도 동작한다.

antd Modal의 자체 focus trap을 대체하지 않는다. antd가 못 하는 **첫 입력 자동 포커스**와 **커스텀 오버레이의 복원**을 보완한다.

---

## 4. 쓰는 법

### 모달

```tsx
const { submit_keys } = useModalKeyboard({
    open,
    onSubmit: handleSubmit,
});
```

이 한 줄이 세 가지를 한다.

1. 열려 있는 동안 단축키 레이어를 잡아 전역 단축키를 차단
2. 설정된 제출 키(기본 F8)를 모달 스코프로 등록 — 입력 중에도 동작
3. 열릴 때 첫 입력으로 포커스, 닫힐 때 원래 자리로 복원

버튼 라벨의 키 뱃지는 `formatShortcutForPlatform(submit_keys)`를 쓴다. `"F8"`을 하드코딩하지 않는다 — 사용자가 설정에서 바꿀 수 있다.

`FormModal`을 쓰면 이미 안에서 처리하므로 아무것도 하지 않아도 된다.

### 확인창 (삭제 등)

antd `Popconfirm`을 직접 쓰지 않고 `ConfirmPopconfirm`을 쓴다.

```tsx
<ConfirmPopconfirm
    title="삭제할까요?"
    description="삭제한 작업은 휴지통으로 갑니다"
    onConfirm={() => onDelete(record.id)}
    okText="삭제"
    cancelText="취소"
>
    <button>삭제</button>
</ConfirmPopconfirm>
```

`danger`와 `autoFocus`가 기본이고, 포커스 위치와 무관하게 Enter로 확인·ESC로 취소된다. `open`/`onOpenChange`를 주면 제어형으로도 쓸 수 있다.

### 개별 단축키

```tsx
useShortcut({
    keys: "Alt+K",
    handler: doSomething,
});
```

모달 안에서 추가 단축키가 필요하면 `useModalKeyboard`가 준 `layer_id`를 넘긴다.

```tsx
const { layer_id } = useModalKeyboard({ open, onSubmit });

useShortcut({
    keys: "Alt+D",
    scope: "layer",
    layer_id,
    handler: handleDuplicate,
});
```

### 전역 단축키

스토어(`useShortcutStore`)에 정의된 단축키는 `useAppShortcuts(handlers)`가 일괄 등록한다. 앱에서 한 번만 호출한다(현재 `DesktopLayout`). 새 전역 단축키는 `DEFAULT_SHORTCUTS`에 추가하고 핸들러를 연결한다(→ `recipes.md`).

모달 제출 단축키(`modal-submit`)는 각 모달이 자기 레이어에 등록하므로 `useAppShortcuts`에서 제외된다.

---

## 5. 하지 말 것

```tsx
// 금지: 직접 리스너
useEffect(() => {
    const handler = (e: KeyboardEvent) => {
        if (e.key === "F8") handleSubmit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
}, []);

// 금지: Form onKeyDown으로 단축키 처리
<Form onKeyDown={(e) => { if (e.key === "F8") handleSubmit(); }}>

// 금지: 키 하드코딩 (사용자가 설정에서 바꿀 수 있다)
<span>F8</span>

// 금지: antd Popconfirm 직접 사용
<Popconfirm onConfirm={handleDelete}>
```

---

## 6. 테스트

| 대상 | 위치 |
| --- | --- |
| 키 정규화·매칭 | `test/unit/shared/lib/shortcuts/key_matcher.test.ts` |
| 바인딩 판정 | `test/unit/shared/lib/shortcuts/binding_resolver.test.ts` |
| 매니저 런타임 | `test/unit/shared/lib/shortcuts/shortcut_manager.test.ts` |
| 포커스 유틸·스택 | `test/unit/shared/lib/focus/focus_manager.test.ts` |
| 전역 단축키 | `test/integration/keyboard/shortcuts.integration.test.ts` |
| 모달·확인창 시나리오 | `test/integration/keyboard/modal_keyboard.integration.test.tsx` |

매니저는 모듈 수준 상태를 갖는다. 테스트에서는 `resetShortcutManager()` / `resetFocusManager()`를 `beforeEach`에서 호출한다.
