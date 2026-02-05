/**
 * 건의사항 게시판 플랫폼 스위칭 진입점
 */

import { useResponsive } from "@/hooks/useResponsive";
import { DesktopSuggestionBoard } from "../Desktop/DesktopSuggestionBoard";
import { MobileSuggestionBoard } from "../Mobile/MobileSuggestionBoard";

export function SuggestionBoard() {
    const { is_mobile } = useResponsive();

    if (is_mobile) {
        return <MobileSuggestionBoard />;
    }

    return <DesktopSuggestionBoard />;
}
