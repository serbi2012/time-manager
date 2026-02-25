/**
 * Gantt chart dynamic CSS variables
 *
 * Static styles are in styles/components/gantt.css.
 * This component only injects CSS custom properties that
 * depend on runtime data (grouped_works_count).
 */

import { useMemo } from "react";

interface GanttStylesProps {
    grouped_works_count: number;
}

const GANTT_LEFT_MARGIN = 140;
const GANTT_ROW_HEIGHT = 44;

export function GanttStyles({ grouped_works_count }: GanttStylesProps) {
    const styles = useMemo(
        () => `
            :root {
                --gantt-left-margin: ${GANTT_LEFT_MARGIN}px;
                --gantt-row-height: ${GANTT_ROW_HEIGHT}px;
                --gantt-container-height: ${Math.max(
                    grouped_works_count * GANTT_ROW_HEIGHT + 40,
                    100
                )}px;
                --gantt-bars-height: ${Math.max(
                    grouped_works_count * GANTT_ROW_HEIGHT,
                    60
                )}px;
            }
        `,
        [grouped_works_count]
    );

    return <style>{styles}</style>;
}
