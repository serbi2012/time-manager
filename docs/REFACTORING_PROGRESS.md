# 리팩토링 진행 상황

> **시작일**: 2026-02-03
> **현재 상태**: Phase 1~3 완료, Phase 4~10 대기

---

## 완료된 작업

### Phase 1: 라이브러리 설치 ✅

**완료일**: 2026-02-03

#### 설치된 라이브러리

| 카테고리     | 패키지                          | 버전     | 용도                             |
| ------------ | ------------------------------- | -------- | -------------------------------- |
| **유틸리티** | `lodash-es`                     | ^4.17.23 | 유틸 함수 (groupBy, debounce 등) |
|              | `@types/lodash-es`              | ^4.17.12 | TypeScript 타입                  |
|              | `immer`                         | ^11.1.3  | 불변 상태 관리                   |
|              | `clsx`                          | ^2.1.1   | 조건부 클래스명                  |
| **폼 관리**  | `react-hook-form`               | ^7.71.1  | 폼 상태 관리                     |
|              | `zod`                           | ^4.3.6   | 스키마 검증                      |
|              | `@hookform/resolvers`           | ^5.2.2   | zod 연동                         |
| **테이블**   | `@tanstack/react-table`         | ^8.21.3  | 테이블 로직                      |
| **테스트**   | `msw`                           | ^2.12.7  | API 모킹                         |
|              | `@faker-js/faker`               | ^10.2.0  | 테스트 데이터 생성               |
|              | `@playwright/test`              | ^1.58.1  | E2E 테스트                       |
|              | `storybook`                     | ^8.6.14  | 컴포넌트 시각적 테스트           |
|              | `@storybook/react`              | ^8.6.14  | React 지원                       |
|              | `@storybook/react-vite`         | ^8.6.14  | Vite 통합                        |
|              | `@storybook/addon-essentials`   | ^8.6.14  | 필수 애드온                      |
|              | `@storybook/addon-interactions` | ^8.6.14  | 인터랙션 테스트                  |
|              | `@storybook/test`               | ^8.6.14  | 테스트 유틸                      |

#### 추가된 스크립트 (package.json)

```json
{
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report",
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build"
}
```

---

### Phase 2: 테스트 환경 강화 ✅

**완료일**: 2026-02-03

#### 생성된 파일

| 파일                                  | 용도                                      |
| ------------------------------------- | ----------------------------------------- |
| `src/test/helpers/mock_factory.ts`    | @faker-js/faker 기반 목 데이터 팩토리     |
| `src/test/helpers/test_utils.tsx`     | 커스텀 렌더러, Provider 래퍼, 이벤트 헬퍼 |
| `src/test/helpers/custom_matchers.ts` | 도메인 특화 Vitest 커스텀 매처            |
| `src/test/setup/msw.setup.ts`         | MSW 핸들러 (Firebase Auth/Firestore 모킹) |
| `src/test/e2e/example.spec.ts`        | Playwright E2E 테스트 예시                |
| `.storybook/main.ts`                  | Storybook 메인 설정                       |
| `.storybook/preview.ts`               | Storybook 프리뷰 설정                     |
| `playwright.config.ts`                | Playwright E2E 설정                       |

#### 테스트 헬퍼 주요 기능

**mock_factory.ts**

-   `createMockSession()` - 세션 목 데이터 생성
-   `createMockRecord()` - 레코드 목 데이터 생성
-   `createMockTemplate()` - 템플릿 목 데이터 생성
-   `SCENARIOS` - 시나리오별 데이터 (emptyDay, busyDay, withConflicts 등)

**test_utils.tsx**

-   `renderWithProviders()` - Provider가 포함된 커스텀 렌더러
-   `wait()`, `waitForAnimation()` - 비동기 대기 유틸
-   `createKeyboardEvent()`, `createF8Event()`, `createEscapeEvent()` - 키보드 이벤트 헬퍼

**custom_matchers.ts**

-   `toBeValidTimeFormat()` - HH:mm 형식 검증
-   `toBeValidDateFormat()` - YYYY-MM-DD 형식 검증
-   `toBeValidWorkRecord()` - WorkRecord 유효성 검증
-   `toConflictWith()` - 시간 충돌 검증
-   `toHaveCompletedAnimation()` - 애니메이션 완료 검증

---

### Phase 3: 애니메이션 시스템 구축 ✅

**완료일**: 2026-02-03

#### 생성된 구조

```
src/shared/ui/animation/
├── index.ts                       # 메인 export
├── config/
│   ├── index.ts
│   ├── timing.ts                  # DURATION, DELAY, STAGGER 상수
│   ├── easing.ts                  # EASING 베지어 커브, SPRING 프리셋
│   └── presets.ts                 # FADE, SLIDE, SCALE, HOVER, PRESS 등
├── primitives/
│   ├── index.ts
│   ├── AnimatedPresence.tsx       # 조건부 렌더링 애니메이션
│   ├── AnimatedList.tsx           # 리스트 순차 애니메이션
│   └── AnimatedNumber.tsx         # 숫자 카운팅 애니메이션
├── interactions/
│   ├── index.ts
│   ├── PressAnimation.tsx         # 눌림 효과 (버튼)
│   ├── HoverAnimation.tsx         # 호버 효과
│   └── RippleEffect.tsx           # 물결 효과 (Material Design)
├── feedback/
│   ├── index.ts
│   ├── SuccessAnimation.tsx       # 성공 체크마크
│   ├── ErrorShake.tsx             # 에러 흔들림
│   ├── SkeletonLoader.tsx         # 스켈레톤 로딩
│   └── LoadingSpinner.tsx         # 로딩 스피너
└── hooks/
    ├── index.ts
    ├── useAnimationConfig.tsx     # 전역 애니메이션 설정 컨텍스트
    ├── useStaggerAnimation.ts     # 순차 애니메이션 훅
    └── useInView.ts               # 뷰포트 진입 감지
```

