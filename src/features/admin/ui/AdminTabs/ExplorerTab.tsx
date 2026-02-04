/**
 * 데이터 탐색기 탭
 */

import { Tabs } from "antd";
import { RecordsExplorer, SessionsExplorer } from "../DataExplorer";
import type { WorkRecord } from "../../../../shared/types";
import type { TimeDisplayFormat } from "../../hooks/useAdminFilters";
import { EXPLORER_TAB_RECORDS, EXPLORER_TAB_SESSIONS } from "../../constants";

interface ExplorerTabProps {
    records: WorkRecord[];
    time_format: TimeDisplayFormat;
}

export function ExplorerTab({ records, time_format }: ExplorerTabProps) {
    return (
        <Tabs
            defaultActiveKey="records"
            items={[
                {
                    key: "records",
                    label: EXPLORER_TAB_RECORDS,
                    children: (
                        <RecordsExplorer
                            records={records}
                            time_format={time_format}
                        />
                    ),
                },
                {
                    key: "sessions",
                    label: EXPLORER_TAB_SESSIONS,
                    children: (
                        <SessionsExplorer
                            records={records}
                            time_format={time_format}
                        />
                    ),
                },
            ]}
        />
    );
}
