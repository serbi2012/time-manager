# 모바일 대규모 디자인 변경 지침 (Mobile Redesign Guide)

모바일 UI/UX를 대규모로 변경할 때 **데스크탑에 영향을 주지 않으면서** 안전하게 작업하기 위한 지침.
디자인뿐 아니라 **로직 변경, 신규 기능 추가**까지 포함한다.

---

## 1. 절대 원칙 (Absolute Rules)

### 1-1. 데스크탑 무영향 보장

> ⚠️ **모바일 작업으로 인해 데스크탑이 깨지면 안 된다. 이것이 최우선 원칙이다.**

```
✅ 허용: Mobile*.tsx 파일 수정/신규 생성
✅ 허용: mobile-*.css 파일 수정/신규 생성
✅ 허용: 모바일 전용 훅/lib 신규 생성
⚠️ 주의: 공유 훅/스토어/lib 수정 (반드시 영향 범위 확인)
❌ 금지: Desktop*.tsx 파일 수정 (모바일 작업 중)
❌ 금지: 공유 코드의 기존 인터페이스(매개변수, 반환값) 변경
```

### 1-2. 변경 안전 등급

모든 파일 변경은 아래 등급으로 분류한다:

| 등급                           | 대상                                              | 조건                      |
| ------------------------------ | ------------------------------------------------- | ------------------------- |
| **GREEN** (자유롭게 수정)      | `Mobile*.tsx`, `mobile-*.css`, 모바일 전용 훅/lib | 데스크탑에 영향 없음      |
| **YELLOW** (영향 확인 후 수정) | 공유 훅, 공유 lib, 공유 타입, 스토어              | 기존 인터페이스 유지 필수 |
| **RED** (수정 금지)            | `Desktop*.tsx`, 데스크탑 전용 CSS                 | 모바일 작업 범위 밖       |

---

## 2. 공유 코드 변경 전략 (Shared Code Strategy)

### 2-1. 판단 플로우차트

모바일에 새 로직이 필요할 때:

```
모바일에 새 동작이 필요하다
│
├─ 기존 공유 훅/lib에 해당 기능이 있는가?
│   ├─ YES → 그대로 사용 (변경 없음)
│   └─ NO ↓
│
├─ 기존 공유 훅/lib을 확장하면 해결되는가?
│   ├─ YES → 확장 가능한가? (기존 인터페이스 유지)
│   │   ├─ YES → **YELLOW: 공유 훅/lib 확장** (§2-2)
│   │   └─ NO  → **모바일 전용 훅/lib 신설** (§2-3)
│   └─ NO ↓
│
└─ 완전히 새로운 기능인가?
    └─ YES → **모바일 전용 훅/lib 신설** (§2-3)
```

### 2-2. 공유 훅/lib 확장 (YELLOW)

기존 인터페이스를 **유지하면서** 선택적 매개변수를 추가한다.

```typescript
// ✅ 허용: 선택적 매개변수 추가 (기존 호출부 영향 없음)
// BEFORE
function useGanttData(selected_date: string) { ... }

// AFTER
interface UseGanttDataOptions {
  selected_date: string;
  enable_swipe?: boolean;  // 모바일 전용 옵션 (선택적)
}
function useGanttData(options: UseGanttDataOptions) { ... }

// ❌ 금지: 기존 매개변수 타입/순서 변경
// BEFORE
function useGanttData(selected_date: string) { ... }
// AFTER (금지!)
function useGanttData(selected_date: string, mode: "mobile" | "desktop") { ... }
```

**확장 시 체크리스트:**

-   [ ] 기존 매개변수의 타입과 순서가 변경되지 않았는가?
-   [ ] 새 매개변수는 모두 선택적(optional)인가?
-   [ ] 새 매개변수 미전달 시 기존 동작과 완전히 동일한가?
-   [ ] Desktop\*.tsx에서 호출하는 코드를 수정할 필요가 없는가?

