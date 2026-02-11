/**
 * Mobile guide book — Toss-inspired redesign
 * Page title + search/menu sidebar + markdown content
 */

import { useMemo, useCallback, isValidElement, cloneElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "antd";
import { DOCS } from "@/docs";
import { DemoRenderer } from "@/components/guide/DemoComponents";
import { useGuideNavigation, useGuideSearch } from "../../hooks";
import { MobileSidebar } from "../MobileSidebar";
import { NavButtons } from "../NavButtons";
import { MermaidDiagram } from "../MermaidDiagram";
import { WikiLink } from "../WikiLink";
import { GUIDE_LABELS } from "../../constants";

const { Title } = Typography;

export function MobileGuideBook() {
    const {
        current_section,
        highlight_keyword,
        content_ref,
        navigateToSection,
    } = useGuideNavigation();
    const { search_query, search_results, handleSearch, clearSearch } =
        useGuideSearch();

    const current_doc = useMemo(() => {
        return DOCS.find((d) => d.id === current_section) || DOCS[0];
    }, [current_section]);

    const handleMenuClick = useCallback(
        (section_id: string) => {
            navigateToSection(section_id);
            clearSearch();
        },
        [navigateToSection, clearSearch]
    );

    const handleSearchResultClick = useCallback(
        (section_id: string, query: string) => {
            navigateToSection(section_id, query);
            clearSearch();
        },
        [navigateToSection, clearSearch]
    );

    const highlightKeywordInContent = useCallback(
        (children: React.ReactNode): React.ReactNode => {
            if (!highlight_keyword) return children;

            const escape_regex = (str: string) =>
                str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(
                `(${escape_regex(highlight_keyword)})`,
                "gi"
            );

            const process_node = (
                node: React.ReactNode,
                key_prefix: string
            ): React.ReactNode => {
                if (typeof node === "string") {
                    if (!regex.test(node)) return node;
                    regex.lastIndex = 0;
                    const parts = node.split(regex);
                    return parts.map((part, i) => {
                        regex.lastIndex = 0;
                        return regex.test(part) ? (
                            <mark
                                key={`${key_prefix}-${i}`}
                                className="guide-content-highlight"
                            >
                                {part}
                            </mark>
                        ) : (
                            part
                        );
                    });
                }

                if (Array.isArray(node)) {
                    return node.map((child, i) =>
                        process_node(child, `${key_prefix}-${i}`)
                    );
                }

                if (isValidElement<{ children?: React.ReactNode }>(node)) {
                    const element_children = node.props.children;
                    if (element_children) {
                        return cloneElement(node, {
                            children: process_node(
                                element_children,
                                `${key_prefix}-c`
                            ),
                        });
                    }
                }

                return node;
            };

            return process_node(children, "hl");
        },
        [highlight_keyword]
    );

    const renderContent = useCallback(
        (content: string) => {
            const parts = content.split(/(:::demo\s+\w+:::)/g);

            return parts.map((part, index) => {
                const demo_match = part.match(/:::demo\s+(\w+):::/);
                if (demo_match) {
                    return (
                        <DemoRenderer
                            key={index}
                            componentName={demo_match[1]}
                        />
                    );
                }

                return (
                    <ReactMarkdown
                        key={index}
                        remarkPlugins={[remarkGfm]}
                        urlTransform={(url) => url}
                        components={{
                            h1: ({ children }) => (
                                <Title level={2} className="guide-h1">
                                    {highlightKeywordInContent(children)}
                                </Title>
                            ),
                            h2: ({ children }) => (
                                <Title level={3} className="guide-h2">
                                    {highlightKeywordInContent(children)}
                                </Title>
                            ),
                            h3: ({ children }) => (
                                <Title level={4} className="guide-h3">
                                    {highlightKeywordInContent(children)}
                                </Title>
                            ),
                            h4: ({ children }) => (
                                <Title level={5} className="guide-h4">
                                    {highlightKeywordInContent(children)}
                                </Title>
                            ),
                            table: ({ children }) => (
                                <div className="guide-table-wrapper">
                                    <table className="guide-table">
                                        {children}
                                    </table>
                                </div>
                            ),
                            code: ({ className, children }) => {
                                const code_string = String(children).replace(
                                    /\n$/,
                                    ""
                                );

                                if (className === "language-mermaid") {
                                    return (
                                        <MermaidDiagram chart={code_string} />
                                    );
                                }

                                const is_inline =
                                    !className && !code_string.includes("\n");
                                return is_inline ? (
                                    <code className="guide-inline-code">
                                        {children}
                                    </code>
                                ) : (
                                    <pre className="guide-code-block">
                                        <code className={className}>
                                            {children}
                                        </code>
                                    </pre>
                                );
                            },
                            blockquote: ({ children }) => (
                                <blockquote className="guide-blockquote">
                                    {children}
                                </blockquote>
                            ),
                            hr: () => <hr className="guide-hr" />,
                            ul: ({ children }) => (
                                <ul className="guide-list">{children}</ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="guide-list guide-list-ordered">
                                    {children}
                                </ol>
                            ),
                            li: ({ children }) => (
                                <li className="guide-list-item">
                                    {highlightKeywordInContent(children)}
                                </li>
                            ),
                            strong: ({ children }) => (
                                <strong className="guide-strong">
                                    {highlightKeywordInContent(children)}
                                </strong>
                            ),
                            a: ({ href, children }) => {
                                if (href && href.startsWith("wiki:")) {
                                    const section_id = href.replace(
                                        "wiki:",
                                        ""
                                    );
                                    return (
                                        <WikiLink
                                            section={section_id}
                                            onNavigate={navigateToSection}
                                        >
                                            {children}
                                        </WikiLink>
                                    );
                                }
                                return (
                                    <a
                                        href={href}
                                        onClick={(e) => {
                                            if (
                                                !href ||
                                                (!href.startsWith("http") &&
                                                    !href.startsWith("/"))
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                        target={
                                            href?.startsWith("http")
                                                ? "_blank"
                                                : undefined
                                        }
                                        rel={
                                            href?.startsWith("http")
                                                ? "noopener noreferrer"
                                                : undefined
                                        }
                                    >
                                        {children}
                                    </a>
                                );
                            },
                            p: ({ children }) => (
                                <p className="guide-paragraph">
                                    {highlightKeywordInContent(children)}
                                </p>
                            ),
                        }}
                    >
                        {part}
                    </ReactMarkdown>
                );
            });
        },
        [navigateToSection, highlightKeywordInContent]
    );

    return (
        <div className="flex flex-col min-h-screen bg-white" ref={content_ref}>
            {/* Sticky header */}
            <div className="sticky top-0 z-30 bg-white">
                {/* Page title */}
                <div className="px-xl pt-xl pb-md">
                    <div className="text-2xl font-bold text-gray-900">
                        {GUIDE_LABELS.pageTitle}
                    </div>
                </div>

                <div className="mx-xl border-b border-gray-100" />

                {/* Search + Menu */}
                <MobileSidebar
                    current_section={current_section}
                    search_query={search_query}
                    search_results={search_results}
                    on_search={handleSearch}
                    on_menu_click={handleMenuClick}
                    on_search_result_click={handleSearchResultClick}
                />
            </div>

            {/* Content */}
            <div className="flex-1 px-xl pt-md pb-[90px]">
                <div className="guide-book-docs">
                    <div className="guide-book-card-content">
                        {renderContent(current_doc.content)}
                    </div>

                    <NavButtons
                        current_section={current_section}
                        on_navigate={navigateToSection}
                    />
                </div>
            </div>
        </div>
    );
}
