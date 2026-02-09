/**
 * DataTable - @tanstack/react-table 기반 공통 테이블 컴포넌트
 *
 * WorkRecordTable, AdminSessionGrid 등에서 중복되던 테이블 패턴을 통합
 * 정렬, 필터링, 페이지네이션, 행 선택 등을 지원
 *
 * @example
 * // 기본 사용
 * <DataTable data={records} columns={columns} />
 *
 * // 정렬 + 페이지네이션
 * <DataTable
 *   data={records}
 *   columns={columns}
 *   enableSorting
 *   enablePagination
 *   pageSize={10}
 * />
 *
 * // 행 선택
 * <DataTable
 *   data={records}
 *   columns={columns}
 *   enableRowSelection
 *   onRowSelectionChange={setSelectedRows}
 * />
 */

import { useMemo, useState, useCallback } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
    type ColumnDef,
    type SortingState,
    type RowSelectionState,
    type ColumnFiltersState,
    type PaginationState,
    type Row,
    type Table as ReactTable,
} from "@tanstack/react-table";
import { Pagination, Empty, Spin, Checkbox } from "antd";
import {
    CaretUpOutlined,
    CaretDownOutlined,
    MinusOutlined,
} from "@ant-design/icons";
import clsx from "clsx";

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * DataTable Props
 */
export interface DataTableProps<TData> {
    /** 테이블 데이터 */
    data: TData[];
    /** 컬럼 정의 - any 타입으로 유연성 확보 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<TData, any>[];
    /** 로딩 상태 */
    loading?: boolean;
    /** 빈 상태 메시지 */
    emptyText?: string;
    /** 정렬 활성화 */
    enableSorting?: boolean;
    /** 필터링 활성화 */
    enableFiltering?: boolean;
    /** 페이지네이션 활성화 */
    enablePagination?: boolean;
    /** 행 선택 활성화 */
    enableRowSelection?: boolean;
    /** 복수 선택 허용 (기본값: true) */
    enableMultiRowSelection?: boolean;
    /** 기본 정렬 상태 */
    defaultSorting?: SortingState;
    /** 페이지 크기 (기본값: 10) */
    pageSize?: number;
    /** 페이지 크기 옵션 */
    pageSizeOptions?: number[];
    /** 행 선택 변경 콜백 */
    onRowSelectionChange?: (selectedRows: TData[]) => void;
    /** 행 클릭 콜백 */
    onRowClick?: (row: TData) => void;
    /** 행 더블클릭 콜백 */
    onRowDoubleClick?: (row: TData) => void;
    /** 정렬 변경 콜백 */
    onSortingChange?: (sorting: SortingState) => void;
    /** 행 키 추출 함수 */
    getRowId?: (row: TData) => string;
    /** 선택된 행 ID 목록 (외부 제어) */
    selectedRowIds?: string[];
    /** 테이블 클래스명 */
    className?: string;
    /** 테이블 스타일 */
    style?: React.CSSProperties;
    /** 행 클래스명 함수 */
    rowClassName?: (row: TData, index: number) => string;
    /** 테이블 크기 */
    size?: "small" | "middle" | "large";
    /** 테이블 제목 */
    title?: React.ReactNode;
    /** 테이블 푸터 */
    footer?: React.ReactNode;
    /** 스크롤 설정 */
    scroll?: { x?: number | string; y?: number | string };
    /** 테이블 테두리 표시 */
    bordered?: boolean;
    /** 줄무늬 배경 */
    striped?: boolean;
    /** 호버 효과 */
    hoverable?: boolean;
}

/**
 * DataTable 컴포넌트 반환 타입 (테이블 인스턴스 포함)
 */
