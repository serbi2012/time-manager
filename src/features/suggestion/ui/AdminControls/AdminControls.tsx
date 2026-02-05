import { useState, useEffect } from "react";
import { Divider, Space, Select, Input, Button, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { message } from "antd";
import type { SuggestionPost, SuggestionStatus } from "@/types";
import { updateSuggestionStatus } from "@/firebase/suggestionService";
import { SUGGESTION_MESSAGES } from "@/shared/constants";
import {
    SUGGESTION_LABELS,
    STATUS_LABELS,
    SUGGESTION_STYLES,
} from "../../constants";

const { Text } = Typography;

interface AdminControlsProps {
    post: SuggestionPost;
}

export function AdminControls({ post }: AdminControlsProps) {
    const [status, setStatus] = useState<SuggestionStatus>(post.status);
    const [resolved_version, setResolvedVersion] = useState(
        post.resolved_version || ""
    );
    const [is_saving, setIsSaving] = useState(false);

    useEffect(() => {
        setStatus(post.status);
        setResolvedVersion(post.resolved_version || "");
    }, [post.status, post.resolved_version]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSuggestionStatus(
                post.id,
                status,
                status === "completed" ? resolved_version : undefined
            );
            message.success(SUGGESTION_MESSAGES.statusUpdated);
        } catch {
            message.error(SUGGESTION_MESSAGES.statusUpdateFailed);
        } finally {
            setIsSaving(false);
        }
    };

    const has_changes =
        status !== post.status ||
        (status === "completed" &&
            resolved_version !== (post.resolved_version || ""));

    return (
        <div className="suggestion-admin-controls">
            <Divider style={SUGGESTION_STYLES.adminDivider}>
                <Space size="small">
                    <SettingOutlined />
                    <Text
                        type="secondary"
                        style={SUGGESTION_STYLES.adminTitleText}
                    >
                        {SUGGESTION_LABELS.adminSettingsTitle}
                    </Text>
                </Space>
            </Divider>
            <Space wrap style={SUGGESTION_STYLES.adminWrap}>
                <Select
                    value={status}
                    onChange={setStatus}
                    style={SUGGESTION_STYLES.adminStatusSelect}
                    options={Object.entries(STATUS_LABELS).map(
                        ([value, config]) => ({
                            value,
                            label: config.label,
                        })
                    )}
                />
                {status === "completed" && (
                    <Input
                        placeholder={
                            SUGGESTION_LABELS.resolvedVersionPlaceholder
                        }
                        value={resolved_version}
                        onChange={(e) => setResolvedVersion(e.target.value)}
                        style={SUGGESTION_STYLES.adminVersionInput}
                    />
                )}
                <Button
                    type="primary"
                    size="small"
                    onClick={handleSave}
                    loading={is_saving}
                    disabled={!has_changes}
                >
                    {SUGGESTION_LABELS.saveButton}
                </Button>
            </Space>
        </div>
    );
}
