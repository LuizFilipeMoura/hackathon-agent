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
    console.log("owner:", owner, "repo:", repo, "issueNumberStr:", issueNumberStr);
    const issueNumber = parseInt(issueNumberStr);
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY environment variable is required');
        process.exit(1);
    }

    if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
        console.error('❌ GITHUB_PERSONAL_ACCESS_TOKEN environment variable is required');
        process.exit(1);
    }

    const agent = new GitHubIssueAgent(process.env.ANTHROPIC_API_KEY);

    try {
        await agent.initialize();
        await agent.solveIssue({ owner, repo, issueNumber });
    } finally {
        await agent.close();
    }
}

main().catch(console.error);
