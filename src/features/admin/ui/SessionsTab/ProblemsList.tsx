/**
 * 문제 세션 목록 컴포넌트
 */

import { Table, Tag, Button, Space, Typography, Empty } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ProblemsListProps, SessionWithMeta } from "../../lib/types";

const { Text } = Typography;

/**
 * 문제 유형별 색상
 */
const PROBLEM_COLORS: Record<string, string> = {
    zero_duration: "orange",
    missing_time: "red",
    invalid_time: "volcano",
    future_time: "purple",
};

/**
 * 문제 세션 목록 컴포넌트
 */
export function ProblemsList({
    sessions,
    problems,
    on_fix,
    on_delete,
}: ProblemsListProps) {
    // 문제가 있는 세션만 필터링
    const problem_sessions = sessions.filter((s) => problems.has(s.id));

    if (problem_sessions.length === 0) {
        return <Empty description="문제가 있는 세션이 없습니다." />;
    }

    const columns: ColumnsType<SessionWithMeta> = [
        {
            title: "작업명",
            dataIndex: "work_name",
            key: "work_name",
            ellipsis: true,
        },
        {
            title: "거래명",
            dataIndex: "deal_name",
            key: "deal_name",
            ellipsis: true,
        },
        {
            title: "시간",
            key: "time",
            render: (_, session) => (
                <Text>
                    {session.start_time || "-"} ~ {session.end_time || "-"}
                </Text>
            ),
        },
        {
            title: "문제",
            key: "problems",
            render: (_, session) => {
                const session_problems = problems.get(session.id) || [];
                return (
                    <Space wrap>
                        {session_problems.map((p, i) => (
                            <Tag
                                key={i}
                                color={PROBLEM_COLORS[p.type] || "default"}
                            >
                                {p.description}
                            </Tag>
                        ))}
                    </Space>
                );
            },
        },
        {
            title: "",
            key: "action",
            width: 120,
            render: (_, session) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => on_fix(session)}
                        size="small"
                    >
                        수정
                    </Button>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => on_delete(session)}
                        size="small"
                    >
                        삭제
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Table
            dataSource={problem_sessions}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
        />
    );
}

export default ProblemsList;
