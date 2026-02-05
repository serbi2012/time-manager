import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

/**
 * 날짜 문자열을 상대 시간으로 변환 (예: "3분 전")
 */
export function formatRelativeTime(date_string: string): string {
    return dayjs(date_string).fromNow();
}
