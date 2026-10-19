/**
 * 데스크탑 사이드바 컴포넌트
 */

import { Layout } from "antd";
import { CursorHaloContainer } from "@/shared/ui/cursor-tracking";
import { useResizableWidth } from "@/shared/hooks";
import { cn } from "@/shared/lib/cn";
import { SIDEBAR_WIDTH, STORAGE_KEYS } from "@/shared/constants";
import WorkTemplateList from "../../components/WorkTemplateList";
import { SidebarResizeHandle } from "./SidebarResizeHandle";

const { Sider } = Layout;

interface DesktopSidebarProps {
    on_add_record_only: (template_id: string) => void;
}

/**
 * 데스크탑 사이드바 컴포넌트
 */
export function DesktopSidebar({ on_add_record_only }: DesktopSidebarProps) {
    const { width, is_resizing, handle_props } = useResizableWidth({
        storage_key: STORAGE_KEYS.SIDEBAR_WIDTH,
        default_width: SIDEBAR_WIDTH.DEFAULT,
        min_width: SIDEBAR_WIDTH.MIN,
        max_width: SIDEBAR_WIDTH.MAX,
    });

    return (
        <div className="relative flex h-full">
            <Sider
                width={width}
                className={cn("app-sider", is_resizing && "!transition-none")}
                theme="light"
            >
                <CursorHaloContainer className="h-full">
                    <WorkTemplateList onAddRecordOnly={on_add_record_only} />
                </CursorHaloContainer>
            </Sider>
            <SidebarResizeHandle
                is_resizing={is_resizing}
                handle_props={handle_props}
                className="absolute inset-y-0 -right-xs z-(--z-dropdown)"
            />
        </div>
    );
}

export default DesktopSidebar;
