# 다크모드 구현 계획서

> 작성일: 2026-02-12
> 상태: 계획 단계

---

## 목차

1. [현황 분석](#1-현황-분석)
2. [설계 방향](#2-설계-방향)
3. [Phase 0: 선행 작업 — 하드코딩 색상 토큰화](#3-phase-0-선행-작업--하드코딩-색상-토큰화)
4. [Phase 1: 다크모드 인프라 구축](#4-phase-1-다크모드-인프라-구축)
5. [Phase 2: 핵심 UI 다크모드 적용](#5-phase-2-핵심-ui-다크모드-적용)
6. [Phase 3: 부가 페이지 다크모드 적용](#6-phase-3-부가-페이지-다크모드-적용)
7. [Phase 4: QA 및 엣지 케이스](#7-phase-4-qa-및-엣지-케이스)
8. [다크모드 컬러 팔레트 (안)](#8-다크모드-컬러-팔레트-안)
9. [파일별 작업 목록](#9-파일별-작업-목록)
10. [리스크 및 주의사항](#10-리스크-및-주의사항)

---

## 1. 현황 분석

### 1.1 현재 컬러 시스템 구조

```
[CSS Variables]          [Tailwind @theme]         [JS Constants]
tokens/colors.css   →    global.css (@theme)   →   constants/style/colors.ts
     ↓                        ↓                         ↓
  :root only             light값만 등록           hex 직접 정의
  다크 블록 없음          dark 토큰 없음           다크 팔레트 없음
```

**토큰 체계 (구축 완료):**

| 토큰 그룹    | CSS 변수                                       | Tailwind 클래스            | 상태               |
| ------------ | ---------------------------------------------- | -------------------------- | ------------------ |
| 그레이스케일 | `--gray-50` ~ `--gray-900`                     | `gray-50` ~ `gray-900`     | ✅                 |
| 시맨틱       | `--color-success/error/warning/info`           | `text-success` 등          | ✅                 |
| 텍스트       | `--color-text-primary/secondary/disabled/hint` | `text-text-primary` 등     | ✅                 |
| 배경         | `--color-bg-default/light/grey/dark/app`       | `bg-bg-default` 등         | ✅                 |
| 보더         | `--color-border-default/light/dark`            | `border-border-default` 등 | ✅                 |
| 프라이머리   | `--color-primary/primary-dark/primary-light`   | `text-primary` 등          | ✅ (런타임 동기화) |

### 1.2 문제점: 하드코딩 색상 현황

| 영역                                   | 파일 수        | 하드코딩 건수 | 심각도 |
| -------------------------------------- | -------------- | ------------- | ------ |
| **TSX/TS 파일**                        | ~40개          | ~250건        | 높음   |
| **CSS 파일**                           | ~12개          | ~130건        | 중간   |
| **Tailwind arbitrary** (`text-[#xxx]`) | ~20개          | ~30건         | 중간   |
| **동적 `<style>` 주입**                | 2~3개          | ~25건         | 높음   |
| **합계**                               | **~75개 파일** | **~435건**    | —      |

### 1.3 테마 관리 현황

-   **액센트 컬러**: `app_theme` (blue/green/purple/red/orange/teal/black) → Zustand 스토어에 저장
-   **ThemeProvider**: Ant Design `ConfigProvider` + `theme.defaultAlgorithm` (light only)
-   **CSS 동기화**: `--color-primary`, `--color-primary-gradient`, `--color-primary-dark` 3개만 동기화
-   **다크모드**: 전혀 없음 (prefers-color-scheme, .dark 클래스, data-theme 모두 없음)

---

## 2. 설계 방향

### 2.1 핵심 결정사항

| 결정                 | 선택                                                     | 이유                                          |
| -------------------- | -------------------------------------------------------- | --------------------------------------------- |
| 다크모드 전환 방식   | `data-theme="dark"` on `<html>`                          | Tailwind v4 호환 + CSS 변수 오버라이드에 최적 |
| 모드 옵션            | `light` / `dark` / `system`                              | 시스템 설정 따라가기 지원                     |
| 액센트 컬러와의 관계 | **독립** (`color_mode` ≠ `app_theme`)                    | 액센트 7가지 × 라이트/다크 = 14가지 조합      |
| Ant Design           | `theme.darkAlgorithm` 활용                               | 자체 다크 팔레트 자동 적용                    |
| 저장 위치            | Zustand `SettingsSlice` + localStorage + Firebase        | 기존 `app_theme`와 동일 패턴                  |
| 전환 애니메이션      | `transition: background-color 200ms, color 200ms` on `*` | 자연스러운 전환                               |

### 2.2 아키텍처 변경 개요

```
[Before]
ThemeProvider
  └─ app_theme → accent color only
  └─ ConfigProvider(defaultAlgorithm)
  └─ CSS vars: primary 3개만 동기화

[After]
ThemeProvider
  ├─ app_theme → accent color (unchanged)
  ├─ color_mode → light / dark / system
  │   └─ useResolvedColorMode() → light | dark (system 해석)
  ├─ ConfigProvider(defaultAlgorithm | darkAlgorithm)
  ├─ <html data-theme="light|dark">
  └─ CSS vars: 전체 시맨틱 토큰 동기화 (dark override in CSS)
```

### 2.3 전략: "Phase 0 먼저"

다크모드를 안정적으로 적용하려면 **하드코딩 색상을 먼저 토큰으로 전환**해야 합니다.
이것이 Phase 0이며, 전체 공수의 약 60%를 차지합니다.

```
Phase 0 (토큰화) → Phase 1 (인프라) → Phase 2 (핵심 UI) → Phase 3 (부가) → Phase 4 (QA)
```

---

## 3. Phase 0: 선행 작업 — 하드코딩 색상 토큰화

> **목표**: 모든 하드코딩 hex/rgba를 CSS 변수 또는 Tailwind 토큰 클래스로 전환
> **예상 공수**: 5~7일

### 3.1 변환 매핑 테이블

#### Ant Design 레거시 색상 → Toss 토큰

| 하드코딩 값                     | 의미          | 대체 CSS 변수           | 대체 Tailwind  |
| ------------------------------- | ------------- | ----------------------- | -------------- |
| `#1890ff`, `#096dd9`            | Ant 파란색    | `var(--color-primary)`  | `text-primary` |
| `#52c41a`                       | Ant 초록색    | `var(--color-success)`  | `text-success` |
| `#ff4d4f`                       | Ant 빨간색    | `var(--color-error)`    | `text-error`   |
| `#faad14`, `#fa8c16`, `#ff9500` | Ant 경고      | `var(--color-warning)`  | `text-warning` |
| `#722ed1`                       | Ant 보라색    | (커스텀 토큰 추가 검토) | —              |
| `#1677ff`                       | Ant v5 파란색 | `var(--color-primary)`  | `text-primary` |

#### 그레이스케일/중립 색상 → Toss 그레이

| 하드코딩 값          | 대체 CSS 변수                 | 대체 Tailwind           |
| -------------------- | ----------------------------- | ----------------------- |
| `#fff`, `#ffffff`    | `var(--color-bg-default)`     | `bg-bg-default`         |
| `#fafafa`, `#f9fafb` | `var(--color-bg-light)`       | `bg-bg-light`           |
| `#f5f5f5`, `#f2f4f6` | `var(--color-bg-grey)`        | `bg-bg-grey`            |
| `#f0f0f0`            | `var(--color-border-light)`   | `border-border-light`   |
| `#e8e8e8`, `#e5e8eb` | `var(--color-border-default)` | `border-border-default` |
| `#d9d9d9`, `#d1d6db` | `var(--color-border-dark)`    | `border-border-dark`    |
| `#bfbfbf`, `#b0b8c1` | `var(--color-text-disabled)`  | `text-text-disabled`    |
| `#8c8c8c`, `#8b95a1` | `var(--gray-500)`             | `text-gray-500`         |
| `#999`, `#aaa`       | `var(--color-text-disabled)`  | `text-text-disabled`    |
| `#666`, `#6b7684`    | `var(--color-text-secondary)` | `text-text-secondary`   |
| `#595959`, `#4e5968` | `var(--gray-700)`             | `text-gray-700`         |
| `#333d4b`            | `var(--gray-800)`             | `text-gray-800`         |
| `#191f28`            | `var(--color-text-primary)`   | `text-text-primary`     |

#### rgba 패턴 → CSS 변수 + 투명도

다크모드에서 투명도 기반 색상은 특히 중요합니다:

| 패턴                       | 용도                 | 대체 방안                       |
| -------------------------- | -------------------- | ------------------------------- |
| `rgba(0, 0, 0, 0.03~0.08)` | 가벼운 배경 오버레이 | 새 토큰 `--color-overlay-light` |
| `rgba(0, 0, 0, 0.1~0.15)`  | 그림자, 스크롤바     | 새 토큰 `--color-shadow`        |
| `rgba(0, 0, 0, 0.4)`       | 모달 오버레이        | 새 토큰 `--color-overlay`       |
| `rgba(255, 255, 255, 0.x)` | 밝은 오버레이        | 새 토큰 `--color-overlay-white` |
| `rgba(49, 130, 246, 0.x)`  | 프라이머리 틴트      | 새 토큰 `--color-primary-tint`  |
| `rgba(240, 68, 82, 0.x)`   | 에러 틴트            | 새 토큰 `--color-error-tint`    |
| `rgba(52, 199, 89, 0.x)`   | 성공 틴트            | 새 토큰 `--color-success-tint`  |

### 3.2 추가할 CSS 변수 (Phase 0에서 정의)

```css
/* tokens/colors.css 에 추가 */
:root {
    /* === Overlay / Tint (Phase 0 신규) === */
    --color-overlay-light: rgba(0, 0, 0, 0.03);
    --color-overlay: rgba(0, 0, 0, 0.4);
    --color-overlay-white: rgba(255, 255, 255, 0.65);
    --color-shadow-xs: rgba(0, 0, 0, 0.04);
    --color-shadow-sm: rgba(0, 0, 0, 0.06);
    --color-shadow-md: rgba(0, 0, 0, 0.08);
    --color-shadow-lg: rgba(0, 0, 0, 0.12);

    /* === Primary Tint === */
    --color-primary-tint: rgba(49, 130, 246, 0.08);
    --color-primary-tint-strong: rgba(49, 130, 246, 0.15);

    /* === Semantic Tint === */
    --color-success-tint: rgba(52, 199, 89, 0.08);
    --color-error-tint: rgba(240, 68, 82, 0.08);
    --color-warning-tint: rgba(255, 149, 0, 0.08);

    /* === Surface (카드, 팝오버 등) === */
    --color-surface: #ffffff;
    --color-surface-elevated: #ffffff;

    /* === Scrollbar === */
    --color-scrollbar-thumb: rgba(0, 0, 0, 0.15);
    --color-scrollbar-thumb-hover: rgba(0, 0, 0, 0.25);
}
```

### 3.3 TSX/TS 파일 토큰화 작업 목록

우선순위별로 정리합니다.

#### P0 — 핵심 기능 (즉시)

| 파일                                                                | 하드코딩 수 | 주요 작업                                                |
| ------------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| `features/gantt-chart/ui/GanttStyles/GanttStyles.tsx`               | 21          | rgba → CSS 변수 (동적 `<style>` 주입이므로 `var()` 사용) |
| `features/gantt-chart/lib/bar_calculator.ts`                        | 10          | hex → `SEMANTIC_COLORS` 상수 또는 CSS 변수               |
| `features/gantt-chart/ui/GanttChart/GanttBar.tsx`                   | 5           | hex/rgba → Tailwind 토큰 클래스                          |
| `features/gantt-chart/ui/DailyGanttChart/GanttBarCell.tsx`          | 2           | hex → CSS 변수                                           |
| `features/gantt-chart/ui/DailyGanttChart/SessionBarTooltip.tsx`     | 3           | hex → Tailwind                                           |
| `features/gantt-chart/ui/DailyGanttChart/LunchZoneOverlay.tsx`      | 1           | hex → Tailwind                                           |
| `features/gantt-chart/ui/DailyGanttChart/LunchOverlay.tsx`          | 4           | rgba → CSS 변수                                          |
| `features/gantt-chart/ui/DailyGanttChart/MobileGanttSegmentBar.tsx` | 1           | rgba → CSS 변수                                          |
| `features/gantt-chart/ui/GanttAddModal/ExistingRecordSelector.tsx`  | 2           | arbitrary → Tailwind                                     |
| `features/gantt-chart/ui/GanttChart/LunchOverlay.tsx`               | 4           | rgba → CSS 변수                                          |
| `features/gantt-chart/ui/ResizeHandle/ResizeHandle.tsx`             | 1           | rgba → CSS 변수                                          |
| `features/work-record/ui/Desktop/RecordHeader.tsx`                  | 1           | rgba → Tailwind                                          |
| `features/work-record/ui/Mobile/MobileRunningSection.tsx`           | 2           | gradient hex → CSS 변수                                  |
| `features/work-record/ui/Mobile/MobileContextMenu.tsx`              | 4           | rgba → tint 토큰                                         |
| `features/work-record/ui/Mobile/MobileSwipeCard.tsx`                | 1           | shadow rgba → 토큰                                       |
| `features/work-record/ui/Mobile/MobileRecordRow.tsx`                | 1           | rgba → 토큰                                              |
| `features/work-record/ui/Mobile/MobileRecordList.tsx`               | 4           | shadow rgba → 토큰                                       |
| `features/work-record/ui/Mobile/MobileCalendarStrip.tsx`            | 1           | shadow rgba → 토큰                                       |
| `features/work-record/ui/RecordColumns/CategoryColumn.tsx`          | 8           | hex → 카테고리 토큰 상수                                 |
| `features/work-record/lib/category_utils.ts`                        | 8           | hex → 카테고리 토큰 상수                                 |
| `shared/lib/scrollbar.ts`                                           | 6           | rgba → `--color-scrollbar-*`                             |
| `shared/ui/layout/LoadingOverlay.tsx`                               | 2           | `#fff` → `var(--color-bg-default)`                       |
| `shared/ui/animation/feedback/SkeletonLoader.tsx`                   | 2           | hex → Tailwind                                           |
| `shared/ui/animation/feedback/SuccessAnimation.tsx`                 | 2           | hex → `var(--color-success)`                             |
| `shared/ui/animation/interactions/RippleEffect.tsx`                 | 4           | rgba → CSS 변수                                          |
| `shared/ui/animation/interactions/HoverAnimation.tsx`               | 2           | rgba → CSS 변수                                          |
| `shared/ui/animation/config/presets.ts`                             | 1           | shadow rgba → 토큰                                       |
| `shared/ui/table/DataTable.tsx`                                     | 1           | `#1890ff` → `text-primary`                               |
| `shared/ui/HighlightText.tsx`                                       | 1           | hex → 토큰                                               |
| `widgets/Navigation/MobileBottomNav.tsx`                            | 2           | rgba → CSS 변수                                          |
| `widgets/SyncStatus/SyncIndicator.tsx`                              | 4           | hex → Tailwind 토큰                                      |
| `App.tsx`                                                           | 5           | hex/rgba → Tailwind 토큰                                 |
| `app/layouts/DesktopLayout.tsx`                                     | 2           | hex → Tailwind                                           |
| `app/layouts/MobileLayout.tsx`                                      | 1           | arbitrary → Tailwind                                     |
| `components/ChangelogModal.tsx`                                     | 1           | arbitrary → Tailwind                                     |
| `constants/changelog.ts`                                            | 9           | hex → `SEMANTIC_COLORS` 상수                             |

#### P1 — 설정 화면

| 파일                                                      | 하드코딩 수 | 주요 작업                |
| --------------------------------------------------------- | ----------- | ------------------------ |
| `features/settings/ui/tabs/ThemeTab.tsx`                  | 2           | hex → Tailwind           |
| `features/settings/ui/tabs/ShortcutsTab.tsx`              | 3           | arbitrary → Tailwind     |
| `features/settings/ui/tabs/ShortcutKeyEditor.tsx`         | 4           | hex → CSS 변수           |
| `features/settings/ui/tabs/SettingItem.tsx`               | 3           | arbitrary → Tailwind     |
| `features/settings/ui/tabs/DataTab.tsx`                   | 4           | hex → Tailwind           |
| `features/settings/ui/tabs/AutoCompleteOptionList.tsx`    | 4           | hex/arbitrary → Tailwind |
| `features/settings/ui/tabs/AutoCompleteHiddenSection.tsx` | 4           | arbitrary → Tailwind     |
| `features/settings/ui/tabs/AutoCompleteChip.tsx`          | 2           | arbitrary → Tailwind     |
| `features/settings/ui/tabs/AutoCompleteTab.tsx`           | 1           | arbitrary → Tailwind     |
| `features/settings/ui/tabs/AnimationTab.tsx`              | 2           | arbitrary → Tailwind     |
| `features/settings/constants/styles.ts`                   | 1           | hex → CSS 변수           |

#### P2 — 관리자/통계

| 파일                                                     | 하드코딩 수 | 주요 작업                     |
| -------------------------------------------------------- | ----------- | ----------------------------- |
| `features/admin/ui/Statistics/StatsDashboard.tsx`        | 27          | Ant 레거시 → 토큰 (가장 대량) |
| `features/admin/ui/AdminTabs/SessionsTab.tsx`            | 17          | arbitrary → Tailwind          |
| `features/admin/ui/Statistics/CategoryAnalysis.tsx`      | 7           | hex → 카테고리 상수           |
| `features/admin/ui/IntegrityCheck/IntegrityChecker.tsx`  | 9           | hex → 토큰                    |
| `features/admin/ui/AdminTabs/RecordsTab.tsx`             | 4           | arbitrary → Tailwind          |
| `features/admin/ui/Statistics/TimeChart.tsx`             | 3           | hex → 토큰                    |
| `features/admin/ui/Statistics/StatsOverview.tsx`         | 3           | hex → 토큰                    |
| `features/admin/ui/AdminSessionGrid/AdminGridHeader.tsx` | 1           | arbitrary → Tailwind          |
| `features/admin/ui/TrashManagement/TrashManager.tsx`     | 1           | hex → CSS 변수                |
| `features/admin/ui/DataExplorer/SessionsExplorer.tsx`    | 1           | hex → 토큰                    |

#### P3 — 기타

| 파일                                                              | 하드코딩 수 |
| ----------------------------------------------------------------- | ----------- |
| `features/suggestion/ui/SuggestionCard/SuggestionCardContent.tsx` | 4           |
| `features/work-template/ui/TemplateCard.tsx`                      | 2           |
| `features/work-template/ui/SortableTemplateCard.tsx`              | 1           |
| `features/work-template/ui/AddPresetButton.tsx`                   | 1           |
| `features/work-template/ui/ColorPicker.tsx`                       | 1           |
| `features/guide/ui/GuideSidebar/GuideSidebar.tsx`                 | 1           |

### 3.4 CSS 파일 토큰화 작업 목록

| CSS 파일                                   | hex 수 | rgba 수 | 작업                               |
| ------------------------------------------ | ------ | ------- | ---------------------------------- |
| `styles/components/guide.css`              | 42     | 2       | 전체 → CSS 변수 전환               |
| `styles/components/demo.css`               | 27     | 2       | 전체 → CSS 변수 전환               |
| `styles/components/weekly-schedule.css`    | 12     | 1       | 전체 → CSS 변수 전환               |
| `styles/components/admin.css`              | 9      | 0       | 전체 → CSS 변수 전환               |
| `styles/components/suggestion.css`         | 5      | 0       | 전체 → CSS 변수 전환               |
| `styles/components/mobile-record-card.css` | 3      | 1       | 전체 → CSS 변수 전환               |
| `styles/components/record-table.css`       | 1      | 3       | rgba → shadow 토큰                 |
| `styles/components/mobile-nav.css`         | 1      | 1       | `#1890ff` → `var(--color-primary)` |
| `styles/components/mobile-record.css`      | 0      | 6       | rgba → 토큰                        |
| `styles/components/mobile-gantt.css`       | 0      | 3       | rgba → 토큰                        |
| `styles/layout.css`                        | 0      | 3       | rgba → 토큰                        |
| `styles/overrides/antd.css`                | 0      | 2       | rgba → shadow 토큰                 |
| `styles/utilities/keyframes.css`           | 2      | 6       | hex/rgba → 토큰                    |

---

## 4. Phase 1: 다크모드 인프라 구축

> **목표**: 토글 한 번으로 전체 앱이 다크/라이트 전환되는 골격 완성
> **예상 공수**: 2~3일
> **선행조건**: Phase 0 완료 (최소 P0 핵심 기능)

### 4.1 ColorMode 열거형 추가

**파일:** `src/shared/constants/enums/theme.ts`

```typescript
// 기존 AppTheme 아래에 추가
export const ColorMode = {
    Light: "light",
    Dark: "dark",
    System: "system",
} as const;

export type ColorMode = (typeof ColorMode)[keyof typeof ColorMode];
export const COLOR_MODE_VALUES = Object.values(ColorMode);
export const DEFAULT_COLOR_MODE = ColorMode.Light;
```

### 4.2 다크 토큰 정의

**파일:** `src/styles/tokens/colors.css`

`:root` 블록 아래에 `[data-theme="dark"]` 블록 추가:

```css
[data-theme="dark"] {
    /* === Grayscale (반전) === */
    --gray-50: #1a1d23;
    --gray-100: #21252d;
    --gray-200: #2c3038;
    --gray-300: #3a3f48;
    --gray-400: #5a6170;
    --gray-500: #8b95a1; /* 중간값 유지 */
    --gray-600: #b0b8c1;
    --gray-700: #d1d6db;
    --gray-800: #e5e8eb;
    --gray-900: #f2f4f6;

    /* === Semantic (밝기 조정) === */
    --color-success: #30d158;
    --color-error: #ff453a;
    --color-warning: #ff9f0a;
    --color-info: #64a8f8;
    --color-disabled: #3a3f48;

    /* === Text (반전) === */
    --color-text-primary: #f2f4f6;
    --color-text-secondary: #b0b8c1;
    --color-text-disabled: #5a6170;
    --color-text-hint: #3a3f48;
    --color-text-white: #ffffff;

    /* === Background (어두운 톤) === */
    --color-bg-default: #141517;
    --color-bg-light: #1a1d23;
    --color-bg-grey: #21252d;
    --color-bg-dark: #0d0e10;
    --color-bg-app: #141517;

    /* === Border (어두운 톤) === */
    --color-border-default: #2c3038;
    --color-border-light: #21252d;
    --color-border-dark: #3a3f48;

    /* === Primary (다크에서 약간 밝게) === */
    --color-primary-light: rgba(49, 130, 246, 0.15);

    /* === Surface === */
    --color-surface: #1a1d23;
    --color-surface-elevated: #21252d;

    /* === Overlay / Shadow === */
    --color-overlay-light: rgba(255, 255, 255, 0.03);
    --color-overlay: rgba(0, 0, 0, 0.6);
    --color-overlay-white: rgba(255, 255, 255, 0.1);
    --color-shadow-xs: rgba(0, 0, 0, 0.2);
    --color-shadow-sm: rgba(0, 0, 0, 0.3);
    --color-shadow-md: rgba(0, 0, 0, 0.4);
    --color-shadow-lg: rgba(0, 0, 0, 0.5);

    /* === Tint === */
    --color-primary-tint: rgba(49, 130, 246, 0.12);
    --color-primary-tint-strong: rgba(49, 130, 246, 0.2);
    --color-success-tint: rgba(48, 209, 88, 0.12);
    --color-error-tint: rgba(255, 69, 58, 0.12);
    --color-warning-tint: rgba(255, 159, 10, 0.12);

    /* === Scrollbar === */
    --color-scrollbar-thumb: rgba(255, 255, 255, 0.15);
    --color-scrollbar-thumb-hover: rgba(255, 255, 255, 0.25);
}
```

### 4.3 Tailwind @theme 다크 연동

**파일:** `src/styles/global.css`

Tailwind v4에서 `@theme`은 정적 값만 받으므로, 다크모드 전환은 CSS 변수 오버라이드로 처리합니다.
`@theme` 내 색상값을 **CSS 변수 참조**로 변경:

```css
@theme {
    /* 기존 하드코딩 hex 값 → CSS 변수 참조로 변경 */
    --color-primary: var(--color-primary);
    --color-text-primary: var(--color-text-primary);
    --color-bg-default: var(--color-bg-default);
    /* ... 모든 색상 토큰을 var() 참조로 전환 */
}
```

> **참고**: Tailwind v4는 `@theme` 내에서 `var()` 참조를 지원하는지 확인 필요.
> 지원하지 않으면, 별도 `@layer theme`에서 유틸리티 클래스를 CSS 변수 기반으로 재정의합니다.

**대안 (Tailwind v4 `var()` 미지원 시):**

```css
@layer theme {
    .text-primary {
        color: var(--color-primary) !important;
    }
    .bg-bg-default {
        background-color: var(--color-bg-default) !important;
    }
    .text-text-primary {
        color: var(--color-text-primary) !important;
    }
    /* ... */
}
```

### 4.4 Store 확장

**파일:** `src/store/types/store.ts`

```typescript
// SettingsSlice에 추가
color_mode: ColorMode;
setColorMode: (mode: ColorMode) => void;
```

**파일:** `src/store/slices/settings.ts`

```typescript
// 초기값
color_mode: DEFAULT_COLOR_MODE,

// setter
setColorMode: (color_mode) => {
    set({ color_mode });
    syncSettings({ color_mode });
},
```

**파일:** `src/store/useWorkStore.ts` — `partialize`에 `color_mode` 추가

### 4.5 ThemeProvider 확장

**파일:** `src/app/providers/ThemeProvider.tsx`

```typescript
import { theme } from "antd";

// 시스템 설정 감지 훅
function useResolvedColorMode(color_mode: ColorMode): "light" | "dark" {
    const [system_preference, setSystemPreference] = useState<"light" | "dark">(
        "light"
    );

    useEffect(() => {
        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemPreference(mql.matches ? "dark" : "light");

        const handler = (e: MediaQueryListEvent) => {
            setSystemPreference(e.matches ? "dark" : "light");
        };
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    if (color_mode === "system") return system_preference;
    return color_mode;
}

// data-theme 속성 동기화
function useSyncDataTheme(resolved_mode: "light" | "dark") {
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", resolved_mode);
    }, [resolved_mode]);
}

// ThemeProvider 내부
export function ThemeProvider({ children }: ThemeProviderProps) {
    const app_theme = useWorkStore((s) => s.app_theme);
    const color_mode = useWorkStore((s) => s.color_mode);

    const resolved_mode = useResolvedColorMode(color_mode);
    const theme_colors = APP_THEME_COLORS[app_theme];

    useSyncCssVariables(theme_colors);
    useSyncDataTheme(resolved_mode);

    const algorithm =
        resolved_mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm;

    return (
        <ConfigProvider
            theme={{
                algorithm,
                token: {
                    colorPrimary: theme_colors.primary,
                    borderRadius: 12,
                    // 다크모드 시 추가 토큰
                    ...(resolved_mode === "dark" && {
                        colorBgContainer: "#1a1d23",
                        colorBgElevated: "#21252d",
                        colorBgLayout: "#141517",
                        colorBorderSecondary: "#2c3038",
                    }),
                },
            }}
        >
            ...
        </ConfigProvider>
    );
}
```

### 4.6 전환 애니메이션 CSS

**파일:** `src/styles/tokens/colors.css` 하단에 추가

```css
/* 다크모드 전환 트랜지션 */
html[data-theme] * {
    transition: background-color 200ms ease, border-color 200ms ease,
        color 150ms ease, box-shadow 200ms ease;
}

/* 애니메이션 비활성 설정 시 제거 */
@media (prefers-reduced-motion: reduce) {
    html[data-theme] * {
        transition: none !important;
    }
}
```

### 4.7 설정 UI — 다크모드 토글

**파일:** `src/features/settings/ui/tabs/ThemeTab.tsx` 에 다크모드 섹션 추가

| 옵션   | 아이콘 | 라벨        |
| ------ | ------ | ----------- |
| Light  | ☀️     | 라이트 모드 |
| Dark   | 🌙     | 다크 모드   |
| System | 🖥️     | 시스템 설정 |

**디자인 참고 (Toss 스타일):**

-   카드형 3버튼 토글 (라이트/다크/시스템)
-   현재 선택에 `border-primary` + `bg-primary-light` 하이라이트
-   미리보기 아이콘 or 미니 UI 스냅샷

---

## 5. Phase 2: 핵심 UI 다크모드 적용

> **목표**: 일상 사용 화면이 자연스럽게 다크모드로 표시
> **예상 공수**: 3~4일
> **선행조건**: Phase 0(P0) + Phase 1 완료

### 5.1 레이아웃

| 파일                            | 작업                                      |
| ------------------------------- | ----------------------------------------- |
| `styles/layout.css`             | rgba → 토큰, 헤더 그라데이션 다크 대응    |
| `app/layouts/DesktopLayout.tsx` | 배경/보더 확인, `bg-bg-default` 사용 확인 |
| `app/layouts/MobileLayout.tsx`  | 모바일 배경 확인                          |
| `styles/overrides/antd.css`     | 다크모드 Ant Design 오버라이드 추가       |

### 5.2 간트 차트 (가장 복잡)

| 파일                     | 핵심 작업                                          |
| ------------------------ | -------------------------------------------------- |
| `GanttStyles.tsx`        | `@layer components`로 감싸기 + 모든 rgba → `var()` |
| `GanttBar.tsx`           | 배경/보더/그림자 다크 대응                         |
| `GanttBarCell.tsx`       | 동일                                               |
| `LunchOverlay.tsx` (2개) | 오버레이 색상 다크 대응                            |
| `SessionBarTooltip.tsx`  | 텍스트/배경 토큰 확인                              |

### 5.3 작업 기록 (데스크탑 + 모바일)

| 파일                       | 핵심 작업                                     |
| -------------------------- | --------------------------------------------- |
| `record-table.css`         | 행 배경/호버/선택 다크 대응                   |
| `mobile-record.css`        | 카드 배경/그림자 다크 대응                    |
| `mobile-record-card.css`   | 상태 색상 다크 대응                           |
| `MobileRunningSection.tsx` | 그라데이션 배경 다크 대응                     |
| `MobileContextMenu.tsx`    | 컨텍스트 메뉴 배경                            |
| `MobileBottomNav.tsx`      | 네비 바 배경 (중요: glass-morphism 다크 대응) |

### 5.4 네비게이션 & 공통

| 파일                  | 핵심 작업                                              |
| --------------------- | ------------------------------------------------------ |
| `MobileBottomNav.tsx` | `rgba(255,255,255,0.88)` → 다크: `rgba(20,21,23,0.88)` |
| `SyncIndicator.tsx`   | 상태 색상 토큰 확인                                    |
| `LoadingOverlay.tsx`  | 배경색 토큰 확인                                       |
| `SkeletonLoader.tsx`  | 그라데이션 색상 다크 대응                              |

### 5.5 확인 체크리스트

-   [ ] 사이드바 배경/텍스트 자연스러운가
-   [ ] 테이블 행 호버/선택 구분이 되는가
-   [ ] 간트 차트 바 색상이 다크 배경에서 보이는가
-   [ ] 점심시간 오버레이가 구분되는가
-   [ ] 모달/팝오버 배경이 어두운가
-   [ ] 토스트가 다크 배경에서 눈에 띄는가
-   [ ] 스크롤바가 보이는가
-   [ ] 하단 네비게이션이 자연스러운가

---

## 6. Phase 3: 부가 페이지 다크모드 적용

> **목표**: 설정, 관리자, 가이드, 데모 등 모든 페이지 다크 대응
> **예상 공수**: 3~5일

### 6.1 설정 화면

| 파일                      | 작업                       |
| ------------------------- | -------------------------- |
| `ShortcutsTab.tsx`        | 배경/보더 토큰 전환        |
| `ShortcutKeyEditor.tsx`   | 상태 보더 색상 토큰 전환   |
| `DataTab.tsx`             | 저장소 배지 색상 다크 대응 |
| `AutoComplete*.tsx` (4개) | 옵션/칩 배경 토큰 전환     |
| `SettingItem.tsx`         | 구분선/배경 토큰 전환      |
| `AnimationTab.tsx`        | 보더 토큰 전환             |

### 6.2 관리자 페이지

| 파일                   | 작업                 | 비고                          |
| ---------------------- | -------------------- | ----------------------------- |
| `StatsDashboard.tsx`   | 27건 전량 전환       | **가장 대량**, 차트 색상 주의 |
| `SessionsTab.tsx`      | 17건, 상태 뱃지 색상 | tint 토큰 사용                |
| `CategoryAnalysis.tsx` | 차트 카테고리 색상   | 다크 배경에서 대비 확인       |
| `IntegrityChecker.tsx` | 상태 색상            | 시맨틱 토큰 사용              |
| `RecordsTab.tsx`       | 상태 보더            | tint 토큰 사용                |
| `TimeChart.tsx`        | 차트 색상            | Ant Charts 다크 대응          |
| `admin.css`            | 9건 hex              | CSS 변수 전환                 |

### 6.3 가이드 & 데모

| 파일        | hex 수 | 전략                                    |
| ----------- | ------ | --------------------------------------- |
| `guide.css` | 42     | 일괄 CSS 변수 전환 + 코드블록 다크 테마 |
| `demo.css`  | 27     | 일괄 CSS 변수 전환                      |

> 코드 블록(`<pre>`, `<code>`)은 라이트/다크 각각 다른 스타일이 필요합니다.
> 라이트: `bg: #f5f7fa`, 다크: `bg: #1e1e2e` (catppuccin 등)

### 6.4 기타 CSS 파일

| 파일                  | 작업                               |
| --------------------- | ---------------------------------- |
| `weekly-schedule.css` | 12건 hex → CSS 변수                |
| `suggestion.css`      | 5건 hex → CSS 변수                 |
| `mobile-nav.css`      | `#1890ff` → `var(--color-primary)` |
| `keyframes.css`       | hex/rgba → CSS 변수                |

---

## 7. Phase 4: QA 및 엣지 케이스

> **목표**: 모든 화면에서 다크모드가 자연스럽게 작동
> **예상 공수**: 2~3일

### 7.1 QA 체크리스트

#### 기능 테스트

-   [ ] 라이트 → 다크 전환 시 깜빡임 없이 부드러운 전환
-   [ ] 다크 → 라이트 전환 동일
-   [ ] "시스템" 모드: OS 다크모드 전환 시 자동 반영
-   [ ] 새로고침 후 설정 유지 (localStorage)
-   [ ] 다른 기기에서 설정 동기화 (Firebase)
-   [ ] 7가지 액센트 컬러 × 2가지 모드 = 14가지 조합 모두 확인
-   [ ] 애니메이션 비활성 설정 시 전환 트랜지션도 제거

#### 시각 테스트

-   [ ] **대비**: 텍스트/배경 대비 WCAG AA (4.5:1) 충족
-   [ ] **구분**: 카드/배경/보더 경계가 다크에서 명확
-   [ ] **일관성**: 같은 시맨틱 의미의 색상이 모든 곳에서 동일
-   [ ] **가독성**: 긴 텍스트(가이드 페이지)의 다크 가독성
-   [ ] **차트**: 색상이 다크 배경에서 충분히 구분되는가
-   [ ] **이미지/아이콘**: 다크 배경에서 깨지지 않는가
-   [ ] **그림자**: 다크 배경에서 그림자가 자연스러운가 (보통 더 강하게)
-   [ ] **스크롤바**: 다크 배경에서 보이는가

#### 플랫폼 테스트

-   [ ] 데스크탑 Chrome
-   [ ] 데스크탑 Safari
-   [ ] 데스크탑 Firefox
-   [ ] 모바일 Chrome (Android)
-   [ ] 모바일 Safari (iOS)
-   [ ] PWA 환경

### 7.2 엣지 케이스

| 케이스                  | 처리 방안                                                              |
| ----------------------- | ---------------------------------------------------------------------- |
| PWA 상태바 색상         | `vite.config.ts`에서 `theme_color` 동적 처리 또는 두 가지 manifest     |
| PDF/인쇄                | `@media print`에서 항상 라이트 모드 강제                               |
| 이미지 배경             | 투명 PNG 아이콘이 다크 배경에서 안 보이는 경우 → 대체 아이콘 또는 필터 |
| 타사 라이브러리 스타일  | Ant Charts, DatePicker 등이 다크에 맞는지 확인                         |
| 초기 로딩 깜빡임 (FOUC) | `<script>` 태그로 `data-theme` 즉시 적용 (SSR 패턴)                    |

### 7.3 FOUC 방지 스크립트

**파일:** `index.html` `<head>` 최상단

```html
<script>
    (function () {
        try {
            var stored = JSON.parse(
                localStorage.getItem("work-time-storage") || "{}"
            );
            var mode = (stored.state && stored.state.color_mode) || "light";
            if (mode === "system") {
                mode = window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";
            }
            document.documentElement.setAttribute("data-theme", mode);
        } catch (e) {
            document.documentElement.setAttribute("data-theme", "light");
        }
    })();
</script>
```

### 7.4 테스트 코드 업데이트

| 파일                           | 작업                                       |
| ------------------------------ | ------------------------------------------ |
| `test/helpers/mock_factory.ts` | `color_mode` 기본값 추가                   |
| 스냅샷 테스트                  | 다크모드 스냅샷 추가 (선택적)              |
| 기존 테스트                    | `color: "#1890ff"` 등 하드코딩 → 토큰 상수 |

---

## 8. 다크모드 컬러 팔레트 (안)

### 8.1 배경 계층

다크모드에서 **높이(elevation)**를 밝기로 표현합니다:

```
[가장 뒤] ─────────────────────────── [가장 앞]
  App BG      Surface     Elevated     Popover
  #141517     #1a1d23     #21252d      #2c3038
```

| 레벨          | 용도             | 라이트    | 다크      |
| ------------- | ---------------- | --------- | --------- |
| L0 (App)      | 앱 배경          | `#F9FAFB` | `#141517` |
| L1 (Surface)  | 카드, 사이드바   | `#FFFFFF` | `#1a1d23` |
| L2 (Elevated) | 드롭다운, 팝오버 | `#FFFFFF` | `#21252d` |
| L3 (Overlay)  | 모달, 다이얼로그 | `#FFFFFF` | `#2c3038` |

### 8.2 텍스트 계층

| 용도             | 라이트    | 다크      |
| ---------------- | --------- | --------- |
| Primary (제목)   | `#191F28` | `#F2F4F6` |
| Secondary (보조) | `#6B7684` | `#B0B8C1` |
| Disabled         | `#B0B8C1` | `#5A6170` |
| Hint             | `#D1D6DB` | `#3A3F48` |

### 8.3 보더

| 용도    | 라이트    | 다크      |
| ------- | --------- | --------- |
| Default | `#E5E8EB` | `#2C3038` |
| Light   | `#F2F4F6` | `#21252D` |
| Dark    | `#D1D6DB` | `#3A3F48` |

### 8.4 시맨틱 (Apple HIG 다크 참고)

| 의미    | 라이트    | 다크      |
| ------- | --------- | --------- |
| Success | `#34C759` | `#30D158` |
| Error   | `#F04452` | `#FF453A` |
| Warning | `#FF9500` | `#FF9F0A` |
| Info    | `#3182F6` | `#64A8F8` |

---

## 9. 파일별 작업 목록 (전체)

### Phase별 파일 수 요약

| Phase             | 파일 수 | 하드코딩 건수 | 예상 공수   |
| ----------------- | ------- | ------------- | ----------- |
| Phase 0 (토큰화)  | ~75개   | ~435건        | 5~7일       |
| Phase 1 (인프라)  | ~8개    | 신규          | 2~3일       |
| Phase 2 (핵심 UI) | ~20개   | 확인/미세조정 | 3~4일       |
| Phase 3 (부가)    | ~25개   | 확인/미세조정 | 3~5일       |
| Phase 4 (QA)      | ~5개    | 테스트        | 2~3일       |
| **합계**          | —       | —             | **15~22일** |

### 핵심 신규/수정 파일

| 파일                                     | Phase | 작업 유형                                  |
| ---------------------------------------- | ----- | ------------------------------------------ |
| `shared/constants/enums/theme.ts`        | 1     | `ColorMode` enum 추가                      |
| `store/types/store.ts`                   | 1     | `color_mode` 필드 추가                     |
| `store/slices/settings.ts`               | 1     | `setColorMode` 액션 추가                   |
| `styles/tokens/colors.css`               | 0+1   | 신규 토큰 + `[data-theme="dark"]` 블록     |
| `styles/global.css`                      | 1     | `@theme` 색상을 CSS 변수 참조로 변경       |
| `app/providers/ThemeProvider.tsx`        | 1     | `darkAlgorithm` 분기 + `data-theme` 동기화 |
| `features/settings/ui/tabs/ThemeTab.tsx` | 1     | 다크모드 토글 UI 추가                      |
| `index.html`                             | 4     | FOUC 방지 스크립트                         |

---

## 10. 리스크 및 주의사항

### 10.1 높은 리스크

| 리스크                                          | 영향                                            | 대응                                                       |
| ----------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| **Tailwind v4 `@theme` 내 `var()` 참조 미지원** | Tailwind 유틸리티 클래스가 다크모드에서 안 바뀜 | `@layer theme`에서 유틸리티 재정의 또는 CSS 변수 직접 참조 |
| **Ant Design 컴포넌트 다크 스타일 불일치**      | antd 기본 다크와 커스텀 토큰 충돌               | `antd.css` 오버라이드 추가                                 |
| **GanttStyles 동적 CSS**                        | `<style>` 태그 내용이 다크 토큰을 안 따름       | `var()` 사용으로 전환                                      |
| **Phase 0 작업량 과소평가**                     | 토큰화가 예상보다 오래 걸림                     | 기능 단위로 쪼개서 점진적 전환                             |

### 10.2 중간 리스크

| 리스크                       | 영향                                | 대응                                |
| ---------------------------- | ----------------------------------- | ----------------------------------- |
| 카테고리/템플릿 고정 색상    | 다크 배경에서 대비 부족             | 다크용 밝기 보정 함수 도입          |
| 차트(Ant Charts) 다크 미지원 | 차트 배경/텍스트/그리드 안 바뀜     | `theme` prop 또는 CSS 오버라이드    |
| FOUC (초기 깜빡임)           | 라이트 → 다크 전환이 눈에 보임      | `index.html` 인라인 스크립트로 해결 |
| 스냅샷 테스트 깨짐           | 색상 변경으로 대량 스냅샷 갱신 필요 | Phase 0에서 한 번에 갱신            |

### 10.3 낮은 리스크

| 리스크                     | 대응                          |
| -------------------------- | ----------------------------- |
| Firebase 동기화 필드 추가  | 기존 `syncSettings` 패턴 따름 |
| localStorage 마이그레이션  | 기본값 fallback으로 충분      |
| PWA manifest `theme_color` | 동적 처리 또는 별도 manifest  |

### 10.4 작업 시 주의사항

1. **Phase 0은 다크모드와 무관하게 가치가 있음** — 디자인 시스템 일관성 향상
2. **Phase 0을 별도 PR로 분리** — 다크모드와 리팩토링을 섞지 않기
3. **점진적 전환** — 한 번에 모든 파일을 바꾸지 말고 기능 단위로
4. **시각 비교 테스트** — 각 Phase 완료 시 라이트/다크 스크린샷 비교
5. **`!important` 남용 주의** — 다크 오버라이드에서 specificity 전쟁 방지
6. **카테고리/템플릿 색상은 라이트/다크 공통** — 밝기 보정으로 대응

---

## 부록: 참고 자료

-   [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode)
-   [Ant Design Dark Theme](https://ant.design/docs/react/customize-theme#use-dark-theme)
-   [Apple HIG - Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
-   [Material Design 3 - Dark Theme](https://m3.material.io/styles/color/dark-theme)
-   [Toss Design System](https://toss.im/design-principle)
