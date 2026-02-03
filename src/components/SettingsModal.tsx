// 설정 모달 컴포넌트
import { useState, useMemo } from "react";
import {
    Modal,
    Tabs,
    Space,
    Button,
    Typography,
    Switch,
    Table,
    Tag,
    Divider,
    message,
    Popconfirm,
    Checkbox,
    Empty,
    Collapse,
    TimePicker,
    Card,
} from "antd";
import {
    DownloadOutlined,
    UploadOutlined,
    KeyOutlined,
    DatabaseOutlined,
    ReloadOutlined,
    UnorderedListOutlined,
    DeleteOutlined,
    UndoOutlined,
    BgColorsOutlined,
    CheckOutlined,
    CheckCircleFilled,
    EditOutlined,
    ClockCircleOutlined,
    CloudOutlined,
    AppstoreOutlined,
    SaveOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useShortcutStore,
    CATEGORY_LABELS,
    type ShortcutDefinition,
} from "../store/useShortcutStore";
import { formatShortcutKeyForPlatform } from "../hooks/useShortcuts";
import {
    useWorkStore,
    DEFAULT_TASK_OPTIONS,
    DEFAULT_CATEGORY_OPTIONS,
    APP_THEME_COLORS,
    APP_THEME_LABELS,
    type AppTheme,
} from "../store/useWorkStore";
import { useResponsive } from "../hooks/useResponsive";
import { AnimationTab } from "../features/settings/ui/tabs";

const { Text } = Typography;

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
}

// 키 입력을 키 문자열로 변환
function keyEventToKeyString(e: React.KeyboardEvent): string | null {
    const key = e.key;

    // 단독 수정자 키만 누른 경우 무시
    if (["Control", "Alt", "Shift", "Meta"].includes(key)) {
        return null;
    }

    // Escape 키는 취소용으로 사용
    if (key === "Escape") {
        return null;
    }

    const parts: string[] = [];

    // 수정자 키 추가 (순서 통일: Ctrl → Alt → Shift)
    if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");

    // 수정자 키 없이 단독 키 입력은 허용하지 않음 (일반 타이핑과 충돌)
    if (parts.length === 0) {
        return null;
    }

    // 메인 키 추가
    let main_key = key;

    // 특수 키 이름 정규화
    if (key === "ArrowLeft") main_key = "Left";
    else if (key === "ArrowRight") main_key = "Right";
    else if (key === "ArrowUp") main_key = "Up";
    else if (key === "ArrowDown") main_key = "Down";
    else if (key === " ") main_key = "Space";
    else if (key.length === 1) main_key = key.toUpperCase();

    parts.push(main_key);

    return parts.join("+");
}

// 단축키 편집 컴포넌트
interface ShortcutKeyEditorProps {
    shortcut: ShortcutDefinition;
    onClose: () => void;
}

