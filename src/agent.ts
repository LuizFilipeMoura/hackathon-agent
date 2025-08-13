import Anthropic from '@anthropic-ai/sdk';

interface IssueContext {
    owner: string;
    repo: string;
    issueNumber: number;
    title: string;
    body: string;
    labels: string[];
}

export class GitHubIssueAgent {
    private anthropic: Anthropic;

    constructor(apiKey: string) {
        this.anthropic = new Anthropic({
            apiKey,
        });
    }

    async solveIssue(context: IssueContext): Promise<void> {
        try {
            console.log(`🔍 Analyzing issue #${context.issueNumber}: ${context.title}`);

            // Get repository context first
            await this.getRepositoryContext(context);

            // Analyze the issue and determine solution approach
            const solution = await this.analyzeAndPlanSolution(context);

            // Execute the solution
            await this.executeSolution(context, solution);

            console.log(`✅ Issue #${context.issueNumber} processing complete!`);
        } catch (error) {
            console.error(`❌ Error solving issue #${context.issueNumber}:`, error);
            throw error;
        }
    }

    private async getRepositoryContext(context: IssueContext): Promise<void> {
        const prompt = `
I need to solve issue #${context.issueNumber} in ${context.owner}/${context.repo}.

Title: ${context.title}
Description: ${context.body}
Labels: ${context.labels.join(', ')}

First, please help me understand the repository structure and the issue context by:
1. Getting the repository file structure
2. Reading relevant files if needed
3. Understanding the codebase

Use the GitHub MCP tools to explore the repository.
`;

        await this.anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            messages: [{role: 'user', content: prompt}],
        });
    }

    private async analyzeAndPlanSolution(context: IssueContext): Promise<string> {
        const prompt = `
Now that I understand the repository context, please analyze this issue and create a detailed plan:

Issue #${context.issueNumber}: ${context.title}
${context.body}

Please:
1. Identify the root cause of the issue
2. Propose a specific solution approach
3. List the files that need to be modified
4. Provide the exact changes needed

If this is a bug, provide a fix. If it's a feature request, implement the feature.
Return your analysis and plan.
`;

        const response = await this.anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            messages: [{role: 'user', content: prompt}],
        });
        console.log("[analyzeAndPlanSolution] Response:", response.content[0]);

        return response.content[0].type === 'text' ? response.content[0].text : '';
    }

    private async executeSolution(context: IssueContext, solution: string): Promise<void> {
        const prompt = `
Based on the analysis: ${solution}

Now please implement the solution by:
1. Creating a new branch for this fix
2. Making the necessary code changes
3. Creating a pull request with proper description
4. Adding a comment to the original issue linking to the PR

Use the GitHub MCP tools to execute these steps.
`;

        const response = await this.anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            messages: [{role: 'user', content: prompt}],
        });
        console.log("[executeSolution] Response:", response.content[0]);

    }
}

// Usage example
async function main() {
    const agent = new GitHubIssueAgent(process.env.ANTHROPIC_API_KEY!);

    // Example: solve an issue
    await agent.solveIssue({
        owner: 'your-org',
        repo: 'your-repo',
        issueNumber: 123,
        title: 'Bug: Login form validation not working',
        body: 'The login form accepts empty passwords...',
        labels: ['bug', 'frontend']
    });
}

