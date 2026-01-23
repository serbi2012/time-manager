/**
 * 데스크탑 사이드바 컴포넌트
 */

import { Layout } from "antd";
import WorkTemplateList from "../../components/WorkTemplateList";

const { Sider } = Layout;

interface DesktopSidebarProps {
    on_add_record_only: (template_id: string) => void;
}

/**
 * 데스크탑 사이드바 컴포넌트
 */
export function DesktopSidebar({ on_add_record_only }: DesktopSidebarProps) {
    return (
        <Sider width={300} className="app-sider" theme="light">
            <WorkTemplateList onAddRecordOnly={on_add_record_only} />
        </Sider>
    );
}

export default DesktopSidebar;
