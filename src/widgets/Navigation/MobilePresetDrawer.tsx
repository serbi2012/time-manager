/**
 * 모바일 프리셋 드로어 컴포넌트
 */

import { Drawer } from "antd";
import WorkTemplateList from "../../components/WorkTemplateList";
import { PRESET_LABELS } from "@/shared/constants";

const DRAWER_BODY_STYLE = { padding: 12 };
const DRAWER_WRAPPER_STYLE = { maxHeight: "70vh" };

interface MobilePresetDrawerProps {
    is_open: boolean;
    on_close: () => void;
    on_add_record_only: (template_id: string) => void;
    on_start_record: (template_id: string) => void;
}

/**
 * 모바일 프리셋 드로어 컴포넌트
 */
export function MobilePresetDrawer({
    is_open,
    on_close,
    on_add_record_only,
    on_start_record,
}: MobilePresetDrawerProps) {
    return (
        <Drawer
            title={PRESET_LABELS.title}
            placement="bottom"
            open={is_open}
            onClose={on_close}
            className="mobile-preset-drawer"
            styles={{
                body: DRAWER_BODY_STYLE,
                wrapper: DRAWER_WRAPPER_STYLE,
            }}
        >
            <WorkTemplateList
                onAddRecordOnly={on_add_record_only}
                onStartRecordFromTemplate={on_start_record}
            />
        </Drawer>
    );
}

export default MobilePresetDrawer;
