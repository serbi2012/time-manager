/**
 * AutoComplete option chip with toggle selection
 * Selected chips are dimmed to indicate pending hide
 */

import { cn } from "@/shared/lib/cn";

interface AutoCompleteChipProps {
    label: string;
    is_selected: boolean;
    onClick: () => void;
}

const BASE_CHIP_CLASS =
    "!inline-flex !items-center !gap-xs !px-sm !py-[5px] !rounded-full !text-xs !border !border-solid !cursor-pointer transition-all duration-200 !appearance-none";

const SELECTED_CHIP_CLASS =
    "!bg-[#fff1f0] !border-[#ffccc7] !text-[#ff4d4f] !opacity-70 !line-through";

const DEFAULT_CHIP_CLASS =
    "!bg-white !border-[#e8e8e8] !text-[rgba(0,0,0,0.75)] hover:!border-[#ff7875] hover:!text-[#ff4d4f]";

export function AutoCompleteChip({
    label,
    is_selected,
    onClick,
}: AutoCompleteChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                BASE_CHIP_CLASS,
                is_selected ? SELECTED_CHIP_CLASS : DEFAULT_CHIP_CLASS
            )}
        >
            {is_selected && <span className="text-[10px] font-bold">✕</span>}
            {label}
        </button>
    );
}
