---
description: 릴리즈 준비 — 테스트/커버리지, 린트, 빌드, 테스트 보강, 버전 결정, CHANGELOG, 문서 동기화
---

`.claude/docs/release.md`를 읽고 그 절차를 **순서대로 빠짐없이** 수행한다.

핵심 원칙:
- 모든 단계는 필수다. 스킵 금지.
- 이전 단계가 통과하기 전에 다음 단계로 넘어가지 않는다.
- 각 단계 완료 후 진행 상황을 보고한다.
- 3단계(테스트 추가)와 6단계(문서 동기화)는 특히 스킵하기 쉬우니 반드시 수행하고, 스킵한 항목이 있으면 사유를 명시한다.

버전 결정 기준은 같은 문서의 "부록: 버저닝 전략"을 따른다.
갱신 대상 파일은 `package.json`의 `version`과 `src/constants/changelog.ts`의 `CURRENT_VERSION`·`CHANGELOG` 두 곳이다.

마지막에 `.claude/docs/release.md`의 "완료 보고 형식"대로 결과를 보고한다.

$ARGUMENTS
