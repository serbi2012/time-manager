/**
 * 세션 테이블 셀 컴포넌트 (JSX in column render 분리)
 */

import { Space, Tag, Tooltip, Typography } from "antd";
import {
    WarningOutlined,
    BugOutlined,
    ExclamationCircleOutlined,
    EyeInvisibleOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import type { SessionWithMeta } from "../../lib/conflict_finder";
import type { ProblemInfo } from "../../lib/problem_detector";
import {
    TABLE_TAG_RUNNING,
    TABLE_TAG_INVISIBLE,
    TABLE_TAG_DISPLAY,
} from "../../constants";
import {
    TABLE_TOOLTIP_CONFLICT,
    TABLE_TOOLTIP_PROBLEM,
    TABLE_TOOLTIP_GANTT_INVISIBLE,
} from "../../constants";
const { Text } = Typography;

interface SessionWithMetaRecord extends SessionWithMeta {
    key?: string;
}

export function SessionDateCell({ date }: { date: string }) {
    return <Text className="!whitespace-nowrap">{date}</Text>;
}

export function SessionTimeCell({ record }: { record: SessionWithMetaRecord }) {
    if (record.end_time === "") {
        return (
            <Space size={4}>
                <Text className="!whitespace-nowrap !font-mono">
                    {record.start_time} ~
                </Text>
                <Tag color="green" icon={<PlayCircleOutlined />}>
                    {TABLE_TAG_RUNNING}
                </Tag>
            </Space>
        );
    }
    return (
        <Text className="!whitespace-nowrap !font-mono">
            {record.start_time} ~ {record.end_time}
        </Text>
    );
}

export function SessionConflictCell({
    record,
    conflict_pairs,
}: {
    record: SessionWithMetaRecord;
    conflict_pairs: Map<string, SessionWithMeta[]>;
}) {
    const conflicting = conflict_pairs.get(record.id);
    if (!conflicting || conflicting.length === 0) {
        return <Text type="secondary">-</Text>;
    }
    const tooltipContent = (
        <div>
            <div className="mb-sm font-bold">{TABLE_TOOLTIP_CONFLICT}</div>
            {conflicting.map((c, idx) => (
                <div key={idx} className="mb-xs">
                    • {c.work_name} ({c.start_time}~{c.end_time})
                </div>
            ))}
        </div>
    );
    return (
        <Tooltip title={tooltipContent} placement="left">
            <Tag color="red" className="!cursor-help">
                <WarningOutlined /> {conflicting.length}
            </Tag>
        </Tooltip>
    );
}

function getProblemTagColor(type: string): string {
    switch (type) {
        case "zero_duration":
            return "orange";
        case "missing_time":
            return "red";
        case "invalid_time":
            return "magenta";
        case "future_time":
            return "purple";
        default:
            return "default";
    }
}

export function SessionProblemCell({
    record,
    problems,
}: {
    record: SessionWithMetaRecord;
    problems: Map<string, ProblemInfo[]>;
}) {
    const list = problems.get(record.id);
    if (!list || list.length === 0) {
        return <Text type="secondary">-</Text>;
    }
    const tooltipContent = (
        <div>
            <div className="mb-sm font-bold">
                <BugOutlined /> {TABLE_TOOLTIP_PROBLEM}
            </div>
            {list.map((p, idx) => (
                <div key={idx} className="mb-xs">
                    • {p.description}
                </div>
            ))}
        </div>
    );
    return (
        <Tooltip title={tooltipContent} placement="left">
            <Tag
                color={getProblemTagColor(list[0].type)}
                className="!cursor-help"
            >
                <ExclamationCircleOutlined /> {list.length}
            </Tag>
        </Tooltip>
    );
}

export function SessionGanttCell({
    record,
    invisible_ids,
}: {
    record: SessionWithMetaRecord;
    invisible_ids: Set<string>;
}) {
    const is_invisible = invisible_ids.has(record.id);
    if (is_invisible) {
        return (
            <Tooltip title={TABLE_TOOLTIP_GANTT_INVISIBLE}>
                <Tag color="purple" className="!cursor-help">
                    <EyeInvisibleOutlined /> {TABLE_TAG_INVISIBLE}
                </Tag>
            </Tooltip>
        );
    }
    return <Text type="secondary">{TABLE_TAG_DISPLAY}</Text>;
}