### 2-3. 모바일 전용 훅/lib 신설 (GREEN)

공유 훅을 **수정하기 어렵거나**, 완전히 새로운 기능인 경우 모바일 전용으로 만든다.

```
features/gantt-chart/
├── hooks/
│   ├── useGanttData.ts          # 공유 (기존)
│   ├── useGanttDrag.ts          # 공유 (기존)
│   ├── useMobileGanttSwipe.ts   # 모바일 전용 (신규) ✅
│   └── useMobileGanttZoom.ts    # 모바일 전용 (신규) ✅
├── lib/
│   ├── bar_calculator.ts        # 공유 (기존)
│   └── mobile_touch_handler.ts  # 모바일 전용 (신규) ✅
```

**네이밍 규칙:**

| 유형                 | 패턴                    | 예시                      |
| -------------------- | ----------------------- | ------------------------- |
| 모바일 전용 훅       | `useMobile[Feature].ts` | `useMobileGanttSwipe.ts`  |
| 모바일 전용 lib      | `mobile_[기능].ts`      | `mobile_touch_handler.ts` |
| 모바일 전용 컴포넌트 | `Mobile[Name].tsx`      | `MobileGanttToolbar.tsx`  |

### 2-4. 스토어 변경 (YELLOW)

스토어에 모바일 전용 상태가 필요한 경우:

```typescript
// ✅ 허용: 새 필드 추가 (기존 필드 영향 없음)
interface SettingsSlice {
    // 기존 필드 (변경 금지)
    transition_enabled: boolean;
    transition_speed: TransitionSpeed;

    // 모바일 전용 필드 추가 (허용)
    mobile_view_mode?: "compact" | "expanded";
    mobile_gantt_zoom?: number;
}

// ❌ 금지: 기존 필드 타입 변경
interface SettingsSlice {
    transition_enabled: boolean | "mobile-only"; // ← 금지!
}
```

### 2-5. 공유 타입 변경 (YELLOW)

```typescript
// ✅ 허용: 선택적 필드 추가
interface WorkRecord {
    // 기존 필드 (변경 금지)
    id: string;
    work_name: string;

    // 모바일 UI용 메타데이터 (선택적)
    mobile_display_order?: number;
}

// ❌ 금지: 기존 필드 타입/이름 변경
```

---

## 3. 디자인 변경 전략 (Design Change Strategy)

### 3-1. CSS 파일 구조

```
src/styles/components/
├── mobile-header.css        # 모바일 헤더
├── mobile-nav.css           # 모바일 네비게이션
├── mobile-record.css        # 모바일 레코드
├── mobile-record-card.css   # 모바일 레코드 카드
├── mobile-gantt.css         # 모바일 간트차트
├── mobile-weekly.css        # 모바일 주간 일정
├── mobile-settings.css      # 모바일 설정
└── mobile-[new-feature].css # 신규 기능 (필요 시)
```

**규칙:**

-   모바일 CSS는 반드시 `mobile-` 접두사로 파일명 작성
-   새 CSS 파일 추가 시 `global.css`에 import 추가
-   기존 공유 CSS(`layout.css`, `antd.css` 등)의 `@media (max-width: 480px)` 블록 수정은 **YELLOW**

### 3-2. 스타일 작성 우선순위

```
1순위: Tailwind 유틸리티 클래스 (className="flex gap-sm p-lg")
2순위: cn() 조건부 클래스 (className={cn("base", is_active && "active")})
3순위: mobile-*.css 파일 (복잡한 셀렉터, 애니메이션)
4순위: inline style (동적 계산 값만)
```

### 3-3. 목업 프리뷰 필수

> **모바일 디자인 변경은 반드시 `.claude/docs/ui-mockup.md` 프로세스를 따른다.**

1. `mockups/mobile-[feature].html` 생성
2. 모바일 뷰포트(375~480px)로 목업 작성
3. 유저 승인 후 구현