function ShortcutKeyEditor({ shortcut, onClose }: ShortcutKeyEditorProps) {
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
            // 중복 검사
            if (isKeysDuplicate(key_string, shortcut.id)) {
                setErrorMessage("이미 다른 단축키에서 사용 중입니다");
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
                message.success("단축키가 변경되었습니다");
                onClose();
            } else {
                message.error(result.message || "단축키 변경에 실패했습니다");
            }
        }
    };

    return (
        <Modal
            title={`단축키 설정: ${shortcut.name}`}
            open={true}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    취소
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    disabled={!pending_keys}
                    onClick={handleSave}
                >
                    저장
                </Button>,
            ]}
            width={400}
        >
            <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 16 }}
                >
                    새로운 단축키 조합을 입력하세요
                </Text>
                <div
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    style={{
                        padding: "24px 16px",
                        border: error_message
                            ? "2px dashed #ff4d4f"
                            : pending_keys
                            ? "2px solid #52c41a"
                            : "2px dashed #d9d9d9",
                        borderRadius: 8,
                        background: "#fafafa",
                        cursor: "text",
                        outline: "none",
                        transition: "all 0.2s",
                    }}
                >
                    {pending_keys ? (
                        <Tag
                            color="blue"
                            style={{
                                fontFamily: "monospace",
                                fontSize: 16,
                                padding: "8px 16px",
                            }}
                        >
                            {formatShortcutKeyForPlatform(pending_keys)}
                        </Tag>
                    ) : (
                        <Text type="secondary" style={{ fontSize: 14 }}>
                            여기를 클릭하고 단축키를 누르세요
                        </Text>
                    )}
                </div>

                {error_message && (
                    <Text
                        type="danger"
                        style={{ display: "block", marginTop: 12 }}
                    >
                        {error_message}
                    </Text>
                )}

                <div style={{ marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        현재:{" "}
                        <Tag style={{ fontFamily: "monospace" }}>
                            {formatShortcutKeyForPlatform(shortcut.keys)}
                        </Tag>
                    </Text>
                </div>

                <Text
                    type="secondary"
                    style={{ display: "block", marginTop: 12, fontSize: 12 }}
                >
                    Ctrl/Alt/Shift + 키 조합만 사용 가능합니다. ESC로
                    취소합니다.
                </Text>
            </div>
        </Modal>
    );
}

// 단축키 탭 컴포넌트
function ShortcutsTab({ is_mobile }: { is_mobile?: boolean }) {
    const shortcuts = useShortcutStore((state) => state.shortcuts);
    const toggleShortcut = useShortcutStore((state) => state.toggleShortcut);
    const resetToDefault = useShortcutStore((state) => state.resetToDefault);
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    const [editing_shortcut, setEditingShortcut] =
        useState<ShortcutDefinition | null>(null);

    const columns = [
        {
            title: "기능",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: ShortcutDefinition) => (
                <div>
                    <Text strong>{name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.description}
                    </Text>
                </div>
            ),
        },
        {
            title: "단축키",
            dataIndex: "keys",
            key: "keys",
            width: 150,
            render: (keys: string, record: ShortcutDefinition) => (
                <Space>
                    <Tag
                        style={{
                            fontFamily: "monospace",
                            fontSize: 13,
                            padding: "4px 8px",
                        }}
                    >
                        {formatShortcutKeyForPlatform(keys)}
                    </Tag>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setEditingShortcut(record)}
                    />
                </Space>
            ),
        },
        {
            title: "카테고리",
            dataIndex: "category",
            key: "category",
            width: 100,
            render: (category: ShortcutDefinition["category"]) => (
                <Tag color={theme_color}>{CATEGORY_LABELS[category]}</Tag>
            ),
        },
        {
            title: "활성화",
            dataIndex: "enabled",
            key: "enabled",
            width: 80,
            render: (enabled: boolean, record: ShortcutDefinition) => (
                <Switch
                    checked={enabled}
                    onChange={() => toggleShortcut(record.id)}
                    size="small"
                />
            ),
        },
    ];

    const handleReset = () => {
        resetToDefault();
        message.success("단축키 설정이 초기화되었습니다");
    };

    // 모바일: 블러 처리 + 사용 불가 메시지
    if (is_mobile) {
        return (
            <div style={{ position: "relative" }}>
                {/* 블러 처리된 단축키 목록 (미리보기용) */}
                <div
                    style={{
                        filter: "blur(3px)",
                        opacity: 0.5,
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        {shortcuts.slice(0, 3).map((shortcut) => (
                            <div
                                key={shortcut.id}
                                style={{
                                    padding: 12,
                                    background: "#fafafa",
                                    borderRadius: 8,
                                    border: "1px solid #f0f0f0",
                                }}
                            >
                                <Text
                                    strong
                                    style={{ fontSize: 13, display: "block" }}
                                >
                                    {shortcut.name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    {shortcut.description}
                                </Text>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 오버레이 메시지 */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.85)",
                        borderRadius: 8,
                        padding: 24,
                        textAlign: "center",
                    }}
                >
                    <KeyOutlined
                        style={{
                            fontSize: 40,
                            color: "#bfbfbf",
                            marginBottom: 16,
                        }}
                    />
                    <Text
                        strong
                        style={{
                            fontSize: 16,
                            marginBottom: 8,
                            color: "#595959",
                        }}
                    >
                        PC에서만 사용 가능
                    </Text>
                    <Text
                        type="secondary"
                        style={{ fontSize: 13, lineHeight: 1.5 }}
                    >
                        단축키 설정은 키보드가 있는
                        <br />
                        PC 환경에서만 변경할 수 있습니다.
                    </Text>
                </div>
            </div>
        );
    }

    // 데스크탑: 테이블로 표시
    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <Text type="secondary">
                    단축키를 활성화/비활성화하거나 원하는 키 조합으로 변경할 수
                    있습니다.
                </Text>
                <Popconfirm
                    title="단축키 초기화"
                    description="모든 단축키 설정을 기본값으로 되돌리시겠습니까?"
                    onConfirm={handleReset}
                    okText="초기화"
                    cancelText="취소"
                    okButtonProps={{ autoFocus: true }}
                >
                    <Button icon={<ReloadOutlined />} size="small">
                        기본값으로 초기화
                    </Button>
                </Popconfirm>
            </div>
            <Table
                dataSource={shortcuts}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ marginTop: 8 }}
            />

            {/* 단축키 편집 모달 */}
            {editing_shortcut && (
                <ShortcutKeyEditor
                    shortcut={editing_shortcut}
                    onClose={() => setEditingShortcut(null)}
                />
            )}
        </div>
    );
}

