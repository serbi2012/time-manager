/**
 * 색상 선택기 컴포넌트
 */

import { Tooltip } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import type { ColorPickerProps } from "../model/types";
import { TEMPLATE_COLORS } from "../../../shared/config";

/**
 * 색상 선택기 컴포넌트
 */
export function ColorPicker({ selected_color, on_change }: ColorPickerProps) {
    return (
        <div className="color-picker">
            {TEMPLATE_COLORS.map((color) => (
                <Tooltip key={color} title={color}>
                    <button
                        type="button"
                        className={`color-swatch ${
                            selected_color === color ? "color-swatch-selected" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => on_change(color)}
                    >
                        {selected_color === color && (
                            <CheckOutlined className="!text-white" />
                        )}
                    </button>
                </Tooltip>
            ))}

            <style>{`
                .color-picker {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .color-swatch {
                    width: 28px;
                    height: 28px;
                    border-radius: 4px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, border-color 0.2s;
                }
                .color-swatch:hover {
                    transform: scale(1.1);
                }
                .color-swatch-selected {
                    border-color: #333;
                }
            `}</style>
        </div>
    );
}

export default ColorPicker;
