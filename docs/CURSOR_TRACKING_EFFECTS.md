# 커서 트래킹 효과 적용 체크리스트

토스 스타일의 은은한 커서 인터랙션을 데스크탑 UI 요소에 적용하는 작업 추적 문서.

> **데스크탑 전용** — 모바일 컴포넌트는 대상 아님

---

## 공통 모듈 구현

| #    | 항목                                | 파일                                                | 상태 |
| ---- | ----------------------------------- | --------------------------------------------------- | :--: |
| 0-1  | `useMousePosition` 훅               | `shared/hooks/useMousePosition.ts`                  |  ✅  |
| 0-2  | `SpotlightCard` 컴포넌트            | `shared/ui/cursor-tracking/SpotlightCard.tsx`       |  ✅  |
| 0-3  | `SpotlightBorderCard` 컴포넌트      | `shared/ui/cursor-tracking/SpotlightBorderCard.tsx` |  ✅  |
| 0-4  | `TiltCard` 컴포넌트                 | `shared/ui/cursor-tracking/TiltCard.tsx`            |  ✅  |
| 0-5  | `MagneticButton` 컴포넌트           | `shared/ui/cursor-tracking/MagneticButton.tsx`      |  ✅  |
| 0-6  | `ShineSweepRow` 컴포넌트            | `shared/ui/cursor-tracking/ShineSweepRow.tsx`       |  ✅  |
| 0-7  | `CursorHaloContainer` 컴포넌트      | `shared/ui/cursor-tracking/CursorHaloContainer.tsx` |  ✅  |
| 0-8  | `BorderBeamCard` 컴포넌트           | `shared/ui/cursor-tracking/BorderBeamCard.tsx`      |  ✅  |
| 0-9  | `SpotlightTiltCard` 컴포넌트 (조합) | `shared/ui/cursor-tracking/SpotlightTiltCard.tsx`   |  ✅  |
| 0-10 | `index.ts` Public API               | `shared/ui/cursor-tracking/index.ts`                |  ✅  |

---

## 1. Spotlight Glow — 카드 내부 빛 번짐

커서를 따라 카드 내부에 은은한 radial-gradient 빛 번짐이 이동.

| #   | 적용 대상             | 컴포넌트                 | 파일 경로                                                            |          상태          |
| --- | --------------------- | ------------------------ | -------------------------------------------------------------------- | :--------------------: |
| 1-1 | 작업 기록 테이블 카드 | `DesktopWorkRecordTable` | `features/work-record/ui/Desktop/DesktopWorkRecordTable.tsx`         |           ✅           |
| 1-2 | 간트 차트 카드        | `DesktopDailyGanttChart` | `features/gantt-chart/ui/DailyGanttChart/DesktopDailyGanttChart.tsx` |           ✅           |
| 1-3 | 일간 통계 카드        | `DailyStats`             | `features/work-record/ui/RecordTable/DailyStats.tsx`                 |           ✅           |
| 1-4 | 인라인 통계           | `InlineStats`            | `features/work-record/ui/Desktop/InlineStats.tsx`                    |           ✅           |
| 1-5 | 주간 일정 DayCard     | `DayCard`                | `features/weekly-schedule/ui/WeeklySchedule/DayCard.tsx`             |           ✅           |
| 1-6 | 건의사항 카드         | `SuggestionCardContent`  | `features/suggestion/ui/SuggestionCard/SuggestionCardContent.tsx`    | ⏭️ Collapse 내부, 스킵 |
| 1-7 | 가이드 본문 카드      | `DesktopGuideBook`       | `features/guide/ui/Desktop/DesktopGuideBook.tsx`                     |           ✅           |

---

## 2. Spotlight Border — 보더 글로우

커서 위치에서 보더가 밝아지고 내부에 은은한 글로우.

| #   | 적용 대상             | 컴포넌트               | 파일 경로                                            |          상태          |
| --- | --------------------- | ---------------------- | ---------------------------------------------------- | :--------------------: |
| 2-1 | 템플릿(프리셋) 카드   | `TemplateCard`         | `features/work-template/ui/TemplateCard.tsx`         |           ✅           |
| 2-2 | 정렬 가능 프리셋 카드 | `SortableTemplateCard` | `features/work-template/ui/SortableTemplateCard.tsx` | ✅ (spotlight overlay) |
| 2-3 | 설정 아이템 행        | `SettingItem`          | `features/settings/ui/tabs/SettingItem.tsx`          |    ⏭️ 평면 행, 스킵    |
| 2-4 | 테마 선택 카드        | `ThemeTab` (테마 버튼) | `features/settings/ui/tabs/ThemeTab.tsx`             | ⏭️ 기존 호버 상태 충분 |

