/**
 * 주간 일정 복사 형식 상태 훅
 */

import { useState, useCallback } from "react";
import { WEEKLY_SCHEDULE_CONFIG } from "../constants/config";

export type WeeklyCopyFormat = 1 | 2;

export function useCopyFormat() {
    const [copy_format, setCopyFormatState] = useState<WeeklyCopyFormat>(
        WEEKLY_SCHEDULE_CONFIG.defaultCopyFormat
    );

    const setCopyFormat = useCallback((format: WeeklyCopyFormat) => {
        setCopyFormatState(format);
    }, []);

    return { copy_format, setCopyFormat };
}
