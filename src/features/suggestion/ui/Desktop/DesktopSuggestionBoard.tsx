import { useState, useEffect } from "react";
import { Layout, Card, Button, Empty, Collapse, Space, Tag, Form } from "antd";
import { MessageOutlined, EditOutlined } from "@ant-design/icons";
import type { SuggestionPost } from "@/types";
import { useAuth } from "@/firebase/useAuth";
import {
    useSuggestionData,
    useSuggestionPostActions,
    usePermissionCheck,
} from "../../hooks";
import { getAuthorId } from "../../lib";
import { SUGGESTION_LABELS } from "../../constants";
import { SuggestionCardHeader, SuggestionCardContent } from "../SuggestionCard";
import { SuggestionWriteModal, SuggestionEditModal } from "../SuggestionModals";

const { Content } = Layout;

export function DesktopSuggestionBoard() {
    const { user } = useAuth();
    const { posts } = useSuggestionData();

    const [is_write_modal_open, setIsWriteModalOpen] = useState(false);
    const [is_edit_modal_open, setIsEditModalOpen] = useState(false);
    const [editing_post, setEditingPost] = useState<SuggestionPost | null>(
        null
    );
    const [is_submitting, setIsSubmitting] = useState(false);

    const [form] = Form.useForm();
    const [edit_form] = Form.useForm();

    const my_author_id = getAuthorId(user);

    const { is_admin, canEditPost, canDeletePost } = usePermissionCheck({
        user_email: user?.email,
        my_author_id,
    });

    const { handleSubmitPost, handleEditPost, handleDeletePost } =
        useSuggestionPostActions({
            author_id: my_author_id,
            on_submit_success: () => {
                setIsWriteModalOpen(false);
            },
        });

    // 작성 모달 열릴 때 닉네임 자동 입력
    useEffect(() => {
        if (is_write_modal_open && user?.displayName) {
            form.setFieldValue("author_name", user.displayName);
        }
    }, [is_write_modal_open, user, form]);

    // 수정 모달 열릴 때 기존 데이터 입력
    useEffect(() => {
        if (is_edit_modal_open && editing_post) {
            edit_form.setFieldsValue({
                title: editing_post.title,
                content: editing_post.content,
            });
        }
    }, [is_edit_modal_open, editing_post, edit_form]);

    // F8 단축키: 모달에서 제출
    useEffect(() => {
        if (!is_write_modal_open && !is_edit_modal_open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F8") {
                e.preventDefault();
                if (is_write_modal_open) {
                    handleSubmitPostWrapper();
                } else if (is_edit_modal_open) {
                    handleEditPostWrapper();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_write_modal_open, is_edit_modal_open]);

    const handleSubmitPostWrapper = async () => {
        setIsSubmitting(true);
        await handleSubmitPost(form);
        setIsSubmitting(false);
    };

    const handleEditPostWrapper = async () => {
        if (!editing_post) return;

        setIsSubmitting(true);
        await handleEditPost(editing_post.id, edit_form, () => {
            setIsEditModalOpen(false);
            setEditingPost(null);
        });
        setIsSubmitting(false);
    };

    const handleDeletePostWrapper = async (post_id: string) => {
        await handleDeletePost(post_id);
    };

    const openEditModal = (post: SuggestionPost) => {
        setEditingPost(post);
        setIsEditModalOpen(true);
    };

    // Collapse 아이템 생성
    const collapse_items = posts.map((post: SuggestionPost) => {
        const can_edit = canEditPost(post);
        const can_delete = canDeletePost(post);

        return {
            key: post.id,
            label: <SuggestionCardHeader post={post} />,
            children: (
                <SuggestionCardContent
                    post={post}
                    can_edit={can_edit}
                    can_delete={can_delete}
                    is_admin={is_admin}
                    author_id={my_author_id}
                    user_display_name={user?.displayName}
                    on_edit={() => openEditModal(post)}
                    on_delete={() => handleDeletePostWrapper(post.id)}
                />
            ),
        };
    });

    return (
        <Layout className="app-body !p-0">
            <Content className="max-w-[800px] mx-auto w-full p-xl">
                <Card
                    title={
                        <Space>
                            <MessageOutlined />
                            <span>{SUGGESTION_LABELS.pageTitle}</span>
                            {is_admin && (
                                <Tag color="purple" className="!ml-sm">
                                    {SUGGESTION_LABELS.adminBadge}
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
                            {SUGGESTION_LABELS.writeButton}
                        </Button>
                    }
                >
                    {posts.length === 0 ? (
                        <Empty
                            description={SUGGESTION_LABELS.emptyDescription}
                            className="!py-[40px]"
                        >
                            <Button
                                type="primary"
                                onClick={() => setIsWriteModalOpen(true)}
                            >
                                {SUGGESTION_LABELS.emptyAction}
                            </Button>
                        </Empty>
                    ) : (
                        <Collapse
                            items={collapse_items}
                            className="suggestion-collapse"
                        />
                    )}
                </Card>

                {/* 작성 모달 */}
                <SuggestionWriteModal
                    open={is_write_modal_open}
                    form={form}
                    is_submitting={is_submitting}
                    on_submit={handleSubmitPostWrapper}
                    on_cancel={() => {
                        setIsWriteModalOpen(false);
                        form.resetFields();
                    }}
                />

                {/* 수정 모달 */}
                <SuggestionEditModal
                    open={is_edit_modal_open}
                    form={edit_form}
                    is_submitting={is_submitting}
                    on_submit={handleEditPostWrapper}
                    on_cancel={() => {
                        setIsEditModalOpen(false);
                        setEditingPost(null);
                        edit_form.resetFields();
                    }}
                />
            </Content>
        </Layout>
    );
}
