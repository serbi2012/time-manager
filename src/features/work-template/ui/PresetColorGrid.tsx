import { ColorPicker as AntColorPicker } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { cn } from "@/shared/lib/cn";
import { TEMPLATE_COLORS } from "@/shared/config";

const CUSTOM_COLOR_LABEL = "직접 선택";

interface PresetColorGridProps {
    value?: string;
    onChange?: (color: string) => void;
}

export function PresetColorGrid({ value, onChange }: PresetColorGridProps) {
    const selected = value || TEMPLATE_COLORS[0];
    const is_custom = !TEMPLATE_COLORS.includes(selected);

    return (
        <div className="flex flex-col gap-md">
            {/* Preset colors */}
            <div className="flex flex-wrap gap-sm">
                {TEMPLATE_COLORS.map((color) => {
                    const is_selected = selected === color;

                    return (
                        <button
                            key={color}
                            type="button"
                            onClick={() => onChange?.(color)}
                            className={cn(
                                "w-8 h-8 rounded-full border-2 cursor-pointer",
                                "flex items-center justify-center",
                                "transition-all duration-200",
                                "hover:scale-110",
                                "active:scale-95",
                                is_selected
                                    ? "border-gray-800 shadow-sm"
                                    : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                        >
                            {is_selected && (
                                <CheckOutlined className="!text-white !text-xs" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Custom color picker */}
            <div className="flex items-center gap-sm">
                <AntColorPicker
                    value={selected}
                    onChange={(color) => onChange?.(color.toHexString())}
                    size="small"
                    showText={() => (
                        <span className="text-xs text-text-secondary">
                            {CUSTOM_COLOR_LABEL}
                        </span>
                    )}
                    presets={[{ label: "프리셋", colors: TEMPLATE_COLORS }]}
                />
                {is_custom && (
                    <span className="text-xs text-text-secondary">
                        {selected}
                    </span>
                )}
            </div>
        </div>
    );
}
