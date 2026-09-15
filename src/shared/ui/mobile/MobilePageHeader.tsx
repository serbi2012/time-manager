import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export interface MobilePageHeaderProps {
    title: string;
    subtitle?: string;
    /** 우측 액션 영역 */
    actions?: ReactNode;
    /** 아래 구분선 표시 여부 */
    divided?: boolean;
    className?: string;
}

/**
 * 모바일 페이지 상단 제목 영역
 * 일간·주간·설명서가 같은 모양을 쓰도록 한 곳에서 관리한다
 */
export function MobilePageHeader({
    title,
    subtitle,
    actions,
    divided = true,
    className,
}: MobilePageHeaderProps) {
    return (
        <div className={cn("bg-transparent", className)}>
            <div className="px-xl pt-xl pb-md">
                <div className="flex items-center justify-between gap-md">
                    <div className="min-w-0">
                        {subtitle && (
                            <div className="text-sm text-text-disabled truncate">
                                {subtitle}
                            </div>
                        )}
                        <div className="text-2xl font-semibold text-text-primary mt-[2px] truncate">
                            {title}
                        </div>
                    </div>

                    {actions && (
                        <div className="flex items-center gap-sm shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            </div>

            {divided && (
                <div className="mx-xl border-b border-border-light" />
            )}
        </div>
    );
}
