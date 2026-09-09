---
description: 사용 설명서(src/docs)와 데모 컴포넌트를 최근 기능 변경에 맞춰 동기화한다
---

`.claude/docs/docs-sync.md`를 읽고 아래를 수행한다.

1. 최근 변경 사항을 파악한다(대화 맥락 또는 `git log`/`git diff`).
2. 변경된 기능 영역에 대응하는 `src/docs/*.md`를 찾아 내용을 갱신한다.

   | 기능 영역 | 문서 |
   | --- | --- |
   | 작업 기록·타이머·간트차트 | `daily-record.md` |
   | 작업 프리셋 | `work-preset.md` |
   | 주간 일정 | `weekly-schedule.md` |
   | 건의사항 | `suggestions.md` |
   | 설정·데이터 관리 | `settings.md` |
   | 단축키 | `shortcuts.md` |
   | 로그인·앱 개요 | `getting-started.md` |

3. `WorkRecordTable` / `WorkTemplateList` / `DailyGanttChart` / `EmptyState` / `ShortcutsTable` /
   `SettingsPanel`의 겉모습이 바뀌었으면 `src/components/guide/Demo*.tsx`의 대응 데모도 함께 고친다.
   더미 데이터는 `src/components/guide/demo_data.ts`에 있다.
4. 새 문서를 추가했으면 `src/docs/index.ts`의 `TABLE_OF_CONTENTS`와 `DOCS`에 등록한다.

관리자 기능(`/admin`)은 문서화 대상이 아니다. 갱신하지 않은 문서가 있으면 사유를 함께 보고한다.

$ARGUMENTS
