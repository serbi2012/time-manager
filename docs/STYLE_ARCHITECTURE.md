# Style Architecture Design

> Tailwind CSS v4 + CSS Modules + framer-motion

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Constraints](#2-goals--constraints)
3. [Current State Analysis](#3-current-state-analysis)
4. [Architecture Decision](#4-architecture-decision)
5. [Folder Structure](#5-folder-structure)
6. [Layer System](#6-layer-system)
7. [Design Tokens](#7-design-tokens)
8. [Migration Examples](#8-migration-examples)
9. [Animation Integration](#9-animation-integration)
10. [Ant Design Override Strategy](#10-ant-design-override-strategy)
11. [Libraries](#11-libraries)
12. [Migration Plan](#12-migration-plan)
13. [UI/UX Preservation Checklist](#13-uiux-preservation-checklist)
14. [Coding Conventions](#14-coding-conventions)
15. [Compatibility Matrix](#15-compatibility-matrix)

---

## 1. Overview

This document defines the style management architecture for the Time Manager project.
The primary goal is to establish a systematic, maintainable, and extensible style system
while **preserving the current UI/UX pixel-perfectly**.

### Key Principles

-   **Zero Visual Regression**: Every migration step must produce identical visual output.
-   **Incremental Adoption**: New system coexists with existing code. No big-bang rewrite.
-   **Single Source of Truth**: Design tokens defined once, consumed everywhere.
-   **Animation-Ready**: Seamless integration with framer-motion animation system.

---

## 2. Goals & Constraints

### Goals

| Goal                  | Description                                               |
| --------------------- | --------------------------------------------------------- |
| Unified style system  | Replace 3+ style patterns with 1 consistent approach      |
| Modular CSS           | Break 1,920-line `App.css` into scoped modules            |
| Token-driven          | CSS variables as single source, consumed by Tailwind + JS |
| Animation integration | framer-motion for dynamic, Tailwind for static styles     |
| Developer experience  | IDE autocomplete, type hints, fast feedback loop          |

### Constraints

| Constraint                | Detail                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------- |
| **UI/UX must not change** | Pixel-perfect preservation. No visual regression allowed.                          |
| Ant Design v6.2.0         | Must coexist with antd's CSS-in-JS system                                          |
| Dynamic theming           | 7 app themes must continue to work (blue, green, purple, red, orange, teal, black) |
| Mobile/Desktop split      | Existing responsive behavior must be preserved                                     |
| framer-motion v12         | Animation system remains unchanged                                                 |
| Incremental migration     | Old and new styles must coexist during transition                                  |

---

## 3. Current State Analysis

### Style Management Methods (Before)

| Method                  | Location                         | Count     | Problem                                          |
| ----------------------- | -------------------------------- | --------- | ------------------------------------------------ |
| Global CSS              | `App.css` (1,920 lines)          | 1 file    | Monolithic, no scoping, antd overrides scattered |
| CSSProperties constants | `features/*/constants/styles.ts` | 8 files   | Type-safe but not class-based, limited reuse     |
| Design tokens (JS)      | `shared/constants/style/`        | 4 files   | Not connected to CSS, JS-only                    |
| Inline styles           | Throughout components            | 90+ files | Guideline violation, not reusable                |
| Animation system        | `shared/ui/animation/`           | 22 files  | Well-structured (keep as-is)                     |

### `App.css` Breakdown

| Section              | Lines (approx) | Description                                               |
| -------------------- | -------------- | --------------------------------------------------------- |
| Layout               | ~100           | `.app-layout`, `.app-header`, `.app-body`, `.app-content` |
| antd overrides       | ~100           | Table, card, button, popconfirm overrides                 |
| Animations           | ~40            | `@keyframes pulse-border`, `syncCheckPop`, etc.           |
| Mobile responsive    | ~400           | `@media (max-width: 480px)` blocks                        |
| Mobile bottom nav    | ~50            | `.mobile-bottom-nav`, `.mobile-nav-item`                  |
| Mobile preset        | ~50            | `.mobile-preset-fab`, drawer styles                       |
| Mobile record cards  | ~70            | `.mobile-record-card` variants                            |
| Mobile gantt         | ~50            | Gantt chart responsive                                    |
| Guide book           | ~450           | `.guide-book-*` full documentation styles                 |
| Demo components      | ~200           | `.demo-*` demonstration styles                            |
| Admin styles         | ~40            | `.admin-conflict-row`, etc.                               |
| Suggestion board     | ~120           | `.suggestion-*` styles                                    |
| Mobile form/settings | ~80            | Form and modal mobile overrides                           |

### Feature Style Files

| Feature         | File                  | Lines | Contents                                    |
| --------------- | --------------------- | ----- | ------------------------------------------- |
| work-record     | `constants/styles.ts` | 225   | Colors, sizes, column widths, CSSProperties |
| gantt-chart     | `constants/styles.ts` | 74    | Row height, fonts, colors, spacing          |
| suggestion      | `constants/styles.ts` | 146   | Nested style objects                        |
| guide           | `constants/styles.ts` | 18    | TOC, search, menu constants                 |
| weekly-schedule | `constants/styles.ts` | 136   | CSSProperties + CSS string                  |
| work-template   | `constants/styles.ts` | 26    | Button, empty state styles                  |
| settings        | `constants/styles.ts` | 88    | Layout constants, CSSProperties             |
| admin           | `constants/styles.ts` | 80    | Admin UI styles, colors                     |

---

## 4. Architecture Decision

### Options Evaluated

| Criteria             |    Tailwind v4    |    CSS Modules    | Panda CSS  | Vanilla Extract |
| -------------------- | :---------------: | :---------------: | :--------: | :-------------: |
| Vite integration     |    zero-config    |     built-in      |   plugin   |     plugin      |
| Learning curve       |      medium       |        low        |    high    |      high       |
| Ecosystem            |      largest      |      medium       |   small    |      small      |
| antd compatibility   |      proven       |      proven       | unverified |   unverified    |
| framer-motion compat |     excellent     |     excellent     |    good    |      good       |
| Incremental adoption |     excellent     |     excellent     |  moderate  |    difficult    |
| Runtime cost         |         0         |         0         |     0      |        0        |
| Design token support | CSS vars (native) | CSS vars (manual) | build-time |   build-time    |
| Bundle size          |    JIT minimal    |     per-file      |  minimal   |     minimal     |

### Decision: Tailwind CSS v4 + CSS Modules (hybrid)

**Rationale:**

1. **Tailwind v4** - CSS-first configuration, native Vite support, zero-config content detection
2. **CSS Modules** - Scoped overrides for complex Ant Design selectors only
3. **framer-motion** - Existing animation system remains unchanged

This hybrid approach provides:

-   Utility classes for 90% of styling needs (layout, spacing, colors, typography)
-   Scoped CSS Modules for antd override complexity (`:global()` selectors)
-   Zero runtime cost across the board
-   Pixel-perfect preservation through incremental migration

---

## 5. Folder Structure

```
src/
├── styles/                              # Style system root (NEW)
│   ├── global.css                       # Tailwind entry + global resets
│   │
│   ├── tokens/                          # Design tokens (CSS custom properties)
│   │   ├── colors.css                   # Color tokens (semantic, text, bg, border, theme)
│   │   ├── spacing.css                  # Spacing, font sizes, border radius
│   │   ├── typography.css               # Font families, line heights, font weights
│   │   └── z-index.css                  # Layer tokens
│   │
│   ├── overrides/                       # Ant Design overrides (CSS Modules)
│   │   ├── header.module.css            # .app-header antd overrides
│   │   ├── card.module.css              # .ant-card overrides
│   │   ├── table.module.css             # .ant-table overrides
│   │   ├── modal.module.css             # .ant-modal overrides
│   │   ├── form.module.css              # .ant-form overrides
│   │   ├── popconfirm.module.css        # .ant-popconfirm overrides
│   │   └── mobile/                      # Mobile-specific antd overrides
│   │       ├── header.module.css
│   │       ├── nav.module.css
│   │       ├── card.module.css
│   │       ├── form.module.css
│   │       ├── gantt.module.css
│   │       └── preset.module.css
│   │
│   ├── components/                      # Feature-specific complex styles (CSS Modules)
│   │   ├── guide.module.css             # Guide book styles
│   │   ├── demo.module.css              # Demo component styles
│   │   ├── suggestion.module.css        # Suggestion board styles
│   │   └── admin.module.css             # Admin-specific styles
│   │
│   └── utilities/                       # Custom CSS utilities
│       ├── scrollbar.css                # Scrollbar styling
│       └── keyframes.css                # @keyframes (pulse-border, syncCheck, etc.)
│
├── shared/
│   ├── constants/style/                 # KEEP - JS token references
│   │   ├── colors.ts                    # → Reads from CSS vars for JS usage
│   │   ├── spacing.ts                   # → Reads from CSS vars for JS usage
│   │   ├── z_index.ts                   # → Reads from CSS vars for JS usage
│   │   └── index.ts
│   │
│   ├── lib/
│   │   └── cn.ts                        # NEW - clsx + tailwind-merge utility
│   │
│   └── ui/
│       └── animation/                   # KEEP AS-IS - framer-motion system
│           ├── config/
│           ├── primitives/
│           ├── interactions/
│           ├── feedback/
│           └── hooks/
│
├── features/
│   └── {feature}/
│       ├── constants/styles.ts          # KEEP during migration → gradually remove
│       └── ui/
│           └── Component.tsx            # Uses Tailwind classes
│
├── App.css                              # DELETE after Phase 2 migration
└── index.css                            # KEEP - minimal global resets
```

---

## 6. Layer System

```
Priority (low → high)

┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Design Tokens (CSS Custom Properties)              │
│  Location: src/styles/tokens/*.css                           │
│  Role: Raw values - colors, spacing, fonts, z-index          │
│  Consumed by: Tailwind theme, JS constants, CSS Modules      │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Tailwind Utility Classes                           │
│  Location: Component JSX (className)                         │
│  Role: Layout, spacing, colors, typography, responsive       │
│  Coverage: ~90% of all styling needs                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: CSS Modules (Scoped)                               │
│  Location: src/styles/overrides/*.module.css                 │
│           src/styles/components/*.module.css                 │
│  Role: Complex antd selector overrides, feature-specific     │
│  Coverage: ~10% - only when Tailwind is insufficient         │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: CSS Keyframes & Utilities                          │
│  Location: src/styles/utilities/*.css                        │
│  Role: @keyframes, scrollbar, custom utilities               │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: framer-motion (Animation)                          │
│  Location: src/shared/ui/animation/                          │
│  Role: Dynamic animations, transitions, interactions         │
│  Integration: className (static) + motion props (dynamic)    │
└─────────────────────────────────────────────────────────────┘
```

### When to Use Which Layer

| Use Case                  | Layer         | Example                                     |
| ------------------------- | ------------- | ------------------------------------------- |
| Flex layout, gap, padding | Tailwind      | `className="flex items-center gap-2 p-4"`   |
| Text color, font size     | Tailwind      | `className="text-sm text-text-secondary"`   |
| Responsive layout         | Tailwind      | `className="hidden md:flex"`                |
| antd `.ant-*` override    | CSS Module    | `.header :global(.ant-menu-item) { ... }`   |
| Complex pseudo-selectors  | CSS Module    | `:hover > :first-child { ... }`             |
| Entry/exit animation      | framer-motion | `<motion.div {...SLIDE.up}>`                |
| Hover/press interaction   | framer-motion | `<motion.div whileHover={{ scale: 1.02 }}>` |
| Animated number/list      | framer-motion | `<AnimatedNumber value={count} />`          |
| Pulse, shake keyframes    | CSS Keyframes | `@keyframes pulse-border { ... }`           |

---

## 7. Design Tokens

### CSS Custom Properties (Single Source of Truth)

```css
/* src/styles/tokens/colors.css */
:root {
    /* === Semantic === */
    --color-success: #52c41a;
    --color-error: #ff4d4f;
    --color-warning: #faad14;
    --color-info: #1890ff;
    --color-disabled: #d9d9d9;

    /* === Text === */
    --color-text-primary: rgba(0, 0, 0, 0.85);
    --color-text-secondary: rgba(0, 0, 0, 0.65);
    --color-text-disabled: rgba(0, 0, 0, 0.45);
    --color-text-hint: rgba(0, 0, 0, 0.25);
    --color-text-white: #ffffff;

    /* === Background === */
    --color-bg-default: #ffffff;
    --color-bg-light: #fafafa;
    --color-bg-grey: #f5f5f5;
    --color-bg-dark: #001529;
    --color-bg-app: #f5f7fa;

    /* === Border === */
    --color-border-default: #d9d9d9;
    --color-border-light: #f0f0f0;
    --color-border-dark: #bfbfbf;

    /* === Primary (dynamic - set by ThemeProvider) === */
    --color-primary: #1890ff;
    --color-primary-gradient: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    --color-primary-dark: #096dd9;
}
```

```css
/* src/styles/tokens/spacing.css */
:root {
    /* === Spacing === */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 24px;
    --spacing-2xl: 32px;
    --spacing-section: 48px;

    /* === Font Size === */
    --font-size-xs: 10px;
    --font-size-sm: 12px;
    --font-size-md: 14px;
    --font-size-lg: 16px;
    --font-size-xl: 18px;
    --font-size-2xl: 20px;
    --font-size-h3: 24px;
    --font-size-h2: 28px;
    --font-size-h1: 32px;

    /* === Border Radius === */
    --radius-xs: 2px;
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --radius-xl: 12px;
    --radius-2xl: 16px;
    --radius-full: 9999px;

    /* === Breakpoints (for reference, Tailwind handles these) === */
    --breakpoint-mobile: 576px;
    --breakpoint-tablet: 768px;
    --breakpoint-desktop: 992px;
    --breakpoint-desktop-lg: 1200px;
    --breakpoint-wide: 1600px;
}
```

```css
/* src/styles/tokens/z-index.css */
:root {
    --z-base: 1;
    --z-dropdown: 10;
    --z-sticky: 20;
    --z-fixed: 30;
    --z-modal-backdrop: 100;
    --z-modal: 1000;
    --z-toast: 1100;
    --z-tooltip: 1200;
    --z-top: 9999;
}
```

### Tailwind Theme Registration

```css
/* src/styles/global.css */
@import "tailwindcss";

@import "./tokens/colors.css";
@import "./tokens/spacing.css";
@import "./tokens/typography.css";
@import "./tokens/z-index.css";

@import "./utilities/scrollbar.css";
@import "./utilities/keyframes.css";

/* Register tokens as Tailwind theme values */
@theme {
    /* Colors */
    --color-primary: var(--color-primary);
    --color-success: var(--color-success);
    --color-error: var(--color-error);
    --color-warning: var(--color-warning);
    --color-info: var(--color-info);
    --color-disabled: var(--color-disabled);

    --color-text-primary: var(--color-text-primary);
    --color-text-secondary: var(--color-text-secondary);
    --color-text-disabled: var(--color-text-disabled);
    --color-text-hint: var(--color-text-hint);

    --color-bg-default: var(--color-bg-default);
    --color-bg-light: var(--color-bg-light);
    --color-bg-grey: var(--color-bg-grey);
    --color-bg-app: var(--color-bg-app);

    --color-border-default: var(--color-border-default);
    --color-border-light: var(--color-border-light);

    /* Spacing */
    --spacing-xs: var(--spacing-xs);
    --spacing-sm: var(--spacing-sm);
    --spacing-md: var(--spacing-md);
    --spacing-lg: var(--spacing-lg);
    --spacing-xl: var(--spacing-xl);
    --spacing-2xl: var(--spacing-2xl);
    --spacing-section: var(--spacing-section);

    /* Border Radius */
    --radius-xs: var(--radius-xs);
    --radius-sm: var(--radius-sm);
    --radius-md: var(--radius-md);
    --radius-lg: var(--radius-lg);
    --radius-xl: var(--radius-xl);
    --radius-2xl: var(--radius-2xl);
    --radius-full: var(--radius-full);

    /* Z-Index */
    --z-index-base: var(--z-base);
    --z-index-dropdown: var(--z-dropdown);
    --z-index-sticky: var(--z-sticky);
    --z-index-fixed: var(--z-fixed);
    --z-index-modal-backdrop: var(--z-modal-backdrop);
    --z-index-modal: var(--z-modal);
    --z-index-toast: var(--z-toast);
    --z-index-tooltip: var(--z-tooltip);
    --z-index-top: var(--z-top);
}
```

### JS Token References (Backward Compatibility)

```typescript
// shared/constants/style/colors.ts (updated)
// Reads CSS custom properties for JS usage where needed

/**
 * Get computed CSS variable value at runtime.
 * Use only when JS needs the actual value (e.g., canvas drawing, chart libraries).
 * For component styling, prefer Tailwind classes.
 */
export function getCssVar(name: string): string {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}

// Static fallback values (for SSR or non-DOM contexts)
export const SEMANTIC_COLORS = {
    success: "#52c41a",
    error: "#ff4d4f",
    warning: "#faad14",
    info: "#1890ff",
    disabled: "#d9d9d9",
} as const;

// ... rest remains backward compatible
```

---

## 8. Migration Examples

### CRITICAL: UI/UX Preservation Rules

> **Every transformation below must produce IDENTICAL visual output.**
> Before/After screenshots must match pixel-for-pixel.

### 8.1 Inline Style → Tailwind

```tsx
// ❌ BEFORE: Inline style object
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
    <span style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.65)" }}>Label</span>
</div>

// ✅ AFTER: Tailwind utility classes (identical visual result)
<div className="flex justify-between items-center mb-4">
    <span className="text-sm text-text-secondary">Label</span>
</div>
```

### 8.2 CSSProperties Constant → Tailwind

```tsx
// ❌ BEFORE: Style constant
const RECORD_HEADER_STYLE: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
};

<div style={RECORD_HEADER_STYLE}>...</div>

// ✅ AFTER: Tailwind classes (identical visual result)
<div className="flex justify-between items-center mb-4">...</div>
```

### 8.3 Global CSS → CSS Module

```css
/* ❌ BEFORE: App.css (global, unscoped) */
.app-header .ant-menu-item {
    color: rgba(255, 255, 255, 0.85) !important;
}
.app-header .ant-menu-item-selected {
    color: white !important;
    background: rgba(255, 255, 255, 0.15) !important;
}

/* ✅ AFTER: styles/overrides/header.module.css (scoped) */
.headerMenu :global(.ant-menu-item) {
    color: rgba(255, 255, 255, 0.85);
}
.headerMenu :global(.ant-menu-item-selected) {
    color: white;
    background: rgba(255, 255, 255, 0.15);
}
```

```tsx
// Component usage
import styles from "@/styles/overrides/header.module.css";

<div className={styles.headerMenu}>
    <Menu ... />
</div>
```

### 8.4 Responsive (Mobile) → Tailwind Breakpoints

```css
/* ❌ BEFORE: App.css media query */
@media (max-width: 480px) {
    .app-header {
        padding: 0 12px;
        height: 52px;
    }
    .app-content {
        padding: 12px;
    }
}

/* ✅ AFTER: Tailwind responsive + CSS Module for antd parts */
```

```tsx
// Layout component
<header className="h-14 px-6 max-sm:h-[52px] max-sm:px-3 ...">
```

### 8.5 Dynamic Theme → CSS Variables

```tsx
// ❌ BEFORE: Only antd ConfigProvider
<ConfigProvider theme={{ token: { colorPrimary: theme_color } }}>

// ✅ AFTER: ConfigProvider + CSS variable sync
function ThemeProvider({ children }: ThemeProviderProps) {
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_colors = APP_THEME_COLORS[app_theme];

    // Sync CSS custom properties with antd theme
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--color-primary", theme_colors.primary);
        root.style.setProperty("--color-primary-gradient", theme_colors.gradient);
        root.style.setProperty("--color-primary-dark", theme_colors.gradientDark);
    }, [theme_colors]);

    return (
        <ConfigProvider
            locale={koKR}
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: theme_colors.primary,
                    borderRadius: 8,
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
}
```

### 8.6 Conditional Styles → cn() utility

```tsx
// ❌ BEFORE: Ternary inline styles
<div style={is_active ? ACTIVE_STYLE : INACTIVE_STYLE}>

// ✅ AFTER: cn() with Tailwind
import { cn } from "@/shared/lib/cn";

<div className={cn(
    "rounded-xl p-4 border",
    is_active
        ? "border-primary bg-white shadow-md"
        : "border-dashed border-border-default bg-bg-light"
)}>
```

---

## 9. Animation Integration

### Principle: Tailwind for Static, framer-motion for Dynamic

The existing animation system (`shared/ui/animation/`) remains **completely unchanged**.
Integration pattern:

```tsx
import { motion } from "framer-motion";
import { SLIDE, SPRING } from "@/shared/ui/animation";
import { cn } from "@/shared/lib/cn";

function AnimatedCard({ is_selected }: { is_selected: boolean }) {
    return (
        <motion.div
            // Tailwind: static visual styles
            className={cn(
                "rounded-xl bg-white shadow-md p-4 border",
                is_selected && "border-primary ring-2 ring-primary/20"
            )}
            // framer-motion: dynamic animation
            {...SLIDE.up}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={SPRING.snappy}
        >
            <motion.span
                className="text-2xl font-bold text-primary"
                // framer-motion for number animation
            >
                <AnimatedNumber value={count} />
            </motion.span>
        </motion.div>
    );
}
```

### CSS Keyframes Coexistence

Existing `@keyframes` (e.g., `pulse-border`) move to `src/styles/utilities/keyframes.css`:

```css
/* src/styles/utilities/keyframes.css */
@keyframes pulse-border {
    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0.3);
    }
    50% {
        box-shadow: 0 0 0 6px rgba(var(--color-primary-rgb), 0);
    }
}

@keyframes sync-check-pop {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Tailwind custom utility */
@utility animate-pulse-border {
    animation: pulse-border 2s infinite;
}

@utility animate-sync-pop {
    animation: sync-check-pop 0.4s ease-out;
}
```

```tsx
// Usage: combine Tailwind animation utility with existing class
<div className={cn(
    "rounded-xl bg-white p-4 border-2 border-primary",
    is_running && "animate-pulse-border"
)}>
```

### When to Use What

| Scenario                      | Approach                                       |
| ----------------------------- | ---------------------------------------------- |
| Static hover/focus effects    | Tailwind (`hover:bg-bg-light`, `focus:ring-2`) |
| Simple CSS transitions        | Tailwind (`transition-colors duration-200`)    |
| Repeating keyframe animations | CSS `@keyframes` + Tailwind utility            |
| Mount/unmount transitions     | framer-motion `AnimatePresence`                |
| Spring physics animations     | framer-motion `SPRING` presets                 |
| Drag interactions             | framer-motion `drag` prop                      |
| Scroll-based animations       | framer-motion `useInView`                      |
| Stagger list animations       | framer-motion `useStaggerAnimation`            |
| Number counting animation     | framer-motion `AnimatedNumber`                 |

---

## 10. Ant Design Override Strategy

### Approach: CSS Modules with :global()

Ant Design v6 uses CSS-in-JS internally. Our overrides use CSS Modules to:

1. Scope overrides to specific wrapper elements
2. Use `:global()` to target antd class names
3. Avoid `!important` where possible (use specificity instead)

### Override File Structure

```
src/styles/overrides/
├── header.module.css          # App header menu, buttons
├── card.module.css            # Card border-radius, shadows, body padding
├── table.module.css           # Table header bg, cell padding
├── modal.module.css           # Modal max-width, border-radius
├── form.module.css            # Form item spacing, label size
├── popconfirm.module.css      # Popconfirm button order
├── scrollbar.module.css       # Webkit scrollbar styling
└── mobile/
    ├── header.module.css      # Mobile header condensed
    ├── nav.module.css         # Bottom tab navigation
    ├── card.module.css        # Card mobile padding, head-wrapper direction
    ├── form.module.css        # iOS zoom prevention (font-size: 16px)
    ├── modal.module.css       # Modal full-width mobile
    ├── button.module.css      # Touch target enlargement
    ├── gantt.module.css       # Gantt horizontal scroll
    ├── preset.module.css      # FAB button, preset drawer
    └── record.module.css      # Mobile record card view
```

### Pattern

```css
/* styles/overrides/card.module.css */

/* Global antd card overrides */
.card :global(.ant-card) {
    border-radius: var(--radius-xl);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card :global(.ant-card-head) {
    border-bottom: 1px solid var(--color-border-light);
}

/* Mobile-specific */
@media (max-width: 480px) {
    .card :global(.ant-card) {
        border-radius: var(--radius-lg);
    }

    .card :global(.ant-card-body) {
        padding: 14px 16px;
    }
}
```

### App-Level Application

```tsx
// app/layouts/AppLayout.tsx
import headerStyles from "@/styles/overrides/header.module.css";
import cardStyles from "@/styles/overrides/card.module.css";

function AppLayout() {
    return (
        <div className={cn(headerStyles.header, cardStyles.card)}>
            {/* All antd overrides applied via CSS Module scope */}
            {children}
        </div>
    );
}
```

---

## 11. Libraries

### New Dependencies

| Library             | Version | Purpose                              |
| ------------------- | ------- | ------------------------------------ |
| `tailwindcss`       | ^4.x    | Core utility CSS framework           |
| `@tailwindcss/vite` | ^4.x    | Vite build plugin                    |
| `tailwind-merge`    | ^3.x    | Resolve conflicting Tailwind classes |

### Existing (Keep)

| Library         | Version  | Purpose                           |
| --------------- | -------- | --------------------------------- |
| `clsx`          | ^2.1.1   | Conditional className composition |
| `framer-motion` | ^12.29.2 | Animation system                  |
| `antd`          | ^6.2.0   | UI component framework            |

### Utility Function

```typescript
// src/shared/lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (dedup).
 *
 * @example
 * cn("px-4 py-2", is_active && "bg-primary text-white")
 * cn("text-sm", className) // allows override from props
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
```

---

## 12. Migration Plan

### Overview

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5
Setup       CSS Split    New Code    Migrate      Cleanup
(no change) (no change)  (TW only)  (gradual)    (remove old)
```

### Phase 1: Setup (No Visual Change) - COMPLETED

**Goal:** Install Tailwind v4, set up tokens, create `cn()` utility.

-   [x] Install `tailwindcss`, `@tailwindcss/vite`, `tailwind-merge`
-   [x] Create `src/styles/global.css` with Tailwind + token imports
-   [x] Create `src/styles/tokens/*.css` from existing `shared/constants/style/`
-   [x] Create `src/shared/lib/cn.ts`
-   [x] Update `vite.config.ts` with `@tailwindcss/vite` plugin
-   [x] Import `src/styles/global.css` in app entry
-   [x] Verify: **No visual change. All existing styles still work.**

### Phase 2: Split App.css → Modular CSS Files (No Visual Change) - COMPLETED

**Goal:** Break monolithic `App.css` into scoped CSS files.

-   [x] Extract layout styles → `src/styles/layout.css`
-   [x] Extract antd overrides → `src/styles/overrides/antd.css`
-   [x] Extract mobile styles → `src/styles/components/mobile-*.css`
-   [x] Extract guide styles → `src/styles/components/guide.css`
-   [x] Extract demo styles → `src/styles/components/demo.css`
-   [x] Extract suggestion styles → `src/styles/components/suggestion.css`
-   [x] Extract admin styles → `src/styles/components/admin.css`
-   [x] Extract keyframes → `src/styles/utilities/keyframes.css`
-   [x] Extract scrollbar → `src/styles/utilities/scrollbar.css`
-   [x] Update `ThemeProvider` to sync CSS custom properties
-   [x] Delete `App.css`
-   [x] Verify: **Pixel-perfect match with before. No visual regression.**

### Phase 3: New Code Uses Tailwind (Coexistence) - COMPLETED

**Goal:** All NEW components use Tailwind. Existing code untouched.

-   [x] Update dev guidelines (`dev-guidelines.mdc`) to mandate Tailwind for new code
-   [x] Style decision tree documented (Tailwind → CSS file → inline style)
-   [x] `cn()` utility usage pattern and className ordering documented
-   [x] Design token reference (CSS custom properties → Tailwind classes) documented
-   [x] Existing CSSProperties constants allowed during migration (backward compatible)
-   [x] Verify: **Old components unchanged. Build passes.**

### Phase 4: Gradual Migration (Per Feature)

**Goal:** Convert existing CSSProperties + inline styles to Tailwind, one feature at a time.

Order (by complexity, low → high):

1. [ ] `work-template` (26 lines styles)
2. [ ] `guide` (18 lines styles)
3. [ ] `admin` (80 lines styles)
4. [ ] `settings` (88 lines styles)
5. [ ] `gantt-chart` (74 lines styles)
6. [ ] `weekly-schedule` (136 lines styles)
7. [ ] `suggestion` (146 lines styles)
8. [ ] `work-record` (225 lines styles)
9. [ ] `shared/ui/form/styles.ts` (126 lines)
10. [ ] Remaining inline `style={{...}}` across 90+ files

Per feature:

-   Convert `CSSProperties` constants → Tailwind classes
-   Convert inline `style={{...}}` → Tailwind classes
-   Verify: **Before/After screenshots must match exactly.**

### Phase 5: Cleanup

**Goal:** Remove all legacy style infrastructure.

-   [ ] Delete empty `features/*/constants/styles.ts` files
-   [ ] Update `shared/constants/style/` to reference CSS vars only
-   [ ] Remove unused CSS class references
-   [ ] Final full visual regression test
-   [ ] Update project documentation

---

## 13. UI/UX Preservation Checklist

> **THIS IS THE MOST CRITICAL SECTION.**
> Every migration step MUST pass this checklist.

### Per-Component Verification

For every component migrated:

-   [ ] **Layout**: Same flex direction, gap, alignment, padding, margin
-   [ ] **Typography**: Same font-size, font-weight, color, line-height
-   [ ] **Colors**: Same background, border, text colors (exact hex/rgba match)
-   [ ] **Spacing**: Same padding, margin, gap values (check px values)
-   [ ] **Border**: Same border-width, border-color, border-radius
-   [ ] **Shadow**: Same box-shadow values
-   [ ] **Responsive**: Same behavior at 480px, 768px, 992px, 1200px breakpoints
-   [ ] **Hover/Active**: Same visual state changes on interaction
-   [ ] **Animation**: Same animation timing, easing, duration
-   [ ] **Ant Design**: Same antd component appearance and override effects
-   [ ] **Theme**: Same appearance across all 7 themes

### Global Verification

After each phase:

-   [ ] Desktop layout matches before (1920x1080, 1440x900, 1280x720)
-   [ ] Mobile layout matches before (375x812 iPhone, 390x844 iPhone)
-   [ ] All 7 themes produce same visual output as before
-   [ ] Timer animation (pulse-border) works identically
-   [ ] Sync check animation works identically
-   [ ] Guide book page renders identically
-   [ ] Demo components render identically
-   [ ] Admin conflict/problem/invisible rows same colors
-   [ ] Mobile bottom nav same position, size, colors
-   [ ] Mobile FAB button same position, size, gradient
-   [ ] All modals same width, padding, border-radius
-   [ ] All forms same input heights, font sizes

### Testing Methods

1. **Screenshot Comparison**: Before/After screenshots at key breakpoints
2. **Storybook**: Verify components in isolation
3. **E2E Tests**: Playwright visual regression tests
4. **Manual QA**: Test all 7 themes on desktop + mobile

---

## 14. Coding Conventions

### className Writing Order

Follow Tailwind's recommended order:

```tsx
className={cn(
    // 1. Layout (display, position, flex, grid)
    "flex items-center justify-between",
    // 2. Sizing (width, height, min/max)
    "w-full h-14",
    // 3. Spacing (margin, padding, gap)
    "px-6 py-4 gap-2",
    // 4. Typography (font, text, leading)
    "text-sm font-medium text-text-primary",
    // 5. Visual (bg, border, shadow, rounded)
    "bg-white border border-border-default rounded-lg shadow-sm",
    // 6. Interactive (hover, focus, active, transition)
    "hover:bg-bg-light transition-colors duration-200",
    // 7. Responsive (sm:, md:, lg:)
    "max-sm:px-3 max-sm:h-[52px]",
    // 8. Conditional
    is_active && "border-primary bg-primary/5",
)}
```

### Naming Rules for CSS Modules

```css
/* Use camelCase for CSS Module class names */
.headerMenu {
    ...;
} /* ✅ */
.header-menu {
    ...;
} /* ❌ (kebab-case becomes bracket notation in JS) */

/* Scope antd overrides with :global() */
.headerMenu :global(.ant-menu-item) {
    ...;
} /* ✅ */
.ant-menu-item {
    ...;
} /* ❌ (global leak) */
```

### Feature Style Decision Tree

```
New style needed?
│
├─ Simple layout/spacing/color/font?
│  └─ ✅ Tailwind utility class
│
├─ Conditional/dynamic style?
│  └─ ✅ cn() + Tailwind classes
│
├─ Antd component override?
│  └─ ✅ CSS Module with :global()
│
├─ Complex pseudo-selector / nesting?
│  └─ ✅ CSS Module
│
├─ Entry/exit/spring animation?
│  └─ ✅ framer-motion preset
│
├─ Repeating keyframe animation?
│  └─ ✅ CSS @keyframes + Tailwind utility
│
└─ Dynamic value from JS (e.g., percentage, computed position)?
   └─ ✅ Inline style={{ left: `${pct}%` }}  (only exception)
```

---

## 15. Compatibility Matrix

### Existing Systems

| System                                    | Status               | Notes                                              |
| ----------------------------------------- | -------------------- | -------------------------------------------------- |
| `shared/constants/style/` (JS tokens)     | **KEEP**             | Gradually reference CSS vars. Backward compatible. |
| `shared/ui/animation/` (framer-motion)    | **KEEP AS-IS**       | No changes needed.                                 |
| `ThemeProvider.tsx` (antd ConfigProvider) | **ENHANCE**          | Add CSS variable sync. ConfigProvider unchanged.   |
| Feature `constants/styles.ts`             | **KEEP → DEPRECATE** | Keep during migration, remove after Phase 4.       |
| `clsx`                                    | **KEEP**             | Used inside `cn()` utility.                        |
| `App.css`                                 | **DELETE**           | After Phase 2 migration to CSS Modules.            |
| `index.css`                               | **KEEP**             | Minimal global resets.                             |
| Storybook                                 | **WORKS**            | Tailwind auto-detected by Vite plugin.             |
| Vitest / Testing Library                  | **WORKS**            | className-based testing.                           |
| Playwright E2E                            | **WORKS**            | Visual regression testing.                         |

### Import Path Changes

```typescript
// No breaking changes. All existing imports continue to work.

// Existing (still works)
import { SEMANTIC_COLORS, SPACING } from "@/shared/constants";

// New (preferred for new code)
import { cn } from "@/shared/lib/cn";
// className="text-primary bg-bg-light p-4 rounded-lg"
```

---

## Appendix: Quick Reference

### Common Tailwind Mappings

| Current Pattern                           | Tailwind Class                 |
| ----------------------------------------- | ------------------------------ |
| `display: "flex"`                         | `flex`                         |
| `alignItems: "center"`                    | `items-center`                 |
| `justifyContent: "space-between"`         | `justify-between`              |
| `gap: 8`                                  | `gap-2` (= 8px)                |
| `padding: 16`                             | `p-4` (= 16px)                 |
| `marginBottom: 16`                        | `mb-4`                         |
| `fontSize: 12`                            | `text-sm` (= 12px via token)   |
| `color: "rgba(0,0,0,0.65)"`               | `text-text-secondary`          |
| `backgroundColor: "#fafafa"`              | `bg-bg-light`                  |
| `borderRadius: 8`                         | `rounded-lg`                   |
| `border: "1px solid #d9d9d9"`             | `border border-border-default` |
| `boxShadow: "0 2px 8px rgba(0,0,0,0.06)"` | `shadow-sm` (or custom)        |
| `fontWeight: 600`                         | `font-semibold`                |
| `textAlign: "center"`                     | `text-center`                  |
| `width: 200`                              | `w-[200px]`                    |
| `minHeight: "100vh"`                      | `min-h-screen`                 |

### Token → Tailwind Class

| Token                     | CSS Variable             | Tailwind Class               |
| ------------------------- | ------------------------ | ---------------------------- |
| `SEMANTIC_COLORS.success` | `--color-success`        | `text-success`, `bg-success` |
| `SEMANTIC_COLORS.error`   | `--color-error`          | `text-error`, `bg-error`     |
| `TEXT_COLORS.primary`     | `--color-text-primary`   | `text-text-primary`          |
| `TEXT_COLORS.secondary`   | `--color-text-secondary` | `text-text-secondary`        |
| `BACKGROUND_COLORS.light` | `--color-bg-light`       | `bg-bg-light`                |
| `BORDER_COLORS.default`   | `--color-border-default` | `border-border-default`      |
| `SPACING.sm` (8px)        | `--spacing-sm`           | `gap-sm`, `p-sm`             |
| `SPACING.lg` (16px)       | `--spacing-lg`           | `gap-lg`, `p-lg`             |
| `Z_INDEX.modal`           | `--z-modal`              | `z-modal`                    |
