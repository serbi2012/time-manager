import { useContext } from "react";

import {
    SyncStatusContext,
    type SyncStatusContextValue,
} from "../model/sync_status_context";

const MISSING_PROVIDER_MESSAGE =
    "useSyncStatusContext는 SyncStatusProvider 안에서만 사용할 수 있습니다";

export function useSyncStatusContext(): SyncStatusContextValue {
    const context = useContext(SyncStatusContext);

    if (!context) {
        throw new Error(MISSING_PROVIDER_MESSAGE);
    }

    return context;
}
