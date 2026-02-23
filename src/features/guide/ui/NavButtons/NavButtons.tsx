import { DOCS } from "@/docs";
import { GUIDE_LABELS } from "../../constants";

interface NavButtonsProps {
    current_section: string;
    on_navigate: (section_id: string) => void;
}

export function NavButtons({ current_section, on_navigate }: NavButtonsProps) {
    const current_index = DOCS.findIndex((d) => d.id === current_section);
    const prev_doc = current_index > 0 ? DOCS[current_index - 1] : null;
    const next_doc =
        current_index < DOCS.length - 1 ? DOCS[current_index + 1] : null;

    return (
        <div className="guide-nav-buttons">
            {prev_doc && (
                <button
                    className="guide-nav-btn guide-nav-prev"
                    onClick={() => on_navigate(prev_doc.id)}
                >
                    <span className="guide-nav-label">
                        {GUIDE_LABELS.prevLabel}
                    </span>
                    <span className="guide-nav-title">{prev_doc.title}</span>
                </button>
            )}
            {next_doc && (
                <button
                    className="guide-nav-btn guide-nav-next"
                    onClick={() => on_navigate(next_doc.id)}
                >
                    <span className="guide-nav-label">
                        {GUIDE_LABELS.nextLabel}
                    </span>
                    <span className="guide-nav-title">{next_doc.title}</span>
                </button>
            )}
        </div>
    );
}
