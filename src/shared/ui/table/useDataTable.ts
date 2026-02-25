/**
 * DataTable 훅 (외부에서 테이블 인스턴스 제어 필요 시)
 */

import { useState, useCallback } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type SortingState,
    type RowSelectionState,
    type PaginationState,
} from "@tanstack/react-table";
import type { UseDataTableOptions } from "./DataTable.types";

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
