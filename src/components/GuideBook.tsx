import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    isValidElement,
    cloneElement,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Typography, Card, Input, List, Empty, Tag } from "antd";
import {
    BookOutlined,
    SearchOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import {
    TABLE_OF_CONTENTS,
    DOCS,
    searchDocs,
    type SearchResult,
} from "../docs";
import { useResponsive } from "../hooks/useResponsive";
import { DemoRenderer } from "./guide/DemoComponents";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "inherit",
});

interface WikiLinkProps {
    section: string;
    children: React.ReactNode;
    onNavigate: (sectionId: string) => void;
}

function WikiLink({ section, children, onNavigate }: WikiLinkProps) {
    return (
        <a
            className="guide-wiki-link"
            onClick={(e) => {
                e.preventDefault();
                onNavigate(section);
            }}
        >
            {children}
        </a>
    );
}

function MermaidDiagram({ chart }: { chart: string }) {
    const container_ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");

    useEffect(() => {
        const render = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg: rendered_svg } = await mermaid.render(id, chart);
                setSvg(rendered_svg);
            } catch {
                setSvg(`<pre style="color: red;">Mermaid 렌더링 오류</pre>`);
            }
        };
        render();
    }, [chart]);

    return (
        <div
            ref={container_ref}
            className="guide-mermaid"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

function GuideBook() {
    const { is_mobile } = useResponsive();
    const location = useLocation();
    const navigate = useNavigate();

    const [current_section, setCurrentSection] =
        useState<string>("getting-started");
    const [search_query, setSearchQuery] = useState<string>("");
    const [search_results, setSearchResults] = useState<SearchResult[]>([]);
    const [highlight_keyword, setHighlightKeyword] = useState<string>("");

    useEffect(() => {
        const hash = location.hash.replace("#", "");
        if (hash && DOCS.some((d) => d.id === hash)) {
            setCurrentSection(hash);
        }
    }, [location.hash]);

    useEffect(() => {
        if (!highlight_keyword) return;

        const scroll_timer = setTimeout(() => {
            const first_highlight = document.querySelector(
                ".guide-content-highlight"
            );
            if (first_highlight) {
                first_highlight.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }, 150);

        const clear_timer = setTimeout(() => {
            setHighlightKeyword("");
        }, 4000);

        return () => {
            clearTimeout(scroll_timer);
            clearTimeout(clear_timer);
        };
    }, [highlight_keyword, current_section]);

    const content_ref = useRef<HTMLDivElement>(null);

    const navigateToSection = useCallback(
        (section_id: string, keyword?: string) => {
            setCurrentSection(section_id);
            setSearchQuery("");
            setSearchResults([]);
            navigate(`/guide#${section_id}`, { replace: true });

            if (keyword) {
                setHighlightKeyword(keyword);
            } else {
                setHighlightKeyword("");
                if (content_ref.current) {
                    content_ref.current.scrollTop = 0;
                }
                window.scrollTo(0, 0);
            }
        },
        [navigate]
    );

    const handleMenuClick = useCallback(
        (info: { key: string }) => {
            navigateToSection(info.key);
        },
        [navigateToSection]
    );

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const results = searchDocs(query);
        setSearchResults(results);
    }, []);

    const current_doc = useMemo(() => {
        return DOCS.find((d) => d.id === current_section) || DOCS[0];
    }, [current_section]);

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
                                // wiki: prefix handling
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
                                // External or other links
                                return (
                                    <a
                                        href={href}
                                        onClick={(e) => {
                                            // Prevent navigation for relative/invalid URLs
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
        <Layout className="guide-book-layout">
            {!is_mobile && (
                <Sider width={280} className="guide-book-sider" theme="light">
                    <div className="guide-book-sider-inner">
                        <div className="guide-book-toc-header">
                            <BookOutlined />
                            <Title level={5} style={{ margin: 0 }}>
                                사용 설명서
                            </Title>
                        </div>

                        <div className="guide-book-search">
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder="문서 검색..."
                                value={search_query}
                                onChange={(e) => handleSearch(e.target.value)}
                                allowClear
                            />
                        </div>

                        <div className="guide-book-toc-content">
                            {search_query ? (
                                <div className="guide-search-results">
                                    {search_results.length === 0 ? (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="검색 결과가 없습니다"
                                        />
                                    ) : (
                                        <List
                                            size="small"
                                            dataSource={search_results}
                                            renderItem={(item) => (
                                                <List.Item
                                                    className="guide-search-result-item"
                                                    onClick={() =>
                                                        navigateToSection(
                                                            item.id,
                                                            search_query
                                                        )
                                                    }
                                                >
                                                    <div className="guide-search-result-content">
                                                        <div className="guide-search-result-title">
                                                            <Tag
                                                                color="blue"
                                                                style={{
                                                                    marginRight: 8,
                                                                }}
                                                            >
                                                                {item.title}
                                                            </Tag>
                                                        </div>
                                                        <Text
                                                            type="secondary"
                                                            className="guide-search-result-preview"
                                                        >
                                                            {highlightText(
                                                                item.preview,
                                                                search_query
                                                            )}
                                                        </Text>
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
                                    onClick={handleMenuClick}
                                    style={{ border: "none" }}
                                />
                            )}
                        </div>
                    </div>
                </Sider>
            )}

            <Content className="guide-book-content" ref={content_ref}>
                {is_mobile && (
                    <Card className="guide-book-mobile-header" size="small">
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="문서 검색..."
                            value={search_query}
                            onChange={(e) => handleSearch(e.target.value)}
                            allowClear
                            style={{ marginBottom: 12 }}
                        />
                        {search_query ? (
                            search_results.length === 0 ? (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="검색 결과가 없습니다"
                                />
                            ) : (
                                <List
                                    size="small"
                                    dataSource={search_results}
                                    renderItem={(item) => (
                                        <List.Item
                                            onClick={() =>
                                                navigateToSection(
                                                    item.id,
                                                    search_query
                                                )
                                            }
                                        >
                                            <Tag color="blue">{item.title}</Tag>
                                            <Text type="secondary" ellipsis>
                                                {item.preview}
                                            </Text>
                                        </List.Item>
                                    )}
                                />
                            )
                        ) : (
                            <Menu
                                mode="horizontal"
                                selectedKeys={[current_section]}
                                items={menu_items}
                                onClick={handleMenuClick}
                                style={{ border: "none" }}
                            />
                        )}
                    </Card>
                )}

                <div className="guide-book-docs">
                    <Card className="guide-book-card">
                        {renderContent(current_doc.content)}
                    </Card>

                    <div className="guide-nav-buttons">
                        {(() => {
                            const current_index = DOCS.findIndex(
                                (d) => d.id === current_section
                            );
                            const prev_doc =
                                current_index > 0
                                    ? DOCS[current_index - 1]
                                    : null;
                            const next_doc =
                                current_index < DOCS.length - 1
                                    ? DOCS[current_index + 1]
                                    : null;
                            return (
                                <>
                                    {prev_doc && (
                                        <button
                                            className="guide-nav-btn guide-nav-prev"
                                            onClick={() =>
                                                navigateToSection(prev_doc.id)
                                            }
                                        >
                                            <span className="guide-nav-label">
                                                이전
                                            </span>
                                            <span className="guide-nav-title">
                                                {prev_doc.title}
                                            </span>
                                        </button>
                                    )}
                                    {next_doc && (
                                        <button
                                            className="guide-nav-btn guide-nav-next"
                                            onClick={() =>
                                                navigateToSection(next_doc.id)
                                            }
                                        >
                                            <span className="guide-nav-label">
                                                다음
                                            </span>
                                            <span className="guide-nav-title">
                                                {next_doc.title}
                                            </span>
                                        </button>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </Content>
        </Layout>
    );
}

export default GuideBook;
