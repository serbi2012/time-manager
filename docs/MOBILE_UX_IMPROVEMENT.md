# 모바일 UI/UX 개선 계획

**갱신일**: 2026-09-15 (2026-02-05 작성본을 대체)

현재 모바일 화면 구성은 `.claude/docs/mobile.md` 0절을 먼저 본다.

---

## 확인된 플랫폼 제약 (코드로 해결 불가)

| 제약 | 내용 |
| --- | --- |
| Android 무음 모드 진동 | Chromium이 벨소리 모드가 무음이면 `navigator.vibrate`를 호출하지 않는다. TWA도 동일하다. |
| iOS 진동 | Safari가 `navigator.vibrate`를 지원하지 않는다. switch 체크박스 우회는 iOS 26.5에서 스크립트 호출 방식이 막혔다는 보고가 있다(미검증). |

따라서 햅틱은 보조 수단으로만 쓰고, 진동을 주는 모든 지점에 시각 피드백을 함께 넣는다.

---

## Phase 0 — 정리 (완료, 2026-09-15)

- 화면에 렌더되지 않던 모바일 컴포넌트와 CSS, 그 테스트 삭제
- 데스크탑 진입점(`WorkRecordTable`, `DailyGanttChart`)에서 모바일 분기 제거
- `useSyncStatus` 이중 호출 제거 — `SyncStatusProvider` + `useSyncStatusContext`로 한 번만 구독
- 프리셋 롱프레스 "바로 시작"이 실제로 타이머를 시작하도록 수정
- 간트 롱프레스 삭제가 영구 삭제 대신 휴지통으로 가도록 수정 (마지막 세션 삭제 포함)
- 롱프레스 메뉴 위치를 화면 안으로 보정 (`shared/lib/mobile/menu_position.ts`)
- 타임라인 바: 스크롤 후 손을 떼면 탭으로 인식되던 문제 수정
- 스와이프 카드: 세로 스크롤 중 가로로 밀리던 문제 수정 (축 잠금)
- 카테고리 색을 CSS 이름색에서 hex 값으로 교체 (`getCategoryHexColor`)
- 메뉴 틴트를 테마 연동 토큰(`--color-*-tint`)으로 교체
- `MobileContextMenu`를 공용 `MobileActionMenu`로 통합, 스프링 프리셋 공용화

---

## Phase 1 — 모바일 공용 부품 (완료, 2026-09-15)

만든 것 (`shared/ui/mobile/`, `shared/ui/keyboard/`, `shared/hooks/`):

- `MobileBottomSheet` — 끌어내려 닫기, 뒤로가기로 닫기, 본문 스크롤 잠금, 하단 안전영역
- `useOverlayHistory` — 안드로이드 뒤로가기로 오버레이만 닫는다
- `UndoToast` + `useUndoToast` — 되돌리기 토스트 (antd message로는 버튼을 못 넣는다)
- `haptic(kind)` — 의미 기반 햅틱. 진동 길이를 15ms 이상으로 올렸고 `haptics_enabled` 설정과 연결했다
- `ShortcutKeyBadge` + `InputCapabilityProvider` — 모바일에서 `F8` 같은 단축키 표시를 숨기고, 모달 자동 포커스도 같은 값을 따른다
- `MobilePageHeader`, `MobileIconButton`(aria-label 필수, 최소 44px 터치 영역)
- safe-area·터치 크기 토큰, `index.html`에 `viewport-fit=cover`

제스처 훅 통합(`MobileSwipeCard`·세그먼트 바의 자체 구현 정리)은 Phase 3 리팩토링으로 미룬다.
화면에 실제로 붙이는 작업은 Phase 2에서 목업 승인 후 진행한다.

## Phase 2 — 체감 문제 해결 (목업 승인 후 구현)

- 프리셋 시트 재설계: 현재 antd Drawer 기본 높이 378px + 제목 중복으로 목록이 2개만 보인다
- 일간 헤더 다이어트: sticky 영역에 제목·날짜·스트립·타임라인·작업목록이 모두 들어 있어 화면 대부분을 차지한다
- 작업 추가/수정 폼을 전체 화면 시트로, 제출 버튼을 키보드 위에 고정
- 완료 목록·휴지통(`width={800}` + 테이블)을 모바일 리스트로
- 설정을 전체 화면 페이지로, 단축키 탭 제거

## Phase 3 — 인터랙션·비주얼

- 좌우 스와이프로 날짜 이동, 주간 스트립 스와이프
- 당겨서 새로고침 → 수동 동기화
- 타이머 시작/정지 마이크로 인터랙션, 스켈레톤 로딩
- 타이포 위계 정리(10px 글자 제거), 다크 모드

## Phase 4 — PWA

- 매니페스트 정비: 테마색 불일치(`#1890ff` vs `#3182F6`), `shortcuts`, 스크린샷, maskable 아이콘 분리
- 자동 새로고침 대신 업데이트 안내 토스트
- 동기화·오프라인 상태 표시 (현재 모바일에는 없음)
- 주간 보고 Web Share, 타이머 실행 중 앱 배지(지원 범위 확인 필요)
- 무음 모드 진동이 꼭 필요하면 네이티브 셸 도입 여부 결정

---

## 남은 알려진 문제 (Phase 2~4에서 해소 예정)

| 항목 | 위치 |
| --- | --- |
| sticky 헤더가 화면 대부분 차지 | `MobileDailyPage`, `MobileDailyHeader` |
| 작업 목록 펼침 높이 `작업 수 x 120px` 고정으로 카드 잘림 | `MobileDailyHeader` |
| safe-area 미적용, `100vh` 사용 | 전역 |
| 44px 미만 터치 영역 다수 | 목록 헤더 아이콘, 세션 칩 등 |
| 모달 자동 포커스로 키보드가 폼을 가림 | `useFocusLayer` |
| 모바일에서 동기화·오프라인 상태 안 보임 | `MobileDailyHeader` |
| 타이머 실행 중 페이지 전체가 매초 리렌더 | `MobileDailyPage` |
| 설명서 마크다운 렌더러가 데스크탑/모바일 중복 | `GuideBook` |
