/**
 * 카테고리 관련 유틸리티 함수
 */

import type { CSSProperties } from "react";

/**
 * 카테고리별 색상 매핑 (Ant Design Tag 색상)
 */
export const CATEGORY_COLORS: Record<string, string> = {
    개발: "green",
    문서작업: "orange",
    회의: "purple",
    환경세팅: "cyan",
    코드리뷰: "magenta",
    테스트: "blue",
    기타: "default",
} as const;

/**
 * 기본 카테고리 색상
 */
export const DEFAULT_CATEGORY_COLOR = "default";

/**
 * 카테고리에 해당하는 색상 반환
 * @param category - 카테고리명
 * @returns Ant Design Tag 색상
 */
export function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;
}

/**
 * 카테고리 Badge 스타일 반환
 * @param category - 카테고리명
 * @returns CSS 스타일 객체
 */
export function getCategoryBadgeStyle(category: string): CSSProperties {
    const color = getCategoryColor(category);

    // Ant Design Tag 색상 매핑
    const color_map: Record<string, string> = {
        green: "#34C759",
        orange: "#fa8c16",
        purple: "#722ed1",
        cyan: "#13c2c2",
        magenta: "#eb2f96",
        blue: "#3182F6",
        default: "#8B95A1",
    };

    return {
        backgroundColor: color_map[color] || color_map.default,
        color: "#fff",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "12px",
    };
}

/**
 * 카테고리 목록에서 특정 카테고리 필터링
 * @param categories - 카테고리 배열
 * @param filter - 필터 카테고리
 * @returns 필터링된 카테고리 배열
 */
export function filterCategories(
    categories: string[],
    filter: string | null
): string[] {
    if (!filter) {
        return categories;
    }
    return categories.filter((cat) => cat === filter);
}
