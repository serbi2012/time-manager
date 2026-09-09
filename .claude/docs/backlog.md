# 백로그 / 기술 부채

사용자가 남긴 개선 항목과, 코드베이스에서 확인된 미해결 부채. 작업을 시작하기 전 관련 항목이 있는지 확인한다.
해결한 항목은 이 문서에서 지운다.

---

## 1. 알려진 버그 / 개선 요청

| 항목 | 내용 |
| --- | --- |
| 진행 중 세션 편집 | 진행 중인 세션의 이름 등을 수정하면 새 세션이 생겨버린다. (레코딩을 중단하면 자동으로 사라지긴 함) |
| 중복 레코드 자동 병합 | 관리자 메뉴가 "같은 작업명 + 거래명 조합" 중복을 알려주고 수동 병합하게 되어 있다. 이런 경우는 안내 없이 **무조건 자동 병합**되도록 바꾼다. |
| 프리셋 드래그 z-index | 프리셋을 드래그앤드롭할 때 잡고 있는 항목이 다른 항목 아래로 깔린다. 드래그 중인 항목이 최상단에 보여야 한다. |
| 고유 식별자 자동 추가 | `use_postfix_on_preset_add` 기능은 더 이상 필요 없어 보인다. 제거 검토. |
| 그리드 라이브러리 | 관리자 그리드를 Ant Design 대신 다른 것으로 교체 검토. |

---

## 2. 미완료 리팩토링

### `is_mobile` 인라인 분기 잔존

`.claude/docs/coding-standards.md` 5절 위반. 아래 파일들은 컴포넌트 내부에서 `is_mobile`로 분기한다.
**해당 파일을 수정하게 되면 그때 함께 분리한다.** 리팩토링만을 위해 따로 손대지 않는다.

| 파일 | 목표 |
| --- | --- |
| `widgets/SyncStatus/SyncIndicator.tsx` | `MobileSyncIndicator` + `DesktopSyncIndicator` |
| `widgets/Header/UserMenu.tsx` | `MobileUserMenu` + `DesktopUserMenu` |
| `features/settings/ui/tabs/DataTab.tsx` | 플랫폼별 분리 |
| `features/settings/ui/tabs/AnimationTab.tsx` | 플랫폼별 분리 |
| `features/settings/ui/tabs/ShortcutsTab.tsx` | 플랫폼별로 완전히 다른 UI를 반환 중 |
| `features/settings/ui/tabs/SettingItem.tsx` | 세로/가로 레이아웃 분기 |
| `features/settings/ui/tabs/BulkEditTab.tsx` | 504줄 — 분리 대상이기도 함 |
| `features/weekly-schedule/ui/WeeklySchedule/{WeeklySchedule,WeeklyHeader}.tsx` | 플랫폼별 분리 |
| `features/suggestion/ui/SuggestionBoard/SuggestionBoard.tsx` | 플랫폼별 분리 |
| `features/guide/ui/GuideBook/GuideBook.tsx` | 플랫폼별 분리 |
| `features/gantt-chart/ui/DailyGanttChart/index.tsx` | 진입점이면 정상 — 확인 후 판단 |

`pages/DailyPage/index.tsx`, `components/WorkRecordTable.tsx`, `components/WorkTemplateList.tsx`, `app/App.tsx`는 **플랫폼 진입점**이므로 `is_mobile` 사용이 정상이다.

### 300줄 초과 파일

`.claude/docs/coding-standards.md` 2절 기준. 수정할 일이 생기면 분리를 함께 진행한다.

| 파일 | 줄 수 |
| --- | --- |
| `features/settings/ui/tabs/BulkEditTab.tsx` | 504 |
| `features/admin/ui/IntegrityCheck/IntegrityChecker.tsx` | 502 |
| `features/admin/ui/DataExplorer/RecordsExplorer.tsx` | 465 |
| `features/admin/lib/integrity.ts` | 439 |
| `features/admin/ui/AdminSessionGrid/AdminSessionGrid.tsx` | 435 |
| `features/admin/ui/AdminTabs/SessionsTab.tsx` | 434 |
| `features/admin/ui/TrashManagement/TrashManager.tsx` | 396 |
| `features/work-record/ui/Mobile/MobileWorkRecordTable.tsx` | 392 |
| `pages/DailyPage/MobileDailyPage.tsx` | 383 |
| `firebase/firestore.ts` | 380 |
| `features/gantt-chart/ui/GanttAddModal/GanttAddModal.tsx` | 374 |

`src/constants/changelog.ts`(1210줄)와 `features/admin/constants/labels.ts`(490줄)는 데이터/상수 파일이라 예외다.

### 남은 정리 항목

- `src/components/WorkRecordTable.tsx.backup` (3119줄) — 분리 전 원본. 참고할 일이 없으면 삭제 대상.
- 스타일 코드 관리 체계 — Tailwind 마이그레이션이 진행 중이고 `CSSProperties` 상수가 일부 feature에 남아 있다. `docs/STYLE_ARCHITECTURE.md` 참조.
- 다크 모드 — `docs/DARK_MODE_PLAN.md`에 계획만 있고 미구현.

---

## 3. 참고 문서 (프로젝트 `docs/` 폴더)

| 파일 | 내용 |
| --- | --- |
| `docs/STYLE_ARCHITECTURE.md` | Tailwind v4 + CSS 레이어 스타일 아키텍처 설계 |
| `docs/DARK_MODE_PLAN.md` | 다크 모드 도입 계획 (미구현) |
| `docs/MOBILE_UX_IMPROVEMENT.md` | 모바일 UX 개선안 |
| `docs/CURSOR_TRACKING_EFFECTS.md` | 커서 추종 효과 설계 |
| `docs/REFACTORING_PROGRESS.md`, `REFACTORING_TODO.md`, `PHASE10_*.md` | 대규모 리팩토링 진행 기록 (Phase 1~9 완료) |
