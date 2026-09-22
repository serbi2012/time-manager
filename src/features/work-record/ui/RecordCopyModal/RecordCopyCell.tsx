import { cn } from "@/shared/lib/cn";

export interface RecordCopyCellCopyOptions {
    /** 셀에 연결된 거래코드 */
    code?: string;
    /** Ctrl(맥은 ⌘)을 누른 채 더블클릭했는가 */
    with_modifier: boolean;
}

interface RecordCopyCellProps {
    value: string;
    /** 더블클릭 시 대신 복사할 수 있는 거래코드 */
    code?: string;
    align_right?: boolean;
    onCopy: (value: string, options: RecordCopyCellCopyOptions) => void;
}

export function RecordCopyCell({
    value,
    code,
    align_right,
    onCopy,
}: RecordCopyCellProps) {
    return (
        <td
            className={cn(
                "px-md py-sm border-b border-border-light align-top",
                "text-md text-text-primary whitespace-pre-wrap break-words",
                "cursor-copy hover:bg-primary-light transition-colors duration-150",
                align_right && "text-right tabular-nums"
            )}
            onDoubleClick={(event) =>
                onCopy(value, {
                    code,
                    with_modifier: event.ctrlKey || event.metaKey,
                })
            }
        >
            {value}
        </td>
    );
}
