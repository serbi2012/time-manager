/**
 * 설정 모달 탭 상태 훅
 */

import { useState, useCallback } from "react";

const SETTINGS_DEFAULT_TAB_KEY = "theme";

export function useSettingsTab() {
    const [active_key, setActiveKey] = useState<string>(
        SETTINGS_DEFAULT_TAB_KEY
    );

    const set_active_key = useCallback((key: string) => {
        setActiveKey(key);
    }, []);

    return {
        active_key,
        set_active_key,
    };
}