---

## 4. 컴포넌트 변경/신규 생성 전략

### 4-1. 기존 모바일 컴포넌트 수정 (GREEN)

기존 `Mobile*.tsx`를 자유롭게 수정한다. **단, .claude/docs/coding-standards.md의 모든 규칙 준수.**

```
✅ MobileDailyPage.tsx 레이아웃 전면 변경
✅ MobileWorkRecordTable.tsx 카드 UI 변경
✅ MobileDailyGanttChart.tsx 터치 인터랙션 추가
```

### 4-2. 신규 모바일 컴포넌트 생성 (GREEN)

기존 컴포넌트가 너무 크게 변경되어야 하면, 하위 컴포넌트를 분리한다.

```
features/work-record/ui/Mobile/
├── MobileWorkRecordTable.tsx      # 기존 진입점
├── MobileRecordCard.tsx           # 기존 카드
├── MobileRecordSwipeAction.tsx    # 신규: 스와이프 액션 ✅
├── MobileRecordQuickAdd.tsx       # 신규: 빠른 추가 ✅
└── MobileRecordStats.tsx          # 신규: 통계 대시보드 ✅
```

### 4-3. 신규 모바일 전용 기능 (GREEN)

데스크탑에 없는 모바일 전용 기능이 필요한 경우:

```
features/
├── mobile-quick-entry/           # 모바일 전용 feature ✅
│   ├── hooks/
│   │   └── useMobileQuickEntry.ts
│   ├── lib/
│   │   └── quick_entry_validator.ts
│   ├── ui/
│   │   └── MobileQuickEntry.tsx
│   └── index.ts
```

-   feature 이름에 `mobile-` 접두사 사용
-   이 feature는 `MobileLayout` / `MobileDailyPage`에서만 import

### 4-4. 공유 UI 컴포넌트 사용 (GREEN)

`shared/ui/`의 공통 컴포넌트(`TimeInput`, `CategoryTag` 등)는 자유롭게 사용한다.
새 공통 컴포넌트가 필요하면 `shared/ui/`에 추가해도 된다 (데스크탑에서도 쓸 수 있으므로).

---

## 5. 기존 `is_mobile` 위반 패턴 정리

현재 아래 파일들에 `is_mobile` 인라인 분기가 남아있다.
모바일 리디자인 시 해당 컴포넌트를 건드리게 되면 **분리를 함께 진행**한다.

> 최신 전체 목록은 `.claude/docs/backlog.md` 2절에 있다.

| 파일                | 현재 상태                                    | 목표                                           |
| ------------------- | -------------------------------------------- | ---------------------------------------------- |
| `SyncIndicator.tsx` | `is_mobile` prop으로 텍스트/스타일 분기      | `MobileSyncIndicator` + `DesktopSyncIndicator` |
| `UserMenu.tsx`      | `is_mobile` prop으로 라벨/아바타 분기        | `MobileUserMenu` + `DesktopUserMenu`           |
| `DataTab.tsx`       | `is_mobile` prop으로 gap/padding/layout 분기 | `MobileDataTab` + `DesktopDataTab`             |
| `AnimationTab.tsx`  | `is_mobile` prop으로 레이아웃/스타일 분기    | `MobileAnimationTab` + `DesktopAnimationTab`   |
| `ShortcutsTab.tsx`  | `is_mobile`로 완전히 다른 UI 반환            | `MobileShortcutsTab` + `DesktopShortcutsTab`   |
| `SettingItem.tsx`   | `is_mobile`로 세로/가로 레이아웃 분기        | `MobileSettingItem` + `DesktopSettingItem`     |

**분리 방법:**

