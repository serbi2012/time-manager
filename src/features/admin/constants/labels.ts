/**
 * 관리자 UI 레이블 상수
 */

export const ADMIN_PANEL_TITLE = "관리자 패널";
export const ADMIN_TAG = "관리자";
export const TIME_DISPLAY_LABEL = "시간 표시:";
export const TIME_FORMAT_HOURS = "시간 분";
export const TIME_FORMAT_MINUTES = "분";

export const TAB_SESSIONS = "세션 분석";
export const TAB_RECORDS = "레코드 분석";
export const TAB_EXPLORER = "데이터 탐색기";
export const TAB_STATISTICS = "통계";
export const TAB_TRASH = "휴지통";
export const TAB_EXPORT = "내보내기";
export const TAB_INTEGRITY = "정합성 검사";

export const VIEW_MODE_ALL = "전체";
export const VIEW_MODE_RUNNING = "진행중";
export const VIEW_MODE_CONFLICTS = "충돌";
export const VIEW_MODE_PROBLEMS = "문제";
export const VIEW_MODE_INVISIBLE = "간트미표시";
export const VIEW_MODE_TIME_SEARCH = "시간검색";

export const PLACEHOLDER_START_DATE = "시작일";
export const PLACEHOLDER_END_DATE = "종료일";

export const BULK_DELETE = "선택 삭제";
export const DELETE = "삭제";
export const CANCEL = "취소";
export const MERGE = "병합";
export const MERGE_EXECUTE = "병합 실행";
export const CLOSE = "닫기";
export const COPY_JSON = "JSON 복사";

export const SESSION_TIME_SEARCH_TITLE = "특정 시간대 검색";
export const SESSION_TIME_SEARCH_HINT =
    "특정 날짜와 시간을 입력하면 해당 시간에 걸쳐있는 모든 세션을 찾습니다. 간트차트에서 보이지 않는 세션도 찾을 수 있습니다.";
export const LABEL_DATE = "날짜:";
export const LABEL_TIME = "시간:";
export const PLACEHOLDER_DATE = "날짜 선택";
export const PLACEHOLDER_TIME = "시간 선택";
export const TIME_RESET = "시간 초기화";

export const ALERT_INVISIBLE_SESSIONS_TITLE = "간트차트에서 보이지 않는 세션";
export const ALERT_INVISIBLE_SESSIONS_DESC =
    "0분 세션이나 1분 이하의 세션은 간트차트에서 너비가 너무 작아 보이지 않습니다. 이 세션들은 충돌을 일으킬 수 있지만 시각적으로 확인이 어렵습니다.";

export const STAT_ALL_SESSIONS = "전체 세션";
export const STAT_CONFLICT_SESSIONS = "충돌 세션";
export const STAT_CONFLICT_DAYS = "충돌 발생일";
export const STAT_PROBLEM_SESSIONS = "문제 세션";
export const STAT_GANTT_INVISIBLE = "간트 미표시";
export const STAT_RUNNING = "진행 중";

export const CARD_RUNNING_STATUS = "진행 중 세션 현황";
export const CARD_RUNNING_HINT =
    '종료 시간이 비어있는(end_time === "") 세션입니다. 타이머가 실행 중이거나 비정상 종료된 세션일 수 있습니다.';
export const CARD_DUPLICATE_RUNNING = "중복 진행 중 세션 발견";
export const CARD_PROBLEM_STATS = "문제 유형별 현황";
export const CARD_PROBLEM_ZERO = "0분 세션:";
export const CARD_PROBLEM_MISSING = "시간 누락:";
export const CARD_PROBLEM_INVALID = "잘못된 형식:";
export const CARD_PROBLEM_FUTURE = "미래 날짜:";
export const CARD_PROBLEM_DAYS = "문제 발생일:";
export const CARD_CONFLICT_DATES = "충돌 발생 날짜";

export const RECORD_DETAIL_MODAL_TITLE = "레코드 상세 데이터";
export const RECORD_DETAIL_BASIC_INFO = "기본 정보";
export const RECORD_DETAIL_SESSION_HISTORY = "세션 이력";
export const RECORD_DETAIL_RAW_JSON = "Raw JSON";

export const MERGE_MODAL_TITLE = "레코드 병합 확인";
export const MERGE_MODAL_WARNING = "주의: 병합은 되돌릴 수 없습니다!";
export const MERGE_MODAL_DESC_RECORDS = "개 레코드가 1개로 병합됩니다.";
export const MERGE_MODAL_DESC_FIRST =
    "첫 번째 레코드를 기준으로 모든 세션이 합쳐지고, 나머지 레코드는 삭제됩니다.";
