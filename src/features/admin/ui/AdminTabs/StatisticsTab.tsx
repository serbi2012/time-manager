/**
 * 통계 탭
 */

import { StatsDashboard } from "../Statistics";
import type { WorkRecord } from "../../../../shared/types";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";

interface StatisticsTabProps {
    records: WorkRecord[];
    time_format: TimeDisplayFormat;
}

export function StatisticsTab({ records, time_format }: StatisticsTabProps) {
    return <StatsDashboard records={records} time_format={time_format} />;
}