#### 주요 컴포넌트 및 사용법

**AnimatedPresence** - 조건부 렌더링 애니메이션

```tsx
import { AnimatedPresence } from "@/shared/ui/animation";

<AnimatedPresence show={isVisible} type="slideUp">
    <Content />
</AnimatedPresence>;
```

**AnimatedList** - 리스트 순차 애니메이션

```tsx
import { AnimatedList } from "@/shared/ui/animation";

<AnimatedList
    items={records}
    keyExtractor={(item) => item.id}
    renderItem={(item) => <RecordCard record={item} />}
    stagger={50}
/>;
```

**AnimatedNumber** - 숫자 카운팅

```tsx
import { AnimatedNumber, AnimatedDuration } from '@/shared/ui/animation';

<AnimatedNumber value={1234} suffix="개" />
<AnimatedDuration minutes={90} />  // "1시간 30분"
```

**PressAnimation / RippleEffect** - 인터랙션

```tsx
import { PressAnimation, RippleEffect } from '@/shared/ui/animation';

<PressAnimation>
  <Button>클릭</Button>
</PressAnimation>

<RippleEffect onClick={handleClick}>
  <Card>...</Card>
</RippleEffect>
```

**SkeletonLoader** - 로딩 상태

```tsx
import { SkeletonLoader, SkeletonCard, SkeletonTable } from '@/shared/ui/animation';

<SkeletonLoader width="100%" height={20} />
<SkeletonCard hasImage />
<SkeletonTable rows={5} cols={4} />
```

**useStaggerAnimation** - 순차 애니메이션 훅

```tsx
import { useStaggerAnimation } from "@/shared/ui/animation";
import { motion } from "framer-motion";

const { containerVariants, itemVariants } = useStaggerAnimation({
    stagger: 50,
});

<motion.ul variants={containerVariants} initial="initial" animate="animate">
    {items.map((item) => (
        <motion.li key={item.id} variants={itemVariants}>
            {item.name}
        </motion.li>
    ))}
</motion.ul>;
```

#### 애니메이션 프리셋

| 프리셋                     | 용도                |
| -------------------------- | ------------------- |
| `FADE`                     | 기본 페이드 인/아웃 |
| `SLIDE.up/down/left/right` | 방향별 슬라이드     |
| `SCALE`                    | 스케일 애니메이션   |
| `PRESS`                    | 버튼 눌림 효과      |
| `HOVER`                    | 호버 효과           |
| `MODAL`                    | 모달 열기/닫기      |
| `DRAWER`                   | 드로어 열기/닫기    |
| `PAGE_TRANSITION`          | 페이지 전환         |

#### 스프링 프리셋

| 프리셋           | 용도                      |
| ---------------- | ------------------------- |
| `SPRING.gentle`  | 부드러운 기본 스프링      |
| `SPRING.snappy`  | 빠른 스프링 (버튼)        |
| `SPRING.bouncy`  | 탄성 있는 스프링          |
| `SPRING.toss`    | 토스 스타일 메인 스프링   |
| `SPRING.heavy`   | 무거운 느낌 (모달)        |
| `SPRING.elegant` | 우아한 느낌 (페이지 전환) |

---

## 테스트 결과

-   **총 테스트 수**: 685개
-   **통과**: 685개 (100%)
-   **테스트 파일**: 44개

---

## 다음 단계

### Phase 4: 공통 UI 추출 (대기)

-   SelectWithAdd, AutoCompleteWithHide
-   WorkFormFields
-   LoadingOverlay, BaseModal

### Phase 5: 공통 훅 추출 (대기)

-   useRecordCreation
-   useDataImportExport
-   useAuthHandlers
-   useAutoCompleteOptions

### Phase 6: 순수 함수 통합 (대기)

-   shared/lib/record, shared/lib/data
-   중복 함수 제거

### Phase 7: 스토어 분리 (대기)

-   useWorkStore → slices

### Phase 8: 거대 컴포넌트 분리 (대기)

-   DailyGanttChart (3,146줄)
-   WorkRecordTable (2,813줄)
-   AdminSessionGrid (2,433줄)

### Phase 9: 플랫폼 완전 분리 (대기)

### Phase 10: 정리 및 문서화 (대기)

---

## 변경 이력

| 날짜       | 내용                                  |
| ---------- | ------------------------------------- |
| 2026-02-03 | Phase 1 완료 - 라이브러리 설치        |
| 2026-02-03 | Phase 2 완료 - 테스트 환경 강화       |
| 2026-02-03 | Phase 3 완료 - 애니메이션 시스템 구축 |
