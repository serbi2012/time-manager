/**
 * 헤더 컨텐츠 (로고 + 타이틀)
 * 데스크탑/모바일 공통
 */

import { Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

/**
 * 헤더 컨텐츠 컴포넌트
 */
export function HeaderContent() {
    return (
        <div className="header-content">
            <ClockCircleOutlined className="header-icon" />
            <Title level={4} className="header-title">
                업무 시간 관리
            </Title>
        </div>
    );
}

export default HeaderContent;
