// 단축키 설정 Store
import { create } from 'zustand';

// 단축키 정의 타입
export interface ShortcutDefinition {
  id: string;
  name: string;
  description: string;
  keys: string;           // 예: "Alt+N", "Ctrl+Shift+S"
  category: 'general' | 'timer' | 'navigation' | 'data';
  enabled: boolean;
  action: string;         // 액션 식별자
}

// 기본 단축키 목록
export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // 일반
  {
    id: 'new-work',
    name: '새 작업 추가',
    description: '작업 기록에 새 작업을 추가하는 모달을 엽니다',
    keys: 'Alt+N',
    category: 'general',
    enabled: true,
    action: 'openNewWorkModal',
  },
  {
    id: 'new-preset',
    name: '새 프리셋 추가',
    description: '새 작업 프리셋을 추가하는 모달을 엽니다',
    keys: 'Alt+P',
    category: 'general',
    enabled: true,
    action: 'openNewPresetModal',
  },
  {
    id: 'open-settings',
    name: '설정 열기',
    description: '설정 모달을 엽니다',
    keys: 'Alt+,',
    category: 'general',
    enabled: true,
    action: 'openSettings',
  },
  {
    id: 'show-shortcuts',
    name: '단축키 도움말',
    description: '단축키 목록을 표시합니다',
    keys: 'Alt+/',
    category: 'general',
    enabled: true,
    action: 'showShortcuts',
  },
  
  // 타이머
  {
    id: 'start-stop-timer',
    name: '타이머 시작/중지',
    description: '현재 작업의 타이머를 시작하거나 중지합니다',
    keys: 'Alt+S',
    category: 'timer',
    enabled: true,
    action: 'toggleTimer',
  },
  {
    id: 'reset-timer',
    name: '타이머 초기화',
    description: '타이머를 초기화합니다',
    keys: 'Alt+R',
    category: 'timer',
    enabled: true,
    action: 'resetTimer',
  },
  
  // 네비게이션
  {
    id: 'go-today',
    name: '오늘로 이동',
    description: '오늘 날짜로 이동합니다',
    keys: 'Alt+T',
    category: 'navigation',
    enabled: true,
    action: 'goToday',
  },
  {
    id: 'prev-day',
    name: '이전 날짜',
    description: '이전 날짜로 이동합니다',
    keys: 'Alt+Left',
    category: 'navigation',
    enabled: true,
    action: 'prevDay',
  },
  {
    id: 'next-day',
    name: '다음 날짜',
    description: '다음 날짜로 이동합니다',
    keys: 'Alt+Right',
    category: 'navigation',
    enabled: true,
    action: 'nextDay',
  },
  {
    id: 'go-daily',
    name: '일간 기록 페이지',
    description: '일간 기록 페이지로 이동합니다',
    keys: 'Alt+1',
    category: 'navigation',
    enabled: true,
    action: 'goDaily',
  },
  {
    id: 'go-weekly',
    name: '주간 일정 페이지',
    description: '주간 일정 페이지로 이동합니다',
    keys: 'Alt+2',
    category: 'navigation',
    enabled: true,
    action: 'goWeekly',
  },
  
  // 일반 - 모달 제출
  {
    id: 'modal-submit',
    name: '모달 저장/추가',
    description: '작업 추가, 수정, 프리셋 추가 등 모달에서 저장/추가 실행',
    keys: 'F8',
    category: 'general',
    enabled: true,
    action: 'modalSubmit',
  },
  
  // 데이터
  {
    id: 'export-data',
    name: '데이터 내보내기',
    description: '데이터를 JSON 파일로 내보냅니다',
    keys: 'Alt+E',
    category: 'data',
    enabled: true,
    action: 'exportData',
  },
  {
    id: 'sync-data',
    name: '수동 동기화',
    description: '클라우드와 수동으로 동기화합니다',
    keys: 'Alt+Shift+S',
    category: 'data',
    enabled: true,
    action: 'syncData',
  },
];

// 카테고리 라벨
export const CATEGORY_LABELS: Record<ShortcutDefinition['category'], string> = {
  general: '일반',
  timer: '타이머',
  navigation: '네비게이션',
  data: '데이터',
};

interface ShortcutStore {
  shortcuts: ShortcutDefinition[];
  
  // 단축키 활성화/비활성화
  toggleShortcut: (id: string) => void;
  setShortcutEnabled: (id: string, enabled: boolean) => void;
  
