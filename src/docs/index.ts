import gettingStarted from "./getting-started.md?raw";
import dailyRecord from "./daily-record.md?raw";
import workPreset from "./work-preset.md?raw";
import weeklySchedule from "./weekly-schedule.md?raw";
import settings from "./settings.md?raw";
import shortcuts from "./shortcuts.md?raw";

export interface TOCItem {
    id: string;
    title: string;
}

export interface DocSection {
    id: string;
    title: string;
    content: string;
}

export interface SearchResult {
    id: string;
    title: string;
    preview: string;
    matches: number;
}

export const TABLE_OF_CONTENTS: TOCItem[] = [
    { id: "getting-started", title: "시작하기" },
    { id: "daily-record", title: "일간 기록" },
    { id: "work-preset", title: "작업 프리셋" },
    { id: "weekly-schedule", title: "주간 일정" },
    { id: "settings", title: "설정" },
    { id: "shortcuts", title: "단축키 목록" },
];

export const DOCS: DocSection[] = [
    {
        id: "getting-started",
        title: "시작하기",
        content: gettingStarted,
    },
    {
        id: "daily-record",
        title: "일간 기록",
        content: dailyRecord,
    },
    {
        id: "work-preset",
        title: "작업 프리셋",
        content: workPreset,
    },
    {
        id: "weekly-schedule",
        title: "주간 일정",
        content: weeklySchedule,
    },
    {
        id: "settings",
        title: "설정",
        content: settings,
    },
    {
        id: "shortcuts",
        title: "단축키 목록",
        content: shortcuts,
    },
];

export function searchDocs(query: string): SearchResult[] {
    if (!query.trim()) return [];

    const normalized_query = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    for (const doc of DOCS) {
        const content_lower = doc.content.toLowerCase();
        const title_lower = doc.title.toLowerCase();

        let matches = 0;
        let index = 0;
        while (
            (index = content_lower.indexOf(normalized_query, index)) !== -1
        ) {
            matches++;
            index += normalized_query.length;
        }

        if (title_lower.includes(normalized_query)) {
            matches += 10;
        }

        if (matches > 0) {
            const preview = extractPreview(doc.content, query);
            results.push({
                id: doc.id,
                title: doc.title,
                preview,
                matches,
            });
        }
    }

    results.sort((a, b) => b.matches - a.matches);

    return results;
}

function extractPreview(content: string, query: string): string {
    const plain_text = content
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/:::demo\s+\w+:::/g, "")
        .replace(/```mermaid[\s\S]*?```/g, "")
        .replace(/[|\\-]+/g, " ")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const lower_text = plain_text.toLowerCase();
    const lower_query = query.toLowerCase();
    const index = lower_text.indexOf(lower_query);

    if (index === -1) {
        return plain_text.slice(0, 100) + "...";
    }

    const start = Math.max(0, index - 40);
    const end = Math.min(plain_text.length, index + query.length + 60);

    let preview = plain_text.slice(start, end);
    if (start > 0) preview = "..." + preview;
    if (end < plain_text.length) preview = preview + "...";

    return preview;
}

export function getDocById(id: string): DocSection | undefined {
    return DOCS.find((doc) => doc.id === id);
}

export function getDocTitle(id: string): string {
    const doc = DOCS.find((d) => d.id === id);
    return doc?.title || id;
}
