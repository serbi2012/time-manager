/**
 * 복사 형식 선택 컴포넌트
 */

import { Radio, Space, Button } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import type { CopyFormat } from "../lib/copy_formatter";
import { COPY_FORMAT_LABELS } from "../lib/copy_formatter";

export interface CopyFormatSelectorProps {
    selected_format: CopyFormat;
    on_format_change: (format: CopyFormat) => void;
    on_copy: () => void;
    disabled?: boolean;
}

/**
 * 복사 형식 선택 컴포넌트
 */
export function CopyFormatSelector({
    selected_format,
    on_format_change,
    on_copy,
    disabled = false,
}: CopyFormatSelectorProps) {
    return (
        <div className="copy-format-selector">
            <Space wrap>
                <Radio.Group
                    value={selected_format}
                    onChange={(e) => on_format_change(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                    size="small"
                >
                    {(Object.keys(COPY_FORMAT_LABELS) as CopyFormat[]).map(
                        (format) => (
                            <Radio.Button key={format} value={format}>
                                {COPY_FORMAT_LABELS[format]}
                            </Radio.Button>
                        )
                    )}
                </Radio.Group>
                
                <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={on_copy}
                    disabled={disabled}
                >
                    복사
                </Button>
            </Space>
            
            <style>{`
                .copy-format-selector {
                    padding: 12px 0;
                }
            `}</style>
        </div>
    );
}

export default CopyFormatSelector;
