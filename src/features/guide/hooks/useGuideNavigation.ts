import {
    useState,
    useEffect,
    useCallback,
    useRef,
    startTransition,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DOCS } from "@/docs";
import { GUIDE_CONFIG } from "../constants";

/**
 * 가이드 네비게이션 훅
 * - 현재 섹션 관리
 * - URL 해시 동기화
 * - 하이라이트 키워드 관리
 */
export function useGuideNavigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const [current_section, setCurrentSection] =
        useState<string>("getting-started");
    const [highlight_keyword, setHighlightKeyword] = useState<string>("");
    const content_ref = useRef<HTMLDivElement>(null);

    // URL 해시가 변경되면 해당 섹션으로 이동
    useEffect(() => {
        const hash = location.hash.replace("#", "");
        if (hash && DOCS.some((d) => d.id === hash)) {
            startTransition(() => {
                setCurrentSection(hash);
            });
        }
    }, [location.hash]);

    // 하이라이트 스크롤 및 자동 제거
    useEffect(() => {
        if (!highlight_keyword) return;

        const scroll_timer = setTimeout(() => {
            const first_highlight = document.querySelector(
                ".guide-content-highlight"
            );
            if (first_highlight) {
                first_highlight.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }, GUIDE_CONFIG.highlightScrollDelay);

        const clear_timer = setTimeout(() => {
            setHighlightKeyword("");
        }, GUIDE_CONFIG.highlightDuration);

        return () => {
            clearTimeout(scroll_timer);
            clearTimeout(clear_timer);
        };
    }, [highlight_keyword, current_section]);

    const navigateToSection = useCallback(
        (section_id: string, keyword?: string) => {
            setCurrentSection(section_id);
            navigate(`/guide#${section_id}`, { replace: true });

            if (keyword) {
                setHighlightKeyword(keyword);
            } else {
                setHighlightKeyword("");
                if (content_ref.current) {
                    content_ref.current.scrollTop = 0;
                }
                window.scrollTo(0, 0);
            }
        },
        [navigate]
    );

    return {
        current_section,
        highlight_keyword,
        content_ref,
        navigateToSection,
    };
}
