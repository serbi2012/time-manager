/**
 * AutoComplete option management tab with card-based section grouping
 */

import { useState, useMemo } from "react";
import { Divider, Typography } from "antd";
import {
    FileTextOutlined,
    TeamOutlined,
    ShoppingOutlined,
    CodeOutlined,
    AppstoreOutlined,
    TagsOutlined,
} from "@ant-design/icons";
import { useWorkStore } from "@/store/useWorkStore";
import {
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
} from "@/store/constants";
import { message } from "antd";
import { SUCCESS_MESSAGES } from "@/shared/constants/ui/messages";
import {
    SETTINGS_AUTOCOMPLETE_DESC,
    SETTINGS_AUTOCOMPLETE_WORK_NAME,
    SETTINGS_AUTOCOMPLETE_TASK_NAME,
    SETTINGS_AUTOCOMPLETE_DEAL_NAME,
    SETTINGS_AUTOCOMPLETE_PROJECT_CODE,
    SETTINGS_AUTOCOMPLETE_TASK_OPTION,
    SETTINGS_AUTOCOMPLETE_CATEGORY_OPTION,
    SETTINGS_AUTOCOMPLETE_INPUT_GROUP,
    SETTINGS_AUTOCOMPLETE_SELECT_GROUP,
} from "../../constants";
import {
    AutoCompleteOptionList,
    type AutoCompleteFieldType,
} from "./AutoCompleteOptionList";

const { Text } = Typography;

const GROUP_LABEL_CLASS =
    "!text-xs !font-semibold !text-[#8c8c8c] !block !mb-md";

