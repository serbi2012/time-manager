import { Modal, Timeline, Tag, Typography, Divider, Empty } from "antd";
import {
    CHANGELOG,
    CURRENT_VERSION,
    CHANGE_TYPE_CONFIG,
    type ChangelogEntry,
    type ChangeItem,
} from "../constants/changelog";

const { Title, Text, Paragraph } = Typography;

interface ChangelogModalProps {
    open: boolean;
    onClose: () => void;
}

/**
 * 변경 항목 렌더링
 */
function ChangeItemTag({ item }: { item: ChangeItem }) {
    const config = CHANGE_TYPE_CONFIG[item.type];
    return (
        <div style={{ marginBottom: 4, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Tag
                color={config.color}
                style={{
                    flexShrink: 0,
                    fontSize: 11,
                    lineHeight: "18px",
                    padding: "0 6px",
                }}
            >
                {config.emoji} {config.label}
            </Tag>
            <Text style={{ fontSize: 13, lineHeight: "20px" }}>{item.description}</Text>
        </div>
    );
}

/**
 * 버전 엔트리 렌더링
 */
function VersionEntry({ entry, is_latest }: { entry: ChangelogEntry; is_latest: boolean }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0 }}>
                    v{entry.version}
                </Title>
                {is_latest && (
                    <Tag color="blue" style={{ fontSize: 11 }}>
                        최신
                    </Tag>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {entry.date}
                </Text>
            </div>
            <Paragraph style={{ marginBottom: 12, color: "#595959", fontWeight: 500 }}>
                {entry.title}
            </Paragraph>
            <div style={{ paddingLeft: 4 }}>
                {entry.changes.map((change, index) => (
                    <ChangeItemTag key={index} item={change} />
                ))}
            </div>
        </div>
    );
}

/**
 * 업데이트 내역 모달 컴포넌트
 */
export default function ChangelogModal({ open, onClose }: ChangelogModalProps) {
    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>📋 업데이트 내역</span>
                    <Tag color="geekblue" style={{ fontSize: 12 }}>
                        v{CURRENT_VERSION}
                    </Tag>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={560}
            styles={{
                body: {
                    maxHeight: "60vh",
                    overflowY: "auto",
                    paddingTop: 16,
                },
            }}
        >
            {CHANGELOG.length === 0 ? (
                <Empty description="변경 내역이 없습니다" />
            ) : (
                <Timeline
                    items={CHANGELOG.map((entry, index) => ({
                        color: index === 0 ? "blue" : "gray",
                        children: (
                            <VersionEntry
                                entry={entry}
                                is_latest={index === 0}
                            />
                        ),
                    }))}
                />
            )}

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ textAlign: "center" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    업무 시간 관리 v{CURRENT_VERSION} • Made By Kim Tae Seop
                </Text>
            </div>
        </Modal>
    );
}
