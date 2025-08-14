import { Octokit } from "@octokit/rest";
import { upsertItems } from "./ragdb";
import 'dotenv/config'
async function* paginateIssues(octokit: Octokit, owner: string, repo: string) {
    let page = 1;
    while (true) {
        const { data } = await octokit.issues.listForRepo({
            owner, repo, state: "all", sort: "updated", direction: "desc",
            per_page: 100, page
        });
        if (!data.length) break;
        yield* data;
        page++;
    }
}

async function main() {
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN!;
    const full = process.env.GH_OWNER_REPO!; // e.g., "you/calculator"
    if (!token || !full) throw new Error("Set GITHUB_PERSONAL_ACCESS_TOKEN and GH_OWNER_REPO in .env");

    const [owner, repo] = full.split("/");
    const octokit = new Octokit({ auth: token });

    const batch: any[] = [];
    for await (const it of paginateIssues(octokit, owner, repo)) {
        const title = it.title ?? "";
        const body = it.body ?? "";
        const text = `Title: ${title}\n\nBody: ${body}`.trim();
        if (!text) continue;

        batch.push({
            id: `gh-${it.number}`,
            text,
            url: it.html_url,
            // labels: (it.labels || []).map((l: any) => l.name ?? l),
            labels: ["bug"],
            updatedAt: it.updated_at,
        });

        // flush in chunks to avoid big memory spikes
        if (batch.length >= 50) {
            await upsertItems(batch);
            batch.length = 0;
        }
    }
    if (batch.length) await upsertItems(batch);
    console.log("Ingestion complete.");
}

main().catch(e => { console.error(e); process.exit(1); });
