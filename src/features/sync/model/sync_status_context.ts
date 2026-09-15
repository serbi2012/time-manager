import { createContext } from "react";

import type { useSyncStatus } from "../hooks/useSyncStatus";

export type SyncStatusContextValue = ReturnType<typeof useSyncStatus>;

export const SyncStatusContext = createContext<SyncStatusContextValue | null>(
    null
);
