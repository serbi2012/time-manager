import { useState, useEffect } from "react";
import {
    Layout,
    Card,
    Button,
    Input,
    Modal,
    Form,
    List,
    Typography,
    Space,
    Collapse,
    message,
    Empty,
    Divider,
    Tag,
    Select,
    Popconfirm,
} from "antd";
import {
    EditOutlined,
    MessageOutlined,
    UserOutlined,
    ClockCircleOutlined,
    SendOutlined,
    CheckCircleOutlined,
    SettingOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { useAuth } from "../firebase/useAuth";
import {
    subscribeToSuggestions,
    addSuggestion,
    addReply,
    updateSuggestionStatus,
    updateSuggestion,
    deleteSuggestion,
} from "../firebase/suggestionService";
import type { SuggestionPost, SuggestionReply, SuggestionStatus } from "../types";
import { useResponsive } from "../hooks/useResponsive";
import type { User } from "firebase/auth";

dayjs.extend(relativeTime);
dayjs.locale("ko");

const { Content } = Layout;
const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const ADMIN_EMAIL = "rlaxo0306@gmail.com";
const GUEST_ID_KEY = "suggestion_guest_id";

const STATUS_CONFIG: Record<SuggestionStatus, { label: string; color: string }> = {
    pending: { label: "대기중", color: "default" },
    reviewing: { label: "검토중", color: "blue" },
    in_progress: { label: "진행중", color: "orange" },
    completed: { label: "완료", color: "green" },
    rejected: { label: "반려", color: "red" },
};

function getAuthorId(user: User | null): string {
    if (user) return user.uid;

    let guest_id = localStorage.getItem(GUEST_ID_KEY);
    if (!guest_id) {
        guest_id = crypto.randomUUID();
        localStorage.setItem(GUEST_ID_KEY, guest_id);
    }
    return guest_id;
}

function formatRelativeTime(date_string: string): string {
    return dayjs(date_string).fromNow();
}

interface ReplyFormProps {
    post_id: string;
    default_author?: string;
}

function ReplyForm({ post_id, default_author = "" }: ReplyFormProps) {
    const [author_name, setAuthorName] = useState(default_author);
    const [content, setContent] = useState("");
    const [is_submitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!author_name.trim()) {
            message.warning("닉네임을 입력해주세요");
            return;
        }
        if (!content.trim()) {
            message.warning("답글 내용을 입력해주세요");
            return;
        }

        setIsSubmitting(true);
        try {
            const reply: SuggestionReply = {
                id: crypto.randomUUID(),
                author_name: author_name.trim(),
                content: content.trim(),
                created_at: new Date().toISOString(),
            };
            await addReply(post_id, reply);
            setContent("");
            message.success("답글이 등록되었습니다");
        } catch {
            message.error("답글 등록에 실패했습니다");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="suggestion-reply-form">
            <Space.Compact style={{ width: "100%" }}>
                <Input
                    placeholder="닉네임"
                    prefix={<UserOutlined />}
                    value={author_name}
                    onChange={(e) => setAuthorName(e.target.value)}
                    style={{ width: 120 }}
                />
                <Input
                    placeholder="답글을 입력하세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPressEnter={handleSubmit}
                    style={{ flex: 1 }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={is_submitting}
                />
            </Space.Compact>
        </div>
    );
}

interface AdminControlsProps {
    post: SuggestionPost;
}

function AdminControls({ post }: AdminControlsProps) {
    const [status, setStatus] = useState<SuggestionStatus>(post.status);
    const [resolved_version, setResolvedVersion] = useState(post.resolved_version || "");
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
            message.success("상태가 업데이트되었습니다");
        } catch {
            message.error("상태 업데이트에 실패했습니다");
        } finally {
            setIsSaving(false);
        }
    };

    const has_changes =
        status !== post.status ||
        (status === "completed" && resolved_version !== (post.resolved_version || ""));

    return (
        <div className="suggestion-admin-controls">
            <Divider style={{ margin: "16px 0 12px" }}>
                <Space size="small">
                    <SettingOutlined />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        관리자 설정
                    </Text>
                </Space>
            </Divider>
            <Space wrap style={{ width: "100%" }}>
                <Select
                    value={status}
                    onChange={setStatus}
                    style={{ width: 120 }}
                    options={Object.entries(STATUS_CONFIG).map(([value, config]) => ({
                        value,
                        label: config.label,
                    }))}
                />
                {status === "completed" && (
                    <Input
                        placeholder="해결 버전 (예: v1.5.0)"
                        value={resolved_version}
                        onChange={(e) => setResolvedVersion(e.target.value)}
                        style={{ width: 160 }}
                    />
                )}
                <Button
                    type="primary"
                    size="small"
                    onClick={handleSave}
                    loading={is_saving}
                    disabled={!has_changes}
                >
                    저장
                </Button>
            </Space>
        </div>
    );
}

