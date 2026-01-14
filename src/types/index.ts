// 작업 세션 (시작/정지 한 번의 기록)
export interface WorkSession {
  id: string;
  start_time: string;     // 시작 시간 (HH:mm:ss)
  end_time: string;       // 종료 시간 (HH:mm:ss)
  duration_seconds: number; // 소요 시간(초)
}

export interface WorkRecord {
  id: string;
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
}

export interface TimerState {
  is_running: boolean;
  start_time: number | null;       // 시작 시각 (timestamp, persist됨)
  active_template_id: string | null; // 현재 진행 중인 템플릿 ID
  active_form_data: WorkFormData | null; // 진행 중인 작업 정보 (persist됨)
}

export interface WorkFormData {
  work_name: string;
  task_name: string;
  deal_name: string;
  category_name: string;
  note: string;
}

// 작업 템플릿 (미리 만들어둔 작업)
export interface WorkTemplate {
  id: string;
  work_name: string;
  task_name: string;
  deal_name: string;
  category_name: string;
  note: string;
  color: string;          // 구분용 색상
  created_at: string;
}
