/**
 * 디바운스 값 훅 - 하위 호환성 유지를 위한 re-export
 *
 * @deprecated shared/hooks에서 직접 import하세요
 * @example
 * // 이전 방식 (여전히 작동)
 * import { useDebouncedValue } from '../hooks/useDebouncedValue';
 *
 * // 권장 방식
 * import { useDebouncedValue } from '@/shared/hooks';
 */

export { useDebouncedValue } from "../shared/hooks/useDebouncedValue";
