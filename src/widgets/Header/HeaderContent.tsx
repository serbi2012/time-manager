/**
 * 헤더 컨텐츠 (로고 + 타이틀)
 * 데스크탑/모바일 공통
 */

import { ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_LABELS } from "@/shared/constants";

export function HeaderContent() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/");
    };

    return (
        <div
            className="flex items-center gap-[10px] cursor-pointer"
            onClick={handleClick}
        >
            <ClockCircleOutlined style={{ color: "white", fontSize: 18 }} />
            <span className="text-md font-semibold text-white">{APP_LABELS.appName}</span>
        </div>
    );
}

export default HeaderContent;
