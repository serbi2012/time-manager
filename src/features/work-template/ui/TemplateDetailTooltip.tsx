import type { WorkTemplate } from "@/shared/types";
import { buildTemplateDetailRows } from "../lib/template_detail";

interface TemplateDetailTooltipProps {
    template: WorkTemplate;
}

export function TemplateDetailTooltip({ template }: TemplateDetailTooltipProps) {
    const rows = buildTemplateDetailRows(template);

    return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-md gap-y-xs m-0 py-xs text-sm">
            {rows.map((row) => (
                <div key={row.label} className="contents">
                    <dt className="text-white/60 whitespace-nowrap">
                        {row.label}
                    </dt>
                    <dd className="m-0 text-white break-words whitespace-pre-wrap">
                        {row.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
