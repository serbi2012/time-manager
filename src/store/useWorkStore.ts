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
  
  // 사용자 정의 옵션 (업무명, 카테고리명)
  custom_task_options: string[];
  custom_category_options: string[];
  
  // 타이머 액션
  startTimer: (template_id?: string) => void;
  stopTimer: () => WorkRecord | null;
  getElapsedSeconds: () => number;  // 실시간 경과 시간 계산
  resetTimer: () => void;
  switchTemplate: (template_id: string) => void;
  syncFromStorage: () => void;      // 다른 탭과 동기화
  
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
  getIncompleteRecords: () => WorkRecord[];  // 미완료 작업 (선택 날짜 + 과거 미완료)
  getCompletedRecords: () => WorkRecord[];   // 완료된 작업 목록
  
  // 완료 상태 관리
  markAsCompleted: (id: string) => void;
  markAsIncomplete: (id: string) => void;
  
  // 자동완성 헬퍼
  getAutoCompleteOptions: (field: keyof WorkFormData) => string[];
  
  // 사용자 정의 옵션 관리
  addCustomTaskOption: (option: string) => void;
  addCustomCategoryOption: (option: string) => void;
  removeCustomTaskOption: (option: string) => void;
  removeCustomCategoryOption: (option: string) => void;
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
  active_template_id: null,
  active_form_data: null,
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

// 기본 업무명/카테고리명 옵션
export const DEFAULT_TASK_OPTIONS = ['개발', '작업', '분석', '설계', '테스트', '기타'];
export const DEFAULT_CATEGORY_OPTIONS = ['개발', '문서작업', '회의', '환경세팅', '코드리뷰', '테스트', '기타'];

