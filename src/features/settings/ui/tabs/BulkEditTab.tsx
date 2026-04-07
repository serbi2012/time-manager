/**
 * 일괄 변경 탭 컴포넌트
 *
 * 작업명과 프로젝트 코드를 일괄로 변경하는 기능 제공
 */

import { Card, Space, Input, Button, Typography, Modal, Alert } from "antd";
import {
    EditOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useWorkStore } from "@/store/useWorkStore";
import { APP_THEME_COLORS } from "@/shared/constants";
import { message } from "@/shared/lib/message";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/shared/constants";
import {
    SETTINGS_BULK_EDIT_TITLE,
    SETTINGS_BULK_EDIT_DESC,
    SETTINGS_BULK_EDIT_OLD_SECTION,
    SETTINGS_BULK_EDIT_NEW_SECTION,
    SETTINGS_BULK_EDIT_OLD_WORK_NAME,
    SETTINGS_BULK_EDIT_NEW_WORK_NAME,
    SETTINGS_BULK_EDIT_OLD_PROJECT_CODE,
    SETTINGS_BULK_EDIT_NEW_PROJECT_CODE,
    SETTINGS_BULK_EDIT_PLACEHOLDER_WORK_NAME,
    SETTINGS_BULK_EDIT_PLACEHOLDER_PROJECT_CODE,
    SETTINGS_BULK_EDIT_BUTTON,
    SETTINGS_BULK_EDIT_CONFIRM_TITLE,
    SETTINGS_BULK_EDIT_CONFIRM_DESC,
    SETTINGS_BULK_EDIT_CONFIRM_COUNT_RECORDS,
    SETTINGS_BULK_EDIT_CONFIRM_COUNT_TEMPLATES,
    SETTINGS_BULK_EDIT_CONFIRM_OK,
    SETTINGS_BULK_EDIT_VALIDATION_REQUIRED,
    SETTINGS_BULK_EDIT_VALIDATION_SAME,
    SETTINGS_BULK_EDIT_NO_MATCHES,
    SETTINGS_BULK_EDIT_WARNING,
    SETTINGS_BULK_EDIT_LOGIN_REQUIRED_TITLE,
    SETTINGS_BULK_EDIT_LOGIN_REQUIRED_DESC,
    SETTINGS_BULK_EDIT_SEARCH_TITLE,
    SETTINGS_BULK_EDIT_SEARCH_BUTTON,
    SETTINGS_CANCEL,
} from "../../constants";
import { cn } from "@/shared/lib/cn";
import { SettingItem } from "./SettingItem";
import { getCurrentUser } from "@/firebase/syncService";
import { saveRecordsBatch, saveTemplatesBatch } from "@/firebase/firestore";
import type { WorkRecord, WorkTemplate } from "@/shared/types";

const { Text, Title } = Typography;

const CARD_BODY_MOBILE = { padding: "12px" as const };
const CARD_BODY_DESKTOP = { padding: "16px" as const };

export interface BulkEditTabProps {
    is_mobile?: boolean;
    isAuthenticated: boolean;
}

interface BulkEditFormData {
    old_work_name: string;
    old_project_code: string;
    new_work_name: string;
    new_project_code: string;
}

