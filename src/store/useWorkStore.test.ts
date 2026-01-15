import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkStore } from './useWorkStore';
import type { WorkRecord, WorkSession } from '../types';

// 점심시간 제외 계산 함수 테스트용 헬퍼
const LUNCH_START_MINUTES = 11 * 60 + 40; // 700분 (11:40)
const LUNCH_END_MINUTES = 12 * 60 + 40; // 760분 (12:40)
const LUNCH_DURATION = LUNCH_END_MINUTES - LUNCH_START_MINUTES; // 60분

const calculateDurationExcludingLunch = (
  start_mins: number,
  end_mins: number
): number => {
  if (end_mins <= LUNCH_START_MINUTES || start_mins >= LUNCH_END_MINUTES) {
    return end_mins - start_mins;
  }
  if (start_mins >= LUNCH_START_MINUTES && end_mins <= LUNCH_END_MINUTES) {
    return 0;
  }
  if (start_mins < LUNCH_START_MINUTES && end_mins > LUNCH_END_MINUTES) {
    return end_mins - start_mins - LUNCH_DURATION;
  }
  if (start_mins < LUNCH_START_MINUTES && end_mins <= LUNCH_END_MINUTES) {
    return LUNCH_START_MINUTES - start_mins;
  }
  if (start_mins >= LUNCH_START_MINUTES && end_mins > LUNCH_END_MINUTES) {
    return end_mins - LUNCH_END_MINUTES;
  }
  return end_mins - start_mins;
};

describe('calculateDurationExcludingLunch', () => {
  it('점심시간 전 작업: 09:00~11:00 = 120분', () => {
    const result = calculateDurationExcludingLunch(9 * 60, 11 * 60);
    expect(result).toBe(120);
  });

  it('점심시간 후 작업: 13:00~15:00 = 120분', () => {
    const result = calculateDurationExcludingLunch(13 * 60, 15 * 60);
    expect(result).toBe(120);
  });

  it('점심시간 완전 포함: 11:40~12:40 = 0분', () => {
    const result = calculateDurationExcludingLunch(LUNCH_START_MINUTES, LUNCH_END_MINUTES);
    expect(result).toBe(0);
  });

  it('점심시간을 걸치는 작업: 11:00~13:00 = 60분 (점심 60분 제외)', () => {
    // 11:00~11:40 (40분) + 12:40~13:00 (20분) = 60분
    const result = calculateDurationExcludingLunch(11 * 60, 13 * 60);
    expect(result).toBe(60);
  });

  it('점심시간 시작 부분과 겹침: 11:00~12:00 = 40분', () => {
    // 11:00~11:40만 유효
    const result = calculateDurationExcludingLunch(11 * 60, 12 * 60);
    expect(result).toBe(40);
  });

  it('점심시간 끝 부분과 겹침: 12:00~13:00 = 20분', () => {
    // 12:40~13:00만 유효
    const result = calculateDurationExcludingLunch(12 * 60, 13 * 60);
    expect(result).toBe(20);
  });
});

