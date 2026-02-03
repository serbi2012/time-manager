# SettingsModal 분리 계획

> **현재**: 1,330줄 (src/components/SettingsModal.tsx)
> **목표**: 메인 컴포넌트 ~200줄 + 하위 모듈들

---

## 1. 현재 구조 분석

### 1.1 파일 위치

-   메인: `src/components/SettingsModal.tsx` (1,330줄)
-   기존 분리: `src/features/settings/`

### 1.2 기존 features/settings 구조

```
features/settings/
├── index.ts
├── model/
│   └── types.ts
└── ui/
    ├── index.ts
    └── tabs/
        ├── index.ts
        ├── AnimationTab.tsx      # ✅ 이미 분리됨
        ├── AutoCompleteTab.tsx   # ✅ 이미 분리됨
        ├── DataTab.tsx           # ✅ 이미 분리됨
        ├── ShortcutsTab.tsx      # ✅ 이미 분리됨
        └── ThemeTab.tsx          # ✅ 이미 분리됨
```

### 1.3 메인 컴포넌트 내부 구조

```typescript
// SettingsModal.tsx 주요 섹션

// 1. 임포트 (1-56줄) - ~56줄
// 2. 헬퍼 함수 (58-145줄) - ~87줄
//    - keyEventToKeyString (키 이벤트 변환)

// 3. 메인 컴포넌트 시작 (147줄~)

// 상태 (state)
- 탭 상태 (160-165줄)
- 단축키 편집 상태 (165-180줄)
- 점심시간 편집 상태 (180-200줄)

// 파생 데이터 (useMemo)
- 탭 아이템 정의 (200-300줄)

// 핸들러 함수들 (~400줄)
- 단축키 관련 핸들러 (300-500줄)
- 점심시간 관련 핸들러 (500-600줄)
- 기타 핸들러 (600-700줄)

// 렌더링 (~600줄)
- 탭 패널 렌더링 (700-1330줄)
//   - 테마 탭 (인라인)
//   - 단축키 탭 (대부분 인라인)
//   - 자동완성 탭 (컴포넌트 사용)
//   - 데이터 탭 (컴포넌트 사용)
//   - 애니메이션 탭 (컴포넌트 사용)
```

---

## 2. 분리 계획

### 2.1 현재 상태 평가

일부 탭은 이미 분리됨 (AnimationTab, AutoCompleteTab, DataTab, ShortcutsTab, ThemeTab).

**문제점**:

1. 메인 컴포넌트에 여전히 많은 로직 있음
2. 단축키 편집 로직이 메인에 있음
3. 점심시간 설정 로직이 메인에 있음
4. 일부 탭이 여전히 인라인 렌더링

### 2.2 목표 구조

```
features/settings/
├── index.ts                       # Public API
├── model/
│   ├── index.ts
│   └── types.ts                   # ✅ 기존
├── lib/
│   ├── index.ts                   # NEW
│   └── shortcut_utils.ts          # NEW: 단축키 유틸
├── hooks/
│   ├── index.ts                   # NEW
│   ├── useShortcutEditor.ts       # NEW: 단축키 편집 로직
│   └── useLunchTimeEditor.ts      # NEW: 점심시간 편집 로직
└── ui/
    ├── index.ts
    ├── SettingsModal/             # NEW: 메인 컴포넌트
    │   ├── index.ts
    │   └── SettingsModal.tsx      # ~200줄
    └── tabs/
        ├── index.ts
        ├── AnimationTab.tsx       # ✅ 기존
        ├── AutoCompleteTab.tsx    # ✅ 기존
        ├── DataTab.tsx            # ✅ 기존
        ├── ShortcutsTab.tsx       # ✅ 기존 (확장)
        ├── ThemeTab.tsx           # ✅ 기존
        └── LunchTimeTab.tsx       # NEW: 점심시간 탭 분리
```

### 2.3 분리 단계

#### Step 1: 순수 함수 추출 (lib/)

| 함수명              | 현재 위치          | 이동 위치             |
| ------------------- | ------------------ | --------------------- |
| keyEventToKeyString | SettingsModal 내부 | lib/shortcut_utils.ts |

#### Step 2: 훅 추출 (hooks/)

| 훅명               | 책임                         | 예상 줄 수 |
| ------------------ | ---------------------------- | ---------- |
| useShortcutEditor  | 단축키 편집 상태 및 핸들러   | ~100       |
| useLunchTimeEditor | 점심시간 편집 상태 및 핸들러 | ~60        |

#### Step 3: 탭 컴포넌트 정리

