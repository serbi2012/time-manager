// 설정 모달 컴포넌트
import { useRef } from "react";
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
} from "antd";
import {
    DownloadOutlined,
    UploadOutlined,
    KeyOutlined,
    DatabaseOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { useShortcutStore, CATEGORY_LABELS, type ShortcutDefinition } from "../store/useShortcutStore";
import { formatShortcutKeyForPlatform } from "../hooks/useShortcuts";

const { Text } = Typography;

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
}

// 단축키 탭 컴포넌트
function ShortcutsTab() {
    const shortcuts = useShortcutStore((state) => state.shortcuts);
    const toggleShortcut = useShortcutStore((state) => state.toggleShortcut);
    const resetToDefault = useShortcutStore((state) => state.resetToDefault);

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
            width: 120,
            render: (keys: string) => (
                <Tag
                    style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        padding: "4px 8px",
                    }}
                >
                    {formatShortcutKeyForPlatform(keys)}
                </Tag>
            ),
        },
        {
            title: "카테고리",
            dataIndex: "category",
            key: "category",
            width: 100,
            render: (category: ShortcutDefinition["category"]) => (
                <Tag color="blue">{CATEGORY_LABELS[category]}</Tag>
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
                    단축키를 활성화/비활성화할 수 있습니다. 입력 필드에서는 단축키가 작동하지 않습니다.
                </Text>
                <Popconfirm
                    title="단축키 초기화"
                    description="모든 단축키 설정을 기본값으로 되돌리시겠습니까?"
                    onConfirm={handleReset}
                    okText="초기화"
                    cancelText="취소"
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
        </div>
    );
}

// 데이터 탭 컴포넌트
function DataTab({
    onExport,
    onImport,
    isAuthenticated,
    file_input_ref,
}: {
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
    file_input_ref: React.RefObject<HTMLInputElement | null>;
}) {
    return (
        <div>
            <Divider orientation="left" style={{ marginTop: 0 }}>
                백업 및 복원
            </Divider>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Button icon={<DownloadOutlined />} onClick={onExport} block>
                    데이터 내보내기 (Export)
                </Button>
                <Button
                    icon={<UploadOutlined />}
                    onClick={onImport}
                    block
                    disabled={!isAuthenticated}
                >
                    데이터 가져오기 (Import)
                </Button>
                <input
                    ref={file_input_ref}
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                />
                {!isAuthenticated && (
                    <Text type="warning" style={{ fontSize: 12 }}>
                        * 데이터 가져오기는 로그인 후 사용할 수 있습니다
                    </Text>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                    * 가져오기 시 기존 데이터가 덮어씌워집니다
                </Text>
            </Space>

            <Divider orientation="left">저장소 정보</Divider>
            <Space direction="vertical" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>저장 위치</Text>
                    <Tag color={isAuthenticated ? "green" : "orange"}>
                        {isAuthenticated ? "Firebase Cloud" : "메모리 (로그인 필요)"}
                    </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {isAuthenticated
                        ? "데이터가 클라우드에 자동으로 동기화됩니다"
                        : "로그인하면 데이터가 클라우드에 저장되어 여러 기기에서 사용할 수 있습니다"}
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
    const file_input_ref = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        if (!isAuthenticated) {
            message.warning("로그인 후 데이터를 가져올 수 있습니다");
            return;
        }
        file_input_ref.current?.click();
        onImport();
    };

    const tab_items = [
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
                    onImport={handleImportClick}
                    isAuthenticated={isAuthenticated}
                    file_input_ref={file_input_ref}
                />
            ),
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
                defaultActiveKey="data"
                items={tab_items}
                tabPosition="left"
                style={{ minHeight: 350 }}
            />
        </Modal>
    );
}
