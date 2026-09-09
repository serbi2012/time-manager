import type { RecordCopyRow } from "../../lib";
import { RECORD_COPY_COLUMNS } from "../../constants";
import { RecordCopyCell } from "./RecordCopyCell";
import { DealCodeCell } from "./DealCodeCell";

const DURATION_COLUMN_INDEX = 3;

interface RecordCopyTableProps {
    rows: RecordCopyRow[];
    onCopyCell: (value: string) => void;
    onSaveDealCode: (deal_name: string, code: string) => void;
}

export function RecordCopyTable({
    rows,
    onCopyCell,
    onSaveDealCode,
}: RecordCopyTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border-default select-text">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-bg-light">
                        {RECORD_COPY_COLUMNS.map((column, index) => (
                            <th
                                key={column}
                                className={
                                    index === DURATION_COLUMN_INDEX
                                        ? "px-md py-sm text-right text-sm font-semibold text-text-secondary border-b border-border-default whitespace-nowrap"
                                        : "px-md py-sm text-left text-sm font-semibold text-text-secondary border-b border-border-default whitespace-nowrap"
                                }
                            >
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.record_id} className="hover:bg-bg-light">
                            <RecordCopyCell
                                value={row.work_name}
                                onCopy={onCopyCell}
                            />
                            <DealCodeCell
                                deal_name={row.deal_name}
                                code={row.deal_code}
                                onSave={onSaveDealCode}
                            />
                            <RecordCopyCell
                                value={row.deal_name}
                                onCopy={onCopyCell}
                            />
                            <RecordCopyCell
                                value={row.duration_text}
                                align_right
                                onCopy={onCopyCell}
                            />
                            <RecordCopyCell
                                value={row.category_name}
                                onCopy={onCopyCell}
                            />
                            <RecordCopyCell
                                value={row.note}
                                onCopy={onCopyCell}
                            />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
