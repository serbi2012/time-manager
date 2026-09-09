import { cn } from "@/shared/lib/cn";

interface RecordCopyCellProps {
    value: string;
    align_right?: boolean;
    onCopy: (value: string) => void;
}

export function RecordCopyCell({
    value,
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
            onDoubleClick={() => onCopy(value)}
        >
            {value}
        </td>
    );
}
