/**
 * 단축키 편집 모달
 */

import { useState } from "react";
import { Modal, Button, Tag, Typography, message } from "antd";
import { useShortcutStore } from "@/store/useShortcutStore";
import type { ShortcutDefinition } from "@/store/useShortcutStore";
import { formatShortcutKeyForPlatform } from "@/hooks/useShortcuts";
import {
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
} from "@/shared/constants/ui/messages";
import { keyEventToKeyString } from "../../lib";
import {
    SETTINGS_SHORTCUT_EDITOR_TITLE,
    SETTINGS_SHORTCUT_EDITOR_PROMPT,
    SETTINGS_SHORTCUT_EDITOR_PLACEHOLDER,
    SETTINGS_SHORTCUT_EDITOR_DUPLICATE,
    SETTINGS_SHORTCUT_EDITOR_CURRENT,
    SETTINGS_SHORTCUT_EDITOR_HINT,
    SETTINGS_SHORTCUT_EDITOR_CANCEL,
    SETTINGS_SHORTCUT_EDITOR_SAVE,
} from "../../constants";

const { Text } = Typography;

const EDITOR_MODAL_WIDTH = 400;

const SEMANTIC_ERROR_BORDER = "2px dashed #ff4d4f";
const SEMANTIC_SUCCESS_BORDER = "2px solid #52c41a";
const SEMANTIC_DEFAULT_BORDER = "2px dashed #d9d9d9";

export interface ShortcutKeyEditorProps {
    shortcut: ShortcutDefinition;
    onClose: () => void;
}

export function ShortcutKeyEditor({
    shortcut,
    onClose,
}: ShortcutKeyEditorProps) {
    const setShortcutKeys = useShortcutStore((state) => state.setShortcutKeys);
    const isKeysDuplicate = useShortcutStore((state) => state.isKeysDuplicate);
    const [pending_keys, setPendingKeys] = useState<string | null>(null);
    const [error_message, setErrorMessage] = useState<string | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === "Escape") {
            onClose();
            return;
        }

        const key_string = keyEventToKeyString(e);
        if (key_string) {
            if (isKeysDuplicate(key_string, shortcut.id)) {
                setErrorMessage(SETTINGS_SHORTCUT_EDITOR_DUPLICATE);
                setPendingKeys(null);
            } else {
                setErrorMessage(null);
                setPendingKeys(key_string);
            }
        }
    };

    const handleSave = () => {
        if (pending_keys) {
            const result = setShortcutKeys(shortcut.id, pending_keys);
            if (result.success) {
                message.success(SUCCESS_MESSAGES.shortcutChanged);
                onClose();
            } else {
                message.error(
                    result.message || ERROR_MESSAGES.shortcutChangeFailed
                );
            }
        }
    };

    const input_border = error_message
        ? SEMANTIC_ERROR_BORDER
        : pending_keys
        ? SEMANTIC_SUCCESS_BORDER
        : SEMANTIC_DEFAULT_BORDER;

    return (
        <Modal
            title={`${SETTINGS_SHORTCUT_EDITOR_TITLE}: ${shortcut.name}`}
            open
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {SETTINGS_SHORTCUT_EDITOR_CANCEL}
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    disabled={!pending_keys}
                    onClick={handleSave}
                >
                    {SETTINGS_SHORTCUT_EDITOR_SAVE}
                </Button>,
            ]}
            width={EDITOR_MODAL_WIDTH}
        >
            <div className="text-center py-[20px]">
                <Text type="secondary" className="!block !mb-lg">
                    {SETTINGS_SHORTCUT_EDITOR_PROMPT}
                </Text>
                <div
                    tabIndex={0}
                    role="textbox"
                    aria-label={SETTINGS_SHORTCUT_EDITOR_PLACEHOLDER}
                    onKeyDown={handleKeyDown}
                    className="py-xl px-lg rounded-lg bg-[#fafafa] cursor-text outline-none transition-all duration-200"
                    style={{ border: input_border }}
                >
                    {pending_keys ? (
                        <Tag color="blue" className="!font-mono !text-base !py-sm !px-lg">
                            {formatShortcutKeyForPlatform(pending_keys)}
                        </Tag>
                    ) : (
                        <Text type="secondary" className="!text-sm">
                            {SETTINGS_SHORTCUT_EDITOR_PLACEHOLDER}
                        </Text>
                    )}
                </div>

                {error_message && (
                    <Text type="danger" className="!block !mt-md">
                        {error_message}
                    </Text>
                )}

                <div className="mt-lg">
                    <Text type="secondary" className="!text-xs">
                        {SETTINGS_SHORTCUT_EDITOR_CURRENT}{" "}
                        <Tag className="!font-mono">
                            {formatShortcutKeyForPlatform(shortcut.keys)}
                        </Tag>
                    </Text>
                </div>

                <Text type="secondary" className="!block !mt-md !text-xs">
                    {SETTINGS_SHORTCUT_EDITOR_HINT}
                </Text>
            </div>
        </Modal>
    );
}
