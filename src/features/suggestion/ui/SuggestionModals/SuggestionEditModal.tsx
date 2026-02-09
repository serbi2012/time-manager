import { Modal, Form, Input } from "antd";
import { SUGGESTION_LABELS, SUGGESTION_CONFIG } from "../../constants";

const { TextArea } = Input;

interface SuggestionEditModalProps {
    open: boolean;
    form: ReturnType<typeof Form.useForm>[0];
    is_submitting: boolean;
    on_submit: () => void;
    on_cancel: () => void;
}

export function SuggestionEditModal({
    open,
    form,
    is_submitting,
    on_submit,
    on_cancel,
}: SuggestionEditModalProps) {
    return (
        <Modal
            title={SUGGESTION_LABELS.editModalTitle}
            open={open}
            onOk={on_submit}
            onCancel={on_cancel}
            okText={
                <>
                    {SUGGESTION_LABELS.updateButton}{" "}
                    <span className="text-[11px] opacity-85 ml-xs py-px px-xs bg-white/20 rounded-[3px]">
                        F8
                    </span>
                </>
            }
            cancelText={SUGGESTION_LABELS.cancelButton}
            confirmLoading={is_submitting}
            destroyOnClose
        >
            <Form form={form} layout="vertical" className="!mt-lg">
                <Form.Item
                    name="title"
                    label={SUGGESTION_LABELS.titleLabel}
                    rules={[
                        {
                            required: true,
                            message: SUGGESTION_LABELS.titlePlaceholder,
                        },
                    ]}
                >
                    <Input
                        placeholder={SUGGESTION_LABELS.titlePlaceholder}
                        maxLength={SUGGESTION_CONFIG.maxTitleLength}
                    />
                </Form.Item>
                <Form.Item
                    name="content"
                    label={SUGGESTION_LABELS.contentLabel}
                    rules={[
                        {
                            required: true,
                            message: SUGGESTION_LABELS.contentPlaceholder,
                        },
                    ]}
                >
                    <TextArea
                        placeholder={SUGGESTION_LABELS.contentPlaceholder}
                        rows={SUGGESTION_CONFIG.contentRows}
                        maxLength={SUGGESTION_CONFIG.maxContentLength}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
