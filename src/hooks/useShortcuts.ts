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
  | 'modalSubmit'
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
  modalSubmit?: () => void;
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

// 키보드 이벤트가 특정 단축키와 일치하는지 확인
export function matchShortcutKey(e: React.KeyboardEvent | KeyboardEvent, keys: string): boolean {
  // 단축키 문자열 파싱
  const parts = keys.split('+').map(p => p.trim().toLowerCase());
  
  const need_ctrl = parts.includes('ctrl');
  const need_alt = parts.includes('alt');
  const need_shift = parts.includes('shift');
  const need_meta = parts.includes('meta');
  
  // 수정자 키가 아닌 메인 키 찾기
  const main_key = parts.find(p => !['ctrl', 'alt', 'shift', 'meta'].includes(p));
  
  if (!main_key) return false;
  
  // 수정자 키 검사
  if (need_ctrl !== e.ctrlKey) return false;
  if (need_alt !== e.altKey) return false;
  if (need_shift !== e.shiftKey) return false;
  if (need_meta !== e.metaKey) return false;
  
  // 메인 키 검사
  let event_key = e.key.toLowerCase();
  
  // 특수 키 정규화
  if (event_key === 'arrowleft') event_key = 'left';
  else if (event_key === 'arrowright') event_key = 'right';
  else if (event_key === 'arrowup') event_key = 'up';
  else if (event_key === 'arrowdown') event_key = 'down';
  else if (event_key === ' ') event_key = 'space';
  
  return event_key === main_key;
}
