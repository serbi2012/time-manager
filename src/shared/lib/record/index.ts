/**
 * 레코드 관련 유틸리티 함수
 *
 * @example
 * import { generateDealName, createRecordFromTemplate } from '@/shared/lib/record';
 */

export {
    generateDealName,
    generateUniqueId,
    generateSequentialDealName,
    extractNumberFromDealName,
    type GenerateDealNameParams,
} from "./deal_name_generator";

export {
    createRecordFromTemplate,
    createEmptyRecord,
    type CreateRecordFromTemplateParams,
    type CreateEmptyRecordParams,
} from "./record_creator";
