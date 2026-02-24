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

export function SyncIndicator({
    sync_status,
    show_sync_check,
    is_authenticated,
    auth_loading,
    is_mobile,
}: SyncIndicatorProps) {
    if (is_authenticated) {
        if (is_mobile) {
            return (
                <span
                    style={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: 10,
                    }}
                >
                    {sync_status === "syncing" && <SyncOutlined spin />}
                    {sync_status === "synced" && (
                        <span className="inline-flex items-center gap-xs">
                            <CloudSyncOutlined />
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
                        <CloudOutlined className="!text-[#ff4d4f]" />
                    )}
                </span>
            );
        }

        return (
            <div
                className="flex items-center gap-[5px] px-sm py-[3px] rounded-full"
                style={{ background: "rgba(255,255,255,0.12)" }}
            >
                {sync_status === "syncing" && (
                    <>
                        <SyncOutlined
                            spin
                            style={{
                                color: "rgba(255,255,255,0.7)",
                                fontSize: 11,
                            }}
                        />
                        <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                            동기화 중
                        </span>
                    </>
                )}
                {sync_status === "synced" && (
                    <>
                        <div
                            className="w-[5px] h-[5px] rounded-full"
                            style={{ background: "#7DEFA0" }}
                        />
                        <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                            동기화됨
                        </span>
                        {show_sync_check && (
                            <CheckCircleFilled
                                style={{
                                    color: "#7DEFA0",
                                    fontSize: 11,
                                    animation:
                                        "syncCheckPop 0.3s ease-out, syncCheckFade 1.5s ease-in-out",
                                }}
                            />
                        )}
                    </>
                )}
                {sync_status === "error" && (
                    <>
                        <CloudOutlined
                            style={{
                                color: "#ff6b6b",
                                fontSize: 11,
                            }}
                        />
                        <span className="text-xs" style={{ color: "#ff6b6b" }}>
                            오류
                        </span>
                    </>
                )}
            </div>
        );
    }

    if (!auth_loading) {
        if (is_mobile) {
            return (
                <span
                    style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 10,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <UserOutlined />
                </span>
            );
        }

        return (
            <div
                className="flex items-center gap-[5px] px-sm py-[3px] rounded-full"
                style={{ background: "rgba(255,255,255,0.12)" }}
            >
                <UserOutlined
                    style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 11,
                    }}
                />
                <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                >
                    게스트
                </span>
            </div>
        );
    }

    return null;
}

export default SyncIndicator;