  // 단축키 키 조합 변경
  setShortcutKeys: (id: string, keys: string) => { success: boolean; message?: string };
  
  // 단축키 가져오기
  getShortcut: (id: string) => ShortcutDefinition | undefined;
  getEnabledShortcuts: () => ShortcutDefinition[];
  getShortcutsByCategory: (category: ShortcutDefinition['category']) => ShortcutDefinition[];
  
  // 단축키 키 조합으로 찾기
  findByKeys: (keys: string) => ShortcutDefinition | undefined;
  
  // 중복 검사 (자기 자신 제외)
  isKeysDuplicate: (keys: string, excludeId?: string) => boolean;
  
  // 초기화
  resetToDefault: () => void;
  
  // Firebase 동기화용
  setShortcuts: (shortcuts: ShortcutDefinition[]) => void;
}

// 로컬스토리지에서 단축키 설정 로드
const loadShortcutsFromStorage = (): ShortcutDefinition[] => {
  try {
    const stored = localStorage.getItem('shortcut-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      // 기존 설정과 기본값 병합 (새로운 단축키 추가 대응)
      return DEFAULT_SHORTCUTS.map(defaultShortcut => {
        const storedShortcut = parsed.find((s: ShortcutDefinition) => s.id === defaultShortcut.id);
        return storedShortcut 
          ? { 
              ...defaultShortcut, 
              enabled: storedShortcut.enabled,
              keys: storedShortcut.keys || defaultShortcut.keys, // 사용자 지정 키 조합 로드
            }
          : defaultShortcut;
      });
    }
  } catch {
    // 파싱 실패 시 기본값 사용
  }
  return [...DEFAULT_SHORTCUTS];
};

// 로컬스토리지에 단축키 설정 저장
const saveShortcutsToStorage = (shortcuts: ShortcutDefinition[]) => {
  try {
    localStorage.setItem('shortcut-settings', JSON.stringify(shortcuts));
  } catch {
    // 저장 실패 무시
  }
};

export const useShortcutStore = create<ShortcutStore>()((set, get) => ({
  shortcuts: loadShortcutsFromStorage(),
  
  toggleShortcut: (id) => {
    set((state) => {
      const updated = state.shortcuts.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      );
      saveShortcutsToStorage(updated);
      return { shortcuts: updated };
    });
  },
  
  setShortcutEnabled: (id, enabled) => {
    set((state) => {
      const updated = state.shortcuts.map((s) =>
        s.id === id ? { ...s, enabled } : s
      );
      saveShortcutsToStorage(updated);
      return { shortcuts: updated };
    });
  },
  
  setShortcutKeys: (id, keys) => {
    const state = get();
    
    // 중복 검사 (자기 자신 제외)
    const duplicate = state.shortcuts.find(
      (s) => s.id !== id && s.keys.toLowerCase() === keys.toLowerCase()
    );
    
    if (duplicate) {
      return { 
        success: false, 
        message: `이미 "${duplicate.name}"에서 사용 중인 단축키입니다` 
      };
    }
    
    set((state) => {
      const updated = state.shortcuts.map((s) =>
        s.id === id ? { ...s, keys } : s
      );
      saveShortcutsToStorage(updated);
      return { shortcuts: updated };
    });
    
    return { success: true };
  },
  
  getShortcut: (id) => {
    return get().shortcuts.find((s) => s.id === id);
  },
  
  getEnabledShortcuts: () => {
    return get().shortcuts.filter((s) => s.enabled);
  },
  
  getShortcutsByCategory: (category) => {
    return get().shortcuts.filter((s) => s.category === category);
  },
  
  findByKeys: (keys) => {
    return get().shortcuts.find((s) => s.enabled && s.keys.toLowerCase() === keys.toLowerCase());
  },
  
  isKeysDuplicate: (keys, excludeId) => {
    return get().shortcuts.some(
      (s) => s.id !== excludeId && s.keys.toLowerCase() === keys.toLowerCase()
    );
  },
  
  resetToDefault: () => {
    const defaultShortcuts = [...DEFAULT_SHORTCUTS];
    saveShortcutsToStorage(defaultShortcuts);
    set({ shortcuts: defaultShortcuts });
  },
  
  setShortcuts: (shortcuts) => {
    saveShortcutsToStorage(shortcuts);
    set({ shortcuts });
  },
}));
