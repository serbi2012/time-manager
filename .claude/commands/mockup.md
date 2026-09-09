---
description: UI 목업 프리뷰 생성 — mockups/에 HTML 목업을 만들고 로컬 서버로 확인받는다
---

`.claude/docs/ui-mockup.md`의 프로세스를 따라 목업을 만든다.

1. `mockups/template.html`을 읽어 구조를 파악한다.
2. `mockups/[feature]-[component].html`을 생성한다.
3. `mockups/index.html`의 `CATEGORIES` 배열에 새 목업을 등록한다. 맞는 카테고리가 없으면 새로 추가한다.
4. `pnpm mockup`으로 서버를 띄우고 `http://localhost:3456/[파일명].html` 주소를 안내한다.
5. 주요 디자인 결정 사항을 설명하고 방향이 맞는지 묻는다.
6. 승인 후에만 실제 구현을 시작한다.

목업은 시각적 프리뷰가 목적이다. 실제 스토어/API를 연동하지 않고, 상호작용은 `useState`로만 흉내 낸다.
스타일 값은 `.claude/docs/design-system.md`의 토큰을 따른다.

목업 대상: $ARGUMENTS
