/**
 * 레코드 생성 훅
 *
 * 템플릿에서 레코드를 생성하는 공통 로직을 제공합니다.
 * Desktop/Mobile DailyPage에서 중복되던 handleAddRecordOnly 로직을 통합합니다.
 */

import { useCallback } from "react";
import { message } from "antd";
import { useWorkStore } from "../../store/useWorkStore";
import {
    generateDealName,
    createRecordFromTemplate,
    createEmptyRecord,
} from "../lib/record";

/**
 * 레코드 생성 훅 반환 타입
 */
export interface UseRecordCreationReturn {
    /**
     * 템플릿에서 레코드 생성
     * @param template_id - 생성할 템플릿 ID
     * @returns 생성된 레코드 또는 null (실패 시)
     */
    createFromTemplate: (
        template_id: string
    ) => ReturnType<typeof createRecordFromTemplate> | null;

    /**
     * 빈 레코드 생성
     * @returns 생성된 빈 레코드
     */
    createEmpty: () => ReturnType<typeof createEmptyRecord>;
}

/**
 * 레코드 생성 훅
 *
 * @example
 * ```tsx
 * const { createFromTemplate, createEmpty } = useRecordCreation();
 *
 * // 템플릿에서 레코드 생성
 * const handleAddFromPreset = (template_id: string) => {
 *   createFromTemplate(template_id);
 * };
 *
 * // 빈 레코드 생성
 * const handleAddEmpty = () => {
 *   createEmpty();
 * };
 * ```
 */
export function useRecordCreation(): UseRecordCreationReturn {
    const addRecord = useWorkStore((s) => s.addRecord);

    /**
     * 템플릿에서 레코드 생성
     */
    const createFromTemplate = useCallback(
        (template_id: string) => {
            const state = useWorkStore.getState();
            const template = state.templates.find((t) => t.id === template_id);

            if (!template) {
                message.error("템플릿을 찾을 수 없습니다");
                return null;
            }

            // deal_name 생성
            const deal_name = generateDealName({
                template,
                existing_records: state.records,
                use_postfix: state.use_postfix_on_preset_add,
            });

            // 레코드 생성
            const new_record = createRecordFromTemplate({
                template,
                deal_name,
                date: state.selected_date,
            });

            // 스토어에 추가
            addRecord(new_record);
            message.success(`"${template.work_name}" 작업이 추가되었습니다`);

            return new_record;
        },
        [addRecord]
    );

    /**
     * 빈 레코드 생성
     */
    const createEmpty = useCallback(() => {
        const state = useWorkStore.getState();

        const new_record = createEmptyRecord({
            date: state.selected_date,
        });

        addRecord(new_record);
        return new_record;
    }, [addRecord]);

    return {
        createFromTemplate,
        createEmpty,
    };
}