export interface DataTableRef<TData> {
    table: ReactTable<TData>;
    getSelectedRows: () => TData[];
    clearSelection: () => void;
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 컬럼 헬퍼 생성
 */
export function createDataTableColumnHelper<TData>() {
    return createColumnHelper<TData>();
}

// ============================================================================
// 정렬 아이콘 컴포넌트
// ============================================================================

interface SortIconProps {
    isSorted: false | "asc" | "desc";
}

function SortIcon({ isSorted }: SortIconProps) {
    if (!isSorted) {
        return <MinusOutlined className="text-xs text-text-disabled ml-xs" />;
    }

    if (isSorted === "asc") {
        return <CaretUpOutlined className="text-xs text-primary ml-xs" />;
    }

    return <CaretDownOutlined className="text-xs text-[#1890ff] ml-xs" />;
}

// ============================================================================
// 메인 컴포넌트
// ============================================================================

/**
 * DataTable 컴포넌트
 */
export function DataTable<TData>({
    data,
    columns,
    loading = false,
    emptyText = "데이터가 없습니다",
    enableSorting = false,
    enableFiltering = false,
    enablePagination = false,
    enableRowSelection = false,
    enableMultiRowSelection = true,
    defaultSorting = [],
    pageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    onRowSelectionChange,
    onRowClick,
    onRowDoubleClick,
    onSortingChange,
    getRowId,
    selectedRowIds,
    className,
    style,
    rowClassName,
    size = "middle",
    title,
    footer,
    scroll,
    bordered = false,
    striped = false,
    hoverable = true,
}: DataTableProps<TData>) {
    // ========================================================================
    // 상태 관리
    // ========================================================================

    const [sorting, setSorting] = useState<SortingState>(defaultSorting);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
        if (selectedRowIds && getRowId) {
            const initial: RowSelectionState = {};
            selectedRowIds.forEach((id) => {
                initial[id] = true;
            });
            return initial;
        }
        return {};
    });
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });

    // ========================================================================
    // 행 선택 컬럼 (활성화된 경우)
    // ========================================================================

    const selection_column: ColumnDef<TData, unknown> = useMemo(
        () => ({
            id: "select",
            header: ({ table }) =>
                enableMultiRowSelection ? (
                    <Checkbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                ) : null,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            size: 40,
            enableSorting: false,
        }),
        [enableMultiRowSelection]
    );

    // ========================================================================
    // 컬럼 정의 (선택 컬럼 추가)
    // ========================================================================

    const all_columns = useMemo(() => {
        if (enableRowSelection) {
            return [selection_column, ...columns];
        }
        return columns;
    }, [columns, enableRowSelection, selection_column]);

    // ========================================================================
    // 테이블 인스턴스 생성
    // ========================================================================

    const table = useReactTable({
        data,
        columns: all_columns,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            ...(enablePagination && { pagination }),
        },
        onSortingChange: (updater) => {
            const new_sorting =
                typeof updater === "function" ? updater(sorting) : updater;
            setSorting(new_sorting);
            onSortingChange?.(new_sorting);
        },
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: (updater) => {
            const new_selection =
                typeof updater === "function" ? updater(rowSelection) : updater;
            setRowSelection(new_selection);

            // 선택된 행 데이터 추출하여 콜백 호출
            if (onRowSelectionChange) {
                const selected_rows = data.filter((row) => {
                    const row_id = getRowId
                        ? getRowId(row)
                        : String(data.indexOf(row));
                    return new_selection[row_id];
                });
                onRowSelectionChange(selected_rows);
            }
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: enableFiltering
            ? getFilteredRowModel()
            : undefined,
        getPaginationRowModel: enablePagination
            ? getPaginationRowModel()
            : undefined,
        getRowId: getRowId,
        enableRowSelection: enableRowSelection,
        enableMultiRowSelection: enableMultiRowSelection,
    });

    // ========================================================================
    // 행 클릭 핸들러
    // ========================================================================

    const handleRowClick = useCallback(
        (row: Row<TData>) => {
            onRowClick?.(row.original);
        },
        [onRowClick]
    );

    const handleRowDoubleClick = useCallback(
        (row: Row<TData>) => {
            onRowDoubleClick?.(row.original);
        },
        [onRowDoubleClick]
    );

    // ========================================================================
    // 페이지네이션 변경 핸들러
    // ========================================================================

    const handlePaginationChange = useCallback((page: number, size: number) => {
        setPagination({
            pageIndex: page - 1,
            pageSize: size,
        });
    }, []);

    // ========================================================================
    // 렌더링
    // ========================================================================

    return (
        <div className={className} style={style}>
            {/* 제목 */}
            {title && <div className="data-table-title">{title}</div>}

            {/* 테이블 */}
            <Spin spinning={loading}>
                <div
                    className={clsx("data-table-container", {
                        "data-table-bordered": bordered,
                        "data-table-striped": striped,
                    })}
                    style={scroll ? { overflow: "auto", ...scroll } : undefined}
                >
                    <table
                        className={clsx(
                            "data-table",
                            {
                                [`data-table-${size}`]: size,
                            },
                            "w-full border-collapse"
                        )}
                    >
                        {/* 헤더 */}
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            style={{
                                                width:
                                                    header.getSize() !== 150
                                                        ? header.getSize()
                                                        : undefined,
                                                padding:
                                                    size === "small"
                                                        ? "8px"
                                                        : "12px",
                                                textAlign: "left",
                                                borderBottom:
                                                    "1px solid var(--color-border-light)",
                                                fontWeight: 600,
                                                background:
                                                    "var(--color-bg-light)",
                                                cursor: header.column.getCanSort()
                                                    ? "pointer"
                                                    : "default",
                                            }}
                                            onClick={
                                                header.column.getCanSort()
                                                    ? header.column.getToggleSortingHandler()
                                                    : undefined
                                            }
                                        >
                                            {header.isPlaceholder ? null : (
                                                <span className="flex items-center">
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext()
                                                    )}
                                                    {enableSorting &&
                                                        header.column.getCanSort() && (
                                                            <SortIcon
                                                                isSorted={header.column.getIsSorted()}
                                                            />
                                                        )}
                                                </span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        {/* 바디 */}
                        <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={all_columns.length}
                                        className="p-[48px] text-center"
                                    >
                                        <Empty description={emptyText} />
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        onClick={() => handleRowClick(row)}
                                        onDoubleClick={() =>
                                            handleRowDoubleClick(row)
                                        }
                                        className={clsx({
                                            "data-table-row-selected":
                                                row.getIsSelected(),
                                            "data-table-row-hover": hoverable,
                                            [rowClassName?.(
                                                row.original,
                                                index
                                            ) ?? ""]: rowClassName,
                                        })}
                                        style={{
                                            cursor:
                                                onRowClick || onRowDoubleClick
                                                    ? "pointer"
                                                    : "default",
                                            background: row.getIsSelected()
                                                ? "var(--color-primary-light)"
                                                : striped && index % 2 === 1
                                                ? "var(--color-bg-light)"
                                                : "white",
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                style={{
                                                    padding:
                                                        size === "small"
                                                            ? "8px"
                                                            : "12px",
                                                    borderBottom:
                                                        "1px solid var(--color-border-light)",
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Spin>

            {/* 페이지네이션 */}
            {enablePagination && data.length > 0 && (
                <div className="flex justify-end py-lg">
                    <Pagination
                        current={pagination.pageIndex + 1}
                        pageSize={pagination.pageSize}
                        total={table.getFilteredRowModel().rows.length}
                        onChange={handlePaginationChange}
                        showSizeChanger
                        pageSizeOptions={pageSizeOptions.map(String)}
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} / ${total}건`
                        }
                        size={size === "small" ? "small" : undefined}
                    />
                </div>
            )}

            {/* 푸터 */}
            {footer && <div className="data-table-footer">{footer}</div>}
        </div>
    );
}

// ============================================================================
// 유틸리티 훅: useDataTable
// ============================================================================

export interface UseDataTableOptions<TData> {
    data: TData[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<TData, any>[];
    enableSorting?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    pageSize?: number;
    getRowId?: (row: TData) => string;
}

/**
 * DataTable 훅 (외부에서 테이블 인스턴스 제어 필요 시)
 */
export function useDataTable<TData>({
    data,
    columns,
    enableSorting = false,
    enablePagination = false,
    enableRowSelection = false,
    pageSize = 10,
    getRowId,
}: UseDataTableOptions<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
            ...(enablePagination && { pagination }),
        },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getPaginationRowModel: enablePagination
            ? getPaginationRowModel()
            : undefined,
        getRowId,
        enableRowSelection,
    });

    const getSelectedRows = useCallback(() => {
        return table.getSelectedRowModel().rows.map((row) => row.original);
    }, [table]);

    const clearSelection = useCallback(() => {
        setRowSelection({});
    }, []);

    return {
        table,
        sorting,
        setSorting,
        rowSelection,
        setRowSelection,
        pagination,
        setPagination,
        getSelectedRows,
        clearSelection,
    };
}

export default DataTable;
