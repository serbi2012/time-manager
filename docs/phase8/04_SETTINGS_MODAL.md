# SettingsModal 분리 계획

> **현재**: 1,330줄 (src/components/SettingsModal.tsx)  
> **목표**: 메인 컴포넌트 ~150줄 + 하위 모듈들  
> **예상 감소율**: **-89%**

---

## 0. ⚠️ 적용할 엄격한 리팩토링 기준 (Phase 1~7 확립)

### 핵심 원칙

✅ **useMemo 내 JSX 100% 금지** - 모두 별도 컴포넌트로  
✅ **inline style 완전 금지** - 모두 constants로  
✅ **사용자 문구 100% 상수화** - 하드코딩 0개  
✅ **탭 내용 모두 별도 컴포넌트** - return 문 50줄 이하  
✅ **한 파일 = 한 컴포넌트** - SRP 엄격 준수

---

## 1. 현재 구조 분석

### 1.1 기존 분리 상태

```
features/settings/
└── ui/
    └── tabs/
        ├── index.ts
        ├── AnimationTab.tsx       # ✅ 애니메이션 설정 (114줄)
        ├── ThemeTab.tsx           # ✅ 테마 설정 (82줄)
        └── ShortcutsTab.tsx       # ✅ 단축키 설정 (156줄)
```

### 1.2 메인 컴포넌트 분석

```typescript
// SettingsModal.tsx (1,330줄)

// 1. 임포트 (1-35줄) - 35줄
// 2. 메인 컴포넌트 (37-1330줄) - ~1,293줄

// ───────────────────────────────────────────
// 상태 (state) - ~40줄
// ───────────────────────────────────────────
- active_tab (50-60줄)
- 폼 상태 (60-80줄)
- 수정 상태 (80-100줄)

// ───────────────────────────────────────────
// ⚠️ 탭 패널 inline 렌더링 (~1,000줄) !!
// ───────────────────────────────────────────
return (
    <Modal>
        <Tabs>
            <TabPane tab="일반" key="general">
                {/* ❌ 200줄 인라인 JSX */}
            </TabPane>
            <TabPane tab="점심시간" key="lunch">
                {/* ❌ 150줄 인라인 JSX */}
            </TabPane>
            <TabPane tab="테마" key="theme">
                <ThemeTab /> {/* ✅ 이미 분리됨 */}
            </TabPane>
            <TabPane tab="애니메이션" key="animation">
                <AnimationTab /> {/* ✅ 이미 분리됨 */}
            </TabPane>
            <TabPane tab="단축키" key="shortcuts">
                <ShortcutsTab /> {/* ✅ 이미 분리됨 */}
            </TabPane>
            <TabPane tab="동기화" key="sync">
                {/* ❌ 200줄 인라인 JSX */}
            </TabPane>
            <TabPane tab="백업/복원" key="backup">
                {/* ❌ 180줄 인라인 JSX */}
            </TabPane>
        </Tabs>
    </Modal>
);
```

---

## 2. 분리 계획

### 2.1 목표 구조

```
features/settings/
├── index.ts
│
├── constants/
│   ├── index.ts
│   ├── labels.ts              # NEW: UI 레이블
│   ├── messages.ts            # NEW: 메시지
│   └── config.ts              # NEW: 기본값
│
├── hooks/
│   ├── index.ts
│   ├── useSettingsTab.ts      # NEW: 탭 상태 (~30줄)
│   └── useSettingsForm.ts     # NEW: 폼 관리 (~60줄)
│
└── ui/
    ├── index.ts
    │
    ├── SettingsModal/         # NEW: 메인 컴포넌트
    │   ├── index.ts
    │   └── SettingsModal.tsx  # ✅ 메인 (~150줄)
    │
    └── tabs/
        ├── index.ts
        ├── GeneralTab.tsx     # NEW: 일반 설정 (~120줄)
        ├── LunchTab.tsx       # NEW: 점심시간 (~100줄)
        ├── ThemeTab.tsx       # ✅ 기존 (82줄)
        ├── AnimationTab.tsx   # ✅ 기존 (114줄)
        ├── ShortcutsTab.tsx   # ✅ 기존 (156줄)
        ├── SyncTab.tsx        # NEW: 동기화 (~150줄)
        └── BackupTab.tsx      # NEW: 백업/복원 (~130줄)
```