export const MERGE_MODAL_RECORDS_LIST = "병합될 레코드 목록";
export const MERGE_MODAL_LABEL_BASE = "기준";
export const MERGE_MODAL_LABEL_WORK = "작업명";
export const MERGE_MODAL_LABEL_DEAL = "거래명";
export const MERGE_MODAL_LABEL_TARGET = "병합 대상 레코드";
export const MERGE_MODAL_LABEL_TOTAL_SESSIONS = "총 세션 수";
export const MERGE_MODAL_LABEL_TOTAL_DURATION = "총 소요시간";
export const MERGE_MODAL_LABEL_DATE_RANGE = "날짜 범위";
export const MERGE_MODAL_COMPLETED = "완료";
export const MERGE_MODAL_INCOMPLETE = "미완료";
export const TABLE_TAG_NO_SESSIONS = "세션없음";

export const ADMIN_ACCESS_REQUIRED = "관리자 권한이 필요합니다";

export const CONFIRM_BULK_DELETE_SESSIONS = "개 세션을 삭제하시겠습니까?";
export const CONFIRM_BULK_DELETE_RECORDS = "개 레코드를 삭제하시겠습니까?";
export const BULK_DELETE_SESSIONS_BTN = "선택 삭제";
export const SELECT_COPY_RECORDS = "선택 데이터 복사";

export const RECORDS_TAB_ALL_RECORDS = "전체 레코드";
export const RECORDS_TAB_DUPLICATE_GROUPS = "중복 의심 그룹";
export const RECORDS_TAB_DUPLICATE_RECORDS = "중복 의심 레코드";
export const RECORDS_TAB_DUPLICATE_GROUP_TITLE = "중복 의심 레코드 그룹";
export const RECORDS_TAB_DUPLICATE_GROUP_HINT =
    "같은 작업명 + 거래명 조합을 가진 레코드들입니다. 병합이 필요한지 확인하세요.";
export const RECORDS_TAB_GROUPS_COUNT = "개 그룹";
export const RECORDS_TAB_ALL_RECORDS_TITLE = "전체 레코드";

export const EXPLORER_TAB_RECORDS = "레코드 탐색";
export const EXPLORER_TAB_SESSIONS = "세션 탐색";

export const TABLE_COL_DATE = "날짜";
export const TABLE_COL_TIME = "시간";
export const TABLE_COL_WORK_NAME = "작업명";
export const TABLE_COL_DEAL_NAME = "거래명";
export const TABLE_COL_PROJECT = "프로젝트";
export const TABLE_COL_DURATION = "소요시간";
export const TABLE_COL_CONFLICT = "충돌";
export const TABLE_COL_PROBLEM = "문제";
export const TABLE_COL_GANTT = "간트";
export const TABLE_COL_SESSIONS = "세션";
export const TABLE_COL_STATE = "상태";
export const TABLE_COL_ACTION = "액션";
export const TABLE_FILTER_CONFLICT_YES = "충돌 있음";
export const TABLE_FILTER_CONFLICT_NO = "충돌 없음";
export const TABLE_FILTER_PROBLEM_YES = "문제 있음";
export const TABLE_FILTER_PROBLEM_NO = "문제 없음";
export const TABLE_FILTER_ZERO = "0분 세션";
export const TABLE_FILTER_MISSING = "시간 누락";
export const TABLE_FILTER_GANTT_VISIBLE = "간트 표시";
export const TABLE_FILTER_GANTT_INVISIBLE = "간트 미표시";
export const TABLE_TAG_RUNNING = "진행중";
export const TABLE_TAG_INVISIBLE = "미표시";
export const TABLE_TAG_DISPLAY = "표시";
export const TABLE_TOOLTIP_CONFLICT = "충돌하는 작업:";
export const TABLE_TOOLTIP_PROBLEM = "문제 발견:";
export const TABLE_TOOLTIP_GANTT_INVISIBLE =
    "이 세션은 간트차트에서 보이지 않습니다 (0분 또는 1분 이하)";
export const TABLE_LABEL_TASK = "업무명";
export const TABLE_LABEL_CATEGORY = "카테고리";
export const TABLE_LABEL_RECORD_COUNT = "레코드 수";
export const TABLE_LABEL_TOTAL_SESSIONS = "총 세션";
export const TABLE_LABEL_TOTAL_TIME = "총 시간";
export const TABLE_LABEL_DATE_RANGE = "날짜 범위";
export const TABLE_VIEW_DETAIL = "상세 데이터 보기";
export const TABLE_COPY_DATA = "데이터 복사";
export const TABLE_COPY_GROUP = "그룹 데이터 복사";
export const TABLE_MINUTES_SUFFIX = "분";

export const PAGINATION_TOTAL = (
    range0: number,
    range1: number,
    total: number
) => `${range0}-${range1} / 총 ${total}개`;