// 오토컴플리트 옵션 관리 탭
function AutoCompleteTab() {
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

    // 모든 옵션 수집 (레코드 + 템플릿에서 추출)
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

        // 업무명/카테고리 옵션 (기본 + 사용자 정의)
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

    // 숨겨진 옵션과 보이는 옵션 분리
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

    type FieldType =
        | "work_name"
        | "task_name"
        | "deal_name"
        | "project_code"
        | "task_option"
        | "category_option";

    // 선택된 항목 일괄 숨김
    const handleBulkHide = (
        field: FieldType,
        selected: string[],
        clearSelection: () => void
    ) => {
        selected.forEach((v) => hideAutoCompleteOption(field, v));
        clearSelection();
        message.success(`${selected.length}개 항목이 숨겨졌습니다`);
    };

    // 숨겨진 항목 복원
    const handleUnhide = (field: FieldType, value: string) => {
        unhideAutoCompleteOption(field, value);
        message.success(`"${value}" 복원됨`);
    };

    // 숨겨진 항목 일괄 복원
    const handleBulkUnhide = (field: FieldType) => {
        const hidden_list = hidden_autocomplete_options[field];
        hidden_list.forEach((v) => unhideAutoCompleteOption(field, v));
        message.success(`${hidden_list.length}개 항목이 복원되었습니다`);
    };

    // 옵션 목록 렌더링
    const renderOptionList = (
        title: string,
        field: FieldType,
        visible_options: string[],
        selected: string[],
        setSelected: (values: string[]) => void
    ) => {
        const hidden_list =
            (hidden_autocomplete_options as Record<string, string[]>)[field] ||
            [];

        return (
            <div style={{ marginBottom: 16 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                    }}
                >
                    <Text strong>
                        {title} ({visible_options.length}개)
                    </Text>
                    {selected.length > 0 && (
                        <Popconfirm
                            title={`${selected.length}개 항목을 숨기시겠습니까?`}
                            onConfirm={() =>
                                handleBulkHide(field, selected, () =>
                                    setSelected([])
                                )
                            }
                            okText="숨김"
                            cancelText="취소"
                            okButtonProps={{ autoFocus: true }}
                        >
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            >
                                선택 숨김 ({selected.length})
                            </Button>
                        </Popconfirm>
                    )}
                </div>

                {visible_options.length === 0 ? (
                    <Empty
                        description="옵션 없음"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: "8px 0" }}
                    />
                ) : (
                    <Checkbox.Group
                        value={selected}
                        onChange={(values) => setSelected(values as string[])}
                        style={{ width: "100%" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 4,
                                maxHeight: 120,
                                overflowY: "auto",
                                border: "1px solid #d9d9d9",
                                borderRadius: 4,
                                padding: 8,
                            }}
                        >
                            {visible_options.map((opt) => (
                                <Checkbox key={opt} value={opt}>
                                    <Tag>{opt}</Tag>
                                </Checkbox>
                            ))}
                        </div>
                    </Checkbox.Group>
                )}

                {/* 숨겨진 항목 */}
                {hidden_list.length > 0 && (
                    <Collapse
                        size="small"
                        style={{ marginTop: 8 }}
                        items={[
                            {
                                key: "hidden",
                                label: (
                                    <Text type="secondary">
                                        숨겨진 항목 ({hidden_list.length}개)
                                    </Text>
                                ),
                                extra: (
                                    <Button
                                        size="small"
                                        type="link"
                                        icon={<UndoOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBulkUnhide(field);
                                        }}
                                    >
                                        전체 복원
                                    </Button>
                                ),
                                children: (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 4,
                                        }}
                                    >
                                        {hidden_list.map((opt) => (
                                            <Tag
                                                key={opt}
                                                closable
                                                closeIcon={<UndoOutlined />}
                                                onClose={(e) => {
                                                    e.preventDefault();
                                                    handleUnhide(field, opt);
                                                }}
                                                style={{
                                                    opacity: 0.6,
                                                    textDecoration:
                                                        "line-through",
                                                }}
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
    };

    return (
        <div>
            <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
            >
                자동완성 옵션을 관리합니다. 숨긴 항목은 자동완성 목록에 표시되지
                않지만, 데이터는 유지됩니다.
            </Text>

            {renderOptionList(
                "작업명",
                "work_name",
                visible_work_names,
                selected_work_names,
                setSelectedWorkNames
            )}

            {renderOptionList(
                "업무명",
                "task_name",
                visible_task_names,
                selected_task_names,
                setSelectedTaskNames
            )}

            {renderOptionList(
                "거래명",
                "deal_name",
                visible_deal_names,
                selected_deal_names,
                setSelectedDealNames
            )}

            {renderOptionList(
                "프로젝트 코드",
                "project_code",
                visible_project_codes,
                selected_project_codes,
                setSelectedProjectCodes
            )}

            <Divider />

            {renderOptionList(
                "업무명 (Select 옵션)",
                "task_option",
                visible_task_options,
                selected_task_options,
                setSelectedTaskOptions
            )}

            {renderOptionList(
                "카테고리 (Select 옵션)",
                "category_option",
                visible_category_options,
                selected_category_options,
                setSelectedCategoryOptions
            )}
        </div>
    );
}

// 테마 탭 컴포넌트
function ThemeTab() {
    const app_theme = useWorkStore((state) => state.app_theme);
    const setAppTheme = useWorkStore((state) => state.setAppTheme);

    const theme_options: AppTheme[] = [
        "blue",
        "green",
        "purple",
        "red",
        "orange",
        "teal",
        "black",
    ];

    return (
        <div>
            {/* 헤더 */}
            <div style={{ marginBottom: 24, textAlign: "center" }}>
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: APP_THEME_COLORS[app_theme].gradient,
                        margin: "0 auto 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 8px 24px ${APP_THEME_COLORS[app_theme].primary}33`,
                    }}
                >
                    <BgColorsOutlined
                        style={{ fontSize: 28, color: "white" }}
                    />
                </div>
                <Text strong style={{ fontSize: 16, display: "block" }}>
                    테마 색상
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                    앱 전체의 테마 색상을 선택하세요
                </Text>
            </div>

            {/* 테마 그리드 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                    gap: 12,
                }}
            >
                {theme_options.map((theme) => {
                    const is_selected = app_theme === theme;
                    return (
                        <div
                            key={theme}
                            onClick={() => setAppTheme(theme)}
                            style={{
                                cursor: "pointer",
                                borderRadius: 12,
                                padding: 4,
                                background: is_selected
                                    ? `${APP_THEME_COLORS[theme].primary}15`
                                    : "transparent",
                                border: is_selected
                                    ? `2px solid ${APP_THEME_COLORS[theme].primary}`
                                    : "2px solid transparent",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <div
                                style={{
                                    height: 56,
                                    borderRadius: 8,
                                    background:
                                        APP_THEME_COLORS[theme].gradient,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 6,
                                    boxShadow: is_selected
                                        ? `0 4px 12px ${APP_THEME_COLORS[theme].primary}40`
                                        : "none",
                                }}
                            >
                                {is_selected && (
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: "50%",
                                            background: "rgba(255,255,255,0.9)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <CheckOutlined
                                            style={{
                                                color: APP_THEME_COLORS[theme]
                                                    .primary,
                                                fontSize: 14,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <Text
                                style={{
                                    display: "block",
                                    textAlign: "center",
                                    fontSize: 12,
                                    fontWeight: is_selected ? 600 : 400,
                                    color: is_selected
                                        ? APP_THEME_COLORS[theme].primary
                                        : "#595959",
                                }}
                            >
                                {APP_THEME_LABELS[theme]}
                            </Text>
                        </div>
                    );
                })}
            </div>

            {/* 안내 문구 */}
            <div
                style={{
                    marginTop: 24,
                    padding: "12px 16px",
                    background: `${APP_THEME_COLORS[app_theme].primary}08`,
                    borderRadius: 8,
                    border: `1px solid ${APP_THEME_COLORS[app_theme].primary}20`,
                }}
            >
                <Text style={{ fontSize: 12, color: "#595959" }}>
                    테마는 자동 저장됩니다. 로그인하면 모든 기기에 동일하게
                    적용됩니다.
                </Text>
            </div>
        </div>
    );
}

// 설정 아이템 컴포넌트 (일관된 레이아웃 - 반응형)
interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action: React.ReactNode;
    is_mobile?: boolean;
}

function SettingItem({
    icon,
    title,
    description,
    action,
    is_mobile,
}: SettingItemProps) {
    // 모바일: 세로 레이아웃 (아이콘 제거, 제목+설명 위, 액션 아래)
    if (is_mobile) {
        return (
            <div
                style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
                <div style={{ marginBottom: 8 }}>
                    <Text
                        strong
                        style={{
                            fontSize: 14,
                            display: "block",
                            marginBottom: 2,
                        }}
                    >
                        {title}
                    </Text>
                    {description && (
                        <Text
                            type="secondary"
                            style={{ fontSize: 12, lineHeight: 1.4 }}
                        >
                            {description}
                        </Text>
                    )}
                </div>
                <div>{action}</div>
            </div>
        );
    }

    // 데스크탑에서도 icon이 사용되지 않으면 무시
    void icon;

    // 데스크탑: 가로 레이아웃
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                borderBottom: "1px solid #f0f0f0",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    flex: 1,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        color: "#595959",
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 14, display: "block" }}>
                        {title}
                    </Text>
                    {description && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {description}
                        </Text>
                    )}
                </div>
            </div>
            <div style={{ flexShrink: 0, marginLeft: 16 }}>{action}</div>
        </div>
    );
}

