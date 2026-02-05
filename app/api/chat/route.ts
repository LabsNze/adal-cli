import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  tool,
} from "ai";
import { z } from "zod";

export const maxDuration = 60;

const codeGenerationTools = {
  analyzeRequirements: tool({
    description:
      "Analyze the coding requirements and break them into clear sub-tasks before writing code. Use this to plan the implementation approach.",
    inputSchema: z.object({
      task: z.string().describe("The coding task to analyze"),
      language: z
        .string()
        .describe("The target programming language")
        .nullable(),
    }),
    execute: async ({ task, language }) => {
      return {
        task,
        language: language ?? "auto-detect",
        analysis: {
          complexity: "analyzed",
          suggestedApproach: "step-by-step implementation",
          considerations: [
            "Error handling",
            "Type safety",
            "Edge cases",
            "Performance",
            "Readability",
          ],
        },
      };
    },
  }),
  reviewCode: tool({
    description:
      "Review generated code for bugs, security issues, performance problems, and best practice violations. Use this after generating code.",
    inputSchema: z.object({
      code: z.string().describe("The code to review"),
      language: z.string().describe("The programming language of the code"),
    }),
    execute: async ({ code, language }) => {
      const lineCount = code.split("\n").length;
      return {
        language,
        lineCount,
        review: {
          status: "reviewed",
          checks: [
            "Syntax validation",
            "Error handling coverage",
            "Type safety",
            "Security patterns",
            "Performance considerations",
          ],
        },
      };
    },
  }),
  expandCodeSnippet: tool({
    description:
      "Take a code snippet or function signature and expand it into a complete, robust implementation with error handling, types, and documentation.",
    inputSchema: z.object({
      snippet: z
        .string()
        .describe("The code snippet or function signature to expand"),
      context: z
        .string()
        .describe("Additional context about what the code should do")
        .nullable(),
    }),
    execute: async ({ snippet, context }) => {
      return {
        originalSnippet: snippet,
        context: context ?? "general purpose",
        expansion: {
          status: "ready",
          approach:
            "Full implementation with types, error handling, documentation, and tests",
        },
      };
    },
  }),
};

export async function POST(req: Request) {
  const { messages, algorithm, temperature } = await req.json();

  const algorithmInstructions: Record<string, string> = {
    cot: `Use Chain-of-Thought reasoning: Think through the problem step-by-step. 
Number each step of your reasoning. Show your thought process before writing code.
Format: Step 1: [thought] -> Step 2: [thought] -> ... -> Final Code`,
    tot: `Use Tree-of-Thought reasoning: Consider multiple approaches to the problem.
Evaluate each branch and pick the best one. Show the branches you considered.
Format: Branch A: [approach] | Branch B: [approach] -> Best: [selected] -> Code`,
    got: `Use Graph-of-Thought reasoning: Map relationships between concepts in the problem.
Connect related ideas and identify dependencies before writing code.
Format: Concept Map -> Dependencies -> Implementation Order -> Code`,
    react: `Use ReAct (Reasoning + Acting) pattern: Alternate between thinking about the problem 
and taking action. Observe results and adjust your approach.
Format: Thought -> Action -> Observation -> ... -> Final Code`,
    selfask: `Use Self-Ask reasoning: Ask and answer sub-questions to decompose the problem.
Each sub-question should make the solution clearer.
Format: Q1: [question] -> A1: [answer] -> Q2: ... -> Final Code`,
    custom: `Use a hybrid reasoning approach: Combine the best aspects of chain-of-thought 
and tree-of-thought to generate the most robust solution.`,
  };

  const selectedAlgorithm = algorithm || "cot";
  const selectedTemp = temperature ?? 0.7;

  const result = streamText({
    model: "anthropic/claude-sonnet-4-20250514",
    system: `You are an elite AI Code Assistant -- an autonomous agent and code assistant working together to generate solid, robust code. You combine the reasoning power of an autonomous AI agent with the precision of a professional code assistant.

${algorithmInstructions[selectedAlgorithm] || algorithmInstructions.cot}

Your capabilities:
- Generate production-ready code in any language
- Expand code snippets into complete, robust implementations
- Review code for bugs, security issues, and best practices
- Use advanced reasoning algorithms to solve complex problems
- Provide step-by-step reasoning traces for transparency

Guidelines:
- Always show your reasoning process using the selected algorithm
- Generate code with proper error handling, types, and documentation
- Include comments explaining key decisions
- Follow language-specific best practices and conventions
- When generating code blocks, always specify the language for syntax highlighting
- Use the available tools to analyze requirements and review code when appropriate
- Be thorough but concise in your explanations`,
    messages: await convertToModelMessages(messages),
    tools: codeGenerationTools,
    stopWhen: stepCountIs(8),
    temperature: selectedTemp,
  });

  return result.toUIMessageStreamResponse();
}
