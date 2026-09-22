export interface ResolveCopyCellValueOptions {
    /** 셀에 보이는 값 */
    value: string;
    /** 셀에 연결된 거래코드 */
    code?: string;
    /** Ctrl(맥은 ⌘)을 누른 채 더블클릭했는가 */
    with_modifier: boolean;
    /** 거래코드 우선 복사 설정 */
    prefer_code: boolean;
}

/**
 * 더블클릭한 셀에서 무엇을 복사할지 정한다
 * 설정이 켜져 있고 거래코드가 있으면 코드를, 수식키를 누르면 이름을 복사한다
 */
export function resolveCopyCellValue({
    value,
    code,
    with_modifier,
    prefer_code,
}: ResolveCopyCellValueOptions): string {
    if (!prefer_code || with_modifier || !code) return value;

    return code;
}
