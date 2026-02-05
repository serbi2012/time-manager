/**
 * 작업 템플릿 리스트 플랫폼 스위칭 진입점
 */

import { useResponsive } from "@/hooks/useResponsive";
import { DesktopWorkTemplateList } from "@/features/work-template/ui/Desktop/DesktopWorkTemplateList";
import { MobileWorkTemplateList } from "@/features/work-template/ui/Mobile/MobileWorkTemplateList";

interface WorkTemplateListProps {
    onAddRecordOnly?: (template_id: string) => void;
}

export default function WorkTemplateList({
    onAddRecordOnly,
}: WorkTemplateListProps) {
    const { is_mobile } = useResponsive();

    if (is_mobile) {
        return <MobileWorkTemplateList onAddRecordOnly={onAddRecordOnly} />;
    }

    return <DesktopWorkTemplateList onAddRecordOnly={onAddRecordOnly} />;
}
