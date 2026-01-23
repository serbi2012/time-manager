/**
 * 동기화 상태 인디케이터
 */

import {
    SyncOutlined,
    CloudSyncOutlined,
    CloudOutlined,
    CheckCircleFilled,
    UserOutlined,
} from "@ant-design/icons";
import type { SyncStatus } from "../../features/sync";

interface SyncIndicatorProps {
    sync_status: SyncStatus;
    show_sync_check: boolean;
    is_authenticated: boolean;
    auth_loading: boolean;
    is_mobile: boolean;
}

/**
 * 동기화 상태 인디케이터 컴포넌트
 */
export function SyncIndicator({
    sync_status,
    show_sync_check,
    is_authenticated,
    auth_loading,
    is_mobile,
}: SyncIndicatorProps) {
    if (is_authenticated) {
        return (
            <span
                style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: is_mobile ? 10 : 12,
                }}
            >
                {sync_status === "syncing" && (
                    <>
                        <SyncOutlined spin />
                        {!is_mobile && " 동기화 중..."}
                    </>
                )}
                {sync_status === "synced" && (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <CloudSyncOutlined />
                        {!is_mobile && " 클라우드 연결됨"}
                        {show_sync_check && (
                            <CheckCircleFilled
                                style={{
                                    color: "#52c41a",
                                    fontSize: 14,
                                    animation:
                                        "syncCheckPop 0.3s ease-out, syncCheckFade 1.5s ease-in-out",
                                }}
                            />
                        )}
                    </span>
                )}
                {sync_status === "error" && (
                    <>
                        <CloudOutlined style={{ color: "#ff4d4f" }} />
                        {!is_mobile && " 동기화 오류"}
                    </>
                )}
            </span>
        );
    }

    if (!auth_loading) {
        return (
            <span
                style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: is_mobile ? 10 : 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <UserOutlined />
                {!is_mobile && " 게스트 모드"}
            </span>
        );
    }

    return null;
}

export default SyncIndicator;
