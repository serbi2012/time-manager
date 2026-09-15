/**
 * 모바일 일간 헤더 — 스크롤해도 고정되는 영역
 * 날짜 줄과 주간 스트립만 둔다 (타임라인은 본문의 MobileDailyTimeline)
 */

import { useState, useCallback } from "react";
import { SettingOutlined } from "@ant-design/icons";
import { useShallow } from "zustand/react/shallow";

import { useWorkStore } from "../../store/useWorkStore";
import { useAuthHandlers } from "../../shared/hooks";
import { useSyncStatusContext } from "../../features/sync";
import { MobileIconButton } from "../../shared/ui";
import { UserMenu } from "../../widgets/Header";
import { MobileDateNavBar } from "../../features/work-record/ui/Mobile/MobileDateNavBar";
import { MobileCalendarStrip } from "../../features/work-record/ui/Mobile/MobileCalendarStrip";
import { MobileDatePickerSheet } from "../../features/work-record/ui/Mobile/MobileDatePickerSheet";
import { MOBILE_DATE_SHEET } from "../../features/work-record/constants";

interface MobileDailyHeaderProps {
    /** 선택한 날짜의 총 기록 시간 (분) */
    total_minutes: number;
}

export function MobileDailyHeader({ total_minutes }: MobileDailyHeaderProps) {
    const { selected_date, setSelectedDate, records } = useWorkStore(
        useShallow((s) => ({
            selected_date: s.selected_date,
            setSelectedDate: s.setSelectedDate,
            records: s.records,
        }))
    );

    const {
        user,
        loading: auth_loading,
        isAuthenticated,
        handleLogin,
        handleLogout,
    } = useAuthHandlers();

    const { is_syncing, handleManualSync } = useSyncStatusContext();

    const [is_date_sheet_open, setIsDateSheetOpen] = useState(false);

    const handleDateSelect = useCallback(
        (date_str: string) => {
            setSelectedDate(date_str);
        },
        [setSelectedDate]
    );

    const handleOpenDateSheet = useCallback(() => {
        setIsDateSheetOpen(true);
    }, []);

    const handleCloseDateSheet = useCallback(() => {
        setIsDateSheetOpen(false);
    }, []);

    const handleOpenSettings = useCallback(() => {
        window.dispatchEvent(new Event("openSettings"));
    }, []);

    return (
        <>
            <div className="mobile-safe-top bg-bg-light">
                <MobileDateNavBar
                    selected_date={selected_date}
                    onDateChange={handleDateSelect}
                    onDateTap={handleOpenDateSheet}
                    total_minutes={total_minutes}
                    actions={
                        <>
                            <MobileIconButton
                                label={MOBILE_DATE_SHEET.SETTINGS_LABEL}
                                variant="tinted"
                                onClick={handleOpenSettings}
                            >
                                <SettingOutlined style={{ fontSize: 17 }} />
                            </MobileIconButton>

                            <UserMenu
                                user={user}
                                auth_loading={auth_loading}
                                is_authenticated={isAuthenticated}
                                is_mobile={true}
                                is_syncing={is_syncing}
                                on_login={handleLogin}
                                on_logout={handleLogout}
                                on_manual_sync={handleManualSync}
                            />
                        </>
                    }
                />

                <MobileCalendarStrip
                    selected_date={selected_date}
                    onDateSelect={handleDateSelect}
                    records={records}
                />
            </div>

            <MobileDatePickerSheet
                open={is_date_sheet_open}
                selected_date={selected_date}
                onSelect={handleDateSelect}
                onClose={handleCloseDateSheet}
            />
        </>
    );
}
