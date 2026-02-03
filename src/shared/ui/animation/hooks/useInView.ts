/**
 * useInView - 뷰포트 진입 감지 훅
 * 요소가 뷰포트에 들어올 때 애니메이션 트리거
 */
import { useEffect, useRef, useState, RefObject } from "react";

interface UseInViewOptions {
    /** 한 번만 트리거 (기본: true) */
    once?: boolean;
    /** 뷰포트 마진 */
    margin?: string;
    /** 가시성 임계값 (0-1) */
    threshold?: number;
}

interface UseInViewResult<T extends HTMLElement> {
    /** 요소에 연결할 ref */
    ref: RefObject<T>;
    /** 뷰포트 내 여부 */
    inView: boolean;
}

/**
 * 요소가 뷰포트에 들어왔는지 감지
 *
 * @example
 * const { ref, inView } = useInView<HTMLDivElement>();
 *
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0, y: 20 }}
 *   animate={inView ? { opacity: 1, y: 0 } : {}}
 * >
 *   Content
 * </motion.div>
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
    options: UseInViewOptions = {}
): UseInViewResult<T> {
    const { once = true, margin = "0px", threshold = 0.1 } = options;

    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // 이미 트리거됐고 once가 true면 더 이상 관찰 안함
        if (once && hasTriggered) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isIntersecting = entry.isIntersecting;

                if (isIntersecting) {
                    setInView(true);
                    if (once) {
                        setHasTriggered(true);
                        observer.disconnect();
                    }
                } else if (!once) {
                    setInView(false);
                }
            },
            {
                rootMargin: margin,
                threshold,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [once, margin, threshold, hasTriggered]);

    return { ref, inView };
}

/**
 * 여러 요소의 뷰포트 진입 감지
 */
export function useInViewMultiple<T extends HTMLElement = HTMLDivElement>(
    count: number,
    options: UseInViewOptions = {}
): { refs: RefObject<T>[]; inViews: boolean[] } {
    const refs = useRef<RefObject<T>[]>(
        Array.from({ length: count }, () => ({ current: null }))
    ).current;

    const [inViews, setInViews] = useState<boolean[]>(
        Array.from({ length: count }, () => false)
    );

    const { once = true, margin = "0px", threshold = 0.1 } = options;

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        refs.forEach((ref, index) => {
            const element = ref.current;
            if (!element) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setInViews((prev) => {
                            const next = [...prev];
                            next[index] = true;
                            return next;
                        });
                        if (once) {
                            observer.disconnect();
                        }
                    } else if (!once) {
                        setInViews((prev) => {
                            const next = [...prev];
                            next[index] = false;
                            return next;
                        });
                    }
                },
                { rootMargin: margin, threshold }
            );

            observer.observe(element);
            observers.push(observer);
        });

        return () => {
            observers.forEach((obs) => obs.disconnect());
        };
    }, [count, once, margin, threshold, refs]);

    return { refs, inViews };
}
