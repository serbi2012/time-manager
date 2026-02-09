/**
 * 주간 일정 복사 미리보기 섹션
 */

import { Divider, Typography, Radio } from "antd";
import type { DayGroup } from "../../lib/week_grouper";
import { generateWeeklyCopyText } from "../../lib/weekly_copy_text";
import type { WeeklyCopyFormat } from "../../hooks/useCopyFormat";
import { WEEKLY_LABELS } from "../../constants";

const { Title } = Typography;

export interface CopyPreviewSectionProps {
    day_groups: DayGroup[];
    copy_format: WeeklyCopyFormat;
    on_format_change: (format: WeeklyCopyFormat) => void;
}

export function CopyPreviewSection({
    day_groups,
    copy_format,
    on_format_change,
}: CopyPreviewSectionProps) {
    const copy_text = generateWeeklyCopyText(day_groups, copy_format);

    return (
        <>
            <Divider className="!my-lg" />
            <div className="preview-section">
                <div className="preview-header">
                    <Title level={5} className="!m-0">
                        {WEEKLY_LABELS.copyPreview}
                    </Title>
                    <Radio.Group
                        value={copy_format}
                        onChange={(e) => on_format_change(e.target.value)}
                        size="small"
                    >
                        <Radio.Button value={1}>
                            {WEEKLY_LABELS.format1}
                        </Radio.Button>
                        <Radio.Button value={2}>
                            {WEEKLY_LABELS.format2}
                        </Radio.Button>
                    </Radio.Group>
                </div>
                <pre className="copy-preview">{copy_text}</pre>
            </div>
        </>
    );
}
