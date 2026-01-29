import { useState, useEffect } from "react";

/**
 * 값의 변경을 디바운스하는 훅
 * 입력이 멈춘 후 지정된 시간이 지나야 값이 업데이트됨
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
