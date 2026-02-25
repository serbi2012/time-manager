/**
 * DataTable 관련 타입 정의
 */

import type {
    ColumnDef,
    SortingState,
    Table as ReactTable,
} from "@tanstack/react-table";

export interface DataTableProps<TData> {
    data: TData[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<TData, any>[];
    loading?: boolean;
    emptyText?: string;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;
    defaultSorting?: SortingState;
    pageSize?: number;
    pageSizeOptions?: number[];
    onRowSelectionChange?: (selectedRows: TData[]) => void;
    onRowClick?: (row: TData) => void;
    onRowDoubleClick?: (row: TData) => void;
    onSortingChange?: (sorting: SortingState) => void;
    getRowId?: (row: TData) => string;
    selectedRowIds?: string[];
    className?: string;
    style?: React.CSSProperties;
    rowClassName?: (row: TData, index: number) => string;
    size?: "small" | "middle" | "large";
    title?: React.ReactNode;
    footer?: React.ReactNode;
    scroll?: { x?: number | string; y?: number | string };
    bordered?: boolean;
    striped?: boolean;
    hoverable?: boolean;
}

export interface DataTableRef<TData> {
    table: ReactTable<TData>;
    getSelectedRows: () => TData[];
    clearSelection: () => void;
}

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
