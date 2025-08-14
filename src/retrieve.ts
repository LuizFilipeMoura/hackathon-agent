// retrieve.ts
import { searchTopK } from "./ragdb";

export async function retrieveSimilarContext(query: string, k = 5): Promise<string> {
    const hits = await searchTopK(query, k);
    if (!hits.length) return "";
    return [
        "## Retrieved similar items (local RAG)",
        ...hits.map((h, i) =>
            `### #${i + 1} — id=${h.id} (sim=${h.similarity.toFixed(3)})` +
            (h.url ? ` — ${h.url}` : "") + `\n` +
            h.text.slice(0, 1200)
        )
    ].join("\n\n---\n\n");
}
