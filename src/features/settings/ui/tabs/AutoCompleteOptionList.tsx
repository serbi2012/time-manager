/**
 * Card-based autocomplete option section with icon header and badge count
 */

import { Badge, Button, Card, Empty, Popconfirm, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { AutoCompleteChip } from "./AutoCompleteChip";
import { AutoCompleteHiddenSection } from "./AutoCompleteHiddenSection";
import {
    SETTINGS_AUTOCOMPLETE_OPTION_EMPTY_DESC,
    SETTINGS_AUTOCOMPLETE_SELECT_HIDE,
    SETTINGS_BULK_HIDE_CONFIRM,
    SETTINGS_BULK_HIDE_OK,
    SETTINGS_CANCEL,
} from "../../constants";

const { Text } = Typography;

export type AutoCompleteFieldType =
    | "work_name"
    | "task_name"
    | "deal_name"
    | "project_code"
    | "task_option"
    | "category_option";

export interface AutoCompleteOptionListProps {
    icon: React.ReactNode;
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

const ICON_BOX_CLASS =
    "!inline-flex !items-center !justify-center !w-7 !h-7 !rounded-lg !bg-[#f0f5ff] !text-[#1890ff] !text-sm";

const CHIP_CONTAINER_CLASS =
    "flex flex-wrap gap-[6px] max-h-[140px] overflow-y-auto";

function toggleItem(
    selected: string[],
    set_selected: (values: string[]) => void,
    opt: string
) {
    if (selected.includes(opt)) {
        set_selected(selected.filter((v) => v !== opt));
    } else {
        set_selected([...selected, opt]);
    }
}

function SectionCardTitle({
    icon,
    title,
    count,
}: {
    icon: React.ReactNode;
    title: string;
    count: number;
}) {
    return (
        <div className="flex items-center gap-sm">
            <span className={ICON_BOX_CLASS}>{icon}</span>
            <span className="!text-sm !font-semibold">{title}</span>
            <Badge
                count={count}
                overflowCount={999}
                style={{
                    backgroundColor: "#f0f0f0",
                    color: "#8c8c8c",
                    fontWeight: 500,
                    fontSize: "11px",
                    boxShadow: "none",
                }}
            />
        </div>
    );
}

export function AutoCompleteOptionList({
    icon,
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
    const has_content = visible_options.length > 0;

    const card_extra =
        selected.length > 0 ? (
            <Popconfirm
                title={`${selected.length}${SETTINGS_BULK_HIDE_CONFIRM}`}
                onConfirm={() =>
                    on_bulk_hide(field, selected, () => set_selected([]))
                }
                okText={SETTINGS_BULK_HIDE_OK}
                cancelText={SETTINGS_CANCEL}
                okButtonProps={{ autoFocus: true }}
            >
                <Button size="small" danger icon={<DeleteOutlined />}>
                    {SETTINGS_AUTOCOMPLETE_SELECT_HIDE} ({selected.length})
                </Button>
            </Popconfirm>
        ) : null;

    return (
        <Card
            size="small"
            title={
                <SectionCardTitle
                    icon={icon}
                    title={title}
                    count={visible_options.length}
                />
            }
            extra={card_extra}
            styles={{
                header: {
                    borderBottom: has_content ? "1px solid #f0f0f0" : "none",
                    padding: "10px 16px",
                    minHeight: "auto",
                },
                body: {
                    padding:
                        !has_content && hidden_list.length === 0
                            ? "0"
                            : "12px 16px",
                },
            }}
        >
            {!has_content ? (
                <Empty
                    description={SETTINGS_AUTOCOMPLETE_OPTION_EMPTY_DESC}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="!py-sm"
                />
            ) : (
                <div className={CHIP_CONTAINER_CLASS}>
                    {visible_options.map((opt) => (
                        <AutoCompleteChip
                            key={opt}
                            label={opt}
                            is_selected={selected.includes(opt)}
                            onClick={() =>
                                toggleItem(selected, set_selected, opt)
                            }
                        />
                    ))}
                </div>
            )}

            <AutoCompleteHiddenSection
                hidden_list={hidden_list}
                on_unhide={(value) => on_unhide(field, value)}
                on_bulk_unhide={() => on_bulk_unhide(field)}
            />
        </Card>
    );
}
