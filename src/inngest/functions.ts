import { inngest } from "./client";
import { openai, createAgent, createTool, createNetwork, type Tool } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter"
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string;
  files: { [path:string]: string}; 
  // these two lines will fix the "any" type error input
};

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-siz-test-4"); // the same name with `sandbox-templates/nextjs/e2b.toml` file
      return sandbox.sandboxId;
    });

    // Create a new agent with a system prompt
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({ 
        model: "gpt-4.1-nano",
        defaultParameters: {
          temperature: 0.1, // 0.1 = reliable, less randomized
        }
      }),
      tools: [

        //1st tool
        createTool({
          name: "terminal",
          // if it fails in terminal, the ai agent will fix it if given the correct error
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", strerr: ""};
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.strerr += data; // handling all the result from the terminal command
                  }
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout}\nstrerror: ${buffers.strerr}`,
                  // important for the AI to debug and retry
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstrerror: ${buffers.strerr}`;
              }
            });
          },
        }),

        // 2nd tool
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState> // use this to make "files" not "any" type anymore
          ) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }

                return updatedFiles;
              } catch (e) {
                return "Error: " + e;
              }
            });

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles; // if it's an object then store it into our network state
            }
          }
        }),

        // 3rd tool
        createTool({
          name: "readFiles",
          // for the AI to reduce hallucination
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            // caution: you gotta extract the step because the every step has different context 
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error" + e;
              }
            })
          },
        })
      ], // end of tools, the AI has access to use all 3 tools equally and mix it own and use tool results (stdout, file contents, etc.)

      lifecycle: {
        onResponse: async ({result, network}) => {
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            // check the prompt.ts <task_summary> part
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15, // limit how many loops the agent can do
      // only stop when reaches this (to limit OpenAI credits use) or ends with <task_summary>
      router: async ({ network }) => {
        const summary = network.state.data.summary; // if we detect summary in the network state, we break the network

        if (summary) {
          return;
        }

        return codeAgent;
      }
    })

    // // no need to run the agent if you run the network
    // const { output } = await codeAgent.run(
    //   `Write the following snippet: ${event.data.value}!`,
    // );

    const result = await network.run(event.data.value);

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0; // something went wrong

    // show the user
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000) // create a host under port 3000
      return `https://${host}`;
    })

    // save the assistant's summary result message
    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again",
            role: "ASSISTANT",
            type: "ERROR", // caution: the data of prisma message always has to have these three, with fragment to be optional
          },
        });
      } // if there is an error then we don't create the fragment

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: "Fragment",
              files: result.state.data.files, // caution: the data of fragment always has to have these three
            },
          },
        },
      })
    });

    // // return for agent
    // return { output, sandboxUrl } 
    return { 
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);

