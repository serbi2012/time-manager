/**
 * useResponsive 훅 - 하위 호환성 유지를 위한 re-export
 *
 * @deprecated shared/hooks에서 직접 import하세요
 * @example
 * // 이전 방식 (여전히 작동)
 * import { useResponsive } from './hooks/useResponsive';
 *
 * // 권장 방식
 * import { useResponsive } from '@/shared/hooks';
 */

import { useResponsive } from "../shared/hooks/useResponsive";

export {
    useResponsive,
    BREAKPOINTS,
    mediaQuery,
    type ResponsiveState,
} from "../shared/hooks/useResponsive";

export default useResponsive;
