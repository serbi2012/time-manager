/**
 * DataTable 헤더 (thead) 렌더링 컴포넌트
 */

import { flexRender, type Table as ReactTable } from "@tanstack/react-table";
import { SortIcon } from "./SortIcon";

interface DataTableHeaderProps<TData> {
    table: ReactTable<TData>;
    size: "small" | "middle" | "large";
    enableSorting: boolean;
}

export function DataTableHeader<TData>({
    table,
    size,
    enableSorting,
}: DataTableHeaderProps<TData>) {
    return (
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
                                padding: size === "small" ? "8px" : "12px",
                                textAlign: "left",
                                borderBottom:
                                    "1px solid var(--color-border-light)",
                                fontWeight: 600,
                                background: "var(--color-bg-light)",
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
                                        header.column.columnDef.header,
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
    );
}
