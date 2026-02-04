/**
 * 자동완성 옵션 목록 섹션 (표시/숨김, 일괄 복원)
 */

import {
    Button,
    Checkbox,
    Collapse,
    Empty,
    Popconfirm,
    Tag,
    Typography,
} from "antd";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import {
    SETTINGS_AUTOCOMPLETE_OPTION_EMPTY,
    SETTINGS_AUTOCOMPLETE_HIDDEN,
    SETTINGS_AUTOCOMPLETE_RESTORE_ALL,
    SETTINGS_AUTOCOMPLETE_SELECT_HIDE,
    SETTINGS_BULK_HIDE_CONFIRM,
    SETTINGS_BULK_HIDE_OK,
    SETTINGS_CANCEL,
} from "../../constants";

const { Text } = Typography;

const SECTION_HEADER_STYLE: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
};

const CHECKBOX_GROUP_WRAPPER_STYLE: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    maxHeight: 120,
    overflowY: "auto",
    border: "1px solid #d9d9d9",
    borderRadius: 4,
    padding: 8,
};

const HIDDEN_TAGS_WRAPPER_STYLE: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
};

const HIDDEN_TAG_STYLE: React.CSSProperties = {
    opacity: 0.6,
    textDecoration: "line-through",
};

export type AutoCompleteFieldType =
    | "work_name"
    | "task_name"
    | "deal_name"
    | "project_code"
    | "task_option"
    | "category_option";

export interface AutoCompleteOptionListProps {
    title: string;
    field: AutoCompleteFieldType;
    visible_options: string[];
    selected: string[];
    set_selected: (values: string[]) => void;
    hidden_list: string[];
    on_bulk_hide: (
        field: AutoCompleteFieldType,
        selected: string[],
        clear: () => void
    ) => void;
    on_unhide: (field: AutoCompleteFieldType, value: string) => void;
    on_bulk_unhide: (field: AutoCompleteFieldType) => void;
}

export function AutoCompleteOptionList({
    title,
    field,
    visible_options,
    selected,
    set_selected,
    hidden_list,
    on_bulk_hide,
    on_unhide,
    on_bulk_unhide,
}: AutoCompleteOptionListProps) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={SECTION_HEADER_STYLE}>
                <Text strong>
                    {title} ({visible_options.length}개)
                </Text>
                {selected.length > 0 && (
                    <Popconfirm
                        title={`${selected.length}${SETTINGS_BULK_HIDE_CONFIRM}`}
                        onConfirm={() =>
                            on_bulk_hide(field, selected, () =>
                                set_selected([])
                            )
                        }
                        okText={SETTINGS_BULK_HIDE_OK}
                        cancelText={SETTINGS_CANCEL}
                        okButtonProps={{ autoFocus: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                            {SETTINGS_AUTOCOMPLETE_SELECT_HIDE} (
                            {selected.length})
                        </Button>
                    </Popconfirm>
                )}
            </div>

            {visible_options.length === 0 ? (
                <Empty
                    description={SETTINGS_AUTOCOMPLETE_OPTION_EMPTY}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: "8px 0" }}
                />
            ) : (
                <Checkbox.Group
                    value={selected}
                    onChange={(values) => set_selected(values as string[])}
                    style={{ width: "100%" }}
                >
                    <div style={CHECKBOX_GROUP_WRAPPER_STYLE}>
                        {visible_options.map((opt) => (
                            <Checkbox key={opt} value={opt}>
                                <Tag>{opt}</Tag>
                            </Checkbox>
                        ))}
                    </div>
                </Checkbox.Group>
            )}

            {hidden_list.length > 0 && (
                <Collapse
                    size="small"
                    style={{ marginTop: 8 }}
                    items={[
                        {
                            key: "hidden",
                            label: (
                                <Text type="secondary">
                                    {SETTINGS_AUTOCOMPLETE_HIDDEN} (
                                    {hidden_list.length}개)
                                </Text>
                            ),
                            extra: (
                                <Button
                                    size="small"
                                    type="link"
                                    icon={<UndoOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        on_bulk_unhide(field);
                                    }}
                                >
                                    {SETTINGS_AUTOCOMPLETE_RESTORE_ALL}
                                </Button>
                            ),
                            children: (
                                <div style={HIDDEN_TAGS_WRAPPER_STYLE}>
                                    {hidden_list.map((opt) => (
                                        <Tag
                                            key={opt}
                                            closable
                                            closeIcon={<UndoOutlined />}
                                            onClose={(e) => {
                                                e.preventDefault();
                                                on_unhide(field, opt);
                                            }}
                                            style={HIDDEN_TAG_STYLE}
                                        >
                                            {opt}
                                        </Tag>
                                    ))}
                                </div>
                            ),
                        },
                    ]}
                />
            )}
        </div>
    );
}
