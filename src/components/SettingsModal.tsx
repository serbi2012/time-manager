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
    EditOutlined,
} from "@ant-design/icons";
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
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
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
                    <Text type="danger" style={{ display: "block", marginTop: 12 }}>
                        {error_message}
                    </Text>
                )}
                
                <div style={{ marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        현재: <Tag style={{ fontFamily: "monospace" }}>
                            {formatShortcutKeyForPlatform(shortcut.keys)}
                        </Tag>
                    </Text>
                </div>
                
                <Text type="secondary" style={{ display: "block", marginTop: 12, fontSize: 12 }}>
                    Ctrl/Alt/Shift + 키 조합만 사용 가능합니다. ESC로 취소합니다.
                </Text>
            </div>
        </Modal>
    );
}

// 단축키 탭 컴포넌트
function ShortcutsTab() {
    const shortcuts = useShortcutStore((state) => state.shortcuts);
    const toggleShortcut = useShortcutStore((state) => state.toggleShortcut);
    const resetToDefault = useShortcutStore((state) => state.resetToDefault);
    const app_theme = useWorkStore((state) => state.app_theme);
    const theme_color = APP_THEME_COLORS[app_theme].primary;
    
    const [editing_shortcut, setEditingShortcut] = useState<ShortcutDefinition | null>(null);

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
                    단축키를 활성화/비활성화하거나 원하는 키 조합으로 변경할 수 있습니다.
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
            <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
            >
                앱 전체의 테마 색상을 선택합니다. 헤더, 버튼, 링크 등 주요 UI 요소의 색상이 변경됩니다.
            </Text>

            <Divider style={{ marginTop: 0 }}>테마 색상</Divider>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 12,
                }}
            >
                {theme_options.map((theme) => (
                    <div
                        key={theme}
                        onClick={() => setAppTheme(theme)}
                        style={{
                            position: "relative",
                            cursor: "pointer",
                            borderRadius: 8,
                            overflow: "hidden",
                            border:
                                app_theme === theme
                                    ? `2px solid ${APP_THEME_COLORS[theme].primary}`
                                    : "2px solid #f0f0f0",
                            transition: "all 0.2s",
                        }}
                    >
                        <div
                            style={{
                                height: 48,
                                background: APP_THEME_COLORS[theme].gradient,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {app_theme === theme && (
                                <CheckOutlined
                                    style={{
                                        color: "white",
                                        fontSize: 20,
                                    }}
                                />
                            )}
                        </div>
                        <div
                            style={{
                                padding: "8px 12px",
                                background: "white",
                                textAlign: "center",
                                fontSize: 13,
                                fontWeight:
                                    app_theme === theme ? 600 : 400,
                                color:
                                    app_theme === theme
                                        ? APP_THEME_COLORS[theme].primary
                                        : "#434343",
                            }}
                        >
                            {APP_THEME_LABELS[theme]}
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    marginTop: 24,
                    padding: 16,
                    background: "#fafafa",
                    borderRadius: 8,
                }}
            >
                <Text type="secondary" style={{ fontSize: 12 }}>
                    💡 테마 설정은 자동으로 저장됩니다. 로그인한 경우 다른 기기에서도 동일한 테마가 적용됩니다.
                </Text>
            </div>
        </div>
    );
}

// 데이터 탭 컴포넌트
function DataTab({
    onExport,
    onImport,
    isAuthenticated,
}: {
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
}) {
    const use_postfix = useWorkStore((state) => state.use_postfix_on_preset_add);
    const setUsePostfix = useWorkStore(
        (state) => state.setUsePostfixOnPresetAdd
    );

    return (
        <div>
            <Divider style={{ marginTop: 0 }}>프리셋 설정</Divider>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}
            >
                <div>
                    <Text>작업 추가 시 구분자(postfix) 사용</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        OFF: "시간관리보고서입력" → 그대로
                        <br />
                        ON: "시간관리보고서입력" → "시간관리보고서입력_0122_093045_123"
                    </Text>
                </div>
                <Switch checked={use_postfix} onChange={setUsePostfix} />
            </div>

            <Divider>백업 및 복원</Divider>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Button icon={<DownloadOutlined />} onClick={onExport} block>
                    데이터 내보내기 (Export)
                </Button>
                <Button
                    icon={<UploadOutlined />}
                    onClick={onImport}
                    block
                >
                    데이터 가져오기 (Import)
                </Button>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    * 가져오기 시 기존 데이터가 덮어씌워집니다
                </Text>
            </Space>

            <Divider>저장소 정보</Divider>
            <Space direction="vertical" style={{ width: "100%" }}>
                <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                >
                    <Text>저장 위치</Text>
                    <Tag color={isAuthenticated ? "green" : "blue"}>
                        {isAuthenticated
                            ? "Firebase Cloud"
                            : "LocalStorage (브라우저)"}
                    </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {isAuthenticated
                        ? "데이터가 클라우드에 자동으로 동기화됩니다"
                        : "데이터가 이 브라우저에 로컬 저장됩니다. 로그인하면 클라우드에 동기화되어 여러 기기에서 사용할 수 있습니다."}
                </Text>
            </Space>
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
            children: <ShortcutsTab />,
        },
    ];

    return (
        <Modal
            title="설정"
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
            styles={{
                body: { minHeight: 400 },
            }}
        >
            <Tabs
                defaultActiveKey="theme"
                items={tab_items}
                tabPosition="left"
                style={{ minHeight: 350 }}
            />
        </Modal>
    );
}
