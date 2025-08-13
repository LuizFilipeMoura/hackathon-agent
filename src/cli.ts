#!/usr/bin/env node

import { GitHubIssueAgent } from './agent';
import 'dotenv/config';

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.log('Usage: npm run solve <owner> <repo> <issue-number>');
        console.log('Example: npm run solve microsoft vscode 12345');
        process.exit(1);
    }

    const [owner, repo, issueNumberStr] = args;
    const issueNumber = parseInt(issueNumberStr);

    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY environment variable is required');
        process.exit(1);
    }

    // Fetch issue details using GitHub API or MCP tools
    // For now, using placeholder data
    const issueContext = {
        owner,
        repo,
        issueNumber,
        title: `Issue #${issueNumber}`, // Would fetch from GitHub
        body: 'Issue body would be fetched from GitHub API',
        labels: []
    };

    const agent = new GitHubIssueAgent(process.env.ANTHROPIC_API_KEY);
    await agent.solveIssue(issueContext);
}

main().catch(console.error);
