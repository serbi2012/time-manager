# 작업 레시피

이 프로젝트에서 자주 하는 변경의 "빠뜨리기 쉬운 곳" 체크리스트다. 각 항목은 실제 코드에서 확인된 경로다.

---

## 새 feature 추가

1. `src/features/<name>/` 생성 — `index.ts`, `constants/`, `model/`, `lib/`, `hooks/`, `ui/`
2. 순수 로직은 `lib/`에, 부수 효과는 `hooks/`에
3. UI는 `ui/Desktop/`, `ui/Mobile/`로 분리
4. `index.ts`에서 외부에 노출할 것만 export
5. 유닛 테스트: `src/test/unit/features/<name>/lib/`
6. 컴포넌트 테스트: `src/test/component/features/<name>/`
7. 다른 feature를 import하지 않는지 확인 (필요하면 `shared/`로 승격)

---

## 새 라우트/페이지 추가

1. `src/pages/`에 페이지 생성 (모바일 분리가 필요하면 `index.tsx` + `Desktop*` + `Mobile*`)
2. `src/app/layouts/DesktopLayout.tsx`의 `<Routes>`에 `<Route>` 추가
3. `src/app/layouts/MobileLayout.tsx`에도 동일하게 추가 — **한쪽만 추가하면 해당 플랫폼에서 404**
4. `src/widgets/Navigation/DesktopSidebar.tsx`와 `MobileBottomNav.tsx`에 메뉴 항목 추가
5. `src/shared/ui/transitions/transition_config.ts`의 `ROUTE_ORDER`에 순서 등록 — 빠뜨리면 방향 슬라이드가 어긋난다
6. 새 페이지/라우트 추가는 **MINOR 버전** 사유다 (→ release.md)
7. 사용자에게 보이는 기능이면 `src/docs/`에 설명서 추가 + `src/docs/index.ts` 등록

---

## 새 설정 항목 추가

1. `src/store/types/store.ts`의 `SettingsSlice`에 상태 + 액션 타입 추가
2. `src/store/slices/settings.ts`에 구현
3. `src/store/constants.ts`에 기본값 추가
4. **`src/store/useWorkStore.ts`의 `partialize`에 필드 추가** — 빠뜨리면 새로고침 시 설정이 초기화된다
5. `src/features/settings/ui/tabs/`의 해당 탭에 UI 추가 (라벨은 `features/settings/constants/`에 상수로)
6. Firebase 동기화가 필요하면 `src/firebase/syncService.ts` 확인
7. 스토어 테스트: `src/test/store/`
8. 단일 토글이면 PATCH, 새 설정 카테고리면 MINOR

---

## 새 단축키 추가

1. `src/shared/types/shortcut.ts`의 정의 확인
2. `src/shared/constants/enums/shortcut.ts`에 키 등록
3. `src/hooks/useShortcuts.ts`에 핸들러 추가
4. `src/store/useShortcutStore.ts`에 활성화 토글 상태 추가
5. `src/features/settings/ui/tabs/ShortcutsTab.tsx`에 노출
6. `src/docs/shortcuts.md`의 단축키 표 갱신
7. 키보드 이벤트 테스트: `src/test/integration/keyboard/`

---

## 새 색상/간격/폰트 토큰 추가

1. CSS 변수: `src/styles/tokens/{colors,spacing,typography,z-index}.css`
2. Tailwind 등록: `src/styles/global.css`의 `@theme` 블록
3. JS에서 런타임 계산이 필요할 때만: `src/shared/constants/style/`
4. Ant Design 컴포넌트에 반영이 필요하면: `src/app/providers/ThemeProvider.tsx`
5. `.claude/docs/design-system.md`의 토큰 표에 추가

토큰을 늘리기 전에 기존 토큰으로 해결되는지 먼저 본다. 임의 값(`text-[13px]`)은 금지다.

---

## 세션/시간 계산 로직 수정

가장 깨지기 쉬운 영역이다. 아래를 모두 확인한다.

1. `duration_minutes`와 `sessions` 합계의 일치 — `src/store/lib/record_recalculator.ts`
2. 점심시간 제외 — `src/shared/lib/lunch/`, 값은 스토어의 `getLunchTimeMinutes()`에서
3. 새벽 근무(`is_overnight`) — `end_time < start_time`이 정상인 케이스
4. 진행 중 세션(`end_time === ""`) — 레코드당 1개만
5. 시간 충돌 — `features/work-record/lib/conflict_detector.ts`, `features/gantt-chart/lib/conflict_detector.ts` **두 곳 모두**
6. `updateSession`의 반환값 `{ success, adjusted, message }`를 호출부에서 처리했는지
7. 관련 유닛 테스트: `src/test/unit/shared/lib/`, `src/test/unit/features/*/lib/`

---

## 간트차트 수정

- 바 위치 계산: `features/gantt-chart/lib/bar_calculator.ts`
- 드래그로 추가: `lib/drag_handler.ts` + `hooks/useGanttDrag.ts`
- 리사이즈: `hooks/useGanttResize.ts` + `ui/ResizeHandle/`
- 모바일 세그먼트: `lib/mobile_segment_calculator.ts`
- 스타일: `src/styles/components/gantt.css`, `mobile-gantt.css`
- 데스크탑/모바일 컴포넌트가 별개다. 한쪽만 고치지 않았는지 확인

---

## `src/components/`를 고치라는 요청을 받았을 때

여기 있는 파일 대부분은 `features/`를 가리키는 **얇은 래퍼**다. 요청이 UI/로직 변경이라면 실제 대상은 features 쪽이다.

| 요청 | 실제로 고칠 곳 |
| --- | --- |
| 작업 기록 테이블 | `features/work-record/ui/Desktop/` 또는 `ui/Mobile/` |
| 작업 프리셋 목록 | `features/work-template/ui/{Desktop,Mobile}/` |
| 주간 일정 | `features/weekly-schedule/ui/` |
| 설정 모달 | `features/settings/ui/` |
| 사용 설명서 | `features/guide/ui/` |
| 건의사항 | `features/suggestion/ui/` |
| 변경 이력 모달 | `src/components/ChangelogModal.tsx` (여기가 실제 구현) |

`WorkRecordTable` / `WorkTemplateList` / `DailyGanttChart`의 **겉모습**이 바뀌었다면
`src/components/guide/Demo*.tsx`의 대응 데모도 함께 갱신한다 (→ docs-sync.md).

---

## 릴리즈

`/release` 커맨드 또는 `.claude/docs/release.md`를 따른다. 요약:

```
pnpm test:coverage → pnpm lint → pnpm build → 테스트 보강
→ 버전 결정 → package.json + src/constants/changelog.ts
→ src/docs/ 갱신 → 최종 검증
```
