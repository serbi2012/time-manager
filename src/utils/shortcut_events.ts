// 단축키 이벤트 유틸리티
// 커스텀 이벤트를 통해 컴포넌트 간 통신

export const SHORTCUT_EVENTS = {
  OPEN_NEW_WORK_MODAL: 'shortcut:openNewWorkModal',
  OPEN_NEW_PRESET_MODAL: 'shortcut:openNewPresetModal',
  OPEN_SETTINGS: 'shortcut:openSettings',
  SHOW_SHORTCUTS: 'shortcut:showShortcuts',
  TOGGLE_TIMER: 'shortcut:toggleTimer',
  RESET_TIMER: 'shortcut:resetTimer',
  GO_TODAY: 'shortcut:goToday',
  PREV_DAY: 'shortcut:prevDay',
  NEXT_DAY: 'shortcut:nextDay',
  GO_DAILY: 'shortcut:goDaily',
  GO_WEEKLY: 'shortcut:goWeekly',
  EXPORT_DATA: 'shortcut:exportData',
  SYNC_DATA: 'shortcut:syncData',
} as const;

// 이벤트 발생
export function emitShortcutEvent(event_name: string) {
  window.dispatchEvent(new CustomEvent(event_name));
}

// 이벤트 리스너 등록/해제 헬퍼
export function addShortcutListener(event_name: string, handler: () => void) {
  window.addEventListener(event_name, handler);
  return () => window.removeEventListener(event_name, handler);
}
