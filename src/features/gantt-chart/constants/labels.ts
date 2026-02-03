/**
 * 간트 차트 UI 텍스트 상수
 */

/** 컨텍스트 메뉴 - 작업 수정 버튼 */
export const GANTT_LABEL_EDIT_WORK = "작업 수정";

/** 컨텍스트 메뉴 - 세션 삭제 버튼 */
export const GANTT_LABEL_DELETE_SESSION = "세션 삭제";

/** 세션 삭제 확인 제목 */
export const GANTT_LABEL_DELETE_SESSION_TITLE = "세션 삭제";

/** 세션 삭제 확인 설명 포맷 (start~end) */
export const GANTT_LABEL_DELETE_SESSION_DESC = (start: string, end: string) =>
    `이 세션(${start}~${end})을 삭제하시겠습니까?`;

/** 툴팁 - 충돌 경고 문구 */
export const GANTT_LABEL_CONFLICT_WARNING = "⚠️ 다른 작업과 시간이 충돌합니다";

/** 툴팁 - 총 N회, M분 포맷 */
export const GANTT_LABEL_TOTAL_SESSIONS = (count: number, duration: string) =>
    `총 ${count}회, ${duration}`;

/** 충돌 오버레이 툴팁 제목 */
export const GANTT_LABEL_CONFLICT_DETECTED = "⚠️ 시간 충돌 감지";

/** 점심시간 툴팁 */
export const GANTT_LABEL_LUNCH = "점심시간";

/** 충돌 오버레이 라벨 */
export const GANTT_LABEL_CONFLICT = "충돌";
