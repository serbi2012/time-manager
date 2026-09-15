import type { ReactNode } from "react";
import type { User } from "firebase/auth";

import { useSyncStatus } from "../hooks/useSyncStatus";
import { SyncStatusContext } from "../model/sync_status_context";

interface SyncStatusProviderProps {
    user: User | null;
    is_authenticated: boolean;
    children: ReactNode;
}

export function SyncStatusProvider({
    user,
    is_authenticated,
    children,
}: SyncStatusProviderProps) {
    const sync_status = useSyncStatus({ user, is_authenticated });

    return (
        <SyncStatusContext.Provider value={sync_status}>
            {children}
        </SyncStatusContext.Provider>
    );
}