export function AutoCompleteTab() {
    const {
        records,
        templates,
        custom_task_options,
        custom_category_options,
        hidden_autocomplete_options,
        hideAutoCompleteOption,
        unhideAutoCompleteOption,
    } = useWorkStore();

    const [selected_work_names, setSelectedWorkNames] = useState<string[]>([]);
    const [selected_task_names, setSelectedTaskNames] = useState<string[]>([]);
    const [selected_deal_names, setSelectedDealNames] = useState<string[]>([]);
    const [selected_project_codes, setSelectedProjectCodes] = useState<
        string[]
    >([]);
    const [selected_task_options, setSelectedTaskOptions] = useState<string[]>(
        []
    );
    const [selected_category_options, setSelectedCategoryOptions] = useState<
        string[]
    >([]);

    const all_options = useMemo(() => {
        const work_names = new Set<string>();
        const task_names = new Set<string>();
        const deal_names = new Set<string>();
        const project_codes = new Set<string>();

        records.forEach((r) => {
            if (r.work_name?.trim()) work_names.add(r.work_name);
            if (r.task_name?.trim()) task_names.add(r.task_name);
            if (r.deal_name?.trim()) deal_names.add(r.deal_name);
            if (r.project_code?.trim()) project_codes.add(r.project_code);
        });

        templates.forEach((t) => {
            if (t.work_name?.trim()) work_names.add(t.work_name);
            if (t.task_name?.trim()) task_names.add(t.task_name);
            if (t.deal_name?.trim()) deal_names.add(t.deal_name);
            if (t.project_code?.trim()) project_codes.add(t.project_code);
        });

        const task_options = [
            ...new Set([...DEFAULT_TASK_OPTIONS, ...custom_task_options]),
        ];
        const category_options = [
            ...new Set([
                ...DEFAULT_CATEGORY_OPTIONS,
                ...custom_category_options,
            ]),
        ];

        return {
            work_names: Array.from(work_names).sort(),
            task_names: Array.from(task_names).sort(),
            deal_names: Array.from(deal_names).sort(),
            project_codes: Array.from(project_codes).sort(),
            task_options: task_options.sort(),
            category_options: category_options.sort(),
        };
    }, [records, templates, custom_task_options, custom_category_options]);

    const visible_work_names = all_options.work_names.filter(
        (v) => !hidden_autocomplete_options.work_name.includes(v)
    );
    const visible_task_names = all_options.task_names.filter(
        (v) => !hidden_autocomplete_options.task_name.includes(v)
    );
    const visible_deal_names = all_options.deal_names.filter(
        (v) => !hidden_autocomplete_options.deal_name.includes(v)
    );
    const visible_project_codes = all_options.project_codes.filter(
        (v) => !hidden_autocomplete_options.project_code.includes(v)
    );
    const visible_task_options = all_options.task_options.filter(
        (v) => !(hidden_autocomplete_options.task_option || []).includes(v)
    );
    const visible_category_options = all_options.category_options.filter(
        (v) => !(hidden_autocomplete_options.category_option || []).includes(v)
    );

    const handleBulkHide = (
        field: AutoCompleteFieldType,
        selected: string[],
        clearSelection: () => void
    ) => {
        selected.forEach((v) => hideAutoCompleteOption(field, v));
        clearSelection();
        message.success(SUCCESS_MESSAGES.itemsHidden(selected.length));
    };

    const handleUnhide = (field: AutoCompleteFieldType, value: string) => {
        unhideAutoCompleteOption(field, value);
        message.success(SUCCESS_MESSAGES.valueRestored(value));
    };

    const handleBulkUnhide = (field: AutoCompleteFieldType) => {
        const hidden_list = (
            hidden_autocomplete_options as Record<string, string[]>
        )[field];
        if (hidden_list?.length) {
            hidden_list.forEach((v) => unhideAutoCompleteOption(field, v));
            message.success(
                SUCCESS_MESSAGES.allItemsRestored(hidden_list.length)
            );
        }
    };

    const hidden = (field: string) =>
        (hidden_autocomplete_options as Record<string, string[]>)[field] || [];

    return (
        <div>
            <Text type="secondary" className="!block !mb-xl !text-[13px]">
                {SETTINGS_AUTOCOMPLETE_DESC}
            </Text>

            <Text className={GROUP_LABEL_CLASS}>
                {SETTINGS_AUTOCOMPLETE_INPUT_GROUP}
            </Text>

            <div className="flex flex-col gap-md mb-xl">
                <AutoCompleteOptionList
                    icon={<FileTextOutlined />}
                    title={SETTINGS_AUTOCOMPLETE_WORK_NAME}
                    field="work_name"
                    visible_options={visible_work_names}
                    selected={selected_work_names}
                    set_selected={setSelectedWorkNames}
                    hidden_list={hidden("work_name")}
                    on_bulk_hide={handleBulkHide}
                    on_unhide={handleUnhide}
                    on_bulk_unhide={handleBulkUnhide}
                />

                <AutoCompleteOptionList
                    icon={<TeamOutlined />}
                    title={SETTINGS_AUTOCOMPLETE_TASK_NAME}
                    field="task_name"
                    visible_options={visible_task_names}
                    selected={selected_task_names}
                    set_selected={setSelectedTaskNames}
                    hidden_list={hidden("task_name")}
                    on_bulk_hide={handleBulkHide}
                    on_unhide={handleUnhide}
                    on_bulk_unhide={handleBulkUnhide}
                />

                <AutoCompleteOptionList
                    icon={<ShoppingOutlined />}
                    title={SETTINGS_AUTOCOMPLETE_DEAL_NAME}
                    field="deal_name"
                    visible_options={visible_deal_names}
                    selected={selected_deal_names}
                    set_selected={setSelectedDealNames}
                    hidden_list={hidden("deal_name")}
                    on_bulk_hide={handleBulkHide}
                    on_unhide={handleUnhide}
                    on_bulk_unhide={handleBulkUnhide}
                />

                <AutoCompleteOptionList
                    icon={<CodeOutlined />}
                    title={SETTINGS_AUTOCOMPLETE_PROJECT_CODE}
                    field="project_code"
                    visible_options={visible_project_codes}
                    selected={selected_project_codes}
                    set_selected={setSelectedProjectCodes}
                    hidden_list={hidden("project_code")}
                    on_bulk_hide={handleBulkHide}
                    on_unhide={handleUnhide}
                    on_bulk_unhide={handleBulkUnhide}
                />
            </div>

            <Divider style={{ margin: "4px 0 20px" }}>
                <Text type="secondary" className="!text-[11px]">
                    {SETTINGS_AUTOCOMPLETE_SELECT_GROUP}
                </Text>
            </Divider>

            <div className="flex flex-col gap-md">
                <AutoCompleteOptionList
                    icon={<AppstoreOutlined />}
                    title={SETTINGS_AUTOCOMPLETE_TASK_OPTION}
                    field="task_option"
                    visible_options={visible_task_options}
                    selected={selected_task_options}
                    set_selected={setSelectedTaskOptions}
                    hidden_list={hidden("task_option")}
                    on_bulk_hide={handleBulkHide}
                    on_unhide={handleUnhide}
                    on_bulk_unhide={handleBulkUnhide}
                />

                <AutoCompleteOptionList
                    icon={<TagsOutlined />}
                    title={SETTINGS_AUTOCOMPLETE_CATEGORY_OPTION}
                    field="category_option"
                    visible_options={visible_category_options}
                    selected={selected_category_options}
                    set_selected={setSelectedCategoryOptions}
                    hidden_list={hidden("category_option")}
                    on_bulk_hide={handleBulkHide}
                    on_unhide={handleUnhide}
                    on_bulk_unhide={handleBulkUnhide}
                />
            </div>
        </div>
    );
}

export default AutoCompleteTab;
