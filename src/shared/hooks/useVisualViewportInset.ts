import { useState, useEffect } from "react";

/**
 * 화면 아래쪽이 가상 키보드에 가려진 높이(px)를 돌려준다
 * iOS Safari는 키보드가 올라와도 레이아웃 뷰포트가 줄지 않아 직접 계산해야 한다
 */
export function useVisualViewportInset(): number {
    const [inset, setInset] = useState(0);

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const updateInset = () => {
            const hidden =
                window.innerHeight - viewport.height - viewport.offsetTop;
            setInset(Math.max(0, Math.round(hidden)));
        };

        updateInset();
        viewport.addEventListener("resize", updateInset);
        viewport.addEventListener("scroll", updateInset);

        return () => {
            viewport.removeEventListener("resize", updateInset);
            viewport.removeEventListener("scroll", updateInset);
        };
    }, []);

    return inset;
}
