// 단축키 이벤트 훅
import { useEffect, useCallback } from 'react';
import { useShortcutStore } from '../store/useShortcutStore';

// 키보드 이벤트를 단축키 문자열로 변환
const eventToKeyString = (e: KeyboardEvent): string => {
  const parts: string[] = [];
  
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Meta');
  
  // 특수 키 처리
  let key = e.key;
  if (key === 'ArrowLeft') key = 'Left';
  else if (key === 'ArrowRight') key = 'Right';
  else if (key === 'ArrowUp') key = 'Up';
  else if (key === 'ArrowDown') key = 'Down';
  else if (key === ' ') key = 'Space';
  else if (key.length === 1) key = key.toUpperCase();
  
  // 수정자 키 자체는 제외
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    parts.push(key);
  }
  
  return parts.join('+');
};

// 액션 핸들러 타입
export type ShortcutAction = 
  | 'openNewWorkModal'
  | 'openNewPresetModal'
  | 'openSettings'
  | 'showShortcuts'
  | 'toggleTimer'
  | 'resetTimer'
  | 'goToday'
  | 'prevDay'
  | 'nextDay'
  | 'goDaily'
  | 'goWeekly'
  | 'exportData'
  | 'syncData';

interface ShortcutHandlers {
  openNewWorkModal?: () => void;
  openNewPresetModal?: () => void;
  openSettings?: () => void;
  showShortcuts?: () => void;
  toggleTimer?: () => void;
  resetTimer?: () => void;
  goToday?: () => void;
  prevDay?: () => void;
  nextDay?: () => void;
  goDaily?: () => void;
  goWeekly?: () => void;
  exportData?: () => void;
  syncData?: () => void;
}

export function useShortcuts(handlers: ShortcutHandlers) {
  const findByKeys = useShortcutStore((state) => state.findByKeys);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 입력 필드에서는 단축키 비활성화
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }
    
    const keyString = eventToKeyString(e);
    const shortcut = findByKeys(keyString);
    
    if (shortcut) {
      const handler = handlers[shortcut.action as keyof ShortcutHandlers];
      if (handler) {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }
    }
  }, [findByKeys, handlers]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// 단축키 표시용 포맷 함수
export function formatShortcutKey(keys: string): string {
  return keys
    .replace('Ctrl', '⌃')
    .replace('Alt', '⌥')
    .replace('Shift', '⇧')
    .replace('Meta', '⌘')
    .replace('Left', '←')
    .replace('Right', '→')
    .replace('Up', '↑')
    .replace('Down', '↓')
    .replace(/\+/g, ' ');
}

// 플랫폼별 단축키 표시 (Windows/Mac)
export function formatShortcutKeyForPlatform(keys: string): string {
  const is_mac = navigator.platform.toLowerCase().includes('mac');
  
  if (is_mac) {
    return formatShortcutKey(keys);
  }
  
  // Windows/Linux는 그대로 표시
  return keys;
}
