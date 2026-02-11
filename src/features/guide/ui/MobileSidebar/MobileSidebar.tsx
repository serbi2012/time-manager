/**
 * Mobile guide sidebar — Toss-inspired redesign
 * Search input + horizontal scroll chip menu
 */

import { useMemo, useRef, useEffect } from "react";
import { Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { TABLE_OF_CONTENTS, type SearchResult } from "@/docs";
import { GUIDE_LABELS } from "../../constants";
import { cn } from "@/shared/lib/cn";

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
            })),
        []
    );

    const active_ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (active_ref.current) {
            active_ref.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }, [current_section]);

    return (
        <div className="bg-white">
            {/* Search */}
            <div className="px-xl pt-md pb-md">
                <div className="flex items-center gap-sm bg-gray-50 rounded-xl px-md h-[44px]">
                    <SearchOutlined
                        className="text-gray-400"
                        style={{ fontSize: 16 }}
                    />
                    <input
                        className="flex-1 border-0 bg-transparent text-md text-gray-800 outline-none placeholder:text-gray-400"
                        placeholder={GUIDE_LABELS.searchPlaceholder}
                        value={search_query}
                        onChange={(e) => on_search(e.target.value)}
                    />
                    {search_query && (
                        <button
                            className="border-0 bg-transparent text-gray-400 cursor-pointer text-md p-0"
                            onClick={() => on_search("")}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Search results or menu */}
            {search_query ? (
                search_results.length === 0 ? (
                    <div className="py-lg">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={GUIDE_LABELS.searchNoResults}
                        />
                    </div>
                ) : (
                    <div className="px-xl pb-md space-y-sm">
                        {search_results.map((item) => (
                            <button
                                key={item.id}
                                className="w-full text-left p-md rounded-xl bg-gray-50 border-0 cursor-pointer"
                                onClick={() =>
                                    on_search_result_click(
                                        item.id,
                                        search_query
                                    )
                                }
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                }}
                            >
                                <div className="text-md font-medium text-primary">
                                    {item.title}
                                </div>
                                <div className="text-sm text-gray-400 mt-xs truncate">
                                    {item.preview}
                                </div>
                            </button>
                        ))}
                    </div>
                )
            ) : (
                <div className="overflow-x-auto scrollbar-none pb-md">
                    <div className="flex gap-sm px-xl">
                        {menu_items.map((item) => {
                            const is_active = current_section === item.key;
                            return (
                                <button
                                    key={item.key}
                                    ref={is_active ? active_ref : undefined}
                                    className={cn(
                                        "shrink-0 h-[36px] px-lg rounded-full border-0 text-sm font-medium cursor-pointer whitespace-nowrap transition-colors",
                                        is_active
                                            ? "bg-primary text-white"
                                            : "bg-gray-100 text-gray-600"
                                    )}
                                    onClick={() => on_menu_click(item.key)}
                                    style={{
                                        WebkitTapHighlightColor: "transparent",
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
