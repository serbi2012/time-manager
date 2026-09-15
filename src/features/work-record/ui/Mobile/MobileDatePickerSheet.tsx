/**
 * 모바일 날짜 선택 시트
 * 날짜 줄을 탭하면 열리는 달력 (숨긴 DatePicker 대신)
 */

import { Calendar } from "antd";
import dayjs, { type Dayjs } from "dayjs";

import { MobileBottomSheet } from "@/shared/ui";

import { DATE_FORMAT, MOBILE_DATE_SHEET } from "../../constants";

const SHEET_HEIGHT_RATIO = 0.62;

interface MobileDatePickerSheetProps {
    open: boolean;
    selected_date: string;
    onSelect: (date_str: string) => void;
    onClose: () => void;
}

export function MobileDatePickerSheet({
    open,
    selected_date,
    onSelect,
    onClose,
}: MobileDatePickerSheetProps) {
    const handleSelect = (date: Dayjs) => {
        onSelect(date.format(DATE_FORMAT));
        onClose();
    };

    return (
        <MobileBottomSheet
            open={open}
            onClose={onClose}
            title={MOBILE_DATE_SHEET.TITLE}
            height_ratio={SHEET_HEIGHT_RATIO}
        >
            <div className="px-lg pb-lg">
                <Calendar
                    fullscreen={false}
                    value={dayjs(selected_date)}
                    onSelect={handleSelect}
                />
            </div>
        </MobileBottomSheet>
    );
}
