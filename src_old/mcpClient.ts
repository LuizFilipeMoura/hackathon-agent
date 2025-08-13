import { Client } from "@modelcontextprotocol/sdk/client";
import * as SSENS from "@modelcontextprotocol/sdk/client/sse";

export async function connectGithubMcpRemote() {
    const url = process.env.GITHUB_MCP_URL || "https://api.githubcopilot.com/mcp/";
    const token = process.env.GITHUB_MCP_TOKEN;
    if (!token) throw new Error("Set GITHUB_MCP_TOKEN (OAuth token for GitHub remote MCP)");

    console.log("[connectGithubMcpRemote] url:", url);

    // ---- version-agnostic transport creation (SDKs differ) -------------------
    const Any = SSENS as any;
    let transport: any;

    if (typeof Any.SSEClientTransport?.create === "function") {
        console.log("[connectGithubMcpRemote] using SSEClientTransport.create(url, opts)");
        transport = await Any.SSEClientTransport.create(url, {
            headers: { Authorization: `Bearer ${token}` },
            fetchOptions: { keepalive: true },
        });
    } else if (typeof Any.SSEClientTransport === "function") {
        console.log("[connectGithubMcpRemote] using new SSEClientTransport(url, opts)");
        transport = new Any.SSEClientTransport(url, {
            headers: { Authorization: `Bearer ${token}` },
            fetchOptions: { keepalive: true },
        });
    } else if (typeof Any.create === "function") {
        console.log("[connectGithubMcpRemote] using namespace create(url, opts)");
        transport = await Any.create(url, {
            headers: { Authorization: `Bearer ${token}` },
            fetchOptions: { keepalive: true },
        });
    } else {
        throw new Error("SSE transport factory not found in @modelcontextprotocol/sdk/client/sse");
    }

    // ---- client --------------------------------------------------------------
    const client = new Client({ name: "ts-agent", version: "1.0.0" }, transport);
    await client.connect();
    const tools = await client.listTools();
    console.log("[connectGithubMcpRemote] tools:", tools.map((t: any) => t.name));

    return { client, tools };
}