export const useWorkStore = create<WorkStore>()(
  persist(
    (set, get) => ({
      records: [],
      templates: [],
      timer: DEFAULT_TIMER,
      form_data: DEFAULT_FORM_DATA,
      selected_date: dayjs().format('YYYY-MM-DD'),
      custom_task_options: [],
      custom_category_options: [],

      startTimer: (template_id?: string) => {
        const { form_data } = get();
        set({
          timer: {
            is_running: true,
            start_time: Date.now(),
            active_template_id: template_id || null,
            active_form_data: { ...form_data },  // 진행 중인 작업 정보 저장
          },
        });
      },

      stopTimer: () => {
        const { timer, records } = get();
        if (!timer.is_running || !timer.start_time || !timer.active_form_data) return null;

        const active_form = timer.active_form_data;
        const end_time = Date.now();
        const record_date = dayjs(timer.start_time).format('YYYY-MM-DD');
        
        // 새 세션 생성
        const new_session = createSession(timer.start_time, end_time);

        // 같은 날짜에 같은 작업이 있는지 확인
        const existing_record = findExistingRecord(
          records,
          record_date,
          active_form.work_name,
          active_form.deal_name
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
            ...active_form,
            duration_minutes: calculateTotalMinutes([new_session]),
            start_time: new_session.start_time,
            end_time: new_session.end_time,
            date: record_date,
            sessions: [new_session],
            is_completed: false,
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
        const { timer, templates, records } = get();
        const template = templates.find(t => t.id === template_id);
        if (!template) return;

        // 현재 진행 중인 작업이 있으면 저장
        if (timer.is_running && timer.start_time && timer.active_form_data) {
          const active_form = timer.active_form_data;
          const end_time = Date.now();
          const record_date = dayjs(timer.start_time).format('YYYY-MM-DD');
          
          // 새 세션 생성
          const new_session = createSession(timer.start_time, end_time);

          // 같은 날짜에 같은 작업이 있는지 확인
          const existing_record = findExistingRecord(
            records,
            record_date,
            active_form.work_name,
            active_form.deal_name
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
              ...active_form,
              duration_minutes: calculateTotalMinutes([new_session]),
              start_time: new_session.start_time,
              end_time: new_session.end_time,
              date: record_date,
              sessions: [new_session],
              is_completed: false,
            };

            set((state) => ({
              records: [...state.records, new_record],
            }));
          }
        }

        // 새 템플릿으로 타이머 시작
        const new_form_data = {
          work_name: template.work_name,
          task_name: template.task_name,
          deal_name: template.deal_name,
          category_name: template.category_name,
          note: template.note,
        };
        set({
          form_data: new_form_data,
          timer: {
            is_running: true,
            start_time: Date.now(),
            active_template_id: template_id,
            active_form_data: new_form_data,
          },
        });
      },

      // 경과 시간을 실시간으로 계산 (저장하지 않음)
      getElapsedSeconds: () => {
        const { timer } = get();
        if (!timer.is_running || !timer.start_time) return 0;
        return Math.floor((Date.now() - timer.start_time) / 1000);
      },

      resetTimer: () => {
        set({ timer: DEFAULT_TIMER, form_data: DEFAULT_FORM_DATA });
      },

      // 다른 탭에서 변경된 상태 동기화
      syncFromStorage: () => {
        const stored = localStorage.getItem('work-time-storage');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.state) {
              set({
                records: parsed.state.records || [],
                templates: parsed.state.templates || [],
                timer: parsed.state.timer || DEFAULT_TIMER,
                form_data: parsed.state.timer?.active_form_data || DEFAULT_FORM_DATA,
                custom_task_options: parsed.state.custom_task_options || [],
                custom_category_options: parsed.state.custom_category_options || [],
              });
            }
          } catch {
            // parse error - ignore
          }
        }
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

      // 미완료 작업: 선택된 날짜의 레코드 + 과거 미완료 레코드
      getIncompleteRecords: () => {
        const { records, selected_date } = get();
        return records.filter((r) => {
          // 완료된 레코드는 제외
          if (r.is_completed) return false;
          // 선택된 날짜의 레코드 또는 과거의 미완료 레코드
          return r.date <= selected_date;
        });
      },

      // 완료된 작업 목록
      getCompletedRecords: () => {
        const { records } = get();
        return records
          .filter((r) => r.is_completed)
          .sort((a, b) => {
            // 완료 시간 기준 내림차순 정렬
            const a_time = a.completed_at || a.date;
            const b_time = b.completed_at || b.date;
            return b_time.localeCompare(a_time);
          });
      },

      // 완료 상태 관리
      markAsCompleted: (id: string) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? { ...r, is_completed: true, completed_at: new Date().toISOString() }
              : r
          ),
        }));
      },

      markAsIncomplete: (id: string) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? { ...r, is_completed: false, completed_at: undefined }
              : r
          ),
        }));
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

      // 사용자 정의 옵션 관리
      addCustomTaskOption: (option) => {
        const trimmed = option.trim();
        if (!trimmed) return;
        set((state) => ({
          custom_task_options: state.custom_task_options.includes(trimmed)
            ? state.custom_task_options
            : [...state.custom_task_options, trimmed],
        }));
      },

      addCustomCategoryOption: (option) => {
        const trimmed = option.trim();
        if (!trimmed) return;
        set((state) => ({
          custom_category_options: state.custom_category_options.includes(trimmed)
            ? state.custom_category_options
            : [...state.custom_category_options, trimmed],
        }));
      },

      removeCustomTaskOption: (option) => {
        set((state) => ({
          custom_task_options: state.custom_task_options.filter((o) => o !== option),
        }));
      },

      removeCustomCategoryOption: (option) => {
        set((state) => ({
          custom_category_options: state.custom_category_options.filter((o) => o !== option),
        }));
      },
    }),
    {
      name: 'work-time-storage',
      partialize: (state) => ({
        records: state.records,
        templates: state.templates,
        timer: state.timer,  // 타이머 상태도 저장 (탭 간 동기화)
        custom_task_options: state.custom_task_options,
        custom_category_options: state.custom_category_options,
      }),
      onRehydrateStorage: () => (state) => {
        // 저장소에서 복원 시 form_data도 동기화
        if (state?.timer?.active_form_data) {
          state.form_data = state.timer.active_form_data;
        }
      },
    }
  )
);
