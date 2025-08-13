import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

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

    private async analyzeAndSolve(context: IssueContext, issue: any): Promise<void> {
        // Create a system prompt that tells Claude it has access to GitHub MCP tools
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

Be methodical and thorough.`;

        const userPrompt = `Please solve this GitHub issue:

**Repository**: ${context.owner}/${context.repo}
**Issue #${context.issueNumber}**: ${issue.title}
**Description**: ${issue.body}
**Labels**: ${issue.labels?.map((l: any) => l.name).join(', ') || 'None'}

Start by exploring the repository structure and understanding the codebase, then implement a solution.`;

        // Use Claude with function calling enabled
        const response = await this.anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            tools: await this.getAvailableTools(),
            tool_choice: { type: "auto" }
        });
        console.log("Claude's response:", response);

        // Process Claude's response and execute any tool calls
        await this.processResponse(response);
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

    private async processResponse(response: any): Promise<void> {
        for (const content of response.content) {
            if (content.type === 'tool_use') {
                console.log(`🔧 Executing: ${content.name}`);

                try {
                    const result = await this.callMCPTool(content.name, content.input);
                    console.log(`✅ Tool result:`, result);

                    // Continue conversation with Claude if needed
                    // This would require a more complex conversation loop
                } catch (error) {
                    console.error(`❌ Tool execution failed:`, error);
                }
            } else if (content.type === 'text') {
                console.log('💭 Claude says:', content.text);
            }
        }
    }

    async close(): Promise<void> {
        await this.mcpClient.close();
    }
}

export { GitHubIssueAgent };
