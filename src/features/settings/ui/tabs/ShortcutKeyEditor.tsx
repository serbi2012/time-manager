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

const PROMPT_BOX_STYLE: React.CSSProperties = {
    textAlign: "center",
    padding: "20px 0",
};

const PROMPT_TEXT_STYLE: React.CSSProperties = {
    display: "block",
    marginBottom: 16,
};

const INPUT_AREA_BASE: React.CSSProperties = {
    padding: "24px 16px",
    borderRadius: 8,
    background: "#fafafa",
    cursor: "text",
    outline: "none",
    transition: "all 0.2s",
};

const TAG_STYLE: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: 16,
    padding: "8px 16px",
};

const PLACEHOLDER_TEXT_STYLE: React.CSSProperties = {
    fontSize: 14,
};

const ERROR_TEXT_STYLE: React.CSSProperties = {
    display: "block",
    marginTop: 12,
};

const CURRENT_LABEL_STYLE: React.CSSProperties = {
    marginTop: 16,
};

const CURRENT_TAG_STYLE: React.CSSProperties = {
    fontFamily: "monospace",
};

const HINT_STYLE: React.CSSProperties = {
    display: "block",
    marginTop: 12,
    fontSize: 12,
};

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
            <div style={PROMPT_BOX_STYLE}>
                <Text type="secondary" style={PROMPT_TEXT_STYLE}>
                    {SETTINGS_SHORTCUT_EDITOR_PROMPT}
                </Text>
                <div
                    tabIndex={0}
                    role="textbox"
                    aria-label={SETTINGS_SHORTCUT_EDITOR_PLACEHOLDER}
                    onKeyDown={handleKeyDown}
                    style={{ ...INPUT_AREA_BASE, border: input_border }}
                >
                    {pending_keys ? (
                        <Tag color="blue" style={TAG_STYLE}>
                            {formatShortcutKeyForPlatform(pending_keys)}
                        </Tag>
                    ) : (
                        <Text type="secondary" style={PLACEHOLDER_TEXT_STYLE}>
                            {SETTINGS_SHORTCUT_EDITOR_PLACEHOLDER}
                        </Text>
                    )}
                </div>

                {error_message && (
                    <Text type="danger" style={ERROR_TEXT_STYLE}>
                        {error_message}
                    </Text>
                )}

                <div style={CURRENT_LABEL_STYLE}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {SETTINGS_SHORTCUT_EDITOR_CURRENT}{" "}
                        <Tag style={CURRENT_TAG_STYLE}>
                            {formatShortcutKeyForPlatform(shortcut.keys)}
                        </Tag>
                    </Text>
                </div>

                <Text type="secondary" style={HINT_STYLE}>
                    {SETTINGS_SHORTCUT_EDITOR_HINT}
                </Text>
            </div>
        </Modal>
    );
}
