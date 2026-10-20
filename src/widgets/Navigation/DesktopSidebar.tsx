/**
 * 데스크탑 사이드바 컴포넌트
 */

import { Layout } from "antd";
import { useShallow } from "zustand/react/shallow";
import { CursorHaloContainer } from "@/shared/ui/cursor-tracking";
import { SidebarToggleButton } from "@/shared/ui";
import { useResizableWidth } from "@/shared/hooks";
import { cn } from "@/shared/lib/cn";
import { SIDEBAR_WIDTH, STORAGE_KEYS } from "@/shared/constants";
import { useSidebarStore } from "@/store/useSidebarStore";
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
    const { is_collapsed, toggleCollapsed } = useSidebarStore(
        useShallow((state) => ({
            is_collapsed: state.is_collapsed,
            toggleCollapsed: state.toggleCollapsed,
        }))
    );

    return (
        <div className="relative flex h-full">
            <Sider
                width={width}
                collapsible
                collapsed={is_collapsed}
                collapsedWidth={SIDEBAR_WIDTH.COLLAPSED}
                trigger={null}
                className={cn(
                    "app-sider !overflow-hidden",
                    is_resizing && "!transition-none"
                )}
                theme="light"
            >
                {is_collapsed && (
                    <div className="flex justify-center pt-lg">
                        <SidebarToggleButton
                            is_collapsed
                            onToggle={toggleCollapsed}
                        />
                    </div>
                )}
                <div
                    className={cn("h-full shrink-0", is_collapsed && "hidden")}
                    style={{ width }}
                >
                    <CursorHaloContainer className="h-full">
                        <WorkTemplateList onAddRecordOnly={on_add_record_only} />
                    </CursorHaloContainer>
                </div>
            </Sider>
            {!is_collapsed && (
                <SidebarResizeHandle
                    is_resizing={is_resizing}
                    handle_props={handle_props}
                    className="absolute inset-y-0 -right-xs z-(--z-dropdown)"
                />
            )}
        </div>
    );
}

export default DesktopSidebar;
