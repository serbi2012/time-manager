/**
 * DataTable - @tanstack/react-table 기반 공통 테이블 컴포넌트
 *
 * WorkRecordTable, AdminSessionGrid 등에서 중복되던 테이블 패턴을 통합
 * 정렬, 필터링, 페이지네이션, 행 선택 등을 지원
 *
 * @example
 * <DataTable data={records} columns={columns} />
 *
 * @example
 * <DataTable
 *   data={records}
 *   columns={columns}
 *   enableSorting
 *   enablePagination
 *   pageSize={10}
 * />
 */

import { useMemo, useState, useCallback } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    createColumnHelper,
    type ColumnDef,
    type SortingState,
    type RowSelectionState,
    type ColumnFiltersState,
    type PaginationState,
    type Row,
} from "@tanstack/react-table";
import { Pagination, Spin, Checkbox } from "antd";
import clsx from "clsx";

import type { DataTableProps } from "./DataTable.types";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableBody } from "./DataTableBody";

/**
 * 컬럼 헬퍼 생성
 */
export function createDataTableColumnHelper<TData>() {
    return createColumnHelper<TData>();
}

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
    // 핸들러
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
            {title && <div className="data-table-title">{title}</div>}

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
                            { [`data-table-${size}`]: size },
                            "w-full border-collapse"
                        )}
                    >
                        <DataTableHeader
                            table={table}
                            size={size}
                            enableSorting={enableSorting}
                        />
                        <DataTableBody
                            table={table}
                            all_columns={all_columns}
                            size={size}
                            emptyText={emptyText}
                            hoverable={hoverable}
                            striped={striped}
                            rowClassName={rowClassName}
                            onRowClick={handleRowClick}
                            onRowDoubleClick={handleRowDoubleClick}
                            clickable={!!(onRowClick || onRowDoubleClick)}
                        />
                    </table>
                </div>
            </Spin>

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

            {footer && <div className="data-table-footer">{footer}</div>}
        </div>
    );
}

export default DataTable;
