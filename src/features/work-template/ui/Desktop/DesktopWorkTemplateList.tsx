/**
 * 데스크탑 작업 템플릿 리스트 컴포넌트
 * - 단축키 배지 표시
 */

import { Card, Button, Space, Typography, Empty } from "antd";
import { PlusOutlined, FolderOutlined } from "@ant-design/icons";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useWorkStore } from "@/store/useWorkStore";
import { useShortcutStore } from "@/store/useShortcutStore";
import { formatShortcutKeyForPlatform } from "@/hooks/useShortcuts";
import {
    TemplateModal,
    SortableTemplateCard,
} from "@/features/work-template/ui";
import {
    useTemplateActions,
    useTemplateDnd,
} from "@/features/work-template/hooks";
import {
    TEMPLATE_CARD_TITLE,
    BUTTON_ADD,
    EMPTY_DESCRIPTION,
    EMPTY_HINT,
} from "@/features/work-template/constants";

const { Text } = Typography;

interface DesktopWorkTemplateListProps {
    onAddRecordOnly?: (template_id: string) => void;
}

export function DesktopWorkTemplateList({
    onAddRecordOnly,
}: DesktopWorkTemplateListProps) {
    const work_store = useWorkStore();
    const { templates, records } = work_store;

    // 단축키 설정
    const new_preset_shortcut = useShortcutStore((state) =>
        state.shortcuts.find((s) => s.id === "new-preset")
    );
    const new_preset_keys = new_preset_shortcut?.keys || "Alt+P";

    // 커스텀 훅: 템플릿 액션
    const {
        is_modal_open,
        is_edit_mode,
        editing_template,
        form,
        handleOpenAddModal,
        handleOpenEditModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
    } = useTemplateActions();

    // 커스텀 훅: 드래그 앤 드롭
    const { sensors, handleDragEnd } = useTemplateDnd();

    return (
        <>
            <Card
                title={
                    <Space>
                        <FolderOutlined />
                        <span>{TEMPLATE_CARD_TITLE}</span>
                    </Space>
                }
                size="small"
                className="template-list-card"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={handleOpenAddModal}
                    >
                        <span className="inline-flex items-center">
                            {BUTTON_ADD}
                            <span className="text-xs opacity-85 ml-xs py-px px-xs bg-white/20 rounded-[3px]">
                                {formatShortcutKeyForPlatform(new_preset_keys)}
                            </span>
                        </span>
                    </Button>
                }
            >
                {templates.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span>
                                {EMPTY_DESCRIPTION}
                                <br />
                                <Text type="secondary" className="!text-sm">
                                    {EMPTY_HINT}
                                </Text>
                            </span>
                        }
                    />
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={templates.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="template-items">
                                {templates.map((template) => (
                                    <SortableTemplateCard
                                        key={template.id}
                                        template={template}
                                        onEdit={handleOpenEditModal}
                                        onDelete={handleDelete}
                                        onAddRecordOnly={onAddRecordOnly}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </Card>

            <TemplateModal
                open={is_modal_open}
                is_edit_mode={is_edit_mode}
                editing_template={editing_template}
                form={form}
                records={records}
                templates={templates}
                getAutoCompleteOptions={work_store.getAutoCompleteOptions}
                getProjectCodeOptions={work_store.getProjectCodeOptions}
                custom_task_options={work_store.custom_task_options}
                custom_category_options={work_store.custom_category_options}
                hidden_autocomplete_options={
                    work_store.hidden_autocomplete_options
                }
                addCustomTaskOption={work_store.addCustomTaskOption}
                addCustomCategoryOption={work_store.addCustomCategoryOption}
                hideAutoCompleteOption={work_store.hideAutoCompleteOption}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />

            <style>{`
                .template-list-card {
                    height: 100%;
                }
                
                .template-items {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }
                
                .template-card {
                    position: relative;
                    display: flex;
                    align-items: center;
                    border-radius: var(--radius-lg);
                    border-left: 4px solid var(--color-primary);
                    background: var(--color-bg-light);
                    overflow: hidden;
                    transition: all 0.2s;
                }
                
                .template-card:hover {
                    background: var(--color-primary-light);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                }
                
                .template-drag-handle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 var(--spacing-sm);
                    cursor: grab;
                    color: var(--color-text-disabled);
                    transition: color 0.2s;
                    align-self: stretch;
                }
                
                .template-drag-handle:hover {
                    color: var(--color-text-secondary);
                }
                
                .template-drag-handle:active {
                    cursor: grabbing;
                }
                
                .template-content {
                    flex: 1;
                    padding: var(--spacing-sm) var(--spacing-md);
                    padding-left: 0;
                    padding-right: var(--spacing-sm);
                    min-height: 60px;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .template-header {
                    display: flex;
                    align-items: flex-start;
                }
                
                .template-title {
                    font-size: var(--font-size-sm);
                    line-height: 1.4;
                    word-break: break-word;
                    display: block;
                }
                
                .template-subtitle {
                    font-size: var(--font-size-xs);
                    color: var(--color-text-disabled);
                    display: block;
                    word-break: break-word;
                }
                
                .template-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    padding-right: var(--spacing-sm);
                    flex-shrink: 0;
                }
                
                .template-hover-buttons {
                    display: flex;
                    gap: var(--spacing-xs);
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                
                .template-card:hover .template-hover-buttons {
                    opacity: 1;
                }
            `}</style>
        </>
    );
}