| 컴포넌트명      | 현재 상태 | 작업                      |
| --------------- | --------- | ------------------------- |
| ThemeTab        | ✅ 분리됨 | 유지                      |
| ShortcutsTab    | ✅ 분리됨 | useShortcutEditor 훅 사용 |
| AutoCompleteTab | ✅ 분리됨 | 유지                      |
| DataTab         | ✅ 분리됨 | 유지                      |
| AnimationTab    | ✅ 분리됨 | 유지                      |
| LunchTimeTab    | ❌ 인라인 | 새로 분리                 |

---

## 3. 상세 분리 계획

### 3.1 lib/shortcut_utils.ts

```typescript
// 단축키 유틸리티 순수 함수

/**
 * 키보드 이벤트를 단축키 문자열로 변환
 */
export function keyEventToKeyString(e: React.KeyboardEvent): string | null {
    const key = e.key;

    // 단독 수정자 키만 누른 경우 무시
    if (["Control", "Alt", "Shift", "Meta"].includes(key)) {
        return null;
    }

    // Escape 키는 취소용
    if (key === "Escape") {
        return null;
    }

    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");

    // 수정자 키 없이 단독 키 입력은 허용하지 않음
    if (parts.length === 0) {
        return null;
    }

    // 메인 키 추가 및 정규화
    let main_key = key;
    if (key === "ArrowLeft") main_key = "Left";
    else if (key === "ArrowRight") main_key = "Right";
    // ...

    parts.push(main_key.toUpperCase());
    return parts.join("+");
}

/**
 * 단축키 문자열 유효성 검사
 */
export function isValidShortcut(shortcut: string): boolean {
    // ...
}
```

### 3.2 hooks/useShortcutEditor.ts

```typescript
// 단축키 편집 훅

export interface UseShortcutEditorReturn {
    // 상태
    editing_shortcut: string | null;
    temp_key: string;

    // 액션
    startEditing: (shortcut_id: string) => void;
    cancelEditing: () => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    saveShortcut: () => void;
    resetToDefault: (shortcut_id: string) => void;
    resetAllToDefault: () => void;
}

export function useShortcutEditor(): UseShortcutEditorReturn {
    const [editing_shortcut, setEditingShortcut] = useState<string | null>(
        null
    );
    const [temp_key, setTempKey] = useState("");

    const { shortcuts, updateShortcut, resetShortcut, resetAllShortcuts } =
        useShortcutStore();

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        e.preventDefault();
        const key_string = keyEventToKeyString(e);
        if (key_string) {
            setTempKey(key_string);
        }
    }, []);

    const saveShortcut = useCallback(() => {
        if (editing_shortcut && temp_key) {
            updateShortcut(editing_shortcut, temp_key);
            setEditingShortcut(null);
            setTempKey("");
            message.success("단축키가 저장되었습니다");
        }
    }, [editing_shortcut, temp_key, updateShortcut]);

    // ...
}
```

### 3.3 hooks/useLunchTimeEditor.ts

```typescript
// 점심시간 편집 훅

export interface UseLunchTimeEditorReturn {
    // 상태
    lunch_start: string;
    lunch_end: string;
    is_editing: boolean;

    // 액션
    startEditing: () => void;
    cancelEditing: () => void;
    setLunchStart: (time: string) => void;
    setLunchEnd: (time: string) => void;
    saveLunchTime: () => void;
}

export function useLunchTimeEditor(): UseLunchTimeEditorReturn {
    const { lunch_start_time, lunch_end_time, setLunchTime } = useWorkStore();

    const [is_editing, setIsEditing] = useState(false);
    const [local_start, setLocalStart] = useState(lunch_start_time);
    const [local_end, setLocalEnd] = useState(lunch_end_time);

    const saveLunchTime = useCallback(() => {
        setLunchTime(local_start, local_end);
        setIsEditing(false);
        message.success("점심시간이 저장되었습니다");
    }, [local_start, local_end, setLunchTime]);

    // ...
}
```

### 3.4 ui/SettingsModal/SettingsModal.tsx (메인)

