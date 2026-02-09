/**
 * 빈 상태 표시 컴포넌트
 *
 * 20개 이상 파일에서 중복되던 Empty 사용을 통합
 * 일관된 스타일과 액션 버튼 지원
 *
 * @example
 * // 기본 사용
 * <EmptyState description="작업 기록이 없습니다" />
 *
 * // 부가 설명 포함
 * <EmptyState
 *   description="프리셋이 없습니다"
 *   subDescription="\"추가\" 버튼으로 추가하세요"
 * />
 *
 * // 액션 버튼 포함
 * <EmptyState
 *   description="데이터가 없습니다"
 *   action={<Button type="primary" onClick={handleAdd}>추가하기</Button>}
 * />
 */

import type { ReactNode } from "react";
import { Empty, Typography } from "antd";

const { Text } = Typography;

export type EmptyImageType = "simple" | "default";

export interface EmptyStateProps {
    /** 메인 설명 */
    description: string;
    /** 부가 설명 (작은 글씨) */
    subDescription?: string;
    /** 이미지 타입 (기본값: "simple") */
    imageType?: EmptyImageType;
    /** 커스텀 이미지 */
    image?: ReactNode;
    /** 액션 버튼 영역 */
    action?: ReactNode;
    /** 전체 래퍼 스타일 */
    style?: React.CSSProperties;
}

/**
 * 빈 상태 표시 컴포넌트
 */
export function EmptyState({
    description,
    subDescription,
    imageType = "simple",
    image,
    action,
    style,
}: EmptyStateProps) {
    // 이미지 결정
    const emptyImage =
        image !== undefined
            ? image
            : imageType === "simple"
            ? Empty.PRESENTED_IMAGE_SIMPLE
            : Empty.PRESENTED_IMAGE_DEFAULT;

    // 설명 렌더링
    const descriptionContent = subDescription ? (
        <span>
            {description}
            <br />
            <Text type="secondary" className="!text-xs">
                {subDescription}
            </Text>
        </span>
    ) : (
        description
    );

    return (
        <Empty
            image={emptyImage}
            description={descriptionContent}
            style={style}
        >
            {action}
        </Empty>
    );
}

export default EmptyState;
