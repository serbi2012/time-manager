// 작업 기록 타입 정의 파일
// 작업 세션 (시작/정지 한 번의 기록)
export interface WorkSession {
  id: string;
  date: string;           // 날짜 (YYYY-MM-DD)
  start_time: string;     // 시작 시간 (HH:mm)
  end_time: string;       // 종료 시간 (HH:mm)
  duration_minutes: number; // 소요 시간(분)
}

export interface WorkRecord {
  id: string;
  project_code: string;   // 프로젝트 코드 (예: A25_01846)
  work_name: string;      // 작업명
  task_name: string;      // 업무명
  deal_name: string;      // 거래명
  category_name: string;  // 카테고리명
  duration_minutes: number; // 총 시간(분)
  note: string;           // 비고
  start_time: string;     // 첫 시작 시간
  end_time: string;       // 마지막 종료 시간
  date: string;           // 날짜 (YYYY-MM-DD)
  sessions: WorkSession[]; // 세션 이력
  is_completed: boolean;  // 완료 여부
  completed_at?: string;  // 완료 시각 (ISO string)
  is_deleted?: boolean;   // 삭제 여부 (휴지통)
  deleted_at?: string;    // 삭제 시각 (ISO string)
}

export interface TimerState {
  is_running: boolean;
  start_time: number | null;       // 시작 시각 (timestamp, persist됨)
  active_template_id: string | null; // 현재 진행 중인 템플릿 ID
  active_form_data: WorkFormData | null; // 진행 중인 작업 정보 (persist됨)
}

export interface WorkFormData {
  project_code: string;
  work_name: string;
  task_name: string;
  deal_name: string;
  category_name: string;
  note: string;
}

// 작업 템플릿 (미리 만들어둔 작업)
export interface WorkTemplate {
  id: string;
  project_code: string;   // 프로젝트 코드 (예: A25_01846)
  work_name: string;
  task_name: string;
  deal_name: string;
  category_name: string;
  note: string;
  color: string;          // 구분용 색상
  created_at: string;
}

// 건의사항 상태
export type SuggestionStatus = 'pending' | 'reviewing' | 'in_progress' | 'completed' | 'rejected';

// 건의사항 답글
export interface SuggestionReply {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

// 건의사항 게시글
export interface SuggestionPost {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  created_at: string;
  replies: SuggestionReply[];
  status: SuggestionStatus;
  resolved_version?: string;
  admin_comment?: string;
}