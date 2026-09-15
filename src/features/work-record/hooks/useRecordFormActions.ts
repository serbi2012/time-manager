/**
 * 작업 추가·수정 저장 로직
 * 모바일 시트와 데스크탑 모달이 같은 로직을 쓴다
 */

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { message } from "@/shared/lib/message";
import { useWorkStore } from "@/store/useWorkStore";
import type { WorkRecord } from "@/shared/types";

import {
    buildNewRecord,
    normalizeRecordFormValues,
    isSameAsActiveWork,
    type RecordFormValues,
} from "../lib/record_form";
import { RECORD_SUCCESS, DEFAULT_PROJECT_CODE } from "../constants";

/** 타이머만 실행 중인 가상 레코드의 id */
const ACTIVE_RECORD_ID = "__active__";

export interface UseRecordFormActionsReturn {
    submitAdd: (values: RecordFormValues) => WorkRecord;
    submitEdit: (record: WorkRecord, values: RecordFormValues) => void;
}

export function useRecordFormActions(): UseRecordFormActionsReturn {
    const { selected_date, timer, addRecord, updateRecord, updateActiveFormData } =
        useWorkStore(
            useShallow((s) => ({
                selected_date: s.selected_date,
                timer: s.timer,
                addRecord: s.addRecord,
                updateRecord: s.updateRecord,
                updateActiveFormData: s.updateActiveFormData,
            }))
        );

    const submitAdd = useCallback(
        (values: RecordFormValues) => {
            const new_record = buildNewRecord({
                values,
                selected_date,
                id: crypto.randomUUID(),
                default_project_code: DEFAULT_PROJECT_CODE,
            });

            addRecord(new_record);
            message.success(RECORD_SUCCESS.ADDED);

            return new_record;
        },
        [selected_date, addRecord]
    );

    const submitEdit = useCallback(
        (record: WorkRecord, values: RecordFormValues) => {
            const updated_data = normalizeRecordFormValues(values);

            if (record.id === ACTIVE_RECORD_ID) {
                updateActiveFormData(updated_data);
                message.success(RECORD_SUCCESS.UPDATED);
                return;
            }

            updateRecord(record.id, updated_data);

            if (
                timer.is_running &&
                isSameAsActiveWork(record, timer.active_form_data)
            ) {
                updateActiveFormData(updated_data);
            }

            message.success(RECORD_SUCCESS.UPDATED);
        },
        [timer, updateRecord, updateActiveFormData]
    );

    return { submitAdd, submitEdit };
}
