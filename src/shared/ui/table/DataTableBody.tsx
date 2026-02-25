/**
 * DataTable 바디 (tbody) 렌더링 컴포넌트
 */

import {
    flexRender,
    type Table as ReactTable,
    type Row,
    type ColumnDef,
} from "@tanstack/react-table";
import { Empty } from "antd";
import clsx from "clsx";

interface DataTableBodyProps<TData> {
    table: ReactTable<TData>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all_columns: ColumnDef<TData, any>[];
    size: "small" | "middle" | "large";
    emptyText: string;
    hoverable: boolean;
    striped: boolean;
    rowClassName?: (row: TData, index: number) => string;
    onRowClick?: (row: Row<TData>) => void;
    onRowDoubleClick?: (row: Row<TData>) => void;
    clickable: boolean;
}

export function DataTableBody<TData>({
    table,
    all_columns,
    size,
    emptyText,
    hoverable,
    striped,
    rowClassName,
    onRowClick,
    onRowDoubleClick,
    clickable,
}: DataTableBodyProps<TData>) {
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
        return (
            <tbody>
                <tr>
                    <td
                        colSpan={all_columns.length}
                        className="p-[48px] text-center"
                    >
                        <Empty description={emptyText} />
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {rows.map((row, index) => (
                <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    onDoubleClick={() => onRowDoubleClick?.(row)}
                    className={clsx({
                        "data-table-row-selected": row.getIsSelected(),
                        "data-table-row-hover": hoverable,
                        [rowClassName?.(row.original, index) ?? ""]:
                            rowClassName,
                    })}
                    style={{
                        cursor: clickable ? "pointer" : "default",
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
                                padding: size === "small" ? "8px" : "12px",
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
            ))}
        </tbody>
    );
}