---

## 3. 단계별 작업

### Step 1: 탭 컴포넌트 분리 ⚠️ **핵심**

#### 3.1 GeneralTab.tsx (~120줄)

```typescript
// features/settings/ui/tabs/GeneralTab.tsx

import { Form, Switch, InputNumber, Select } from "antd";
import {
    SETTINGS_TAB_GENERAL_TITLE,
    SETTINGS_LABEL_AUTO_SAVE,
    SETTINGS_LABEL_SAVE_INTERVAL,
    SETTINGS_PLACEHOLDER_SAVE_INTERVAL,
} from "../../constants";

interface GeneralTabProps {
    form: FormInstance;
}

export function GeneralTab({ form }: GeneralTabProps) {
    return (
        <div style={TAB_CONTAINER_STYLE}>
            <Text style={TAB_TITLE_STYLE}>{SETTINGS_TAB_GENERAL_TITLE}</Text>

            <Form form={form} layout="vertical">
                <Form.Item
                    name="auto_save"
                    label={SETTINGS_LABEL_AUTO_SAVE}
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    name="save_interval"
                    label={SETTINGS_LABEL_SAVE_INTERVAL}
                >
                    <InputNumber
                        min={MIN_SAVE_INTERVAL}
                        max={MAX_SAVE_INTERVAL}
                        placeholder={SETTINGS_PLACEHOLDER_SAVE_INTERVAL}
                    />
                </Form.Item>

                {/* ... */}
            </Form>
        </div>
    );
}
```

**체크리스트**:

-   [ ] 120줄 이하
-   [ ] inline style 0개 (TAB_CONTAINER_STYLE 사용)
-   [ ] 하드코딩 문구 0개
-   [ ] 매직 넘버 상수화 (MIN_SAVE_INTERVAL 등)

#### 3.2 LunchTab.tsx (~100줄)

```typescript
// features/settings/ui/tabs/LunchTab.tsx

import { Form, TimePicker } from "antd";
import { TimeRangeInput } from "@/shared/ui/form";

export function LunchTab({ form }: LunchTabProps) {
    return (
        <div style={TAB_CONTAINER_STYLE}>
            <Form form={form} layout="vertical">
                <Form.Item name="lunch_time" label={SETTINGS_LABEL_LUNCH_TIME}>
                    <TimeRangeInput
                        start_placeholder={SETTINGS_PLACEHOLDER_LUNCH_START}
                        end_placeholder={SETTINGS_PLACEHOLDER_LUNCH_END}
                    />
                </Form.Item>
            </Form>
        </div>
    );
}
```

**체크리스트**:

-   [ ] TimeRangeInput 재사용
-   [ ] 모든 문구 상수화

#### 3.3 SyncTab.tsx (~150줄)

```typescript
// features/settings/ui/tabs/SyncTab.tsx

import { Button, Switch, Alert, Statistic } from "antd";
import { CloudSyncOutlined } from "@ant-design/icons";

export function SyncTab({ sync_status, onSync }: SyncTabProps) {
    return (
        <div style={TAB_CONTAINER_STYLE}>
            <Alert
                message={SETTINGS_SYNC_ALERT_TITLE}
                description={SETTINGS_SYNC_ALERT_DESC}
                type="info"
                showIcon
            />

            <Statistic
                title={SETTINGS_SYNC_LAST_SYNC_TITLE}
                value={sync_status.last_sync_time}
                prefix={<CloudSyncOutlined />}
            />

            <Button
                type="primary"
                onClick={onSync}
                loading={sync_status.is_syncing}
            >
                {SETTINGS_SYNC_BUTTON_TEXT}
            </Button>
        </div>
    );
}
```

