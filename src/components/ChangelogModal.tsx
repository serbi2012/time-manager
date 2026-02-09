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
        <div className="mb-xs flex items-start gap-sm">
            <Tag
                color={config.color}
                className="!shrink-0 !text-[11px] !leading-[18px] !px-[6px] !py-0"
            >
                {config.emoji} {config.label}
            </Tag>
            <Text className="text-[13px] leading-5">{item.description}</Text>
        </div>
    );
}

/**
 * 버전 엔트리 렌더링
 */
function VersionEntry({ entry, is_latest }: { entry: ChangelogEntry; is_latest: boolean }) {
    return (
        <div className="mb-xl">
            <div className="flex items-center gap-sm mb-sm">
                <Title level={5} className="!m-0">
                    v{entry.version}
                </Title>
                {is_latest && (
                    <Tag color="blue" className="!text-[11px]">
                        최신
                    </Tag>
                )}
                <Text type="secondary" className="!text-xs">
                    {entry.date}
                </Text>
            </div>
            <Paragraph className="!mb-md !text-[#595959] !font-medium">
                {entry.title}
            </Paragraph>
            <div className="pl-xs">
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
                <div className="flex items-center gap-sm">
                    <span>📋 업데이트 내역</span>
                    <Tag color="geekblue" className="!text-xs">
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

            <Divider className="!my-lg" />

            <div className="text-center">
                <Text type="secondary" className="!text-xs">
                    업무 시간 관리 v{CURRENT_VERSION} • Made By Kim Tae Seop
                </Text>
            </div>
        </Modal>
    );
}
