/**
 * 동기화 상태 관리 훅
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import type { User } from "firebase/auth";
import {
    loadFromFirebase,
    refreshFromFirebase,
    syncBeforeUnload,
    checkPendingSync,
    autoMergeDuplicateRecords,
    clearSyncState,
} from "../../../firebase/syncService";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface UseSyncStatusOptions {
    user: User | null;
    is_authenticated: boolean;
}

interface UseSyncStatusReturn {
    sync_status: SyncStatus;
    initial_load_done: boolean;
    is_syncing: boolean;
    show_sync_check: boolean;
    handleManualSync: () => Promise<void>;
}

/**
 * 동기화 상태 관리 훅
 */
export function useSyncStatus({
    user,
    is_authenticated,
}: UseSyncStatusOptions): UseSyncStatusReturn {
    const [sync_status, setSyncStatus] = useState<SyncStatus>("idle");
    const [initial_load_done, setInitialLoadDone] = useState(false);
    const [is_syncing, setIsSyncing] = useState(false);
    const [show_sync_check, setShowSyncCheck] = useState(false);
    const sync_check_timeout = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    // 동기화 완료 체크 애니메이션
    const showSyncCheckAnimation = useCallback(() => {
        if (sync_check_timeout.current) {
            clearTimeout(sync_check_timeout.current);
        }

        setShowSyncCheck(true);

        sync_check_timeout.current = setTimeout(() => {
            setShowSyncCheck(false);
            sync_check_timeout.current = null;
        }, 1500);
    }, []);

    // 로그인 시 데이터 동기화
    useEffect(() => {
        if (user) {
            setSyncStatus("syncing");
            setInitialLoadDone(false);

            checkPendingSync(user)
                .then(() => loadFromFirebase(user))
                .then((success) => {
                    if (success) {
                        const merge_result = autoMergeDuplicateRecords();
                        if (merge_result.merged_count > 0) {
                            message.info(
                                `중복 레코드 ${merge_result.deleted_count}개가 자동으로 병합되었습니다`
                            );
                        }
                        setSyncStatus("synced");
                        showSyncCheckAnimation();
                    } else {
                        setSyncStatus("error");
                        message.error("데이터 로드에 실패했습니다");
                    }
                    setInitialLoadDone(true);
                })
                .catch(() => {
                    setSyncStatus("error");
                    setInitialLoadDone(true);
                    message.error("데이터 동기화에 실패했습니다");
                });
        } else {
            clearSyncState();
            setSyncStatus("idle");
            setInitialLoadDone(true);
        }
    }, [user, showSyncCheckAnimation]);

    // 브라우저 종료/새로고침 시 데이터 백업
    useEffect(() => {
        if (!user || !is_authenticated) return;

        const handleBeforeUnload = () => {
            syncBeforeUnload(user);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [user, is_authenticated]);

    // 수동 새로고침
    const handleManualSync = useCallback(async () => {
        if (!user) return;

        setIsSyncing(true);
        try {
            const success = await refreshFromFirebase(user);
            if (success) {
                message.success("서버에서 데이터를 새로고침했습니다");
                showSyncCheckAnimation();
            } else {
                message.error("새로고침 실패");
            }
        } catch {
            message.error("새로고침 실패");
        } finally {
            setIsSyncing(false);
        }
    }, [user, showSyncCheckAnimation]);

    return {
        sync_status,
        initial_load_done,
        is_syncing,
        show_sync_check,
        handleManualSync,
    };
}

export default useSyncStatus;