### Step 2: 메인 컴포넌트 최종화

#### SettingsModal.tsx (최종 ~150줄)

```typescript
// features/settings/ui/SettingsModal/SettingsModal.tsx

import { useSettingsTab } from "../../hooks/useSettingsTab";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import {
    GeneralTab,
    LunchTab,
    ThemeTab,
    AnimationTab,
    ShortcutsTab,
    SyncTab,
    BackupTab,
} from "../tabs";

export function SettingsModal({ open, onClose }: SettingsModalProps) {
    const tabs = useSettingsTab();
    const form = useSettingsForm();

    return (
        <Modal
            title={SETTINGS_MODAL_TITLE}
            open={open}
            onCancel={onClose}
            width={SETTINGS_MODAL_WIDTH}
        >
            <Tabs activeKey={tabs.active_key} onChange={tabs.setActiveKey}>
                <TabPane tab={SETTINGS_TAB_GENERAL} key="general">
                    <GeneralTab form={form.instance} />
                </TabPane>

                <TabPane tab={SETTINGS_TAB_LUNCH} key="lunch">
                    <LunchTab form={form.instance} />
                </TabPane>

                <TabPane tab={SETTINGS_TAB_THEME} key="theme">
                    <ThemeTab />
                </TabPane>

                <TabPane tab={SETTINGS_TAB_ANIMATION} key="animation">
                    <AnimationTab />
                </TabPane>

                <TabPane tab={SETTINGS_TAB_SHORTCUTS} key="shortcuts">
                    <ShortcutsTab />
                </TabPane>

                <TabPane tab={SETTINGS_TAB_SYNC} key="sync">
                    <SyncTab />
                </TabPane>

                <TabPane tab={SETTINGS_TAB_BACKUP} key="backup">
                    <BackupTab />
                </TabPane>
            </Tabs>
        </Modal>
    );
}
```

**최종 체크리스트**:

-   [ ] 150줄 이하
-   [ ] 탭 패널 모두 별도 컴포넌트
-   [ ] inline JSX 0개
-   [ ] 하드코딩 문구 0개 (모든 탭 제목, 라벨 상수화)

---

## 4. 예상 성과

| 지표               | Before  | After (예상) | 목표 개선 |
| ------------------ | ------- | ------------ | --------- |
| **총 줄 수**       | 1,330줄 | 150줄        | **-89%**  |
| **탭 패널 inline** | 1,000줄 | 0줄          | **-100%** |
| **inline style**   | 30개    | 0개          | **-100%** |
| **하드코딩 문구**  | 70개    | 0개          | **-100%** |

---

## 5. 작업 체크리스트

### Phase 1: 탭 컴포넌트 분리 ✅

-   [x] `ThemeTab.tsx` (테마 그리드 UI, 상수화)
-   [x] `DataTab.tsx` (시간/프리셋/내보내기·가져오기/저장소 상태)
-   [x] `AutoCompleteTab.tsx` + `AutoCompleteOptionList.tsx`
-   [x] `ShortcutsTab.tsx` + `ShortcutKeyEditor.tsx`
-   [x] `SettingItem.tsx` (공통 설정 항목 레이아웃)
-   [x] `AnimationTab.tsx` (기존 유지)

### Phase 2: 훅·상수 분리 ✅

-   [x] `useSettingsTab.ts` (탭 상태)
-   [x] `constants/labels.ts`, `constants/styles.ts`

### Phase 3: 메인 컴포넌트 최종화 ✅

-   [x] `SettingsModal.tsx` (features/settings/ui/SettingsModal, ~190줄)
-   [x] `src/components/SettingsModal.tsx` → feature re-export
-   [x] 테스트 실행 및 스냅샷 갱신

---

## 6. 참고

-   [PHASE8_OVERVIEW.md](PHASE8_OVERVIEW.md) - Phase 8 전체 계획
-   [01_DAILY_GANTT_CHART.md](01_DAILY_GANTT_CHART.md) - 완료된 사례
