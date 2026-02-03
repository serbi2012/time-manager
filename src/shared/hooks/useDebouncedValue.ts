/**
 * 디바운스 값 훅
 *
 * 값의 변경을 디바운스하여 빈번한 업데이트를 방지합니다.
 * 입력이 멈춘 후 지정된 시간이 지나야 값이 업데이트됩니다.
 */

import { useState, useEffect } from "react";

/**
 * 값의 변경을 디바운스하는 훅
 *
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms), 기본값 150ms
 * @returns 디바운스된 값
 *
 * @example
 * ```tsx
 * const [search_text, setSearchText] = useState("");
 * const debounced_search = useDebouncedValue(search_text, 300);
 *
 * // debounced_search는 입력이 300ms 동안 멈춘 후에만 업데이트됨
 * useEffect(() => {
 *   if (debounced_search) {
 *     performSearch(debounced_search);
 *   }
 * }, [debounced_search]);
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number = 150): T {
    const [debounced_value, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debounced_value;
}
