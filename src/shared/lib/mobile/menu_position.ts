/**
 * 롱프레스 메뉴 위치 계산
 * 기준 요소 아래에 두되, 공간이 부족하면 위로 뒤집고 화면 안쪽으로 고정한다
 */

export interface MenuAnchorRect {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface MenuPositionOptions {
    anchor: MenuAnchorRect | null;
    viewport_width: number;
    viewport_height: number;
    menu_width: number;
    menu_height: number;
    /** 기준 요소와 메뉴 사이 간격 */
    margin?: number;
    /** 화면 아래쪽에서 비워 둘 높이 (하단 네비 등) */
    bottom_reserved?: number;
}

export interface MenuPosition {
    top: number;
    right: number;
}

const DEFAULT_MARGIN = 8;
const DEFAULT_BOTTOM_RESERVED = 0;
const EDGE_GAP = 16;

export function calcAnchoredMenuPosition({
    anchor,
    viewport_width,
    viewport_height,
    menu_width,
    menu_height,
    margin = DEFAULT_MARGIN,
    bottom_reserved = DEFAULT_BOTTOM_RESERVED,
}: MenuPositionOptions): MenuPosition {
    if (!anchor) {
        return { top: margin, right: EDGE_GAP };
    }

    const max_top = viewport_height - bottom_reserved - menu_height - margin;
    const below_top = anchor.bottom + margin;
    const above_top = anchor.top - menu_height - margin;

    let top: number;
    if (below_top <= max_top) {
        top = below_top;
    } else if (above_top >= margin) {
        top = above_top;
    } else {
        top = Math.max(margin, max_top);
    }

    const max_right = Math.max(viewport_width - menu_width - margin, margin);
    const anchored_right = viewport_width - anchor.right + EDGE_GAP;
    const right = Math.min(Math.max(anchored_right, margin), max_right);

    return { top, right };
}