// 데이터 탭 컴포넌트
function DataTab({
    onExport,
    onImport,
    isAuthenticated,
    is_mobile,
}: {
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
    is_mobile?: boolean;
}) {
    const use_postfix = useWorkStore(
        (state) => state.use_postfix_on_preset_add
    );
    const setUsePostfix = useWorkStore(
        (state) => state.setUsePostfixOnPresetAdd
    );
    const lunch_start_time = useWorkStore((state) => state.lunch_start_time);
    const lunch_end_time = useWorkStore((state) => state.lunch_end_time);
    const setLunchTime = useWorkStore((state) => state.setLunchTime);
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;

    // 점심시간 핸들러
    const handleLunchTimeChange = (
        times: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
    ) => {
        if (times && times[0] && times[1]) {
            const start = times[0].format("HH:mm");
            const end = times[1].format("HH:mm");
            setLunchTime(start, end);
            message.success("점심시간이 변경되었습니다");
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: is_mobile ? 16 : 24,
            }}
        >
            {/* 시간 설정 섹션 */}
            <Card
                size="small"
                title={
                    <Space>
                        <ClockCircleOutlined style={{ color: theme_color }} />
                        <span>시간 설정</span>
                    </Space>
                }
                styles={{ body: { padding: is_mobile ? "0 12px" : "0 16px" } }}
            >
                <SettingItem
                    icon={<ClockCircleOutlined />}
                    title="점심시간"
                    description="간트차트에 표시되며 작업 시간 계산 시 자동 제외됩니다"
                    is_mobile={is_mobile}
                    action={
                        <TimePicker.RangePicker
                            value={[
                                dayjs(lunch_start_time, "HH:mm"),
                                dayjs(lunch_end_time, "HH:mm"),
                            ]}
                            onChange={handleLunchTimeChange}
                            format="HH:mm"
                            minuteStep={5}
                            size="small"
                            style={{ width: is_mobile ? "100%" : 180 }}
                            allowClear={false}
                        />
                    }
                />
            </Card>

            {/* 프리셋 설정 섹션 */}
            <Card
                size="small"
                title={
                    <Space>
                        <AppstoreOutlined style={{ color: theme_color }} />
                        <span>프리셋 설정</span>
                    </Space>
                }
                styles={{ body: { padding: is_mobile ? "0 12px" : "0 16px" } }}
            >
                <SettingItem
                    icon={<AppstoreOutlined />}
                    title="고유 식별자 자동 추가"
                    description="프리셋으로 작업 추가 시 거래명에 타임스탬프를 붙입니다"
                    is_mobile={is_mobile}
                    action={
                        <Switch
                            checked={use_postfix}
                            onChange={setUsePostfix}
                        />
                    }
                />
            </Card>

            {/* 데이터 관리 섹션 */}
            <Card
                size="small"
                title={
                    <Space>
                        <SaveOutlined style={{ color: theme_color }} />
                        <span>데이터 관리</span>
                    </Space>
                }
                styles={{ body: { padding: is_mobile ? 12 : 16 } }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: is_mobile ? 8 : 12,
                        marginBottom: is_mobile ? 12 : 16,
                    }}
                >
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={onExport}
                        style={{ height: is_mobile ? 40 : 48 }}
                    >
                        내보내기
                    </Button>
                    <Button
                        icon={<UploadOutlined />}
                        onClick={onImport}
                        style={{ height: is_mobile ? 40 : 48 }}
                    >
                        가져오기
                    </Button>
                </div>
                <Text
                    type="secondary"
                    style={{ fontSize: is_mobile ? 11 : 12 }}
                >
                    JSON 파일로 데이터를 백업하거나 복원할 수 있습니다. 가져오기
                    시 기존 데이터가 대체됩니다.
                </Text>
            </Card>

            {/* 저장소 상태 */}
            <Card
                size="small"
                styles={{
                    body: {
                        padding: is_mobile ? 12 : 16,
                        background: isAuthenticated ? "#f6ffed" : "#e6f4ff",
                        borderRadius: 8,
                    },
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {isAuthenticated ? (
                        <CheckCircleFilled
                            style={{
                                color: "#52c41a",
                                fontSize: 32,
                                flexShrink: 0,
                            }}
                        />
                    ) : (
                        <CloudOutlined
                            style={{
                                color: "#1677ff",
                                fontSize: 32,
                                flexShrink: 0,
                            }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        <Text strong style={{ display: "block", fontSize: 14 }}>
                            {isAuthenticated ? "클라우드 연결됨" : "로컬 저장"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {isAuthenticated
                                ? "모든 데이터가 자동으로 동기화됩니다"
                                : "로그인하면 여러 기기에서 데이터를 동기화할 수 있습니다"}
                        </Text>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default function SettingsModal({
    open,
    onClose,
    onExport,
    onImport,
    isAuthenticated,
}: SettingsModalProps) {
    const { is_mobile } = useResponsive();

    const tab_items = [
        {
            key: "theme",
            label: (
                <span>
                    <BgColorsOutlined /> 테마
                </span>
            ),
            children: <ThemeTab />,
        },
        {
            key: "animation",
            label: (
                <span>
                    <ThunderboltOutlined /> 애니메이션
                </span>
            ),
            children: <AnimationTab is_mobile={is_mobile} />,
        },
        {
            key: "data",
            label: (
                <span>
                    <DatabaseOutlined /> 데이터
                </span>
            ),
            children: (
                <DataTab
                    onExport={onExport}
                    onImport={onImport}
                    isAuthenticated={isAuthenticated}
                    is_mobile={is_mobile}
                />
            ),
        },
        {
            key: "autocomplete",
            label: (
                <span>
                    <UnorderedListOutlined /> 자동완성
                </span>
            ),
            children: <AutoCompleteTab />,
        },
        {
            key: "shortcuts",
            label: (
                <span>
                    <KeyOutlined /> 단축키
                </span>
            ),
            children: <ShortcutsTab is_mobile={is_mobile} />,
        },
    ];

    // 탭 컨텐츠를 스크롤 가능한 컨테이너로 감싸기
    const scrollable_tab_items = tab_items.map((item) => ({
        ...item,
        children: is_mobile ? (
            // 모바일: 모달 내부에서 스크롤 (모달헤더 55px + 탭바 46px + 여백 = 약 130px)
            <div
                style={{
                    maxHeight: "calc(100vh - 280px)",
                    overflowY: "auto",
                    overflowX: "hidden",
                    paddingBottom: 16,
                    paddingRight: 4,
                }}
            >
                {item.children}
            </div>
        ) : (
            // 데스크탑
            <div
                style={{
                    height: "calc(70vh - 120px)",
                    maxHeight: 500,
                    minHeight: 300,
                    overflowY: "auto",
                    paddingRight: 8,
                }}
            >
                {item.children}
            </div>
        ),
    }));

    // 모바일용 모달 설정
    if (is_mobile) {
        return (
            <Modal
                title="설정"
                open={open}
                onCancel={onClose}
                footer={null}
                width="calc(100% - 24px)"
                centered
                style={{
                    maxWidth: 400,
                    margin: "0 auto",
                }}
                styles={{
                    body: {
                        padding: "0 12px 12px",
                        maxHeight: "calc(100vh - 180px)",
                        overflow: "hidden",
                    },
                }}
                className="mobile-settings-modal"
            >
                <Tabs
                    defaultActiveKey="theme"
                    items={scrollable_tab_items}
                    tabPosition="top"
                    centered
                    size="small"
                />
            </Modal>
        );
    }

    // 데스크탑용 모달
    return (
        <Modal
            title="설정"
            open={open}
            onCancel={onClose}
            footer={null}
            width={750}
            centered
            styles={{
                body: {
                    padding: "12px 24px 24px",
                },
            }}
        >
            <Tabs
                defaultActiveKey="theme"
                items={scrollable_tab_items}
                tabPosition="left"
                tabBarStyle={{
                    width: 120,
                    flexShrink: 0,
                    borderRight: "1px solid #f0f0f0",
                    marginRight: 0,
                }}
                style={{
                    height: "calc(70vh - 80px)",
                    maxHeight: 540,
                    minHeight: 340,
                }}
            />
            <style>{`
                .ant-tabs-left > .ant-tabs-content-holder {
                    padding-left: 24px;
                }
                .ant-tabs-left > .ant-tabs-nav .ant-tabs-tab {
                    padding: 12px 16px;
                    margin: 0;
                }
            `}</style>
        </Modal>
    );
}
