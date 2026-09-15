const DEFAULT_ROW_COUNT = 4;

export interface MobileListSkeletonProps {
    /** 보여줄 줄 수 */
    rows?: number;
}

/**
 * 모바일 목록 로딩 자리표시
 * 스피너 대신 실제 화면과 비슷한 뼈대를 먼저 보여준다
 */
export function MobileListSkeleton({
    rows = DEFAULT_ROW_COUNT,
}: MobileListSkeletonProps) {
    return (
        <div className="px-xl pt-xl flex flex-col gap-sm" aria-hidden="true">
            <div className="h-10 w-40 rounded-lg bg-bg-grey mobile-skeleton" />

            <div className="h-12 rounded-xl bg-bg-grey mobile-skeleton mt-md" />

            {Array.from({ length: rows }, (_, index) => (
                <div
                    key={index}
                    className="h-16 rounded-xl bg-bg-grey mobile-skeleton"
                />
            ))}
        </div>
    );
}