export function BulkEditTab({ is_mobile, isAuthenticated }: BulkEditTabProps) {
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    const records = useWorkStore((state) => state.records);
    const templates = useWorkStore((state) => state.templates);
    const updateRecord = useWorkStore((state) => state.updateRecord);
    const updateTemplate = useWorkStore((state) => state.updateTemplate);

    const [form_data, setFormData] = useState<BulkEditFormData>({
        old_work_name: "",
        old_project_code: "",
        new_work_name: "",
        new_project_code: "",
    });

    const [is_loading, setIsLoading] = useState(false);
    const [search_results, setSearchResults] = useState<{
        records: number;
        templates: number;
    } | null>(null);

    const handleInputChange = (
        field: keyof BulkEditFormData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // 입력 변경 시 검색 결과 초기화
        setSearchResults(null);
    };

    const validateForm = (): string | null => {
        const {
            old_work_name,
            old_project_code,
            new_work_name,
            new_project_code,
        } = form_data;

        if (
            !old_work_name.trim() ||
            !old_project_code.trim() ||
            !new_work_name.trim() ||
            !new_project_code.trim()
        ) {
            return SETTINGS_BULK_EDIT_VALIDATION_REQUIRED;
        }

        if (
            old_work_name === new_work_name &&
            old_project_code === new_project_code
        ) {
            return SETTINGS_BULK_EDIT_VALIDATION_SAME;
        }

        return null;
    };

    const findMatchingItems = () => {
        const { old_work_name, old_project_code } = form_data;

        const matching_records = records.filter(
            (record) =>
                record.work_name === old_work_name &&
                record.project_code === old_project_code
        );

        const matching_templates = templates.filter(
            (template) =>
                template.work_name === old_work_name &&
                template.project_code === old_project_code
        );

        return {
            records: matching_records,
            templates: matching_templates,
        };
    };

    const handleSearch = () => {
        const validation_error = validateForm();
        if (validation_error) {
            message.error(validation_error);
            return;
        }

        const { records: matching_records, templates: matching_templates } =
            findMatchingItems();

        if (matching_records.length === 0 && matching_templates.length === 0) {
            message.warning(SETTINGS_BULK_EDIT_NO_MATCHES);
            setSearchResults(null);
            return;
        }

        setSearchResults({
            records: matching_records.length,
            templates: matching_templates.length,
        });
    };

    const handleBulkEdit = async () => {
        const validation_error = validateForm();
        if (validation_error) {
            message.error(validation_error);
            return;
        }

        const { records: matching_records, templates: matching_templates } =
            findMatchingItems();

        if (matching_records.length === 0 && matching_templates.length === 0) {
            message.warning(SETTINGS_BULK_EDIT_NO_MATCHES);
            return;
        }

        // 확인 모달 표시
        Modal.confirm({
            title: SETTINGS_BULK_EDIT_CONFIRM_TITLE,
            icon: <ExclamationCircleOutlined />,
            content: (
                <div className="flex flex-col gap-md">
                    <Text>{SETTINGS_BULK_EDIT_CONFIRM_DESC}</Text>
                    <div>
                        <Text strong>
                            {matching_records.length}{" "}
                            {SETTINGS_BULK_EDIT_CONFIRM_COUNT_RECORDS}
                        </Text>
                        <br />
                        <Text strong>
                            {matching_templates.length}{" "}
                            {SETTINGS_BULK_EDIT_CONFIRM_COUNT_TEMPLATES}
                        </Text>
                    </div>
                    <Text type="secondary" className="!text-sm">
                        {form_data.old_work_name} ({form_data.old_project_code})
                        <br />→ {form_data.new_work_name} (
                        {form_data.new_project_code})
                    </Text>
                </div>
            ),
            okText: SETTINGS_BULK_EDIT_CONFIRM_OK,
            cancelText: SETTINGS_CANCEL,
            okButtonProps: { danger: true },
            onOk: async () => {
                await performBulkEdit(matching_records, matching_templates);
            },
        });
    };

    const performBulkEdit = async (
        matching_records: WorkRecord[],
        matching_templates: WorkTemplate[]
    ) => {
        setIsLoading(true);

        try {
            const { new_work_name, new_project_code } = form_data;

            // 로컬 스토어 업데이트
            matching_records.forEach((record) => {
                updateRecord(record.id, {
                    work_name: new_work_name,
                    project_code: new_project_code,
                });
            });

            matching_templates.forEach((template) => {
                updateTemplate(template.id, {
                    work_name: new_work_name,
                    project_code: new_project_code,
                });
            });

            // Firebase 동기화 (로그인 상태일 경우)
            const current_user = getCurrentUser();
            if (current_user) {
                // 업데이트된 레코드 준비
                const updated_records = matching_records.map((record) => ({
                    ...record,
                    work_name: new_work_name,
                    project_code: new_project_code,
                }));

                const updated_templates = matching_templates.map(
                    (template) => ({
                        ...template,
                        work_name: new_work_name,
                        project_code: new_project_code,
                    })
                );

                // 배치 저장
                await Promise.all([
                    saveRecordsBatch(current_user.uid, updated_records),
                    saveTemplatesBatch(current_user.uid, updated_templates),
                ]);
            }

            message.success(
                SUCCESS_MESSAGES.bulkEditSuccess(
                    matching_records.length,
                    matching_templates.length
                )
            );

            // 폼 초기화
            setFormData({
                old_work_name: "",
                old_project_code: "",
                new_work_name: "",
                new_project_code: "",
            });
            setSearchResults(null);
        } catch (error) {
            console.error("[BulkEdit] 일괄 변경 실패:", error);
            message.error(ERROR_MESSAGES.saveFailed);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col gap-lg">
                <Card
                    size="small"
                    styles={{
                        body: is_mobile ? CARD_BODY_MOBILE : CARD_BODY_DESKTOP,
                    }}
                >
                    <div className="flex flex-col items-center justify-center py-xl gap-md">
                        <ExclamationCircleOutlined className="!text-[48px] !text-[#faad14]" />
                        <div className="text-center">
                            <Title level={5}>
                                {SETTINGS_BULK_EDIT_LOGIN_REQUIRED_TITLE}
                            </Title>
                            <Text type="secondary">
                                {SETTINGS_BULK_EDIT_LOGIN_REQUIRED_DESC}
                            </Text>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col", is_mobile ? "gap-lg" : "gap-xl")}>
            <Card
                size="small"
                title={
                    <Space>
                        <EditOutlined style={{ color: theme_color }} />
                        <span>{SETTINGS_BULK_EDIT_TITLE}</span>
                    </Space>
                }
                styles={{
                    body: is_mobile ? CARD_BODY_MOBILE : CARD_BODY_DESKTOP,
                }}
            >
                <div className="flex flex-col gap-lg">
                    <Text type="secondary" className="!text-sm">
                        {SETTINGS_BULK_EDIT_DESC}
                    </Text>

                    <Alert
                        title={SETTINGS_BULK_EDIT_WARNING}
                        type="warning"
                        showIcon
                    />

                    {/* 기존 값 섹션 */}
                    <div className="flex flex-col gap-md">
                        <Text strong className="!text-md">
                            {SETTINGS_BULK_EDIT_OLD_SECTION}
                        </Text>

                        <SettingItem
                            title={SETTINGS_BULK_EDIT_OLD_WORK_NAME}
                            is_mobile={is_mobile}
                            action={
                                <Input
                                    placeholder={
                                        SETTINGS_BULK_EDIT_PLACEHOLDER_WORK_NAME
                                    }
                                    value={form_data.old_work_name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "old_work_name",
                                            e.target.value
                                        )
                                    }
                                    size={is_mobile ? "middle" : "small"}
                                    style={{ width: "100%" }}
                                />
                            }
                        />

                        <SettingItem
                            title={SETTINGS_BULK_EDIT_OLD_PROJECT_CODE}
                            is_mobile={is_mobile}
                            action={
                                <Input
                                    placeholder={
                                        SETTINGS_BULK_EDIT_PLACEHOLDER_PROJECT_CODE
                                    }
                                    value={form_data.old_project_code}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "old_project_code",
                                            e.target.value
                                        )
                                    }
                                    size={is_mobile ? "middle" : "small"}
                                    style={{ width: "100%" }}
                                />
                            }
                        />
                    </div>

                    {/* 새 값 섹션 */}
                    <div className="flex flex-col gap-md">
                        <Text strong className="!text-md">
                            {SETTINGS_BULK_EDIT_NEW_SECTION}
                        </Text>

                        <SettingItem
                            title={SETTINGS_BULK_EDIT_NEW_WORK_NAME}
                            is_mobile={is_mobile}
                            action={
                                <Input
                                    placeholder={
                                        SETTINGS_BULK_EDIT_PLACEHOLDER_WORK_NAME
                                    }
                                    value={form_data.new_work_name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "new_work_name",
                                            e.target.value
                                        )
                                    }
                                    size={is_mobile ? "middle" : "small"}
                                    style={{ width: "100%" }}
                                />
                            }
                        />

                        <SettingItem
                            title={SETTINGS_BULK_EDIT_NEW_PROJECT_CODE}
                            is_mobile={is_mobile}
                            action={
                                <Input
                                    placeholder={
                                        SETTINGS_BULK_EDIT_PLACEHOLDER_PROJECT_CODE
                                    }
                                    value={form_data.new_project_code}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "new_project_code",
                                            e.target.value
                                        )
                                    }
                                    size={is_mobile ? "middle" : "small"}
                                    style={{ width: "100%" }}
                                />
                            }
                        />
                    </div>

                    {/* 검색 결과 */}
                    {search_results && (
                        <Card
                            size="small"
                            styles={{
                                body: { padding: 12, background: "#f0f9ff" },
                            }}
                        >
                            <div className="flex flex-col gap-xs">
                                <Text strong>
                                    {SETTINGS_BULK_EDIT_SEARCH_TITLE}
                                </Text>
                                <div>
                                    <Text>
                                        {search_results.records}{" "}
                                        {
                                            SETTINGS_BULK_EDIT_CONFIRM_COUNT_RECORDS
                                        }
                                    </Text>
                                    <br />
                                    <Text>
                                        {search_results.templates}{" "}
                                        {
                                            SETTINGS_BULK_EDIT_CONFIRM_COUNT_TEMPLATES
                                        }
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* 액션 버튼 */}
                    <div
                        className={cn(
                            "grid grid-cols-2",
                            is_mobile ? "gap-sm" : "gap-md"
                        )}
                    >
                        <Button
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            style={{ height: is_mobile ? 40 : 48 }}
                        >
                            {SETTINGS_BULK_EDIT_SEARCH_BUTTON}
                        </Button>
                        <Button
                            type="primary"
                            danger
                            icon={<EditOutlined />}
                            onClick={handleBulkEdit}
                            loading={is_loading}
                            disabled={!search_results}
                            style={{ height: is_mobile ? 40 : 48 }}
                        >
                            {SETTINGS_BULK_EDIT_BUTTON}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default BulkEditTab;
