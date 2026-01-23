/**
 * 핵심 도메인 타입 정의
 */

/**
 * 작업 세션 (시작/정지 한 번의 기록)
 */
export interface WorkSession {
    id: string;
    date: string;              // 날짜 (YYYY-MM-DD)
    start_time: string;        // 시작 시간 (HH:mm)
    end_time: string;          // 종료 시간 (HH:mm), 빈 문자열이면 진행 중
    duration_minutes: number;  // 소요 시간(분)
}

/**
 * 작업 기록 (여러 세션을 포함)
 */
export interface WorkRecord {
    id: string;
    project_code: string;      // 프로젝트 코드 (예: A25_01846)
    work_name: string;         // 작업명 (예: 5.6 프레임워크 FE)
    task_name: string;         // 업무명 (예: 개발, 작업, 분석)
    deal_name: string;         // 거래명/상세작업 (예: 5.6 테스트 케이스 확인)
    category_name: string;     // 카테고리명 (예: 개발, 문서작업, 회의)
    duration_minutes: number;  // 총 시간(분)
    note: string;              // 비고
    start_time: string;        // 첫 시작 시간 (HH:mm)
    end_time: string;          // 마지막 종료 시간 (HH:mm)
    date: string;              // 날짜 (YYYY-MM-DD)
    sessions: WorkSession[];   // 세션 이력
    is_completed: boolean;     // 완료 여부
    completed_at?: string;     // 완료 시각 (ISO string)
    is_deleted?: boolean;      // 삭제 여부 (휴지통)
    deleted_at?: string;       // 삭제 시각 (ISO string)
}

/**
 * 작업 입력 폼 데이터
 */
export interface WorkFormData {
    project_code: string;
    work_name: string;
    task_name: string;
    deal_name: string;
    category_name: string;
    note: string;
}

/**
 * 작업 템플릿 (프리셋)
 */
export interface WorkTemplate {
    id: string;
    project_code: string;      // 프로젝트 코드 (예: A25_01846)
    work_name: string;         // 작업명
    task_name: string;         // 업무명
    deal_name: string;         // 거래명
    category_name: string;     // 카테고리명
    note: string;              // 비고
    color: string;             // 구분용 색상 (HEX)
    created_at: string;        // 생성 시각 (ISO string)
}

/**
 * 숨김 처리된 자동완성 옵션
 */
export interface HiddenAutoCompleteOptions {
    work_name: string[];
    task_name: string[];
    deal_name: string[];
    project_code: string[];
    task_option: string[];      // 업무명 Select 옵션
    category_option: string[];  // 카테고리명 Select 옵션
}

/**
 * 프로젝트 코드 자동완성 옵션
 */
export interface ProjectCodeOption {
    value: string;
    label: string;
    work_name?: string;
}
