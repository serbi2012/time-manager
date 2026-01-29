import React from "react";

interface HighlightTextProps {
    text: string;
    search: string;
    highlightStyle?: React.CSSProperties;
}

/**
 * 검색어를 하이라이트하는 컴포넌트
 * 대소문자 구분 없이 검색어와 일치하는 부분을 하이라이트
 */
export function HighlightText({
    text,
    search,
    highlightStyle = {
        backgroundColor: "#ffc069",
        padding: 0,
        borderRadius: 2,
    },
}: HighlightTextProps) {
    if (!search || !search.trim()) {
        return <>{text}</>;
    }

    const search_lower = search.toLowerCase();
    const text_lower = text.toLowerCase();
    const parts: React.ReactNode[] = [];
    let last_index = 0;
    let index = text_lower.indexOf(search_lower);

    while (index !== -1) {
        // 하이라이트 전 텍스트
        if (index > last_index) {
            parts.push(text.substring(last_index, index));
        }
        // 하이라이트 텍스트 (원본 대소문자 유지)
        parts.push(
            <mark key={index} style={highlightStyle}>
                {text.substring(index, index + search.length)}
            </mark>
        );
        last_index = index + search.length;
        index = text_lower.indexOf(search_lower, last_index);
    }

    // 마지막 남은 텍스트
    if (last_index < text.length) {
        parts.push(text.substring(last_index));
    }

    return <>{parts}</>;
}