```typescript
// BEFORE (위반)
function SettingItem({ is_mobile, label, children }: Props) {
    if (is_mobile) {
        return <div className="py-md border-b">{/* 모바일 레이아웃 */}</div>;
    }
    return <div className="flex items-center">{/* 데스크탑 레이아웃 */}</div>;
}

// AFTER (분리)
// MobileSettingItem.tsx
function MobileSettingItem({ label, children }: Props) {
    return <div className="py-md border-b">{/* 모바일 레이아웃 */}</div>;
}

// DesktopSettingItem.tsx
function DesktopSettingItem({ label, children }: Props) {
    return <div className="flex items-center">{/* 데스크탑 레이아웃 */}</div>;
}
```

**정리 규칙:**

-   리디자인 범위에 포함되는 위반 파일 → **이번에 분리**
-   리디자인 범위 밖 위반 파일 → **건드리지 않음** (별도 작업으로)

---

## 6. 작업 프로세스 (Workflow)

### 변경 전 (Before)

-   [ ] 변경 대상 파일의 안전 등급 확인 (GREEN / YELLOW / RED)
-   [ ] YELLOW 파일 수정 시: Desktop\*.tsx에서의 사용처 확인
-   [ ] 디자인 변경: 목업 프리뷰 생성 및 승인 (.claude/docs/ui-mockup.md)
-   [ ] 신규 기능: 프로토타입 설계 및 승인 (프로토타입 → 사용자 확인 → 구현)

### 변경 중 (During)

-   [ ] GREEN 파일만 수정하고 있는가?
-   [ ] YELLOW 파일 수정 시 기존 인터페이스가 유지되는가?
-   [ ] RED 파일은 건드리지 않았는가?
-   [ ] .claude/docs/coding-standards.md 준수 (300줄 제한, SRP, Tailwind 우선 등)
-   [ ] .claude/docs/design-system.md 준수 (컬러 토큰, 타이포 토큰 등)
-   [ ] 하드코딩 문자열 없이 상수화

### 변경 후 (After)

-   [ ] 데스크탑 레이아웃에서 깨지는 부분 없는가? (브라우저 확인)
-   [ ] 린터 에러 0건
-   [ ] 공유 훅/lib 변경 시: 기존 테스트 통과 확인 (`pnpm test:run`)

---

## 7. 빠른 참조 (Quick Reference)

### 자주 수정하는 파일과 안전 등급

| 파일                        | 등급      | 비고               |
| --------------------------- | --------- | ------------------ |
| `MobileLayout.tsx`          | 🟢 GREEN  | 자유 수정          |
| `MobileDailyPage.tsx`       | 🟢 GREEN  | 자유 수정          |
| `MobileHeader.tsx`          | 🟢 GREEN  | 자유 수정          |
| `MobileBottomNav.tsx`       | 🟢 GREEN  | 자유 수정          |
| `MobileWorkRecordTable.tsx` | 🟢 GREEN  | 자유 수정          |
| `MobileDailyGanttChart.tsx` | 🟢 GREEN  | 자유 수정          |
| `MobileWeeklySchedule.tsx`  | 🟢 GREEN  | 자유 수정          |
| `MobileSettingsModal.tsx`   | 🟢 GREEN  | 자유 수정          |
| `mobile-*.css`              | 🟢 GREEN  | 자유 수정          |
| `useGanttData.ts`           | 🟡 YELLOW | 인터페이스 유지    |
| `useRecordData.ts`          | 🟡 YELLOW | 인터페이스 유지    |
| `useWorkStore`              | 🟡 YELLOW | 필드 추가만 허용   |
| `shared/types/domain.ts`    | 🟡 YELLOW | 선택적 필드 추가만 |
| `layout.css` @media 블록    | 🟡 YELLOW | 모바일 블록만 수정 |
| `Desktop*.tsx`              | 🔴 RED    | 수정 금지          |
| `DesktopLayout.tsx`         | 🔴 RED    | 수정 금지          |

### 브레이크포인트

```
모바일: max-width: 480px
태블릿: max-width: 1023px (현재 미사용)
데스크탑: min-width: 1024px
```
