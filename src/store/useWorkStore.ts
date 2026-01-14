import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type { WorkRecord, TimerState, WorkFormData, WorkTemplate, WorkSession } from '../types';

// 템플릿 색상 팔레트
export const TEMPLATE_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb',
];

interface WorkStore {
  records: WorkRecord[];
  templates: WorkTemplate[];
  timer: TimerState;
  form_data: WorkFormData;
  selected_date: string;
  
  // 타이머 액션
  startTimer: (template_id?: string) => void;
  stopTimer: () => WorkRecord | null;
  updateElapsedTime: () => void;
  resetTimer: () => void;
  switchTemplate: (template_id: string) => void;
  
  // 폼 액션
  setFormData: (data: Partial<WorkFormData>) => void;
  resetFormData: () => void;
  
  // 레코드 액션
  addRecord: (record: WorkRecord) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, record: Partial<WorkRecord>) => void;
  
  // 템플릿 액션
  addTemplate: (template: Omit<WorkTemplate, 'id' | 'created_at'>) => WorkTemplate;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, template: Partial<WorkTemplate>) => void;
  applyTemplate: (template_id: string) => void;
  
  // 날짜 필터
  setSelectedDate: (date: string) => void;
  getFilteredRecords: () => WorkRecord[];
  
  // 자동완성 헬퍼
  getAutoCompleteOptions: (field: keyof WorkFormData) => string[];
}

const DEFAULT_FORM_DATA: WorkFormData = {
  work_name: '',
  task_name: '',
  deal_name: '',
  category_name: '',
  note: '',
};

const DEFAULT_TIMER: TimerState = {
  is_running: false,
  start_time: null,
  elapsed_seconds: 0,
  active_template_id: null,
};

// 같은 작업 기록 찾기 (같은 날짜 + 같은 작업명 + 같은 거래명)
const findExistingRecord = (
  records: WorkRecord[],
  date: string,
  work_name: string,
  deal_name: string
): WorkRecord | undefined => {
  return records.find(
    (r) => r.date === date && r.work_name === work_name && r.deal_name === deal_name
  );
};

// 새 세션 생성
const createSession = (
  start_time: number,
  end_time: number
): WorkSession => {
  const duration_seconds = Math.floor((end_time - start_time) / 1000);
  
  return {
    id: crypto.randomUUID(),
    start_time: dayjs(start_time).format('HH:mm:ss'),
    end_time: dayjs(end_time).format('HH:mm:ss'),
    duration_seconds,
  };
};

// 세션의 duration을 초 단위로 가져오기 (기존 데이터 호환)
const getSessionSeconds = (session: WorkSession): number => {
  if (session.duration_seconds !== undefined) {
    return session.duration_seconds;
  }
  // 기존 데이터는 duration_minutes 필드가 있을 수 있음
  const legacy = session as unknown as { duration_minutes?: number };
  if (legacy.duration_minutes !== undefined) {
    return legacy.duration_minutes * 60;
  }
  return 0;
};

// 세션들의 총 시간을 분으로 계산 (초 합산 후 올림)
const calculateTotalMinutes = (sessions: WorkSession[]): number => {
  const total_seconds = sessions.reduce((sum, s) => sum + getSessionSeconds(s), 0);
  return Math.max(1, Math.ceil(total_seconds / 60));
};

