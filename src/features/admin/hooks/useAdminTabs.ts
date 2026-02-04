/**
 * 관리자 탭 상태 훅
 */

import { useState } from "react";
import type { AdminTab } from "../lib/types";

export interface UseAdminTabsReturn {
    active_key: AdminTab;
    set_active_key: (key: AdminTab) => void;
}

export function useAdminTabs(): UseAdminTabsReturn {
    const [active_key, set_active_key] = useState<AdminTab>("sessions");

    return {
        active_key,
        set_active_key,
    };
}
