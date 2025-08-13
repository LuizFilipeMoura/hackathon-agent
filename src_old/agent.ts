import { connectGithubMcpRemote } from "./mcpClient";
import "dotenv/config"; // Load environment variables from .env file

import { createTool } from "@langchain/core/tools";
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import { spawn } from "node:child_process";
import { Readable, Writable } from "node:stream";
import { ReadableStream, WritableStream } from "node:stream/web";
async function main() {
    const owner = process.env.GH_OWNER || "my-org";
    const repo = process.env.GH_REPO || "my-repo";
    const issue_number = Number(process.env.ISSUE_NUMBER || 1);
    const body = process.env.COMMENT_BODY || "🤖 hello from remote MCP (SSE)";

    const { client, tools } = await connectGithubMcpRemote();

    const getIssue = tools.find(t => t.name.includes("get_issue"))?.name;
    const createComment = tools.find(t => t.name.includes("create_comment"))?.name;
    if (!getIssue || !createComment) throw new Error("Missing get_issue/create_comment");

    const issue = await client.callTool(getIssue, { owner, repo, issue_number });
    console.log("Issue title:", issue?.title);

    await client.callTool(createComment, { owner, repo, issue_number, body });
    console.log("Comment posted.");

    await client.close();
}
main().catch(err => { console.error(err); process.exit(1); });
