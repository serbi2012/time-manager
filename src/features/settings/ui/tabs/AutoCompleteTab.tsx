/**
 * 자동완성 탭 컴포넌트
 */

import { Collapse, List, Tag, Button, Typography, Empty } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import type { AutoCompleteTabProps } from "../../model/types";

const { Text } = Typography;

// 필드 라벨은 fields 배열에서 직접 정의

/**
 * 자동완성 탭 컴포넌트
 * 자동완성 옵션 표시/숨김 관리
 */
export function AutoCompleteTab({
    work_names,
    deal_names,
    task_names,
    project_codes,
    hidden_options,
    on_hide,
    on_unhide,
}: AutoCompleteTabProps) {
    const fields = [
        { key: "work_name", label: "작업명", values: work_names },
        { key: "deal_name", label: "거래명", values: deal_names },
        { key: "task_name", label: "업무명", values: task_names },
        { key: "project_code", label: "프로젝트 코드", values: project_codes },
    ];

    const collapse_items = fields.map((field) => ({
        key: field.key,
        label: (
            <span>
                {field.label}
                <Tag style={{ marginLeft: 8 }}>{field.values.length}개</Tag>
            </span>
        ),
        children: (
            <OptionList
                field={field.key}
                values={field.values}
                hidden={hidden_options[field.key as keyof typeof hidden_options] || []}
                on_hide={on_hide}
                on_unhide={on_unhide}
            />
        ),
    }));

    return (
        <div className="autocomplete-tab">
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                레코드에서 추출된 자동완성 옵션들입니다. 
                숨김 처리하면 자동완성 목록에서 제외됩니다.
            </Text>

            <Collapse items={collapse_items} />

            <style>{`
                .autocomplete-tab {
                    padding: 16px 0;
                }
            `}</style>
        </div>
    );
}

/**
 * 옵션 목록 컴포넌트
 */
interface OptionListProps {
    field: string;
    values: string[];
    hidden: string[];
    on_hide: (field: string, value: string) => void;
    on_unhide: (field: string, value: string) => void;
}

function OptionList({
    field,
    values,
    hidden,
    on_hide,
    on_unhide,
}: OptionListProps) {
    if (values.length === 0) {
        return <Empty description="옵션이 없습니다." />;
    }

    // 숨김/표시 옵션 분리
    const visible_values = values.filter((v) => !hidden.includes(v));
    const hidden_values = values.filter((v) => hidden.includes(v));

    return (
        <div>
            {/* 표시 중인 옵션 */}
            {visible_values.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        표시 중 ({visible_values.length})
                    </Text>
                    <List
                        size="small"
                        dataSource={visible_values}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="hide"
                                        type="text"
                                        icon={<EyeInvisibleOutlined />}
                                        onClick={() => on_hide(field, item)}
                                        size="small"
                                    >
                                        숨김
                                    </Button>,
                                ]}
                            >
                                {item}
                            </List.Item>
                        )}
                    />
                </div>
            )}

            {/* 숨김 처리된 옵션 */}
            {hidden_values.length > 0 && (
                <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        숨김 ({hidden_values.length})
                    </Text>
                    <List
                        size="small"
                        dataSource={hidden_values}
                        renderItem={(item) => (
                            <List.Item
                                style={{ opacity: 0.5 }}
                                actions={[
                                    <Button
                                        key="show"
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => on_unhide(field, item)}
                                        size="small"
                                    >
                                        표시
                                    </Button>,
                                ]}
                            >
                                {item}
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </div>
    );
}

export default AutoCompleteTab;