export const useWorkStore = create<WorkStore>()(
  persist(
    (set, get) => ({
      records: [],
      templates: [],
      timer: DEFAULT_TIMER,
      form_data: DEFAULT_FORM_DATA,
      selected_date: dayjs().format('YYYY-MM-DD'),

      startTimer: (template_id?: string) => {
        set({
          timer: {
            is_running: true,
            start_time: Date.now(),
            elapsed_seconds: 0,
            active_template_id: template_id || null,
          },
        });
      },

      stopTimer: () => {
        const { timer, form_data, records } = get();
        if (!timer.is_running || !timer.start_time) return null;

        const end_time = Date.now();
        const record_date = dayjs(timer.start_time).format('YYYY-MM-DD');
        
        // 새 세션 생성
        const new_session = createSession(timer.start_time, end_time);

        // 같은 날짜에 같은 작업이 있는지 확인
        const existing_record = findExistingRecord(
          records,
          record_date,
          form_data.work_name,
          form_data.deal_name
        );

        if (existing_record) {
          // 기존 기록에 세션 추가 및 시간 합산
          const updated_sessions = [...(existing_record.sessions || []), new_session];
          const total_minutes = calculateTotalMinutes(updated_sessions);
          
          set((state) => ({
            records: state.records.map((r) =>
              r.id === existing_record.id
                ? {
                    ...r,
                    duration_minutes: total_minutes,
                    end_time: new_session.end_time,
                    sessions: updated_sessions,
                  }
                : r
            ),
            timer: DEFAULT_TIMER,
            form_data: DEFAULT_FORM_DATA,
          }));

          return { ...existing_record, duration_minutes: total_minutes };
        } else {
          // 새 기록 생성
          const new_record: WorkRecord = {
            id: crypto.randomUUID(),
            ...form_data,
            duration_minutes: calculateTotalMinutes([new_session]),
            start_time: new_session.start_time,
            end_time: new_session.end_time,
            date: record_date,
            sessions: [new_session],
          };

          set((state) => ({
            records: [...state.records, new_record],
            timer: DEFAULT_TIMER,
            form_data: DEFAULT_FORM_DATA,
          }));

          return new_record;
        }
      },

      // 작업 전환: 현재 작업 저장 후 새 작업 시작
      switchTemplate: (template_id: string) => {
        const { timer, templates, form_data, records } = get();
        const template = templates.find(t => t.id === template_id);
        if (!template) return;

        // 현재 진행 중인 작업이 있으면 저장
        if (timer.is_running && timer.start_time) {
          const end_time = Date.now();
          const record_date = dayjs(timer.start_time).format('YYYY-MM-DD');
          
          // 새 세션 생성
          const new_session = createSession(timer.start_time, end_time);

          // 같은 날짜에 같은 작업이 있는지 확인
          const existing_record = findExistingRecord(
            records,
            record_date,
            form_data.work_name,
            form_data.deal_name
          );

          if (existing_record) {
            // 기존 기록에 세션 추가 및 시간 합산
            const updated_sessions = [...(existing_record.sessions || []), new_session];
            const total_minutes = calculateTotalMinutes(updated_sessions);
            
            set((state) => ({
              records: state.records.map((r) =>
                r.id === existing_record.id
                  ? {
                      ...r,
                      duration_minutes: total_minutes,
                      end_time: new_session.end_time,
                      sessions: updated_sessions,
                    }
                  : r
              ),
            }));
          } else {
            // 새 기록 생성
            const new_record: WorkRecord = {
              id: crypto.randomUUID(),
              ...form_data,
              duration_minutes: calculateTotalMinutes([new_session]),
              start_time: new_session.start_time,
              end_time: new_session.end_time,
              date: record_date,
              sessions: [new_session],
            };

            set((state) => ({
              records: [...state.records, new_record],
            }));
          }
        }

        // 새 템플릿으로 타이머 시작
        set({
          form_data: {
            work_name: template.work_name,
            task_name: template.task_name,
            deal_name: template.deal_name,
            category_name: template.category_name,
            note: template.note,
          },
          timer: {
            is_running: true,
            start_time: Date.now(),
            elapsed_seconds: 0,
            active_template_id: template_id,
          },
        });
      },

      updateElapsedTime: () => {
        const { timer } = get();
        if (!timer.is_running || !timer.start_time) return;

        const elapsed = Math.floor((Date.now() - timer.start_time) / 1000);
        set({
          timer: {
            ...timer,
            elapsed_seconds: elapsed,
          },
        });
      },

      resetTimer: () => {
        set({ timer: DEFAULT_TIMER });
      },

      setFormData: (data) => {
        set((state) => ({
          form_data: { ...state.form_data, ...data },
        }));
      },

      resetFormData: () => {
        set({ form_data: DEFAULT_FORM_DATA });
      },

      addRecord: (record) => {
        set((state) => ({
          records: [...state.records, record],
        }));
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      updateRecord: (id, record) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        }));
      },

      // 템플릿 관리
      addTemplate: (template) => {
        const new_template: WorkTemplate = {
          ...template,
          id: crypto.randomUUID(),
          created_at: dayjs().toISOString(),
        };
        set((state) => ({
          templates: [...state.templates, new_template],
        }));
        return new_template;
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      updateTemplate: (id, template) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...template } : t
          ),
        }));
      },

      applyTemplate: (template_id) => {
        const { templates } = get();
        const template = templates.find(t => t.id === template_id);
        if (!template) return;

        set({
          form_data: {
            work_name: template.work_name,
            task_name: template.task_name,
            deal_name: template.deal_name,
            category_name: template.category_name,
            note: template.note,
          },
        });
      },

      setSelectedDate: (date) => {
        set({ selected_date: date });
      },

      getFilteredRecords: () => {
        const { records, selected_date } = get();
        return records.filter((r) => r.date === selected_date);
      },

      // 자동완성 옵션 생성
      getAutoCompleteOptions: (field) => {
        const { records, templates } = get();
        const values = new Set<string>();
        
        // 기존 레코드에서 추출
        records.forEach((r) => {
          const value = r[field as keyof WorkRecord];
          if (typeof value === 'string' && value.trim()) {
            values.add(value);
          }
        });
        
        // 템플릿에서도 추출
        templates.forEach((t) => {
          const value = t[field as keyof WorkTemplate];
          if (typeof value === 'string' && value.trim()) {
            values.add(value);
          }
        });
        
        return Array.from(values).sort();
      },
    }),
    {
      name: 'work-time-storage',
      partialize: (state) => ({
        records: state.records,
        templates: state.templates,
      }),
    }
  )
);
