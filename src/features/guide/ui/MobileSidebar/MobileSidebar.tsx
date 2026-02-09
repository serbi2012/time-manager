import { useMemo } from "react";
import { Card, Menu, Input, List, Empty, Tag } from "antd";
import { SearchOutlined, FileTextOutlined } from "@ant-design/icons";
import { TABLE_OF_CONTENTS, type SearchResult } from "@/docs";
import { GUIDE_LABELS } from "../../constants";

interface MobileSidebarProps {
    current_section: string;
    search_query: string;
    search_results: SearchResult[];
    on_search: (query: string) => void;
    on_menu_click: (section_id: string) => void;
    on_search_result_click: (section_id: string, query: string) => void;
}

export function MobileSidebar({
    current_section,
    search_query,
    search_results,
    on_search,
    on_menu_click,
    on_search_result_click,
}: MobileSidebarProps) {
    const menu_items = useMemo(
        () =>
            TABLE_OF_CONTENTS.map((item) => ({
                key: item.id,
                label: item.title,
                icon: <FileTextOutlined />,
            })),
        []
    );

    return (
        <Card className="guide-book-mobile-header" size="small">
            <Input
                prefix={<SearchOutlined />}
                placeholder={GUIDE_LABELS.searchPlaceholder}
                value={search_query}
                onChange={(e) => on_search(e.target.value)}
                allowClear
                className="!mb-md"
            />
            {search_query ? (
                search_results.length === 0 ? (
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
                                onClick={() =>
                                    on_search_result_click(
                                        item.id,
                                        search_query
                                    )
                                }
                            >
                                <div className="flex gap-sm items-center w-full">
                                    <Tag color="blue">{item.title}</Tag>
                                    <span className="text-[#999] text-sm flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                        {item.preview}
                                    </span>
                                </div>
                            </List.Item>
                        )}
                    />
                )
            ) : (
                <Menu
                    mode="horizontal"
                    selectedKeys={[current_section]}
                    items={menu_items}
                    onClick={(info) => on_menu_click(info.key)}
                    className="!border-none"
                />
            )}
        </Card>
    );
}
