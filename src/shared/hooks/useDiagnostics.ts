import { useState, useEffect, useCallback } from "react";
import { useWorkStore } from "@/store/useWorkStore";
import { useShortcutStore } from "@/store/useShortcutStore";
import {
    type DiagnosticEvent,
    buildDiagnosticReport,
    collectEnvironment,
    createDiagnosticFileName,
    getDiagnosticEvents,
    clearDiagnosticEvents,
    measureStorageBytes,
    subscribeToDiagnosticEvents,
} from "@/shared/lib/diagnostics";

const JSON_INDENT = 2;
const JSON_MIME_TYPE = "application/json";

export interface UseDiagnosticsReturn {
    events: DiagnosticEvent[];
    error_count: number;
    downloadReport: () => void;
    clearEvents: () => void;
}

/**
 * 수집된 진단 이벤트를 구독하고 리포트를 파일로 내려받는 훅
 */
export function useDiagnostics(): UseDiagnosticsReturn {
    const [events, setEvents] = useState<DiagnosticEvent[]>(
        getDiagnosticEvents
    );

    useEffect(() => subscribeToDiagnosticEvents(setEvents), []);

    const downloadReport = useCallback(() => {
        const store_state = useWorkStore.getState();
        const {
            records,
            templates,
            timer,
            custom_task_options,
            custom_category_options,
            hidden_autocomplete_options,
            deal_codes,
            category_codes,
            app_theme,
            lunch_start_time,
            lunch_end_time,
            transition_enabled,
            transition_speed,
            cursor_tracking_enabled,
            mobile_gantt_list_expanded,
            use_postfix_on_preset_add,
            selected_date,
        } = store_state;

        const report = buildDiagnosticReport({
            environment: collectEnvironment(),
            events: getDiagnosticEvents(),
            records,
            templates,
            timer,
            storage_bytes: measureStorageBytes(),
            settings: {
                custom_task_options,
                custom_category_options,
                hidden_autocomplete_options,
                deal_codes,
                category_codes,
                app_theme,
                lunch_start_time,
                lunch_end_time,
                transition_enabled,
                transition_speed,
                cursor_tracking_enabled,
                mobile_gantt_list_expanded,
                use_postfix_on_preset_add,
                selected_date,
                shortcuts: useShortcutStore.getState().shortcuts,
            },
        });

        const blob = new Blob([JSON.stringify(report, null, JSON_INDENT)], {
            type: JSON_MIME_TYPE,
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = createDiagnosticFileName();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    const clearEvents = useCallback(() => {
        clearDiagnosticEvents();
    }, []);

    return {
        events,
        error_count: events.filter((e) => e.level === "error").length,
        downloadReport,
        clearEvents,
    };
}
