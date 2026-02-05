interface WikiLinkProps {
    section: string;
    children: React.ReactNode;
    onNavigate: (sectionId: string) => void;
}

export function WikiLink({ section, children, onNavigate }: WikiLinkProps) {
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
