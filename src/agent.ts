import Anthropic from '@anthropic-ai/sdk';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import * as fs from "fs";
import * as path from "path";
import {retrieveSimilarContext} from "./retrieveSimilarContext";
import {upsertItems} from "./ragdb"; // at top with other imports


interface IssueContext {
    owner: string;
    repo: string;
    issueNumber: number;
}

class GitHubIssueAgent {
    private anthropic: Anthropic;
    private mcpClient: Client;

    constructor(apiKey: string) {
        this.anthropic = new Anthropic({
            apiKey,
        });
        this.mcpClient = new Client(
            {
                name: "github-agent",
                version: "1.0.0",
            },
            {
                capabilities: {}
            }
        );
    }

    async initialize(): Promise<void> {
        // Connect to GitHub MCP server
        const transport = new StdioClientTransport({
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-github"],
            env: {
                ...process.env,
                GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
            }
        });

        await this.mcpClient.connect(transport);
        console.log("🔗 Connected to GitHub MCP server");
    }

    async solveIssue(context: IssueContext): Promise<void> {
        try {
            console.log(`🔍 Analyzing issue #${context.issueNumber}: ${context.owner}/${context.repo}`);

            // Get issue details using MCP
            const issue = await this.callMCPTool('get_issue', {
                owner: context.owner,
                repo: context.repo,
                issue_number: context.issueNumber
            });

            console.log(`📋 Issue: ${issue.title}`);

            // Let Claude analyze and solve using MCP tools
            await this.analyzeAndSolve(context, issue);

            console.log(`✅ Issue #${context.issueNumber} processing complete!`);
        } catch (error) {
            console.error(`❌ Error solving issue #${context.issueNumber}:`, error);
            throw error;
        }
    }

    async close(): Promise<void> {
        await this.mcpClient.close();
    }

    private async callMCPTool(toolName: string, params: any): Promise<any> {
        console.log("[callMCPTool] Tool call called:", toolName);
        const {tools} = await this.mcpClient.listTools();
        console.log("[callMCPTool] Tool call schema:", tools.find(t => t.name === toolName)?.inputSchema);

        const result = await this.mcpClient.callTool({
            name: toolName,
            arguments: params
        });
        console.log("[callMCPTool] Tool call result:", result);
        return JSON.parse(result.content[0]?.text);
    }

    /** Final comment/labels/close */
    private async finalizeIssue(
        context: IssueContext,
        data: { prUrl?: string; branch?: string; messages: any[] }
    ) {
        const {owner, repo, issueNumber} = context;
        const summary = this.summarizeOutcome(data);

        // Prefer MCP tool if you expose it; otherwise Octokit:
        await this.callMCPTool("add_issue_comment", {
            owner, repo, issue_number: issueNumber,
            body:
                `${summary}\n\n` +
                (data.prUrl ? `**PR**: ${data.prUrl}\n` : "") +
                (data.branch ? `**Branch**: ${data.branch}\n` : "")
        });

        // Optional: labels/state
        // await this.github.addLabels({ owner, repo, issue_number: issueNumber, labels: ["bot:proposed-fix"] });
        // Optionally close if PR merged / CI green (gate this carefully!)
    }

    private summarizeOutcome(data: { prUrl?: string; branch?: string; messages: any[] }) {
        // Keep it short; you can extract the last assistant text from messages if helpful
        const lines = [];
        lines.push("### 🤖 Issue Solver Summary");
        if (data.branch) lines.push(`- Created branch: \`${data.branch}\``);
        if (data.prUrl) lines.push(`- Opened PR: ${data.prUrl}`);
        lines.push("- See build logs & diffs in the PR.");
        return lines.join("\n");
    }

