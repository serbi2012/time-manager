# 업무 시간 관리 (Time Manager)

하루 동안 회사에서 수행한 작업을 실시간으로 기록하고 관리하는 웹 애플리케이션입니다.

## 주요 기능

-   **실시간 타이머**: 작업 시작/정지/전환
-   **작업 기록 관리**: 작업 추가, 수정, 삭제(휴지통), 완료 처리
-   **작업 프리셋**: 자주 사용하는 작업을 템플릿으로 저장
-   **일간 간트차트**: 하루의 작업 시각화, 드래그로 작업 추가
-   **주간 일정**: 주간 작업 조회 및 복사 형식 제공
-   **클라우드 동기화**: Firebase를 통한 실시간 데이터 동기화
-   **게스트 모드**: 로그인 없이 LocalStorage 기반 사용 가능
-   **반응형 UI**: 데스크탑/모바일 완전 분리된 UI

## 기술 스택

-   **React 19** + **TypeScript 5.9** + **Vite 7**
-   **Zustand 5** - 전역 상태 관리
-   **Firebase 12** - 인증 및 데이터베이스
-   **Ant Design 6** - UI 컴포넌트
-   **Vitest** - 테스트 프레임워크

## 프로젝트 구조 (Feature-Slice Design)

```
src/
├── app/                              # 앱 진입점
│   ├── App.tsx                       # 루트 컴포넌트
│   ├── providers/                    # 전역 Provider
│   │   └── ThemeProvider.tsx         # Ant Design 테마
│   └── layouts/                      # 플랫폼별 레이아웃
│       ├── DesktopLayout.tsx         # 데스크탑 레이아웃
│       └── MobileLayout.tsx          # 모바일 레이아웃
│
├── pages/                            # 페이지 컴포넌트
│   └── DailyPage/                    # 일간 페이지
│       ├── DesktopDailyPage.tsx      # 데스크탑 버전
│       └── MobileDailyPage.tsx       # 모바일 버전
│
├── widgets/                          # 조합 위젯
│   ├── Header/                       # 헤더 (Desktop/Mobile)
│   ├── Navigation/                   # 네비게이션 (Sidebar/BottomNav)
│   └── SyncStatus/                   # 동기화 상태
│
├── features/                         # 기능별 모듈
│   ├── timer/                        # 타이머 기능
│   ├── work-record/                  # 작업 기록
│   │   ├── lib/                      # 순수 함수 (충돌 감지, 병합)
│   │   └── ui/                       # UI 컴포넌트
│   ├── work-template/                # 작업 프리셋
│   ├── gantt-chart/                  # 간트 차트
│   │   └── lib/                      # 슬롯 계산, 드래그 핸들러
│   ├── weekly-schedule/              # 주간 일정
│   │   └── lib/                      # 복사 포매터
│   ├── settings/                     # 설정
│   │   └── ui/tabs/                  # 설정 탭 컴포넌트
│   ├── admin/                        # 관리자
│   │   └── lib/                      # 충돌/문제 감지
│   └── sync/                         # 동기화
│       └── hooks/                    # useSyncStatus
│
├── shared/                           # 공유 리소스
│   ├── lib/                          # 순수 유틸리티
│   │   ├── time/                     # 시간 계산/포맷/검증
│   │   ├── lunch/                    # 점심시간 계산
│   │   └── session/                  # 세션 관련 유틸
│   ├── types/                        # 공유 타입 정의
│   ├── config/                       # 상수 및 설정
│   ├── ui/                           # 공유 UI 컴포넌트
│   └── hooks/                        # 공유 훅
│
├── components/                       # 기존 컴포넌트 (마이그레이션 중)
├── store/                            # Zustand 스토어
├── firebase/                         # Firebase 연동
│
└── test/                             # 테스트
    ├── unit/                         # 유닛 테스트 (순수 함수)
    ├── component/                    # 컴포넌트 테스트
    └── helpers/                      # 테스트 헬퍼
```

## 아키텍처 원칙

### 1. 모바일/데스크탑 완전 분리

```
App.tsx
  ├── DesktopLayout → DesktopHeader + DesktopDailyPage
  └── MobileLayout  → MobileHeader + MobileDailyPage
```

-   모바일 변경이 데스크탑에 영향을 주지 않음
-   플랫폼별 독립적인 컴포넌트 트리

### 2. 순수 함수 우선

-   모든 계산 로직은 `lib/` 폴더에 순수 함수로 분리
-   부수 효과(Firebase, Store)는 `model/` 또는 `api/`에서만 처리

### 3. 단방향 의존성

```
pages → widgets → features → shared
```

-   features 간 직접 import 금지 (shared를 통해서만)

### 4. 테스트 용이성

-   `lib/` 폴더의 순수 함수는 독립적으로 테스트 가능
-   Store 테스트와 UI 테스트 분리
-   **현재 테스트**: 27개 파일, 504개 테스트 통과

## 개발 명령어

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 테스트 실행
pnpm test

# 테스트 (단일 실행)
pnpm test:run

# 유닛 테스트만 실행
pnpm test:run src/test/unit

# 린트
pnpm lint

# 타입 체크
npx tsc --noEmit
```

## 라이선스

MIT
