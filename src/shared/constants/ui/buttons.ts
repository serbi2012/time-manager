/**
 * 버튼 텍스트 상수
 */

export const BUTTON_TEXT = {
    // 기본 액션
    save: "저장",
    cancel: "취소",
    confirm: "확인",
    close: "닫기",
    ok: "확인",

    // CRUD 액션
    add: "추가",
    create: "생성",
    edit: "수정",
    delete: "삭제",
    remove: "제거",

    // 타이머 액션
    start: "시작",
    stop: "정지",
    pause: "일시정지",
    resume: "재개",
    reset: "초기화",

    // 데이터 액션
    export: "내보내기",
    import: "가져오기",
    sync: "동기화",
    refresh: "새로고침",
    copy: "복사",

    // 기타 액션
    apply: "적용",
    clear: "지우기",
    search: "검색",
    filter: "필터",
    settings: "설정",
    more: "더보기",
    back: "뒤로",
    next: "다음",
    prev: "이전",
    finish: "완료",
    submit: "제출",
    login: "로그인",
    logout: "로그아웃",
} as const;

export type ButtonTextKey = keyof typeof BUTTON_TEXT;