```typescript
// 메인 컴포넌트 (~200줄)

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
}

export default function SettingsModal({
    open,
    onClose,
    onExport,
    onImport,
    isAuthenticated,
}: SettingsModalProps) {
    const { is_mobile } = useResponsive();
    const [active_tab, setActiveTab] = useState("theme");

    const tab_items = useMemo(
        () => [
            {
                key: "theme",
                label: "테마",
                icon: <BgColorsOutlined />,
                children: <ThemeTab />,
            },
            {
                key: "shortcuts",
                label: "단축키",
                icon: <KeyOutlined />,
                children: <ShortcutsTab />,
            },
            {
                key: "autocomplete",
                label: "자동완성",
                icon: <UnorderedListOutlined />,
                children: <AutoCompleteTab />,
            },
            {
                key: "lunchtime",
                label: "점심시간",
                icon: <ClockCircleOutlined />,
                children: <LunchTimeTab />,
            },
            {
                key: "animation",
                label: "애니메이션",
                icon: <ThunderboltOutlined />,
                children: <AnimationTab />,
            },
            {
                key: "data",
                label: "데이터",
                icon: <DatabaseOutlined />,
                children: <DataTab onExport={onExport} onImport={onImport} />,
            },
        ],
        [onExport, onImport]
    );

    return (
        <Modal
            title="설정"
            open={open}
            onCancel={onClose}
            width={is_mobile ? "100%" : 700}
            footer={null}
        >
            <Tabs
                activeKey={active_tab}
                onChange={setActiveTab}
                tabPosition={is_mobile ? "top" : "left"}
                items={tab_items}
            />
        </Modal>
    );
}
```

### 3.5 ui/tabs/LunchTimeTab.tsx (새로 분리)

```typescript
// 점심시간 설정 탭 (~100줄)

export function LunchTimeTab() {
    const {
        lunch_start,
        lunch_end,
        is_editing,
        startEditing,
        cancelEditing,
        setLunchStart,
        setLunchEnd,
        saveLunchTime,
    } = useLunchTimeEditor();

    return (
        <Card title="점심시간 설정">
            <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                    <Text>시작 시간</Text>
                    <TimePicker
                        value={dayjs(lunch_start, "HH:mm")}
                        format="HH:mm"
                        onChange={(time) =>
                            setLunchStart(time?.format("HH:mm") || "")
                        }
                        disabled={!is_editing}
                    />
                </div>
                <div>
                    <Text>종료 시간</Text>
                    <TimePicker
                        value={dayjs(lunch_end, "HH:mm")}
                        format="HH:mm"
                        onChange={(time) =>
                            setLunchEnd(time?.format("HH:mm") || "")
                        }
                        disabled={!is_editing}
                    />
                </div>
                <Space>
                    {is_editing ? (
                        <>
                            <Button onClick={cancelEditing}>취소</Button>
                            <Button type="primary" onClick={saveLunchTime}>
                                저장
                            </Button>
                        </>
                    ) : (
                        <Button onClick={startEditing}>수정</Button>
                    )}
                </Space>
            </Space>
        </Card>
    );
}
```

---

## 4. 마이그레이션 체크리스트

### 4.1 순수 함수 추출

-   [ ] `lib/shortcut_utils.ts` 생성
    -   [ ] keyEventToKeyString 함수
    -   [ ] isValidShortcut 함수
    -   [ ] 테스트 작성

### 4.2 훅 추출

-   [ ] `hooks/useShortcutEditor.ts` 생성
    -   [ ] 단축키 편집 상태 관리
    -   [ ] 테스트 작성
-   [ ] `hooks/useLunchTimeEditor.ts` 생성
    -   [ ] 점심시간 편집 상태 관리
    -   [ ] 테스트 작성

### 4.3 탭 컴포넌트 정리

-   [ ] `ui/tabs/LunchTimeTab.tsx` 생성
-   [ ] `ui/tabs/ShortcutsTab.tsx` 업데이트 (훅 사용)
-   [ ] index.ts 업데이트

### 4.4 메인 컴포넌트 리팩토링

-   [ ] `ui/SettingsModal/` 생성
-   [ ] 메인 컴포넌트 200줄 이내로 축소

### 4.5 정리

-   [ ] 기존 `components/SettingsModal.tsx` 삭제
-   [ ] import 경로 업데이트
-   [ ] 테스트 마이그레이션

---

## 5. 예상 결과

### 5.1 줄 수 비교

| 항목                     | Before | After |
| ------------------------ | ------ | ----- |
| SettingsModal.tsx        | 1,330  | -     |
| SettingsModal (메인)     | -      | ~200  |
| lib/shortcut_utils.ts    | -      | ~50   |
| hooks/\*.ts              | -      | ~160  |
| ui/tabs/LunchTimeTab.tsx | -      | ~100  |
| **총계**                 | 1,330  | ~510  |

### 5.2 개선 효과

-   탭별 독립적 관리 가능
-   단축키/점심시간 로직 재사용 가능
-   테스트 용이성 향상

---

## 참고

-   [PHASE8_OVERVIEW.md](./PHASE8_OVERVIEW.md) - 전체 개요
-   기존 features/settings/ui/tabs 활용
