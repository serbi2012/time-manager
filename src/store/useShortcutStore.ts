// 단축키 설정 Store
import { create } from "zustand";
import { SHORTCUT_LABELS, SHORTCUT_CATEGORIES } from "@/shared/constants";

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
        id: "new-work",
        name: SHORTCUT_LABELS.addNewWork,
        description: SHORTCUT_LABELS.addNewWorkDesc,
        keys: "Alt+N",
        category: "general",
        enabled: true,
        action: "openNewWorkModal",
    },
    {
        id: "new-preset",
        name: SHORTCUT_LABELS.addNewPreset,
        description: SHORTCUT_LABELS.addNewPresetDesc,
        keys: "Alt+P",
        category: "general",
        enabled: true,
        action: "openNewPresetModal",
    },
    {
        id: "open-settings",
        name: SHORTCUT_LABELS.openSettings,
        description: SHORTCUT_LABELS.openSettingsDesc,
        keys: "Alt+,",
        category: "general",
        enabled: true,
        action: "openSettings",
    },
    {
        id: "show-shortcuts",
        name: SHORTCUT_LABELS.shortcutHelp,
        description: SHORTCUT_LABELS.shortcutHelpDesc,
        keys: "Alt+/",
        category: "general",
        enabled: true,
        action: "showShortcuts",
    },
    // 타이머
    {
        id: "start-stop-timer",
        name: SHORTCUT_LABELS.timerToggle,
        description: SHORTCUT_LABELS.timerToggleDesc,
        keys: "Alt+S",
        category: "timer",
        enabled: true,
        action: "toggleTimer",
    },
    {
        id: "reset-timer",
        name: SHORTCUT_LABELS.timerReset,
        description: SHORTCUT_LABELS.timerResetDesc,
        keys: "Alt+R",
        category: "timer",
        enabled: true,
        action: "resetTimer",
    },
    // 네비게이션
    {
        id: "go-today",
        name: SHORTCUT_LABELS.goToToday,
        description: SHORTCUT_LABELS.goToTodayDesc,
        keys: "Alt+T",
        category: "navigation",
        enabled: true,
        action: "goToday",
    },
    {
        id: "prev-day",
        name: SHORTCUT_LABELS.prevDate,
        description: SHORTCUT_LABELS.prevDateDesc,
        keys: "Alt+Left",
        category: "navigation",
        enabled: true,
        action: "prevDay",
    },
    {
        id: "next-day",
        name: SHORTCUT_LABELS.nextDate,
        description: SHORTCUT_LABELS.nextDateDesc,
        keys: "Alt+Right",
        category: "navigation",
        enabled: true,
        action: "nextDay",
    },
    {
        id: "go-daily",
        name: SHORTCUT_LABELS.dailyPage,
        description: SHORTCUT_LABELS.dailyPageDesc,
        keys: "Alt+1",
        category: "navigation",
        enabled: true,
        action: "goDaily",
    },
    {
        id: "go-weekly",
        name: SHORTCUT_LABELS.weeklyPage,
        description: SHORTCUT_LABELS.weeklyPageDesc,
        keys: "Alt+2",
        category: "navigation",
        enabled: true,
        action: "goWeekly",
    },
    // 일반 - 모달 제출
    {
        id: "modal-submit",
        name: SHORTCUT_LABELS.modalSave,
        description: SHORTCUT_LABELS.modalSaveDesc,
        keys: "F8",
        category: "general",
        enabled: true,
        action: "modalSubmit",
    },
    // 데이터
    {
        id: "export-data",
        name: SHORTCUT_LABELS.exportData,
        description: SHORTCUT_LABELS.exportDataDesc,
        keys: "Alt+E",
        category: "data",
        enabled: true,
        action: "exportData",
    },
    {
        id: "sync-data",
        name: SHORTCUT_LABELS.manualSync,
        description: SHORTCUT_LABELS.manualSyncDesc,
        keys: "Alt+Shift+S",
        category: "data",
        enabled: true,
        action: "syncData",
    },
];

// 카테고리 라벨
export const CATEGORY_LABELS: Record<ShortcutDefinition["category"], string> = {
    general: SHORTCUT_CATEGORIES.general,
    timer: SHORTCUT_CATEGORIES.timer,
    navigation: SHORTCUT_CATEGORIES.navigation,
    data: SHORTCUT_CATEGORIES.data,
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
            message: SHORTCUT_LABELS.duplicateShortcut(duplicate.name),
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
