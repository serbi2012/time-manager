import { useMemo } from "react";
import { Menu, Typography, Input, List, Empty, Tag } from "antd";
import {
    BookOutlined,
    SearchOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import { TABLE_OF_CONTENTS, type SearchResult } from "@/docs";
import { GUIDE_LABELS } from "../../constants";

const { Title } = Typography;

interface GuideSidebarProps {
    current_section: string;
    search_query: string;
    search_results: SearchResult[];
    on_search: (query: string) => void;
    on_menu_click: (section_id: string) => void;
    on_search_result_click: (section_id: string, query: string) => void;
}

export function GuideSidebar({
    current_section,
    search_query,
    search_results,
    on_search,
    on_menu_click,
    on_search_result_click,
}: GuideSidebarProps) {
    const menu_items = useMemo(
        () =>
            TABLE_OF_CONTENTS.map((item) => ({
                key: item.id,
                label: item.title,
                icon: <FileTextOutlined />,
            })),
        []
    );

    const highlightText = (text: string, query: string) => {
        if (!query.trim()) return text;
        const regex = new RegExp(
            `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi"
        );
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="guide-search-highlight">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div className="guide-book-sider-inner">
            <div className="guide-book-toc-header">
                <BookOutlined />
                <Title level={5} style={{ margin: 0 }}>
                    {GUIDE_LABELS.pageTitle}
                </Title>
            </div>

            <div className="guide-book-search">
                <Input
                    prefix={<SearchOutlined />}
                    placeholder={GUIDE_LABELS.searchPlaceholder}
                    value={search_query}
                    onChange={(e) => on_search(e.target.value)}
                    allowClear
                />
            </div>

            <div className="guide-book-toc-content">
                {search_query ? (
                    <div className="guide-search-results">
                        {search_results.length === 0 ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={GUIDE_LABELS.searchNoResults}
                            />
                        ) : (
                            <List
                                size="small"
                                dataSource={search_results}
                                renderItem={(item) => (
                                    <List.Item
                                        className="guide-search-result-item"
                                        onClick={() =>
                                            on_search_result_click(
                                                item.id,
                                                search_query
                                            )
                                        }
                                    >
                                        <div className="guide-search-result-content">
                                            <div className="guide-search-result-title">
                                                <Tag
                                                    color="blue"
                                                    style={{ marginRight: 8 }}
                                                >
                                                    {item.title}
                                                </Tag>
                                            </div>
                                            <div
                                                className="guide-search-result-preview"
                                                style={{
                                                    color: "#999",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {highlightText(
                                                    item.preview,
                                                    search_query
                                                )}
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>
                ) : (
                    <Menu
                        mode="inline"
                        selectedKeys={[current_section]}
                        items={menu_items}
                        onClick={(info) => on_menu_click(info.key)}
                        style={{ border: "none" }}
                    />
                )}
            </div>
        </div>
    );
}
