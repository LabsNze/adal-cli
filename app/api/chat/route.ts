import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  tool,
} from "ai"
import { z } from "zod"

export const maxDuration = 60

const codeGenerationTools = {
  analyzeRequirements: tool({
    description:
      "Analyze the coding requirements and break them into clear sub-tasks before writing code. Use this to plan the implementation approach systematically.",
    inputSchema: z.object({
      task: z.string().describe("The coding task to analyze"),
      language: z
        .string()
        .nullable()
        .describe("The target programming language"),
      complexity: z
        .enum(["low", "medium", "high"])
        .nullable()
        .describe("Estimated complexity level"),
    }),
    execute: async ({ task, language, complexity }) => {
      const estimatedComplexity = complexity ?? "medium"
      const subtasks: string[] = []

      if (estimatedComplexity === "low") {
        subtasks.push("Implement core function", "Add basic error handling", "Write usage example")
      } else if (estimatedComplexity === "medium") {
        subtasks.push(
          "Define types and interfaces",
          "Implement core logic",
          "Add comprehensive error handling",
          "Add input validation",
          "Write tests outline",
          "Document public API"
        )
      } else {
        subtasks.push(
          "Architecture design",
          "Define types, interfaces, and contracts",
          "Implement core modules",
          "Add comprehensive error handling and edge cases",
          "Implement input validation and sanitization",
          "Add logging and observability hooks",
          "Performance optimization pass",
          "Security review checklist",
          "Write test suite outline",
          "Document API and usage"
        )
      }

      return {
        task,
        language: language ?? "auto-detect",
        complexity: estimatedComplexity,
        subtasks,
        considerations: [
          "Type safety and correctness",
          "Error handling for all failure modes",
          "Edge cases and boundary conditions",
          "Performance implications",
          "Security best practices",
          "Code readability and maintainability",
        ],
      }
    },
  }),

  reviewCode: tool({
    description:
      "Review generated code for bugs, security vulnerabilities, performance problems, and best-practice violations. Use after generating code to ensure quality.",
    inputSchema: z.object({
      code: z.string().describe("The code to review"),
      language: z.string().describe("The programming language of the code"),
      focusAreas: z
        .array(z.string())
        .nullable()
        .describe("Specific areas to focus the review on"),
    }),
    execute: async ({ code, language, focusAreas }) => {
      const lineCount = code.split("\n").length
      const hasErrorHandling = /try|catch|throw|error|except|rescue/i.test(code)
      const hasTypeAnnotations = /:\s*(string|number|boolean|int|float|void|any|Promise)/i.test(code)
      const hasComments = /\/\/|\/\*|#|"""/i.test(code)
      const hasSQLInjectionRisk = /f"|f'|\$\{.*\}.*sql|query.*\+/i.test(code)
      const hasHardcodedSecrets = /password\s*=\s*["']|api_key\s*=\s*["']|secret\s*=\s*["']/i.test(code)

      const issues: string[] = []
      if (!hasErrorHandling) issues.push("Missing error handling")
      if (!hasTypeAnnotations && ["typescript", "python", "java"].includes(language.toLowerCase()))
        issues.push("Missing type annotations")
      if (!hasComments) issues.push("Missing code documentation")
      if (hasSQLInjectionRisk) issues.push("CRITICAL: Potential SQL injection vulnerability")
      if (hasHardcodedSecrets) issues.push("CRITICAL: Hardcoded secrets detected")

      return {
        language,
        lineCount,
        focusAreas: focusAreas ?? ["general"],
        analysis: {
          errorHandling: hasErrorHandling ? "present" : "missing",
          typeAnnotations: hasTypeAnnotations ? "present" : "missing",
          documentation: hasComments ? "present" : "missing",
          securityFlags: {
            sqlInjectionRisk: hasSQLInjectionRisk,
            hardcodedSecrets: hasHardcodedSecrets,
          },
        },
        issues,
        score: issues.length === 0 ? "excellent" : issues.length <= 2 ? "good" : "needs-improvement",
      }
    },
  }),

  expandCodeSnippet: tool({
    description:
      "Take a code snippet, function signature, or pseudocode and expand it into a complete, production-ready implementation with error handling, types, and documentation.",
    inputSchema: z.object({
      snippet: z.string().describe("The code snippet or function signature to expand"),
      context: z
        .string()
        .nullable()
        .describe("Additional context about what the code should do"),
      targetLanguage: z
        .string()
        .nullable()
        .describe("Target programming language for the expansion"),
    }),
    execute: async ({ snippet, context, targetLanguage }) => {
      const lines = snippet.trim().split("\n")
      const isSignatureOnly = lines.length <= 3

      return {
        originalSnippet: snippet,
        context: context ?? "general purpose",
        targetLanguage: targetLanguage ?? "auto-detect",
        isSignatureOnly,
        expansionPlan: {
          approach: isSignatureOnly
            ? "Full implementation from signature with types, error handling, validation, documentation, and usage examples"
            : "Complete and harden existing code with missing error handling, edge cases, types, and documentation",
          steps: [
            "Add type definitions and interfaces",
            "Implement core logic with proper control flow",
            "Add input validation and sanitization",
            "Add comprehensive error handling",
            "Add inline documentation and JSDoc/docstrings",
            "Provide usage example",
          ],
        },
      }
    },
  }),

  generateTests: tool({
    description:
      "Generate test cases for the given code, covering happy path, edge cases, and error conditions.",
    inputSchema: z.object({
      code: z.string().describe("The code to generate tests for"),
      language: z.string().describe("The programming language"),
      framework: z
        .string()
        .nullable()
        .describe("Testing framework to use (jest, pytest, vitest, etc.)"),
    }),
    execute: async ({ code, language, framework }) => {
      const functionMatches = code.match(/(?:function|def|fn|func)\s+(\w+)/g) || []
      const functionNames = functionMatches.map((m) => m.split(/\s+/)[1])

      return {
        language,
        framework: framework ?? "auto-detect",
        functionsFound: functionNames,
        testPlan: {
          categories: [
            "Happy path - expected inputs produce correct outputs",
            "Edge cases - boundary values, empty inputs, null/undefined",
            "Error cases - invalid inputs, network failures, timeouts",
            "Integration - component interactions and data flow",
          ],
          estimatedTestCount: Math.max(functionNames.length * 3, 5),
        },
      }
    },
  }),
}

