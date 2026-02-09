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

// ---------- message.* (antd message API) ----------

/** 진행 중인 세션 삭제 불가 안내 */
export const GANTT_MESSAGE_ACTIVE_SESSION_CANNOT_DELETE =
    "진행 중인 세션은 삭제할 수 없습니다.";

/** 세션 삭제 완료 */
export const GANTT_MESSAGE_SESSION_DELETED = "세션이 삭제되었습니다.";

// ---------- 카드/헤더 UI 문구 ----------

/** 일간 타임라인 카드 제목 */
export const GANTT_TITLE_DAILY_TIMELINE = "일간 타임라인";

/** 빈 영역 드래그 힌트 (extra) */
export const GANTT_HINT_DRAG_TO_ADD = "💡 빈 영역을 드래그하여 작업 추가";

// ---------- 빈 간트 상태 ----------

/** 작업 기록 없음 문구 */
export const GANTT_EMPTY_NO_RECORDS = "작업 기록이 없습니다";

/** 빈 상태 하단 힌트 - 드래그하여 추가 */
export const GANTT_EMPTY_HINT_DRAG = "드래그하여 작업 추가";

// ---------- 리사이즈/수정 모달 메시지 ----------

/** 최소 1분 이상 필요 */
export const GANTT_MESSAGE_MIN_1_MINUTE = "최소 1분 이상이어야 합니다.";

/** 진행 중인 세션 종료 시간 수정 불가 */
export const GANTT_MESSAGE_ACTIVE_SESSION_END_CANNOT_EDIT =
    "진행 중인 세션의 종료 시간은 수정할 수 없습니다.";

/** 작업 수정 완료 */
export const GANTT_MESSAGE_WORK_UPDATED = "작업이 수정되었습니다.";

/** 선택된 작업 없음 */
export const GANTT_MESSAGE_RECORD_NOT_FOUND = "선택된 작업을 찾을 수 없습니다.";

/** 항목 숨김 안내 (라벨) */
export const GANTT_MESSAGE_OPTION_HIDDEN = (label: string) =>
    `"${label}" 항목이 숨겨졌습니다`;

/** 옵션 숨김 안내 (값) */
export const GANTT_MESSAGE_OPTION_HIDDEN_V = (v: string) =>
    `"${v}" 옵션이 숨겨졌습니다`;

/** 기존 작업에 세션 추가 완료 포맷 */
export const GANTT_MESSAGE_SESSION_ADDED_TO_RECORD = (
    work_name: string,
    start: string,
    end: string
) => `"${work_name}"에 ${start} ~ ${end} 세션이 추가되었습니다.`;

/** 기존 작업에 세션 추가 완료 (시간만) */
export const GANTT_MESSAGE_SESSION_ADDED_EXISTING = (
    start: string,
    end: string
) => `기존 작업에 ${start} ~ ${end} 세션이 추가되었습니다.`;

/** 새 작업 추가 완료 포맷 */
export const GANTT_MESSAGE_WORK_ADDED = (start: string, end: string) =>
    `${start} ~ ${end} 작업이 추가되었습니다.`;

// ---------- 버튼/확인 다이얼로그 ----------

/** 삭제 버튼 */
export const GANTT_BUTTON_DELETE = "삭제";

/** 취소 버튼 */
export const GANTT_BUTTON_CANCEL = "취소";

// ---------- 모달 폼 라벨/플레이스홀더 ----------

export const GANTT_FORM_LABEL_START = "시작";
export const GANTT_FORM_LABEL_END = "종료";
export const GANTT_FORM_PLACEHOLDER_START = "09:00";
export const GANTT_FORM_PLACEHOLDER_END = "18:00";
export const GANTT_FORM_LABEL_PROJECT_CODE = "프로젝트 코드";
export const GANTT_FORM_PLACEHOLDER_PROJECT_CODE = "예: A25_01846";
export const GANTT_FORM_PLACEHOLDER_PROJECT_CODE_ADD =
    "예: A25_01846 (미입력 시 A00_00000)";
export const GANTT_FORM_LABEL_WORK_NAME = "작업명";
export const GANTT_FORM_PLACEHOLDER_WORK_NAME = "예: 5.6 프레임워크 FE";
export const GANTT_FORM_LABEL_DEAL_NAME = "거래명 (상세 작업)";
export const GANTT_FORM_PLACEHOLDER_DEAL_NAME =
    "예: 5.6 테스트 케이스 확인 및 이슈 처리";
export const GANTT_FORM_LABEL_TASK = "업무명";
export const GANTT_FORM_PLACEHOLDER_TASK = "업무 선택";
export const GANTT_FORM_PLACEHOLDER_NEW_TASK = "새 업무명";
export const GANTT_FORM_LABEL_CATEGORY = "카테고리";
export const GANTT_FORM_PLACEHOLDER_CATEGORY = "카테고리";
export const GANTT_FORM_PLACEHOLDER_NEW_CATEGORY = "새 카테고리";
export const GANTT_FORM_LABEL_NOTE = "비고";
export const GANTT_FORM_PLACEHOLDER_NOTE = "추가 메모";

// ---------- 점심 오버레이 (다른 간트) ----------

/** 점심시간 툴팁 (시간 범위 포함) */
export const GANTT_LABEL_LUNCH_TIME_RANGE = "점심시간 (11:40 ~ 12:40)";

// ---------- 모달 제목/버튼/세그먼트 ----------

export const GANTT_MODAL_TITLE_ADD = "작업 추가";
export const GANTT_MODAL_TITLE_EDIT = "작업 수정";
export const GANTT_MODAL_BUTTON_ADD = "추가";
export const GANTT_MODAL_BUTTON_SAVE = "저장";
export const GANTT_MODAL_BUTTON_CANCEL = "취소";
export const GANTT_MODAL_SEGMENT_NEW = "새 작업 추가";
export const GANTT_MODAL_SEGMENT_EXISTING = "기존 작업에 추가";
export const GANTT_MODAL_SELECT_WORK_PROMPT =
    "세션을 추가할 작업을 선택하세요:";
export const GANTT_MODAL_SESSION_TIME_HEADER = "세션 시간";
export const GANTT_MODAL_ACTIVE_SESSION_HINT =
    "💡 진행 중인 세션은 시작 시간만 수정할 수 있습니다";
export const GANTT_MODAL_DURATION_LABEL = "소요";

// ---------- 폼 검증 메시지 ----------

export const GANTT_FORM_VALIDATE_WORK_NAME_REQUIRED = "작업명을 입력하세요";
export const GANTT_FORM_VALIDATE_START_REQUIRED = "시작 시간 필수";
export const GANTT_FORM_VALIDATE_END_REQUIRED = "종료 시간 필수";
export const GANTT_FORM_VALIDATE_TIME_FORMAT = "HH:mm 형식";
