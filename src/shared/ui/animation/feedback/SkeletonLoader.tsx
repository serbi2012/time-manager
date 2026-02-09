/**
 * SkeletonLoader - 스켈레톤 로딩 애니메이션
 * 토스 스타일의 shimmer 효과
 */
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/cn";

interface SkeletonLoaderProps {
    /** 너비 */
    width?: string | number;
    /** 높이 */
    height?: string | number;
    /** 모서리 둥글기 */
    borderRadius?: number;
    /** CSS 클래스명 */
    className?: string;
    /** 스타일 */
    style?: CSSProperties;
    /** 애니메이션 비활성화 */
    disabled?: boolean;
}

export function SkeletonLoader({
    width = "100%",
    height = 20,
    borderRadius = 4,
    className,
    style,
    disabled = false,
}: SkeletonLoaderProps) {
    const baseStyle: CSSProperties = {
        width,
        height,
        borderRadius,
        background:
            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        ...style,
    };

    if (disabled) {
        return <div className={className} style={baseStyle} />;
    }

    return (
        <motion.div
            className={className}
            style={baseStyle}
            animate={{
                backgroundPosition: ["200% 0", "-200% 0"],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    );
}

// ============================================================================
// 프리셋 스켈레톤
// ============================================================================

interface SkeletonTextProps {
    /** 줄 수 */
    lines?: number;
    /** 마지막 줄 너비 */
    lastLineWidth?: string;
    /** 줄 간격 */
    gap?: number;
    className?: string;
}

/**
 * 텍스트 스켈레톤
 */
export function SkeletonText({
    lines = 3,
    lastLineWidth = "60%",
    gap = 8,
    className,
}: SkeletonTextProps) {
    return (
        <div
            className={cn(className, "flex flex-col")}
            style={{ gap }}
        >
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonLoader
                    key={i}
                    width={i === lines - 1 ? lastLineWidth : "100%"}
                    height={16}
                />
            ))}
        </div>
    );
}

interface SkeletonAvatarProps {
    /** 크기 */
    size?: number;
    /** 모양 */
    shape?: "circle" | "square";
    className?: string;
}

/**
 * 아바타 스켈레톤
 */
export function SkeletonAvatar({
    size = 40,
    shape = "circle",
    className,
}: SkeletonAvatarProps) {
    return (
        <SkeletonLoader
            width={size}
            height={size}
            borderRadius={shape === "circle" ? size / 2 : 4}
            className={className}
        />
    );
}

interface SkeletonCardProps {
    /** 이미지 포함 여부 */
    hasImage?: boolean;
    /** 이미지 높이 */
    imageHeight?: number;
    className?: string;
    style?: CSSProperties;
}

/**
 * 카드 스켈레톤
 */
export function SkeletonCard({
    hasImage = true,
    imageHeight = 200,
    className,
    style,
}: SkeletonCardProps) {
    return (
        <div
            className={className}
            style={{
                padding: 16,
                borderRadius: 8,
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                ...style,
            }}
        >
            {hasImage && (
                <SkeletonLoader
                    width="100%"
                    height={imageHeight}
                    borderRadius={4}
                    className="mb-lg"
                />
            )}
            <SkeletonLoader
                width="60%"
                height={24}
                className="mb-md"
            />
            <SkeletonText lines={2} />
        </div>
    );
}

interface SkeletonTableProps {
    /** 행 수 */
    rows?: number;
    /** 열 수 */
    cols?: number;
    className?: string;
}

/**
 * 테이블 스켈레톤
 */
export function SkeletonTable({
    rows = 5,
    cols = 4,
    className,
}: SkeletonTableProps) {
    return (
        <div
            className={cn(className, "flex flex-col gap-sm")}
        >
            {/* 헤더 */}
            <div className="flex gap-sm">
                {Array.from({ length: cols }).map((_, i) => (
                    <SkeletonLoader
                        key={`header-${i}`}
                        height={40}
                        className="flex-1"
                    />
                ))}
            </div>
            {/* 바디 */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className="flex gap-sm"
                >
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <SkeletonLoader
                            key={`cell-${rowIndex}-${colIndex}`}
                            height={48}
                            className="flex-1"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
