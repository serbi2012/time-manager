import { useEffect, useState, useRef } from "react";
import { GUIDE_LABELS } from "../../constants";

let is_initialized = false;

interface MermaidDiagramProps {
    chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const container_ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");

    useEffect(() => {
        const render = async () => {
            try {
                const { default: mermaid } = await import("mermaid");

                if (!is_initialized) {
                    mermaid.initialize({
                        startOnLoad: false,
                        theme: "default",
                        securityLevel: "loose",
                        fontFamily: "inherit",
                    });
                    is_initialized = true;
                }

                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg: rendered_svg } = await mermaid.render(id, chart);
                setSvg(rendered_svg);
            } catch {
                setSvg(
                    `<pre style="color: red;">${GUIDE_LABELS.mermaidError}</pre>`
                );
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
