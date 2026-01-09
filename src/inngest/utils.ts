import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
    const sandbox = await Sandbox.connect(sandboxId)
    return sandbox;
};

export function lastAssistantTextMessageContent(result: AgentResult) {
    const lastAssistantTextMessageIndex = result.output.findLastIndex(
        (message) => message.role === "assistant", // this is what the assistant said last
    )

    const message = result.output[lastAssistantTextMessageIndex] as | TextMessage | undefined;

    return message?.content
        ? typeof message.content === "string"
            ? message.content // if it's string the it just return its content
            : message.content.map((c) => c.text).join("") // this is in case it's an array of string
        : undefined;
};