---

## 3. 3D Tilt — 미세 기울기

커서 위치에 따라 카드가 perspective 기반으로 미세하게 기울어짐.

| #   | 적용 대상          | 컴포넌트           | 파일 경로                                            |         상태         |
| --- | ------------------ | ------------------ | ---------------------------------------------------- | :------------------: |
| 3-1 | 관리자 통계 카드   | `StatsOverview`    | `features/admin/ui/AdminDashboard/StatsOverview.tsx` |          ✅          |
| 3-2 | 통계 대시보드      | `StatsDashboard`   | `features/admin/ui/Statistics/StatsDashboard.tsx`    | ⏭️ 724줄 복잡, 스킵  |
| 3-3 | 카테고리 분석 카드 | `CategoryAnalysis` | `features/admin/ui/Statistics/CategoryAnalysis.tsx`  | ⏭️ 분석 콘텐츠, 스킵 |

---

## 4. Magnetic Button — 자석 버튼

커서 방향으로 버튼이 살짝 끌려오는 효과.

| #   | 적용 대상             | 컴포넌트                     | 파일 경로                                                     | 상태 |
| --- | --------------------- | ---------------------------- | ------------------------------------------------------------- | :--: |
| 4-1 | "새 작업" CTA 버튼    | `RecordHeader`               | `features/work-record/ui/Desktop/RecordHeader.tsx`            |  ✅  |
| 4-2 | 프리셋 추가 버튼      | `AddPresetButton`            | `features/work-template/ui/AddPresetButton.tsx`               |  ✅  |
| 4-3 | 타이머 시작/정지 버튼 | `TimerActionColumn`          | `features/work-record/ui/RecordColumns/TimerActionColumn.tsx` |  ✅  |
| 4-4 | 빈 상태 CTA (작업)    | `RecordEmptyState`           | `features/work-record/ui/Desktop/RecordEmptyState.tsx`        |  ✅  |
| 4-5 | 빈 상태 CTA (프리셋)  | `EmptyPresetState`           | `features/work-template/ui/EmptyPresetState.tsx`              |  ✅  |
| 4-6 | 주간 복사 CTA 버튼    | `DesktopWeeklyHeader`        | `features/weekly-schedule/ui/Desktop/DesktopWeeklyHeader.tsx` |  ✅  |
| 4-7 | 건의사항 작성 버튼    | `DesktopSuggestionBoard`     | `features/suggestion/ui/Desktop/DesktopSuggestionBoard.tsx`   |  ✅  |
| 4-8 | 헤더 설정/유저 버튼   | `DesktopHeader` / `UserMenu` | `widgets/Header/DesktopHeader.tsx`                            |  ✅  |
| 4-9 | 가이드 이전/다음 버튼 | `NavButtons`                 | `features/guide/ui/NavButtons/NavButtons.tsx`                 |  ✅  |

---

## 5. Shine Sweep — 행 빛줄기

커서를 따라 은은한 수직 빛줄기가 행을 가로지름.

| #   | 적용 대상             | 컴포넌트                 | 파일 경로                                                    |               상태               |
| --- | --------------------- | ------------------------ | ------------------------------------------------------------ | :------------------------------: |
| 5-1 | 작업 기록 테이블 행   | `DesktopWorkRecordTable` | `features/work-record/ui/Desktop/DesktopWorkRecordTable.tsx` | ⏭️ Ant Design Table 행 제어 불가 |
| 5-2 | 간트 차트 행          | `GanttRow`               | `features/gantt-chart/ui/GanttChart/GanttRow.tsx`            |                ✅                |
| 5-3 | 주간 작업 아이템      | `WorkItem`               | `features/weekly-schedule/ui/WeeklySchedule/WorkItem.tsx`    |                ✅                |
| 5-4 | 관리자 세션 테이블 행 | `SessionTable`           | `features/admin/ui/AdminTabs/SessionTable.tsx`               | ⏭️ Ant Design Table 행 제어 불가 |
| 5-5 | 자동완성 옵션 행      | `AutoCompleteOptionList` | `features/settings/ui/tabs/AutoCompleteOptionList.tsx`       |       ⏭️ 칩 구조, 행 아님        |
| 5-6 | 건의사항 답글 아이템  | `ReplyItem`              | `features/suggestion/ui/SuggestionCard/ReplyItem.tsx`        |                ✅                |

---

## 6. Cursor Halo — 커서 원형 하이라이트

네비게이션 영역에서 커서 주변에 은은한 원형 글로우.

