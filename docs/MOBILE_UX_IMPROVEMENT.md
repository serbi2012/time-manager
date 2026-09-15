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

## Phase 2 — 체감 문제 해결 (완료, 2026-09-15 · 목업 승인 후 구현)

- 프리셋 시트: 화면 높이 90% 시트, 줄 탭은 추가·우측 버튼은 추가 후 타이머 시작, 검색
- 일간 헤더: 고정 영역을 약 390px에서 약 150px로 축소, 타임라인은 본문 접이식 섹션으로
- 작업 추가·수정: 전체 화면 시트 + 키보드 위 고정 저장 버튼
- 완료·휴지통: 표 모달 대신 카드 목록 시트 + 밀어서 되돌리기
- 설정: 전체 화면 그룹 목록, 단축키·일괄 변경 탭 제거, 진동 토글 추가

목업: `mockups/mobile-preset-sheet.html`, `mobile-daily-header.html`, `mobile-record-form-sheet.html`, `mobile-lists-and-settings.html`

## Phase 3 — 인터랙션·비주얼 (일부 완료, 2026-09-15)

완료
- 좌우 스와이프로 이전·다음 날짜 이동 (축 잠금 포함)
- 당겨서 새로고침 → 수동 동기화
- 로딩 스피너를 스켈레톤으로 교체
- 10px 글자 제거 (최소 11px 토큰)

남음
- 다크 모드 — `docs/DARK_MODE_PLAN.md` 참고. 토큰·antd 테마·데스크탑까지 함께 손대야 해서 별도 작업으로 분리했다
- 주간 스트립 스와이프, 타이머 시작·정지 마이크로 인터랙션

## Phase 4 — PWA (완료, 2026-09-15)

완료
- 매니페스트 정비: 테마색 `#3182F6` 통일, `id`, 앱 바로가기(새 작업·주간 일정), maskable 아이콘 분리
- 자동 새로고침 대신 새 버전 안내 후 적용 (`registerType: "prompt"`)
- 오프라인·동기화 상태를 날짜 줄에 표시
- 주간 보고 Web Share (미지원 기기는 클립보드로)

남음
- 타이머 실행 중 앱 배지 (Badging API 지원 범위 확인 필요)
- 설치 안내(A2HS) 유도, 스크린샷 매니페스트
- 무음 모드 진동이 꼭 필요하면 네이티브 셸 도입 여부 결정

---

## 남은 알려진 문제

| 항목 | 위치 | 비고 |
| --- | --- | --- |
| 다크 모드 미구현 | 전역 | `docs/DARK_MODE_PLAN.md` |
| 44px 미만 터치 영역 일부 | 목록 헤더 아이콘, 세션 칩 | `MobileIconButton`으로 순차 교체 |
| 타이머 실행 중 페이지 전체가 매초 리렌더 | `MobileDailyPage` | 틱을 표시 컴포넌트로 내려야 함 |
| 설명서 마크다운 렌더러가 데스크탑/모바일 중복 | `GuideBook` | 공용 컴포넌트로 추출 |
| 제스처 구현 중복 | `MobileSwipeCard`, `MobileGanttSegmentBar` | `useSwipeNavigation`과 통합 검토 |
| `100vh` 사용 구간 | `guide.css`, `weekly-schedule.css` 등 | `dvh`로 전환 |

해소됨: sticky 헤더 높이, 작업 목록 펼침 잘림, 모바일 safe-area, 모달 자동 포커스(키보드 없는 환경에서 끔), 동기화·오프라인 표시
