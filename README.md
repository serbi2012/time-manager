<div align="center">

<img src="public/favicon.svg" alt="Time Manager Logo" width="80" height="80" />

# 업무 시간 관리 (Time Manager)

**실시간 타이머 기반 업무 시간 측정 및 관리 웹 애플리케이션**

하루 동안 수행한 작업을 타이머로 측정하고, 간트 차트로 시각화하며, 주간 단위로 한눈에 관리하세요.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12-DD2C00?logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Vitest](https://img.shields.io/badge/Tests-1115_passed-6DA13F?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Supported-5A0FC8?logo=pwa&logoColor=white)](#pwa-지원)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 주요 기능

### 실시간 타이머

단축키(F8) 한 번으로 작업 시작 — 측정 중인 시간은 탭 타이틀에도 실시간 반영됩니다. 작업 전환 시 이전 작업은 자동 저장되고 새 타이머가 바로 시작됩니다.

### 일간 간트 차트

하루의 작업 흐름을 타임라인으로 시각화합니다. 빈 영역을 드래그하여 작업을 추가하거나, 바의 양끝을 잡아 시작·종료 시간을 조절할 수 있습니다. 점심시간은 자동으로 음영 처리됩니다.

### 작업 기록 관리

작업 추가·수정·삭제·완료 처리를 지원합니다. 삭제된 항목은 휴지통에 30일간 보관되며, 완료된 작업은 별도 목록에서 확인할 수 있습니다.

### 작업 프리셋 (템플릿)

자주 반복하는 작업을 템플릿으로 저장하고, 클릭 한 번으로 적용합니다. 드래그 앤 드롭으로 순서를 변경하고, 색상으로 구분할 수 있습니다.

### 주간 일정

일주일 단위로 작업 기록을 조회하고, 다양한 포맷으로 복사할 수 있습니다. 관리업무 필터로 필요한 항목만 골라볼 수 있습니다.

### 클라우드 동기화

Google 로그인으로 Firebase Firestore와 실시간 동기화됩니다. 여러 기기에서 동일한 데이터에 접근할 수 있습니다.

### 게스트 모드

로그인 없이도 LocalStorage 기반으로 모든 기능을 사용할 수 있습니다. 나중에 로그인하면 데이터를 클라우드로 마이그레이션할 수 있습니다.

### 반응형 UI

데스크탑과 모바일은 완전히 독립된 컴포넌트 트리로 구성되어, 각 플랫폼에 최적화된 경험을 제공합니다.

---

## 기술 스택

| 영역 | 기술 |
| :--- | :--- |
| **UI** | React 19, Ant Design 6, Tailwind CSS 4, Framer Motion |
| **언어** | TypeScript 5.9 |
| **빌드** | Vite 7, PWA (vite-plugin-pwa) |
| **상태 관리** | Zustand 5 (persist middleware) |
| **백엔드** | Firebase 12 (Firestore, Auth) |
| **폼** | React Hook Form, Zod |
| **테이블** | TanStack Table v8 |
| **DnD** | @dnd-kit |
| **테스트** | Vitest, Testing Library, Playwright |
| **폰트** | Pretendard Variable |

---

## 시작하기

### 사전 요구사항

- **Node.js** 20+
- **pnpm** 10+

### 설치

```bash
git clone https://github.com/serbi2012/time-manager.git
cd time-manager
pnpm install
```

### 실행

```bash
pnpm dev        # 개발 서버 (http://localhost:5173)
pnpm build      # 프로덕션 빌드
pnpm preview    # 빌드 결과 미리보기
```

---

## 테스트

91개 테스트 파일, **1,115개 테스트** 통과 (2026.03.03 기준)

```bash
pnpm test              # Watch 모드
pnpm test:run          # 단일 실행
pnpm test:coverage     # 커버리지 포함
pnpm test:e2e          # Playwright E2E 테스트
```

테스트 구조:

```
src/test/
├── unit/           # 순수 함수 유닛 테스트 (시간 계산, 충돌 감지, 슬롯 계산 등)
├── component/      # UI 컴포넌트 테스트 (렌더링, 상호작용, 접근성)
├── hooks/          # 커스텀 훅 테스트
├── store/          # Zustand 스토어 테스트
├── snapshot/       # 스냅샷 테스트
└── helpers/        # 목 데이터 팩토리
```

---

## 프로젝트 구조

[Feature-Sliced Design](https://feature-sliced.design/) 아키텍처를 기반으로 합니다.

```
src/
├── app/                # 앱 진입점 (providers, layouts, routing)
├── pages/              # 페이지 (Desktop/Mobile 분리)
├── widgets/            # 조합 위젯 (Header, Navigation, SyncStatus)
├── features/           # 기능 모듈
│   ├── timer/          #   타이머
│   ├── work-record/    #   작업 기록 (CRUD, 세션 관리)
│   ├── work-template/  #   작업 프리셋 (템플릿, 색상)
│   ├── gantt-chart/    #   간트 차트 (드래그, 리사이즈, 슬롯)
│   ├── weekly-schedule/ #  주간 일정 (복사 포맷, 그룹핑)
│   ├── settings/       #   설정 (테마, 단축키, 데이터)
│   ├── admin/          #   관리자 (통계, 충돌 감지)
│   └── sync/           #   동기화 (Firebase 실시간)
├── shared/             # 공유 리소스
│   ├── lib/            #   순수 유틸리티 (time, lunch, session)
│   ├── ui/             #   공유 UI 컴포넌트
│   ├── types/          #   타입 정의
│   ├── hooks/          #   공유 훅
│   └── constants/      #   상수 (enums, labels, tokens)
├── store/              # Zustand 스토어
├── firebase/           # Firebase 연동
└── styles/             # 디자인 토큰 (colors, spacing, typography)
```

### 의존성 흐름

```
pages → widgets → features → shared
```

같은 레이어 간 직접 import는 금지되며, 반드시 하위 레이어를 통해서만 공유합니다.

---

## 아키텍처 원칙

### 플랫폼 완전 분리

```
App.tsx
 ├── DesktopLayout → DesktopHeader + DesktopSidebar + DesktopDailyPage
 └── MobileLayout  → MobileHeader  + MobileBottomNav + MobileDailyPage
```

모바일 코드 변경이 데스크탑에 영향을 주지 않으며, 그 반대도 마찬가지입니다.

### 순수 함수 우선

모든 비즈니스 로직은 `lib/` 폴더에 순수 함수로 분리합니다. 부수 효과(Firebase, Store)는 훅 또는 스토어에서만 처리합니다.

### 테스트 용이성

`lib/` 폴더의 모든 순수 함수는 외부 의존성 없이 독립적으로 테스트할 수 있습니다.

---

## 커스터마이징

### 테마

7가지 테마 컬러(Blue, Green, Purple, Red, Orange, Teal, Black)를 설정에서 선택할 수 있습니다.

### 점심시간

기본 점심시간(11:40~12:40)을 설정에서 변경할 수 있으며, 모든 시간 계산과 간트 차트에 반영됩니다.

### 단축키

| 단축키 | 동작 |
| :--- | :--- |
| `F8` | 타이머 시작/정지 |
| `Escape` | 모달 닫기 |

단축키 활성화 여부는 설정에서 개별적으로 토글할 수 있습니다.

---

## PWA 지원

Progressive Web App으로 설치하면 네이티브 앱처럼 사용할 수 있습니다.

- 홈 화면에 추가하여 독립 창에서 실행
- 오프라인 캐싱으로 빠른 로딩
- 자동 업데이트

---

## 스크립트 목록

| 명령어 | 설명 |
| :--- | :--- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm preview` | 빌드 미리보기 |
| `pnpm test` | 테스트 (Watch 모드) |
| `pnpm test:run` | 테스트 (단일 실행) |
| `pnpm test:coverage` | 커버리지 포함 테스트 |
| `pnpm test:e2e` | E2E 테스트 (Playwright) |
| `pnpm lint` | ESLint 린트 |
| `pnpm storybook` | Storybook 실행 |

---

## 라이선스

MIT