describe('useWorkStore', () => {
  beforeEach(() => {
    // 스토어 상태 초기화
    useWorkStore.setState({
      records: [],
      templates: [],
      timer: {
        is_running: false,
        start_time: null,
        active_template_id: null,
        active_form_data: null,
      },
      form_data: {
        project_code: '',
        work_name: '',
        task_name: '',
        deal_name: '',
        category_name: '',
        note: '',
      },
      selected_date: '2026-01-15',
      custom_task_options: [],
      custom_category_options: [],
      hidden_autocomplete_options: {
        work_name: [],
        deal_name: [],
        project_code: [],
      },
    });
  });

  describe('폼 데이터 관리', () => {
    it('setFormData: 폼 데이터 업데이트', () => {
      const { setFormData } = useWorkStore.getState();
      
      setFormData({ work_name: '테스트 작업', deal_name: '테스트 거래' });
      
      const { form_data } = useWorkStore.getState();
      expect(form_data.work_name).toBe('테스트 작업');
      expect(form_data.deal_name).toBe('테스트 거래');
      expect(form_data.project_code).toBe(''); // 변경 안됨
    });

    it('resetFormData: 폼 데이터 초기화', () => {
      const { setFormData, resetFormData } = useWorkStore.getState();
      
      setFormData({ work_name: '테스트', deal_name: '테스트' });
      resetFormData();
      
      const { form_data } = useWorkStore.getState();
      expect(form_data.work_name).toBe('');
      expect(form_data.deal_name).toBe('');
    });
  });

  describe('레코드 관리', () => {
    const mock_record: WorkRecord = {
      id: 'test-record-1',
      project_code: 'A00_00000',
      work_name: '테스트 작업',
      task_name: '개발',
      deal_name: '테스트 거래',
      category_name: '개발',
      duration_minutes: 60,
      note: '',
      start_time: '09:00',
      end_time: '10:00',
      date: '2026-01-15',
      sessions: [
        {
          id: 'session-1',
          date: '2026-01-15',
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
        },
      ],
      is_completed: false,
    };

    it('addRecord: 레코드 추가', () => {
      const { addRecord } = useWorkStore.getState();
      
      addRecord(mock_record);
      
      const { records } = useWorkStore.getState();
      expect(records).toHaveLength(1);
      expect(records[0].work_name).toBe('테스트 작업');
    });

    it('updateRecord: 레코드 수정', () => {
      const { addRecord, updateRecord } = useWorkStore.getState();
      
      addRecord(mock_record);
      updateRecord('test-record-1', { deal_name: '수정된 거래' });
      
      const { records } = useWorkStore.getState();
      expect(records[0].deal_name).toBe('수정된 거래');
    });

    it('deleteRecord: 레코드 삭제', () => {
      const { addRecord, deleteRecord } = useWorkStore.getState();
      
      addRecord(mock_record);
      deleteRecord('test-record-1');
      
      const { records } = useWorkStore.getState();
      expect(records).toHaveLength(0);
    });

    it('softDeleteRecord: 휴지통으로 이동', () => {
      const { addRecord, softDeleteRecord, getDeletedRecords } = useWorkStore.getState();
      
      addRecord(mock_record);
      softDeleteRecord('test-record-1');
      
      const { records } = useWorkStore.getState();
      expect(records[0].is_deleted).toBe(true);
      expect(records[0].deleted_at).toBeDefined();
      
      const deleted = getDeletedRecords();
      expect(deleted).toHaveLength(1);
    });

    it('restoreRecord: 휴지통에서 복원', () => {
      const { addRecord, softDeleteRecord, restoreRecord } = useWorkStore.getState();
      
      addRecord(mock_record);
      softDeleteRecord('test-record-1');
      restoreRecord('test-record-1');
      
      const { records } = useWorkStore.getState();
      expect(records[0].is_deleted).toBe(false);
    });

    it('markAsCompleted: 작업 완료 처리', () => {
      const { addRecord, markAsCompleted, getCompletedRecords } = useWorkStore.getState();
      
      addRecord(mock_record);
      markAsCompleted('test-record-1');
      
      const { records } = useWorkStore.getState();
      expect(records[0].is_completed).toBe(true);
      expect(records[0].completed_at).toBeDefined();
      
      const completed = getCompletedRecords();
      expect(completed).toHaveLength(1);
    });

    it('markAsIncomplete: 완료 취소', () => {
      const { addRecord, markAsCompleted, markAsIncomplete } = useWorkStore.getState();
      
      addRecord(mock_record);
      markAsCompleted('test-record-1');
      markAsIncomplete('test-record-1');
      
      const { records } = useWorkStore.getState();
      expect(records[0].is_completed).toBe(false);
    });
  });

  describe('세션 관리', () => {
    const mock_record: WorkRecord = {
      id: 'test-record-1',
      project_code: 'A00_00000',
      work_name: '테스트 작업',
      task_name: '개발',
      deal_name: '테스트 거래',
      category_name: '개발',
      duration_minutes: 60,
      note: '',
      start_time: '09:00',
      end_time: '10:00',
      date: '2026-01-15',
      sessions: [
        {
          id: 'session-1',
          date: '2026-01-15',
          start_time: '09:00',
          end_time: '10:00',
          duration_minutes: 60,
        },
      ],
      is_completed: false,
    };

    it('updateSession: 세션 시간 수정', () => {
      const { addRecord, updateSession } = useWorkStore.getState();
      
      addRecord(mock_record);
      const result = updateSession('test-record-1', 'session-1', '10:00', '11:00');
      
      expect(result.success).toBe(true);
      
      const { records } = useWorkStore.getState();
      expect(records[0].sessions[0].start_time).toBe('10:00');
      expect(records[0].sessions[0].end_time).toBe('11:00');
    });

    it('updateSession: 종료 시간이 시작 시간보다 빠르면 실패', () => {
      const { addRecord, updateSession } = useWorkStore.getState();
      
      addRecord(mock_record);
      const result = updateSession('test-record-1', 'session-1', '10:00', '09:00');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('시작 시간보다');
    });

    it('updateSession: 시간 충돌 시 자동 조정', () => {
      const { addRecord, updateSession } = useWorkStore.getState();
      
      // 두 개의 세션이 있는 레코드 추가
      const record_with_two_sessions: WorkRecord = {
        ...mock_record,
        sessions: [
          {
            id: 'session-1',
            date: '2026-01-15',
            start_time: '09:00',
            end_time: '10:00',
            duration_minutes: 60,
          },
          {
            id: 'session-2',
            date: '2026-01-15',
            start_time: '11:00',
            end_time: '12:00',
            duration_minutes: 60,
          },
        ],
      };
      
      addRecord(record_with_two_sessions);
      
      // session-1을 10:30~11:30으로 변경 시도 (session-2와 충돌)
      const result = updateSession('test-record-1', 'session-1', '10:30', '11:30');
      
      // 자동 조정되어 성공해야 함
      expect(result.success).toBe(true);
      expect(result.adjusted).toBe(true);
    });

    it('deleteSession: 세션 삭제', () => {
      const { addRecord, deleteSession } = useWorkStore.getState();
      
      const record_with_two_sessions: WorkRecord = {
        ...mock_record,
        sessions: [
          {
            id: 'session-1',
            date: '2026-01-15',
            start_time: '09:00',
            end_time: '10:00',
            duration_minutes: 60,
          },
          {
            id: 'session-2',
            date: '2026-01-15',
            start_time: '11:00',
            end_time: '12:00',
            duration_minutes: 60,
          },
        ],
        duration_minutes: 120,
      };
      
      addRecord(record_with_two_sessions);
      deleteSession('test-record-1', 'session-1');
      
      const { records } = useWorkStore.getState();
      expect(records[0].sessions).toHaveLength(1);
      expect(records[0].sessions[0].id).toBe('session-2');
    });

    it('deleteSession: 마지막 세션 삭제 시 레코드도 삭제', () => {
      const { addRecord, deleteSession } = useWorkStore.getState();
      
      addRecord(mock_record);
      deleteSession('test-record-1', 'session-1');
      
      const { records } = useWorkStore.getState();
      expect(records).toHaveLength(0);
    });
  });

  describe('템플릿 관리', () => {
    it('addTemplate: 템플릿 추가', () => {
      const { addTemplate } = useWorkStore.getState();
      
      const template = addTemplate({
        project_code: 'A00_00000',
        work_name: '테스트 작업',
        task_name: '개발',
        deal_name: '테스트 거래',
        category_name: '개발',
        note: '',
        color: '#1890ff',
      });
      
      expect(template.id).toBeDefined();
      expect(template.created_at).toBeDefined();
      
      const { templates } = useWorkStore.getState();
      expect(templates).toHaveLength(1);
    });

    it('updateTemplate: 템플릿 수정', () => {
      const { addTemplate, updateTemplate } = useWorkStore.getState();
      
      const template = addTemplate({
        project_code: 'A00_00000',
        work_name: '테스트 작업',
        task_name: '개발',
        deal_name: '테스트 거래',
        category_name: '개발',
        note: '',
        color: '#1890ff',
      });
      
      updateTemplate(template.id, { deal_name: '수정된 거래' });
      
      const { templates } = useWorkStore.getState();
      expect(templates[0].deal_name).toBe('수정된 거래');
    });

    it('deleteTemplate: 템플릿 삭제', () => {
      const { addTemplate, deleteTemplate } = useWorkStore.getState();
      
      const template = addTemplate({
        project_code: 'A00_00000',
        work_name: '테스트 작업',
        task_name: '개발',
        deal_name: '테스트 거래',
        category_name: '개발',
        note: '',
        color: '#1890ff',
      });
      
      deleteTemplate(template.id);
      
      const { templates } = useWorkStore.getState();
      expect(templates).toHaveLength(0);
    });

    it('applyTemplate: 템플릿을 폼에 적용', () => {
      const { addTemplate, applyTemplate } = useWorkStore.getState();
      
      const template = addTemplate({
        project_code: 'A00_00000',
        work_name: '테스트 작업',
        task_name: '개발',
        deal_name: '테스트 거래',
        category_name: '개발',
        note: '테스트 메모',
        color: '#1890ff',
      });
      
      applyTemplate(template.id);
      
      const { form_data } = useWorkStore.getState();
      expect(form_data.work_name).toBe('테스트 작업');
      expect(form_data.deal_name).toBe('테스트 거래');
      expect(form_data.note).toBe('테스트 메모');
    });
  });

  describe('날짜 필터링', () => {
    it('getFilteredRecords: 선택된 날짜의 레코드만 반환', () => {
      const { addRecord, setSelectedDate, getFilteredRecords } = useWorkStore.getState();
      
      addRecord({
        id: 'record-1',
        project_code: 'A00_00000',
        work_name: '작업1',
        task_name: '개발',
        deal_name: '거래1',
        category_name: '개발',
        duration_minutes: 60,
        note: '',
        start_time: '09:00',
        end_time: '10:00',
        date: '2026-01-15',
        sessions: [],
        is_completed: false,
      });
      
      addRecord({
        id: 'record-2',
        project_code: 'A00_00000',
        work_name: '작업2',
        task_name: '개발',
        deal_name: '거래2',
        category_name: '개발',
        duration_minutes: 60,
        note: '',
        start_time: '09:00',
        end_time: '10:00',
        date: '2026-01-16',
        sessions: [],
        is_completed: false,
      });
      
      setSelectedDate('2026-01-15');
      const filtered = getFilteredRecords();
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].work_name).toBe('작업1');
    });

    it('getIncompleteRecords: 미완료 작업 반환 (과거 포함)', () => {
      const { addRecord, setSelectedDate, getIncompleteRecords } = useWorkStore.getState();
      
      // 과거 미완료 작업
      addRecord({
        id: 'record-1',
        project_code: 'A00_00000',
        work_name: '과거 작업',
        task_name: '개발',
        deal_name: '거래1',
        category_name: '개발',
        duration_minutes: 60,
        note: '',
        start_time: '09:00',
        end_time: '10:00',
        date: '2026-01-14',
        sessions: [],
        is_completed: false,
      });
      
      // 오늘 작업
      addRecord({
        id: 'record-2',
        project_code: 'A00_00000',
        work_name: '오늘 작업',
        task_name: '개발',
        deal_name: '거래2',
        category_name: '개발',
        duration_minutes: 60,
        note: '',
        start_time: '09:00',
        end_time: '10:00',
        date: '2026-01-15',
        sessions: [],
        is_completed: false,
      });
      
      setSelectedDate('2026-01-15');
      const incomplete = getIncompleteRecords();
      
      // 과거 미완료 + 오늘 미완료 = 2개
      expect(incomplete).toHaveLength(2);
    });
  });

  describe('타이머', () => {
    it('startTimer: 타이머 시작', () => {
      const { setFormData, startTimer } = useWorkStore.getState();
      
      setFormData({
        work_name: '테스트 작업',
        deal_name: '테스트 거래',
      });
      
      const before = Date.now();
      startTimer();
      const after = Date.now();
      
      const { timer } = useWorkStore.getState();
      expect(timer.is_running).toBe(true);
      expect(timer.start_time).toBeGreaterThanOrEqual(before);
      expect(timer.start_time).toBeLessThanOrEqual(after);
      expect(timer.active_form_data?.work_name).toBe('테스트 작업');
    });

    it('getElapsedSeconds: 경과 시간 계산', () => {
      const { setFormData, startTimer, getElapsedSeconds } = useWorkStore.getState();
      
      setFormData({ work_name: '테스트' });
      
      // 5초 전에 시작한 것처럼 설정
      const five_seconds_ago = Date.now() - 5000;
      useWorkStore.setState({
        timer: {
          is_running: true,
          start_time: five_seconds_ago,
          active_template_id: null,
          active_form_data: { work_name: '테스트', deal_name: '', task_name: '', category_name: '', project_code: '', note: '' },
        },
      });
      
      const elapsed = getElapsedSeconds();
      expect(elapsed).toBeGreaterThanOrEqual(5);
      expect(elapsed).toBeLessThan(10); // 약간의 오차 허용
    });

    it('resetTimer: 타이머 초기화', () => {
      const { setFormData, startTimer, resetTimer } = useWorkStore.getState();
      
      setFormData({ work_name: '테스트 작업' });
      startTimer();
      resetTimer();
      
      const { timer, form_data } = useWorkStore.getState();
      expect(timer.is_running).toBe(false);
      expect(timer.start_time).toBeNull();
      expect(form_data.work_name).toBe('');
    });
  });

  describe('자동완성 옵션', () => {
    it('getAutoCompleteOptions: 레코드에서 옵션 추출', () => {
      const { addRecord, getAutoCompleteOptions } = useWorkStore.getState();
      
      addRecord({
        id: 'record-1',
        project_code: 'A00_00000',
        work_name: '작업1',
        task_name: '개발',
        deal_name: '거래1',
        category_name: '개발',
        duration_minutes: 60,
        note: '',
        start_time: '09:00',
        end_time: '10:00',
        date: '2026-01-15',
        sessions: [],
        is_completed: false,
      });
      
      addRecord({
        id: 'record-2',
        project_code: 'A00_00000',
        work_name: '작업2',
        task_name: '개발',
        deal_name: '거래2',
        category_name: '개발',
        duration_minutes: 60,
        note: '',
        start_time: '09:00',
        end_time: '10:00',
        date: '2026-01-15',
        sessions: [],
        is_completed: false,
      });
      
      const work_names = getAutoCompleteOptions('work_name');
      expect(work_names).toContain('작업1');
      expect(work_names).toContain('작업2');
    });

    it('hideAutoCompleteOption: 옵션 숨김', () => {
      const { addRecord, hideAutoCompleteOption, getAutoCompleteOptions } = useWorkStore.getState();
      
      addRecord({
        id: 'record-1',
        project_code: 'A00_00000',
        work_name: '숨길 작업',
        task_name: '개발',
        deal_name: '거래1',
        category_name: '개발',
        duration_minutes: 60,
        note: '',
        start_time: '09:00',
        end_time: '10:00',
        date: '2026-01-15',
        sessions: [],
        is_completed: false,
      });
      
      hideAutoCompleteOption('work_name', '숨길 작업');
      
      const work_names = getAutoCompleteOptions('work_name');
      expect(work_names).not.toContain('숨길 작업');
    });

    it('unhideAutoCompleteOption: 숨김 해제', () => {
      const { addRecord, hideAutoCompleteOption, unhideAutoCompleteOption, getAutoCompleteOptions } = useWorkStore.getState();
      
      addRecord({
        id: 'record-1',
        project_code: 'A00_00000',
        work_name: '테스트 작업',
        task_name: '개발',
        deal_name: '거래1',
        category_name: '개발',
        duration_minutes: 60,
        note: '',
        start_time: '09:00',
        end_time: '10:00',
        date: '2026-01-15',
        sessions: [],
        is_completed: false,
      });
      
      hideAutoCompleteOption('work_name', '테스트 작업');
      unhideAutoCompleteOption('work_name', '테스트 작업');
      
      const work_names = getAutoCompleteOptions('work_name');
      expect(work_names).toContain('테스트 작업');
    });
  });

  describe('사용자 정의 옵션', () => {
    it('addCustomTaskOption: 사용자 정의 업무명 추가', () => {
      const { addCustomTaskOption } = useWorkStore.getState();
      
      addCustomTaskOption('커스텀 업무');
      
      const { custom_task_options } = useWorkStore.getState();
      expect(custom_task_options).toContain('커스텀 업무');
    });

    it('addCustomCategoryOption: 사용자 정의 카테고리명 추가', () => {
      const { addCustomCategoryOption } = useWorkStore.getState();
      
      addCustomCategoryOption('커스텀 카테고리');
      
      const { custom_category_options } = useWorkStore.getState();
      expect(custom_category_options).toContain('커스텀 카테고리');
    });

    it('removeCustomTaskOption: 사용자 정의 업무명 삭제', () => {
      const { addCustomTaskOption, removeCustomTaskOption } = useWorkStore.getState();
      
      addCustomTaskOption('삭제할 업무');
      removeCustomTaskOption('삭제할 업무');
      
      const { custom_task_options } = useWorkStore.getState();
      expect(custom_task_options).not.toContain('삭제할 업무');
    });
  });
});
