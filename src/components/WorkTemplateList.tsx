/**
 * 작업 프리셋 리스트 (데스크탑 진입점)
 *
 * 모바일은 MobilePresetSheet가 자체 화면을 구성한다.
 */

import { DesktopWorkTemplateList } from "@/features/work-template/ui/Desktop/DesktopWorkTemplateList";

interface WorkTemplateListProps {
    onAddRecordOnly?: (template_id: string) => void;
}

export default function WorkTemplateList({
    onAddRecordOnly,
}: WorkTemplateListProps) {
    return <DesktopWorkTemplateList onAddRecordOnly={onAddRecordOnly} />;
}