const algorithmInstructions: Record<string, string> = {
  cot: `Use Chain-of-Thought reasoning: Think through the problem step-by-step in a clear, numbered sequence.
Show your thought process before writing any code.
Format your reasoning as:
Step 1: [Understand the requirements]
Step 2: [Plan the approach]
Step 3: [Consider edge cases]
...
Final: [Write the implementation]`,

  tot: `Use Tree-of-Thought reasoning: Consider multiple possible approaches to the problem.
Evaluate each branch on correctness, performance, and maintainability, then select the best.
Format:
Branch A: [approach and trade-offs]
Branch B: [approach and trade-offs]
Branch C: [approach and trade-offs]
Evaluation: [compare branches]
Selected: [best approach with justification]
Implementation: [write the code]`,

  got: `Use Graph-of-Thought reasoning: Map out the relationships between concepts, modules, and dependencies.
Identify how different parts connect and determine the optimal implementation order.
Format:
Concepts: [list key concepts]
Dependencies: [concept A depends on B, C connects to D]
Implementation Order: [based on dependency graph]
Code: [implement in dependency order]`,

  react: `Use the ReAct (Reasoning + Acting) pattern: Alternate between thinking about the problem and taking concrete actions. Observe results after each action and adjust your plan.
Format:
Thought 1: [analyze the situation]
Action 1: [take a concrete step]
Observation 1: [what you learned]
Thought 2: [refine approach based on observation]
...
Final Action: [deliver the solution]`,

  selfask: `Use Self-Ask reasoning: Break down the problem by asking and answering sub-questions. Each answer should build toward the final solution.
Format:
Main Question: [the user's request]
Sub-Q1: [first clarifying question] -> Answer: [...]
Sub-Q2: [next question building on Q1] -> Answer: [...]
...
Synthesis: [combine all answers into final solution]
Code: [implementation]`,

  custom: `Use a Hybrid reasoning approach that combines the best strategies:
1. Start with Self-Ask to decompose the problem into sub-questions
2. Use Tree-of-Thought to explore multiple approaches for the core logic
3. Apply Chain-of-Thought for step-by-step implementation of the selected approach
4. Use ReAct to validate and refine the solution iteratively
This ensures thorough analysis and robust implementation.`,
}

export async function POST(req: Request) {
  const body = await req.json()
  const { messages, algorithm, temperature } = body

  const selectedAlgorithm = algorithm && algorithmInstructions[algorithm] ? algorithm : "cot"
  const selectedTemp = typeof temperature === "number" ? Math.min(1, Math.max(0, temperature)) : 0.7

  const result = streamText({
    model: "anthropic/claude-sonnet-4-20250514",
    system: `You are AdaL -- an elite AI Code Assistant that combines an autonomous AI agent with a precise code assistant. You generate solid, robust, production-ready code.

## Reasoning Approach
${algorithmInstructions[selectedAlgorithm]}

## Core Responsibilities
- Generate production-ready code in any programming language
- Expand code snippets into complete, robust implementations
- Review code for bugs, security vulnerabilities, and anti-patterns
- Debug issues with clear explanations and fixes
- Optimize code for performance, readability, and maintainability
- Apply design patterns appropriately
- Generate comprehensive test suites

## Code Quality Standards
- ALWAYS include proper error handling for all failure modes
- ALWAYS add type annotations where the language supports them
- ALWAYS include inline comments explaining non-obvious decisions
- ALWAYS follow language-specific conventions and best practices
- ALWAYS consider security implications (SQL injection, XSS, CSRF, etc.)
- ALWAYS validate and sanitize inputs
- When generating code blocks, ALWAYS specify the language for syntax highlighting

## Agent Behavior
- Use the available tools proactively: analyze requirements before complex tasks, review code after generating it, and expand snippets when asked
- Show your reasoning process transparently using the selected algorithm
- Be thorough in analysis but concise in explanations
- When you find issues, provide the fix immediately -- don't just point out problems`,
    messages: await convertToModelMessages(messages),
    tools: codeGenerationTools,
    stopWhen: stepCountIs(10),
    temperature: selectedTemp,
  })

  return result.toUIMessageStreamResponse()
}
