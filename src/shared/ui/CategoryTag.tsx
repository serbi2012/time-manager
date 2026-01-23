/**
 * 카테고리 태그 컴포넌트
 * 
 * 카테고리별 색상이 지정된 Tag 컴포넌트
 */

import { Tag } from "antd";
import { getCategoryColor } from "../config";

export interface CategoryTagProps {
    /** 카테고리명 */
    category: string;
    /** 추가 스타일 */
    style?: React.CSSProperties;
    /** 클릭 핸들러 */
    onClick?: () => void;
}

/**
 * 카테고리 태그 컴포넌트
 * 
 * @example
 * <CategoryTag category="개발" />
 * <CategoryTag category="회의" />
 */
export function CategoryTag({ 
    category, 
    style,
    onClick,
}: CategoryTagProps) {
    const color = getCategoryColor(category);
    
    return (
        <Tag 
            color={color} 
            style={style}
            onClick={onClick}
        >
            {category}
        </Tag>
    );
}

export default CategoryTag;
