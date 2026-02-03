/**
 * 테이블 목록을 표시하는 모달 컴포넌트
 *
 * Table + Empty 상태 처리를 통합하여 완료된 작업, 휴지통 등에 사용
 *
 * @example
 * <RecordListModal
 *   title="완료된 작업"
 *   open={isOpen}
 *   onClose={handleClose}
 *   records={completedRecords}
 *   columns={columns}
 *   emptyText="완료된 작업이 없습니다."
 * />
 */

import type { ReactNode } from "react";
import { Table, Empty, Typography, Space, Input, type ModalProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { BaseModal } from "./BaseModal";

const { Text } = Typography;

export interface RecordListModalProps<T extends { id: string }>
    extends Omit<ModalProps, "footer" | "onCancel"> {
    /** 모달 닫기 콜백 */
    onClose: () => void;
    /** 레코드 목록 */
    records: T[];
    /** 테이블 컬럼 정의 */
    columns: ColumnsType<T>;
    /** 빈 상태 메시지 */
    emptyText?: string;
    /** 카운트 표시 텍스트 (예: "개의 완료된 작업") */
    countText?: string;
    /** 페이지 크기 (기본값: 10) */
    pageSize?: number;
    /** 검색 기능 활성화 */
    showSearch?: boolean;
    /** 검색어 */
    searchValue?: string;
    /** 검색어 변경 콜백 */
    onSearchChange?: (value: string) => void;
    /** 검색 placeholder */
    searchPlaceholder?: string;
    /** 헤더 추가 요소 */
    headerExtra?: ReactNode;
    /** 테이블 크기 (기본값: "small") */
    tableSize?: "small" | "middle" | "large";
    /** 모달 너비 (기본값: 800) */
    width?: number;
}

/**
 * 테이블 목록을 표시하는 모달
 */
export function RecordListModal<T extends { id: string }>({
    onClose,
    records,
    columns,
    emptyText = "데이터가 없습니다.",
    countText = "개",
    pageSize = 10,
    showSearch = false,
    searchValue = "",
    onSearchChange,
    searchPlaceholder = "검색...",
    headerExtra,
    tableSize = "small",
    width = 800,
    ...modalProps
}: RecordListModalProps<T>) {
    return (
        <BaseModal
            {...modalProps}
            onCancel={onClose}
            footer={null}
            width={width}
        >
            {records.length === 0 ? (
                <Empty description={emptyText} />
            ) : (
                <>
                    <Space
                        style={{
                            marginBottom: 16,
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text type="secondary">
                            총 {records.length}
                            {countText}
                        </Text>
                        <Space>
                            {showSearch && onSearchChange && (
                                <Input
                                    placeholder={searchPlaceholder}
                                    prefix={<SearchOutlined />}
                                    value={searchValue}
                                    onChange={(e) =>
                                        onSearchChange(e.target.value)
                                    }
                                    style={{ width: 200 }}
                                    allowClear
                                />
                            )}
                            {headerExtra}
                        </Space>
                    </Space>
                    <Table
                        dataSource={records}
                        columns={columns}
                        rowKey="id"
                        size={tableSize}
                        pagination={{ pageSize }}
                    />
                </>
            )}
        </BaseModal>
    );
}

export default RecordListModal;