export default function SuggestionBoard() {
    const { user } = useAuth();
    const { is_mobile } = useResponsive();
    const [posts, setPosts] = useState<SuggestionPost[]>([]);
    const [is_write_modal_open, setIsWriteModalOpen] = useState(false);
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [editing_post, setEditingPost] = useState<SuggestionPost | null>(null);
    const [is_submitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [edit_form] = Form.useForm();

    const is_admin = user?.email === ADMIN_EMAIL;
    const my_author_id = getAuthorId(user);

    useEffect(() => {
        const unsubscribe = subscribeToSuggestions(setPosts);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (is_write_modal_open && user?.displayName) {
            form.setFieldValue("author_name", user.displayName);
        }
    }, [is_write_modal_open, user, form]);

    useEffect(() => {
        if (is_edit_modal_open && editing_post) {
            edit_form.setFieldsValue({
                title: editing_post.title,
                content: editing_post.content,
            });
        }
    }, [is_edit_modal_open, editing_post, edit_form]);

    useEffect(() => {
        if (!is_write_modal_open && !is_edit_modal_open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F8") {
                e.preventDefault();
                if (is_write_modal_open) {
                    handleSubmitPost();
                } else if (is_edit_modal_open) {
                    handleEditPost();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [is_write_modal_open, is_edit_modal_open]);

    const canEditPost = (post: SuggestionPost) => {
        return is_admin || (post.author_id && post.author_id === my_author_id);
    };

    const canDeletePost = (post: SuggestionPost) => {
        return is_admin || (post.author_id && post.author_id === my_author_id);
    };

    const handleSubmitPost = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            const new_post: SuggestionPost = {
                id: crypto.randomUUID(),
                author_id: my_author_id,
                author_name: values.author_name.trim(),
                title: values.title.trim(),
                content: values.content.trim(),
                created_at: new Date().toISOString(),
                replies: [],
                status: "pending",
            };

            await addSuggestion(new_post);
            message.success("건의사항이 등록되었습니다");
            form.resetFields();
            setIsWriteModalOpen(false);
        } catch {
            message.error("등록에 실패했습니다");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditPost = async () => {
        if (!editing_post) return;

        try {
            const values = await edit_form.validateFields();
            setIsSubmitting(true);

            await updateSuggestion(
                editing_post.id,
                values.title.trim(),
                values.content.trim()
            );
            message.success("게시글이 수정되었습니다");
            edit_form.resetFields();
            setIsEditModalOpen(false);
            setEditingPost(null);
        } catch {
            message.error("수정에 실패했습니다");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async (post_id: string) => {
        try {
            await deleteSuggestion(post_id);
            message.success("게시글이 삭제되었습니다");
        } catch {
            message.error("삭제에 실패했습니다");
        }
    };

    const openEditModal = (post: SuggestionPost) => {
        setEditingPost(post);
        setIsEditModalOpen(true);
    };

    const collapse_items = posts.map((post) => {
        const can_edit = canEditPost(post);
        const can_delete = canDeletePost(post);

        return {
            key: post.id,
            label: (
                <div className="suggestion-item-header">
                    <div className="suggestion-item-title">
                        <Space wrap>
                            <Text strong>{post.title}</Text>
                            <Tag color={STATUS_CONFIG[post.status].color}>
                                {STATUS_CONFIG[post.status].label}
                            </Tag>
                            {post.status === "completed" && post.resolved_version && (
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                    {post.resolved_version}
                                </Tag>
                            )}
                        </Space>
                    </div>
                    <div className="suggestion-item-meta">
                        <Space size="small" split={<Divider type="vertical" />}>
                            <span>
                                <UserOutlined /> {post.author_name}
                            </span>
                            <span>
                                <ClockCircleOutlined />{" "}
                                {formatRelativeTime(post.created_at)}
                            </span>
                            <span>
                                <MessageOutlined /> {post.replies.length}
                            </span>
                        </Space>
                    </div>
                </div>
            ),
            children: (
                <div className="suggestion-item-content">
                    {(can_edit || can_delete) && (
                        <div style={{ marginBottom: 12, textAlign: "right" }}>
                            <Space>
                                {can_edit && (
                                    <Button
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => openEditModal(post)}
                                    >
                                        수정
                                    </Button>
                                )}
                                {can_delete && (
                                    <Popconfirm
                                        title="게시글 삭제"
                                        description="정말 이 게시글을 삭제하시겠습니까?"
                                        onConfirm={() => handleDeletePost(post.id)}
                                        okText="삭제"
                                        cancelText="취소"
                                        okButtonProps={{ danger: true, autoFocus: true }}
                                    >
                                        <Button
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                        >
                                            삭제
                                        </Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </div>
                    )}

                    <Paragraph
                        style={{
                            whiteSpace: "pre-wrap",
                            marginBottom: 16,
                            padding: "12px 16px",
                            background: "#fafafa",
                            borderRadius: 8,
                        }}
                    >
                        {post.content}
                    </Paragraph>

                    {post.status === "completed" && post.resolved_version && (
                        <div
                            style={{
                                padding: "8px 12px",
                                background: "#f6ffed",
                                border: "1px solid #b7eb8f",
                                borderRadius: 6,
                                marginBottom: 16,
                            }}
                        >
                            <Space>
                                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                                <Text style={{ color: "#52c41a" }}>
                                    {post.resolved_version}에서 해결됨
                                </Text>
                            </Space>
                        </div>
                    )}

                    {post.replies.length > 0 && (
                        <div className="suggestion-replies">
                            <Text
                                type="secondary"
                                style={{ fontSize: 13, marginBottom: 8, display: "block" }}
                            >
                                답글 {post.replies.length}개
                            </Text>
                            <List
                                dataSource={post.replies}
                                renderItem={(reply) => (
                                    <div className="suggestion-reply-item">
                                        <div className="suggestion-reply-content">
                                            <Text>{reply.content}</Text>
                                        </div>
                                        <div className="suggestion-reply-meta">
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {reply.author_name} ·{" "}
                                                {formatRelativeTime(reply.created_at)}
                                            </Text>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    )}

                    <Divider style={{ margin: "16px 0" }} />
                    <ReplyForm
                        post_id={post.id}
                        default_author={user?.displayName || ""}
                    />

                    {is_admin && <AdminControls post={post} />}
                </div>
            ),
        };
    });

    return (
        <Layout className="app-body" style={{ padding: 0 }}>
            <Content
                style={{
                    padding: is_mobile ? 12 : 24,
                    maxWidth: 800,
                    margin: "0 auto",
                    width: "100%",
                }}
            >
                <Card
                    title={
                        <Space>
                            <MessageOutlined />
                            <span>건의사항</span>
                            {is_admin && (
                                <Tag color="purple" style={{ marginLeft: 8 }}>
                                    관리자
                                </Tag>
                            )}
                        </Space>
                    }
                    extra={
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setIsWriteModalOpen(true)}
                        >
                            {is_mobile ? "" : "글쓰기"}
                        </Button>
                    }
                >
                    {posts.length === 0 ? (
                        <Empty
                            description="아직 건의사항이 없습니다"
                            style={{ padding: "40px 0" }}
                        >
                            <Button
                                type="primary"
                                onClick={() => setIsWriteModalOpen(true)}
                            >
                                첫 건의사항 작성하기
                            </Button>
                        </Empty>
                    ) : (
                        <Collapse
                            items={collapse_items}
                            accordion
                            className="suggestion-collapse"
                        />
                    )}
                </Card>

                {/* 글쓰기 모달 */}
                <Modal
                    title="건의사항 작성"
                    open={is_write_modal_open}
                    onOk={handleSubmitPost}
                    onCancel={() => {
                        setIsWriteModalOpen(false);
                        form.resetFields();
                    }}
                    okText="등록 (F8)"
                    cancelText="취소"
                    confirmLoading={is_submitting}
                    destroyOnClose
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Form.Item
                            name="author_name"
                            label="닉네임"
                            rules={[{ required: true, message: "닉네임을 입력해주세요" }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="닉네임을 입력하세요"
                                maxLength={20}
                            />
                        </Form.Item>
                        <Form.Item
                            name="title"
                            label="제목"
                            rules={[{ required: true, message: "제목을 입력해주세요" }]}
                        >
                            <Input placeholder="제목을 입력하세요" maxLength={100} />
                        </Form.Item>
                        <Form.Item
                            name="content"
                            label="내용"
                            rules={[{ required: true, message: "내용을 입력해주세요" }]}
                        >
                            <TextArea
                                placeholder="건의사항 내용을 입력하세요"
                                rows={6}
                                maxLength={2000}
                                showCount
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 수정 모달 */}
                <Modal
                    title="게시글 수정"
                    open={is_edit_modal_open}
                    onOk={handleEditPost}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setEditingPost(null);
                        edit_form.resetFields();
                    }}
                    okText="수정 (F8)"
                    cancelText="취소"
                    confirmLoading={is_submitting}
                    destroyOnClose
                >
                    <Form form={edit_form} layout="vertical" style={{ marginTop: 16 }}>
                        <Form.Item
                            name="title"
                            label="제목"
                            rules={[{ required: true, message: "제목을 입력해주세요" }]}
                        >
                            <Input placeholder="제목을 입력하세요" maxLength={100} />
                        </Form.Item>
                        <Form.Item
                            name="content"
                            label="내용"
                            rules={[{ required: true, message: "내용을 입력해주세요" }]}
                        >
                            <TextArea
                                placeholder="건의사항 내용을 입력하세요"
                                rows={6}
                                maxLength={2000}
                                showCount
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
}
