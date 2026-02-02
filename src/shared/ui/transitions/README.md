# 트랜지션 시스템 (Page Transitions)

페이지 진입 시 UI 요소들의 애니메이션 효과를 관리하는 모듈입니다.

## 파일 구조

```
transitions/
├── index.ts                  # Public API
├── transition_config.ts      # 설정 상수
├── SlideIn.tsx              # 슬라이드 인 컴포넌트
├── FadeIn.tsx               # 페이드 인 컴포넌트
├── PageTransitionContext.tsx # 상태 전달 Context
└── usePageTransition.ts     # 헬퍼 훅
```

## 빠른 시작

### 1. 기본 사용

```tsx
import { SlideIn, FadeIn } from "@/shared/ui";

// 슬라이드 인
<SlideIn direction="left" show={is_ready} delay={0.1}>
  <Sidebar />
</SlideIn>

// 페이드 인
<FadeIn show={is_ready} delay={0.2}>
  <FloatingButton />
</FadeIn>
```

### 2. Context 활용 (권장)

**Layout에서 Provider 설정:**
```tsx
<PageTransitionProvider
  is_ready={initial_load_done}
  transition_enabled={transition_enabled}
  transition_speed={transition_speed}
>
  <Routes>...</Routes>
</PageTransitionProvider>
```

**Page에서 Consumer 사용:**
```tsx
const { is_ready, transition_enabled, transition_speed } = usePageTransitionContext();

<SlideIn
  direction="left"
  show={is_ready}
  delay={DESKTOP_DAILY_DELAYS.sidebar}
  enabled={transition_enabled}
  speed={transition_speed}
>
  <Sidebar />
</SlideIn>
```

## API

### SlideIn Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | `"left" \| "right" \| "top" \| "bottom"` | 필수 | 슬라이드 방향 |
| show | `boolean` | 필수 | 트랜지션 시작 조건 |
| delay | `number` | `0` | 딜레이 (초) |
| enabled | `boolean` | `true` | 활성화 여부 |
| speed | `"slow" \| "normal" \| "fast"` | `"normal"` | 속도 |
| className | `string` | - | CSS 클래스 |
| style | `CSSProperties` | - | 인라인 스타일 |

### FadeIn Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| show | `boolean` | 필수 | 트랜지션 시작 조건 |
| delay | `number` | `0` | 딜레이 (초) |
| enabled | `boolean` | `true` | 활성화 여부 |
| speed | `"slow" \| "normal" \| "fast"` | `"normal"` | 속도 |
| className | `string` | - | CSS 클래스 |
| style | `CSSProperties` | - | 인라인 스타일 |

## 설정 상수

```typescript
// 속도별 Duration (초)
TRANSITION_SPEED_DURATION = { slow: 0.7, normal: 0.5, fast: 0.25 }

// 페이지별 딜레이
DESKTOP_DAILY_DELAYS = { header: 0, sidebar: 0.1, gantt: 0.2, table: 0.3 }
MOBILE_DAILY_DELAYS = { header: 0, content: 0.15 }
```

## 주의사항

1. **will-change 사용 금지**: 텍스트가 흐려지는 문제 발생
2. **로딩 오버레이는 top: 0**: 전체 화면을 덮어야 함
3. **enabled=false**: 애니메이션 없이 즉시 렌더링

## 자세한 문서

→ `.cursor/rules/transitions.mdc` 참고