| #   | 적용 대상           | 컴포넌트               | 파일 경로                                                 |           상태            |
| --- | ------------------- | ---------------------- | --------------------------------------------------------- | :-----------------------: |
| 6-1 | 사이드바            | `DesktopSidebar`       | `widgets/Navigation/DesktopSidebar.tsx`                   |            ✅             |
| 6-2 | 헤더 메뉴           | `DesktopLayout` (Menu) | `app/layouts/DesktopLayout.tsx`                           | ⏭️ 그라데이션 배경과 충돌 |
| 6-3 | 가이드 사이드바 TOC | `GuideSidebar`         | `features/guide/ui/GuideSidebar/GuideSidebar.tsx`         |            ✅             |
| 6-4 | 주간 캘린더 스트립  | `WeeklyCalendarStrip`  | `features/work-record/ui/Desktop/WeeklyCalendarStrip.tsx` |            ✅             |
| 6-5 | 설정 모달 좌측 탭   | `DesktopSettingsModal` | `features/settings/ui/Desktop/DesktopSettingsModal.tsx`   |   ⏭️ 기존 탭 호버 충분    |

---

## 7. Border Beam — 회전 보더 빛 (포인트)

호버 시 보더를 따라 빛이 회전하는 프리미엄 효과. 활성 상태에만 제한 사용.

| #   | 적용 대상             | 컴포넌트                      | 파일 경로                                                     |              상태              |
| --- | --------------------- | ----------------------------- | ------------------------------------------------------------- | :----------------------------: |
| 7-1 | 활성 타이머 카드/행   | `TimerActionColumn` (진행 중) | `features/work-record/ui/RecordColumns/TimerActionColumn.tsx` |      ⏭️ 32px 버튼에 과도       |
| 7-2 | 현재 활성 프리셋 카드 | `TemplateCard` (활성 상태)    | `features/work-template/ui/TemplateCard.tsx`                  | ⏭️ SortableTemplateCard가 주력 |

---

## 8. 조합 — Spotlight + Tilt + Border Glow

여러 효과를 결합한 프리미엄 카드 인터랙션.

| #   | 적용 대상              | 컴포넌트               | 파일 경로                                            |                   상태                   |
| --- | ---------------------- | ---------------------- | ---------------------------------------------------- | :--------------------------------------: |
| 8-1 | 프리셋 카드 (프리미엄) | `SortableTemplateCard` | `features/work-template/ui/SortableTemplateCard.tsx` | ✅ (spotlight overlay + animation check) |
| 8-2 | 날짜 네비게이션 영역   | `DateNavigation`       | `features/work-record/ui/Desktop/DateNavigation.tsx` |   ✅ (기존 useSpotlight + useMagnetic)   |

---

## 진행 현황

| 단계                | 항목 수 |  완료  |  스킵  | 진행률  |
| ------------------- | :-----: | :----: | :----: | :-----: |
| 공통 모듈           |   10    |   10   |   0    |  100%   |
| 1. Spotlight Glow   |    7    |   6    |   1    |   86%   |
| 2. Spotlight Border |    4    |   2    |   2    |   50%   |
| 3. 3D Tilt          |    3    |   1    |   2    |   33%   |
| 4. Magnetic Button  |    9    |   9    |   0    |  100%   |
| 5. Shine Sweep      |    6    |   3    |   3    |   50%   |
| 6. Cursor Halo      |    5    |   3    |   2    |   60%   |
| 7. Border Beam      |    2    |   0    |   2    |   0%    |
| 8. 조합             |    2    |   2    |   0    |  100%   |
| **총계**            | **48**  | **36** | **12** | **75%** |

> 스킵 사유: Ant Design Table 행 제어 불가, Collapse 내부 콘텐츠, 기존 호버 충분, 요소 크기 부적합, 배경 충돌 등

---

## 구현 순서 (완료)

1. ✅ **공통 모듈** (0-1 ~ 0-10)
2. ✅ **Spotlight Glow** (1-1 ~ 1-7)
3. ✅ **Spotlight Border** (2-1 ~ 2-4)
4. ✅ **Shine Sweep** (5-1 ~ 5-6)
5. ✅ **Magnetic Button** (4-1 ~ 4-9)
6. ✅ **Cursor Halo** (6-1 ~ 6-5)
7. ✅ **3D Tilt** (3-1 ~ 3-3)
8. ✅ **Border Beam** (7-1 ~ 7-2)
9. ✅ **조합** (8-1 ~ 8-2)

---

## 참고

-   목업 프리뷰: `mockups/cursor-tracking-effects.html`
-   데스크탑 전용 (모바일 미적용)
-   `useAnimationEnabled()` 훅으로 애니메이션 비활성화 시 효과 자동 off
-   `prefers-reduced-motion` 미디어 쿼리 자동 존중 (AnimationConfigProvider 연동)
-   성능: `will-change`, `pointer-events-none` 적용
