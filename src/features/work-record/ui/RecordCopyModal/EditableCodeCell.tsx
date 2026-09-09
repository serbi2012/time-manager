import { useState, useCallback } from "react";
import { Input } from "antd";
import { cn } from "@/shared/lib/cn";
import { RECORD_COPY_MODAL } from "../../constants";

interface EditableCodeCellProps {
    map_key: string;
    code: string;
    onSave: (map_key: string, code: string) => void;
}

export function EditableCodeCell({
    map_key,
    code,
    onSave,
}: EditableCodeCellProps) {
    const [is_editing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(code);

    const handleStartEdit = useCallback(() => {
        setDraft(code);
        setIsEditing(true);
    }, [code]);

    const handleCommit = useCallback(() => {
        setIsEditing(false);
        if (draft.trim() !== code) {
            onSave(map_key, draft);
        }
    }, [draft, code, map_key, onSave]);

    const handleCancel = useCallback(() => {
        setDraft(code);
        setIsEditing(false);
    }, [code]);

    if (is_editing) {
        return (
            <td className="px-md py-sm border-b border-border-light align-top">
                <Input
                    autoFocus
                    size="small"
                    value={draft}
                    placeholder={RECORD_COPY_MODAL.CODE_PLACEHOLDER}
                    onChange={(e) => setDraft(e.target.value)}
                    onPressEnter={handleCommit}
                    onBlur={handleCommit}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") handleCancel();
                    }}
                />
            </td>
        );
    }

    return (
        <td
            className={cn(
                "px-md py-sm border-b border-border-light align-top",
                "text-md whitespace-pre-wrap break-words",
                "cursor-text hover:bg-primary-light transition-colors duration-150",
                code ? "text-text-primary" : "text-text-disabled"
            )}
            onClick={handleStartEdit}
        >
            {code || RECORD_COPY_MODAL.CODE_PLACEHOLDER}
        </td>
    );
}
