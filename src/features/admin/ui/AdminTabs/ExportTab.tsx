/**
 * 내보내기 탭
 */

import { ExportPanel } from "../DataExport";
import type { WorkRecord } from "../../../../shared/types";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";

interface ExportTabProps {
    records: WorkRecord[];
    time_format: TimeDisplayFormat;
}

export function ExportTab({ records, time_format }: ExportTabProps) {
    return <ExportPanel records={records} time_format={time_format} />;
}
