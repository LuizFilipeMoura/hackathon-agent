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
You can use tools like:
- get_file_contents
- create_branch  
- create_or_update_file
- create_pull_request
- add_issue_comment
And many others.

Your task is to solve the given GitHub issue by:
1. Understanding the repository and issue context
2. Creating a solution plan
3. Implementing the fix
4. Creating a pull request
5. Updating the issue
6. When updating the issue and also when creating the PR, share any related issues and how is it related to the current. This is mandatory

If the task is more complex than a simple fix, break it down into smaller steps and tackle them one at a time, making sure that the long term goal is achieved and explain the trade-offs of each decision.
Be methodical and thorough.
Use prior art from similar issues if it accelerates a correct, minimal fix.
Prefer surgical diffs
${similarBlock ? `${similarBlock}\n` : ""}.
`;


        const userPrompt = `Please solve this GitHub issue:

**Repository**: ${context.owner}/${context.repo}
**Issue #${context.issueNumber}**: ${issue.title}
**Description**: ${issue.body}
**Labels**: ${issue.labels?.map((l: any) => l.name).join(', ') || 'None'}

Start by exploring the repository structure and understanding the codebase, then implement a solution.`;

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

        while (step++ < maxSteps) {
            console.log(`\n[loop] STEP ${step}/${maxSteps} → calling Claude…`);
            const resp = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                system: systemPrompt,
                messages,
                tools,
                tool_choice: {type: "auto"},
                max_tokens: 4000,
            });
            console.log(`[loop] stop_reason=${resp.stop_reason}`);
            console.log("[loop] assistant blocks:", resp.content?.map((b: any) => b.type));

            // 1) ALWAYS append assistant content immediately
            messages.push({role: "assistant", content: resp.content});

            // 2) Find tool calls requested in this assistant turn
            const toolUses = resp.content.filter((b: any) => b.type === "tool_use");
            console.log("[loop] tool_use count:", toolUses.length);

            if (toolUses.length === 0) {
                console.log("[loop] No tool_use blocks → treating as final answer, exiting loop.");
                break;
            }

            // 3) Execute all tool calls, collect results
            const executed = [];
            for (const tc of toolUses) {
                console.log("[loop] Executing tool:", tc.name, "id:", tc.id, "args:", JSON.stringify(tc.input));
                try {
                    // Use your MCP helper directly (don’t call processResponse here)
                    const result = await this.callMCPTool(tc.name, tc.input);
                    console.log("[loop] Tool result keys:", result && typeof result === "object" ? Object.keys(result) : typeof result);

                    // Capture useful artifacts if present
                    if (!prUrl && result?.url && /\/pull\/\d+/.test(result.url)) {
                        prUrl = result.url;
                        console.log("[loop] captured prUrl:", prUrl);
                    }
                    if (!branch && (result?.branch || result?.ref)) {
                        branch = result.branch || result.ref;
                        console.log("[loop] captured branch:", branch);
                    }

                    executed.push({
                        type: "tool_result",
                        tool_use_id: tc.id,
                        // Claude is happiest with a short string; stringify objects
                        content: typeof result === "string" ? result : JSON.stringify(result),
                    });
                } catch (err: any) {
                    console.log("[loop] Tool ERROR:", tc.name, "->", err?.message || String(err));
                    executed.push({
                        type: "tool_result",
                        tool_use_id: tc.id,
                        content: `Error: ${err?.message || String(err)}`,
                        is_error: true,
                    });
                }
            }

            // 4) IMMEDIATELY reply with ONE user message that contains ONLY tool_result blocks
            console.log("[loop] Posting tool_results, count:", executed.length);
            messages.push({role: "user", content: executed});

            // (Optionally snapshot the transcript for debugging)
            try {
                saveJsonToFile(messages, `messages_after_step_${step}.json`);
            } catch {
            }
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