    private async getAvailableTools(): Promise<any[]> {
        const tools = await this.mcpClient.listTools();

        // Convert MCP tool format to Anthropic tool format
        return tools.tools.map((tool: any) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.inputSchema
        }));
    }


    private async analyzeAndSolve(context: IssueContext, issue: any): Promise<void> {
        console.log("[analyzeAndSolve] ENTER", JSON.stringify({
            repo: `${context.owner}/${context.repo}`,
            issue: issue?.title
        }));
        // Build a short query from the current issue
        const query = `${issue.title ?? ""}\n\n${issue.body ?? ""}`.trim();
// 🔹 NEW: store this issue in local DB for future searches
        await upsertItems([{
            id: `issue-${context.issueNumber}`,
            text: query,
            url: `https://github.com/${context.owner}/${context.repo}/issues/${context.issueNumber}`,
            labels: issue.labels?.map((l: any) => l.name) || [],
            updatedAt: new Date().toISOString(),
        }]);
        // 🔹 NEW: fetch similar local context (from LanceDB)
        const similarBlock = await retrieveSimilarContext(query, 5);
        saveJsonToFile({similarBlock: similarBlock.split("\n")}, `similarity_issue${context.issueNumber}_${Date.now()}.json`, "./debug");
        // --- prompts --------------------------------------------------------------
        const systemPrompt = `You are a GitHub issue solver with access to GitHub MCP tools. 
        
        You have two loops per time you are prompted
        1) PHASE loop (fixed phases, in order)
        2) NEXT-ACTION loop inside each phase
        
        INTERNAL REASONING (HIDDEN):
        - Only output compact task metadata and tool calls; brief final summary when done.
        - The steps are strict, don't do anything other than what the step strictly says
        
        You have access to Github MCP, tools like:
        - get_file_contents (this is used to get all files from the repository, by sending "/") as the request
        - create_branch  
        - create_or_update_file
        - create_pull_request
        - add_issue_comment
        And many others.

        PHASES (in order):
        1. UNDERSTAND — establish repo/issue context; locate all files; Don't create new files until every folder and file is fetched.
        2. PLAN — propose a minimal, concrete plan (short) aligned to repo norms; pick files/functions to change.
        3. IMPLEMENT — create/switch to a branch; edit code with surgical diffs; commit with concise messages. Don't create PRs or add comments to the issues in this step.
        4. PR — open a PR with title referencing issue #${context.issueNumber}; body includes summary, rationale, test notes, and **related issues** with relationship. Create only one PR, this is mandatory
        5. UPDATE_ISSUE — add final issue comment summarizing fix, PR link. This should happen only once. It's mandatory to link SIMILAR issues, if no similar issues found, say NO SIMILAR ISSUES FOUND (check similar block)
        
        NEXT-ACTION MODE (STRICT):
        Each assistant turn MUST begin with a single JSON object named task_meta (no prose, no fences):
        {
          "phase": "UNDERSTAND|PLAN|IMPLEMENT|PR|UPDATE_ISSUE",
          "task": "concise verb phrase",
          "why_short": "≤1 sentence rationale",
          "success_criteria": ["bullet", "points"],
          "preferred_tool": "get_file_contents|create_branch|create_or_update_file|create_pull_request|add_issue_comment|null",
          "phase_done": false
        }
        - Immediately follow task_meta with tool_use calls to execute the task.
        - When the current phase is complete, set "phase_done": true in task_meta for that turn.
        
        TOOL DISCIPLINE:
        - Inspect before editing.
        - Never push to default branch; use e.g. "fix/issue-${context.issueNumber}-short-slug".
        - Keep diffs surgical; match project style.
        - Commits: concise what/why.
        - PR: reference issue, include notes on **related issues** and relationship (duplicate/blocked-by/regression/etc.).

        CONCLUSION:
        - After UPDATE_ISSUE is done, return a brief final summary (≤120 words)
        
        SIMILAR ISSUES CONTEXT:
        ${similarBlock ? `${similarBlock}\n` : ""}.
`;


        const userPrompt = `Please solve this GitHub issue:
        **Repository**: ${context.owner}/${context.repo}
        **Issue #${context.issueNumber}**: ${issue.title}
        **Description**: ${issue.body}
        **Labels**: ${issue.labels?.map((l: any) => l.name).join(', ') || 'None'}
        
        Start by exploring the repository structure and understanding the codebase, then implement a solution.
        Operate strictly in the PHASE → NEXT-ACTION protocol.
`;

        function parseTextBlocksConcat(blocks: any[]): string {
            let out = "";
            for (const b of blocks ?? []) {
                if (b.type !== "text") continue;
                if (typeof b.text === "string") out += b.text;
                else if (Array.isArray(b.text)) out += b.text.map((t: any) => (t?.text ?? "")).join("");
                else if (typeof b.text?.text === "string") out += b.text.text;
            }
            return out.trim();
        }

        function extractTaskMeta(blocks: any[]): any | undefined {
            const txt = parseTextBlocksConcat(blocks);
            if (!txt) return undefined;
            try {
                const obj = JSON.parse(txt);
                if (obj && typeof obj === "object" && obj.task && obj.phase) return obj;
            } catch {
            }
            return undefined;
        }

        function getToolUses(blocks: any[]): any[] {
            return (blocks ?? []).filter((b: any) => b.type === "tool_use");
        }

        // ========================= CONVERSATION STATE =========================

        // ⤵ NEW (phases)
        const phases = [
            {
                name: "UNDERSTAND",
                maxInnerSteps: 5,
                kickoff: "Identify relevant files, code paths, and reproduction steps if applicable."
            },
            {
                name: "PLAN",
                maxInnerSteps: 4,
                kickoff: "Propose a minimal concrete edit plan (files/functions) aligned with project style."
            },
            {
                name: "IMPLEMENT",
                maxInnerSteps: 12,
                kickoff: "Create/switch to branch, make surgical edits, commit with concise messages."
            },
            {
                name: "PR",
                maxInnerSteps: 4,
                kickoff: "Open a PR referencing the issue, include summary/rationale/tests and related issues."
            },
            {
                name: "UPDATE_ISSUE",
                maxInnerSteps: 3,
                kickoff: "Post final issue comment with PR link, related issues"
            },
        ];
        const maxTotalSteps = 40; // safety valve for the entire run
        let totalSteps = 0;

        // --- conversation state ---------------------------------------------------
        const messages: Array<{ role: "user" | "assistant"; content: any }> = [
            {role: "user", content: userPrompt}
        ];
        console.log("[analyzeAndSolve] Seed messages length:", messages.length);

        const tools = await this.getAvailableTools();
        console.log("[analyzeAndSolve] Tools provided to model:", tools.length);

        const maxSteps = 15;      // give Claude a few cycles
        let step = 0;
        let prUrl: string | undefined;
        let branch: string | undefined;

        for (const phase of phases) {
            console.log(`\n[phase] START ${phase.name}`);

            // Kickoff nudge so the model knows which phase it's in.
            messages.push({
                role: "user",
                content: `CURRENT_PHASE: ${phase.name}\nPHASE_GOAL: ${phase.kickoff}\nFollow the Output Protocol: start with task_meta JSON (with "phase":"${phase.name}") then tool_use calls.`
            });

            // ========================= INNER NEXT-ACTION LOOP =========================
            let innerStep = 0;
            let phaseMarkedDone = false;

            while (innerStep++ < phase.maxInnerSteps && totalSteps++ < maxTotalSteps) {
                console.log(`[phase:${phase.name}] STEP ${innerStep}/${phase.maxInnerSteps} → calling LLM…`);

                const resp = await this.anthropic.messages.create({
                    model: "claude-3-5-sonnet-20241022",
                    system: systemPrompt,
                    messages,
                    tools,
                    tool_choice: {type: "auto"},
                    max_tokens: 4000,
                });

                console.log(`[phase:${phase.name}] stop_reason=${resp.stop_reason}`);
                console.log(`[phase:${phase.name}] assistant blocks:`, resp.content?.map((b: any) => b.type));

                // Parse task_meta (compact; not chain-of-thought)
                const taskMeta = extractTaskMeta(resp.content || []);
                if (taskMeta) {
                    try {
                        saveJsonToFile(taskMeta, `taskmeta_${phase.name.toLowerCase()}_${innerStep}.json`, "./debug");
                    } catch {
                    }
                    console.log(`[phase:${phase.name}] task_meta:`, taskMeta);
                    if (taskMeta.phase !== phase.name) {
                        console.log(`[phase:${phase.name}] WARNING: task_meta.phase != current phase.`);
                    }
                    if (taskMeta.phase_done === true) {
                        phaseMarkedDone = true; // will still execute any tools returned in this turn
                    }
                } else {
                    console.log(`[phase:${phase.name}] No task_meta JSON found.`);
                }

                // Keep assistant content
                messages.push({role: "assistant", content: resp.content});

                // Execute tool calls (if any)
                const toolUses = getToolUses(resp.content || []);
                console.log(`[phase:${phase.name}] tool_use count:`, toolUses.length);

                if (toolUses.length === 0) {
                    // If no tools and model likely summarized, we consider phase potentially complete
                    if (phaseMarkedDone || phase.name === "UPDATE_ISSUE" || phase.name === "PR") {
                        console.log(`[phase:${phase.name}] No tool_use; assuming phase wrap-up.`);
                        break;
                    }
                    // gentle nudge to follow protocol
                    messages.push({
                        role: "user",
                        content:
                            `Please follow the Output Protocol for phase ${phase.name}:\n` +
                            `- Begin with one task_meta JSON (phase="${phase.name}") then tool_use calls.\n` +
                            `- Set "phase_done": true when the phase is complete.`
                    });
                    continue;
                }

                const executed: any[] = [];
                for (const tc of toolUses) {
                    console.log(`[phase:${phase.name}] Executing tool:`, tc.name, "id:", tc.id, "args:", JSON.stringify(tc.input));
                    try {
                        const result = await this.callMCPTool(tc.name, tc.input);
                        console.log(`[phase:${phase.name}] Tool result keys:`, result && typeof result === "object" ? Object.keys(result) : typeof result);

                        if (!prUrl && result?.url && /\/pull\/\d+/.test(result.url)) {
                            prUrl = result.url;
                            console.log(`[phase:${phase.name}] captured prUrl:`, prUrl);
                        }
                        if (!branch && (result?.branch || result?.ref)) {
                            branch = result.branch || result.ref;
                            console.log(`[phase:${phase.name}] captured branch:`, branch);
                        }

                        executed.push({
                            type: "tool_result",
                            tool_use_id: tc.id,
                            content: typeof result === "string" ? result : JSON.stringify(result),
                        });
                    } catch (err: any) {
                        console.log(`[phase:${phase.name}] Tool ERROR:`, tc.name, "->", err?.message || String(err));
                        executed.push({
                            type: "tool_result",
                            tool_use_id: tc.id,
                            content: `Error: ${err?.message || String(err)}`,
                            is_error: true,
                        });
                    }
                }

                // Post tool_results back
                console.log(`[phase:${phase.name}] Posting tool_results, count:`, executed.length);
                messages.push({role: "user", content: executed});

                // Persist transcript
                try {
                    saveJsonToFile(messages, `messages_after_${phase.name.toLowerCase()}_${innerStep}.json`);
                } catch {
                }

                // If model already signaled completion for this phase, exit inner loop
                if (phaseMarkedDone) {
                    console.log(`[phase:${phase.name}] phase_done signaled by model; exiting phase.`);
                    break;
                }
            }

            console.log(`[phase] END ${phase.name}`);
        }

        console.log("[analyzeAndSolve] Loop finished. prUrl:", prUrl, "branch:", branch);

        // 5) Finalize (post summary comment via MCP)
        await this.finalizeIssue(context, {prUrl, branch, messages});
        console.log("[analyzeAndSolve] finalizeIssue complete.");
    }

}

export {GitHubIssueAgent};

export function saveJsonToFile(
    obj: Record<string, any>,
    filename = "output.json",
    directory?: string
) {
    // Resolve full file path
    const filePath = directory
        ? path.resolve(directory, filename)
        : path.resolve(process.cwd(), filename);

    // Convert object to JSON string with indentation
    const jsonString = JSON.stringify(obj, null, 2);

    // Write to file
    fs.writeFileSync(filePath, jsonString, "utf8");

    console.log(`[saveJsonToFile] JSON saved to ${filePath}`);
}
