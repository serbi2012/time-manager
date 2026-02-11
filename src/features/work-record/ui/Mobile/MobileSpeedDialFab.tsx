/**
 * Mobile Speed Dial FAB — unified floating action button
 * Tap: expand to show "새 작업" + "프리셋" mini FABs
 * Main FAB rotates 45° when open (becomes X)
 */

import { useState, useCallback } from "react";
import { PlusOutlined, AppstoreOutlined } from "@ant-design/icons";

import type { AppTheme } from "../../../../shared/config";
import { APP_THEME_COLORS } from "../../../../shared/config";
import { cn } from "../../../../shared/lib/cn";
import { MOBILE_RECORD_LABEL } from "../../constants";

interface MobileSpeedDialFabProps {
    on_add_record: () => void;
    on_open_preset: () => void;
    app_theme: AppTheme;
}

export function MobileSpeedDialFab({
    on_add_record,
    on_open_preset,
    app_theme,
}: MobileSpeedDialFabProps) {
    const [is_open, setIsOpen] = useState(false);

    const handleToggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const handleAddRecord = useCallback(() => {
        setIsOpen(false);
        on_add_record();
    }, [on_add_record]);

    const handleOpenPreset = useCallback(() => {
        setIsOpen(false);
        on_open_preset();
    }, [on_open_preset]);

    const handleOverlayClick = useCallback(() => {
        setIsOpen(false);
    }, []);

    const theme_colors = APP_THEME_COLORS[app_theme];

    return (
        <>
            {/* Dimming overlay */}
            {is_open && (
                <div
                    className="fixed inset-0 z-[98] bg-black/30 transition-opacity"
                    onClick={handleOverlayClick}
                />
            )}

            {/* Mini FAB: 프리셋 (upper) */}
            <div
                className={cn(
                    "fixed right-lg z-[99] flex items-center gap-sm transition-all duration-200",
                    is_open
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                )}
                style={{ bottom: 208 }}
            >
                <span className="text-sm font-medium text-white bg-gray-800/80 px-sm py-xs rounded-md whitespace-nowrap">
                    {MOBILE_RECORD_LABEL.SPEED_DIAL_PRESET}
                </span>
                <button
                    className="w-12 h-12 rounded-full flex items-center justify-center border-0 cursor-pointer text-white shadow-md outline-none select-none"
                    style={{
                        background: theme_colors.gradient,
                        WebkitTapHighlightColor: "transparent",
                    }}
                    onClick={handleOpenPreset}
                >
                    <AppstoreOutlined style={{ fontSize: 20 }} />
                </button>
            </div>

            {/* Mini FAB: 새 작업 (lower) */}
            <div
                className={cn(
                    "fixed right-lg z-[99] flex items-center gap-sm transition-all duration-200",
                    is_open
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                )}
                style={{ bottom: 150 }}
            >
                <span className="text-sm font-medium text-white bg-gray-800/80 px-sm py-xs rounded-md whitespace-nowrap">
                    {MOBILE_RECORD_LABEL.SPEED_DIAL_NEW_RECORD}
                </span>
                <button
                    className="w-12 h-12 rounded-full flex items-center justify-center border-0 cursor-pointer bg-primary text-white shadow-md outline-none select-none"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    onClick={handleAddRecord}
                >
                    <PlusOutlined style={{ fontSize: 20 }} />
                </button>
            </div>

            {/* Main FAB */}
            <button
                className="fixed right-lg z-[99] w-14 h-14 rounded-full flex items-center justify-center border-0 cursor-pointer text-white transition-transform duration-200 outline-none select-none"
                style={{
                    bottom: 88,
                    background: theme_colors.gradient,
                    boxShadow: `0 4px 12px ${theme_colors.primary}66`,
                    transform: is_open ? "rotate(45deg)" : "rotate(0deg)",
                    WebkitTapHighlightColor: "transparent",
                }}
                onClick={handleToggle}
            >
                <PlusOutlined style={{ fontSize: 24 }} />
            </button>
        </>
    );
}
