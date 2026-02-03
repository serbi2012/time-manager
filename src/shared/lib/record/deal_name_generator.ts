/**
 * deal_name 생성 유틸리티
 *
 * 레코드 생성 시 고유한 deal_name을 생성하는 순수 함수들
 */

import type { WorkTemplate, WorkRecord } from "../../types";

/**
 * 타임스탬프 기반 고유 ID 생성
 * 형식: MMdd_HHmmss_xxx (예: 0203_143052_042)
 */
export function generateUniqueId(): string {
    const now = new Date();
    const random_suffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");

    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${month}${day}_${hours}${minutes}${seconds}_${random_suffix}`;
}

/**
 * 기존 deal_name에서 번호 추출
 * "작업명 (3)" -> 3, "작업명" -> 0
 */
export function extractNumberFromDealName(deal_name: string): number {
    const match = deal_name.match(/\((\d+)\)$/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * 중복을 피하는 deal_name 생성 (순차 번호 방식)
 * "작업" -> "작업" / "작업 (2)" / "작업 (3)" ...
 */
export function generateSequentialDealName(
    base_name: string,
    existing_records: WorkRecord[]
): string {
    // 같은 base_name을 가진 레코드들 필터링
    const matching_records = existing_records.filter(
        (r) =>
            !r.is_deleted &&
            !r.is_completed &&
            (r.deal_name === base_name ||
                r.deal_name.match(
                    new RegExp(`^${escapeRegExp(base_name)} \\(\\d+\\)$`)
                ))
    );

    if (matching_records.length === 0) {
        return base_name;
    }

    // 기존 번호들 추출
    const numbers = matching_records.map((r) =>
        extractNumberFromDealName(r.deal_name)
    );

    // 최대 번호 + 1
    const max_num = Math.max(...numbers, 1);
    return `${base_name} (${max_num + 1})`;
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface GenerateDealNameParams {
    template: WorkTemplate;
    existing_records: WorkRecord[];
    use_postfix: boolean;
}

/**
 * 템플릿과 기존 레코드를 기반으로 고유한 deal_name 생성
 *
 * @param params.template - 작업 템플릿
 * @param params.existing_records - 기존 레코드 목록
 * @param params.use_postfix - 타임스탬프 접미사 사용 여부
 * @returns 고유한 deal_name
 *
 * @example
 * // use_postfix = true인 경우
 * generateDealName({ template, existing_records, use_postfix: true })
 * // -> "작업_0203_143052_042"
 *
 * // use_postfix = false인 경우 (순차 번호)
 * generateDealName({ template, existing_records, use_postfix: false })
 * // -> "작업" / "작업 (2)" / "작업 (3)" ...
 */
export function generateDealName(params: GenerateDealNameParams): string {
    const { template, existing_records, use_postfix } = params;
    const base_name = template.deal_name || "작업";

    if (use_postfix) {
        // 타임스탬프 방식: deal_name_MMdd_HHmmss_xxx
        const unique_id = generateUniqueId();
        return template.deal_name
            ? `${template.deal_name}_${unique_id}`
            : `작업_${unique_id}`;
    }

    // 순차 번호 방식
    // 같은 work_name을 가진 레코드들만 대상으로 중복 체크
    const records_with_same_work = existing_records.filter(
        (r) => r.work_name === template.work_name
    );

    return generateSequentialDealName(base_name, records_with_same_work);
}
