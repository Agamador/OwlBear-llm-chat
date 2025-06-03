// ollama sdk
import { Ollama } from "ollama";

// mcp sdk
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";


const OLLAMA_HOST = "http://localhost:11434";
const OLLAMA_MODEL = "qwen3:8b";

class MCPClient {
    constructor() {
        this.llm = new Ollama({
            host: OLLAMA_HOST,
        });
        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
        this.transport = null;
        this.tools = [];
    }
    // Connect to the MCP
    async connectToServer(serverScriptPath) {
        const isJs = serverScriptPath.endsWith(".js");
        const isPy = serverScriptPath.endsWith(".py");
        if (!isJs && !isPy) {
            throw new Error("Server script must be a .js or .py file");
        }

        this.transport = new StdioClientTransport({
            command, // python /path/to/server.py
            args: [serverScriptPath],
        });
        await this.mcp.connect(this.transport);

        // Register tools
        const toolsResult = await this.mcp.listTools();
        this.tools = toolsResult.tools.map((tool) => {
            return {
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            };
        });

        console.log(
            "Connected to server with tools:",
            this.tools.map(({ name }) => name)
        );
    }
    // Process query
    async processQuery(query) {
        // call the llm
        const messages = [
            {
                role: "user",
                content: query,
            },
        ];

        // Convert MCP tools to Ollama tools format
        const ollamaTools = this.tools.map((tool) => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.input_schema,
            },
        }));

        const response = await this.llm.chat({
            model: OLLAMA_MODEL,
            messages,
            tools: ollamaTools,
        });

        // check the response
        const finalText = [];
        const toolResults = [];

        // Handle tool calls
        if (response.message.tool_calls && response.message.tool_calls.length > 0) {
            for (const toolCall of response.message.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = toolCall.function.arguments;

                try {
                    const result = await this.mcp.callTool({
                        name: toolName,
                        arguments: toolArgs,
                    });
                    toolResults.push(result);
                    finalText.push(
                        `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`
                    );

                    // Add tool result to messages and get follow-up response
                    messages.push({
                        role: "assistant",
                        content: "",
                        tool_calls: [toolCall],
                    });
                    messages.push({
                        role: "tool",
                        content: JSON.stringify(result.content),
                        tool_call_id: toolCall.id || toolName,
                    });

                    const followUpResponse = await this.llm.chat({
                        model: OLLAMA_MODEL,
                        messages,
                    });

                    finalText.push(followUpResponse.message.content || "");
                } catch (error) {
                    finalText.push(`Error calling tool ${toolName}: ${error.message}`);
                }
            }
        } else {
            // No tool calls, just return the text response
            finalText.push(response.message.content || "");
        }

        return finalText.join("\n");
    }

    async cleanup() {
        await this.mcp.close();
    }
}

export default MCPClient;