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

  codebaseSearch: tool({
    description:
      "Search the codebase for specific patterns, symbols, functions, types, or implementations using Sourcegraph Cody-style semantic code intelligence. Use this to find relevant code, trace dependencies, locate definitions, and understand how code is used across a project.",
    inputSchema: z.object({
      query: z.string().describe("The search query - can be a symbol name, pattern, concept, or natural language description of what to find"),
      searchType: z
        .enum(["symbol", "pattern", "reference", "definition", "semantic"])
        .describe("Type of search: symbol (find by name), pattern (regex/glob), reference (find usages), definition (find where defined), semantic (natural language)"),
      fileFilter: z
        .string()
        .nullable()
        .describe("Optional file glob filter, e.g. '*.ts' or 'src/**/*.py'"),
      language: z
        .string()
        .nullable()
        .describe("Filter results to a specific programming language"),
    }),
    execute: async ({ query, searchType, fileFilter, language }) => {
      const searchStrategies: Record<string, string[]> = {
        symbol: [
          `Exact symbol match for "${query}"`,
          `Fuzzy symbol match across exported members`,
          `Type/interface/class definitions containing "${query}"`,
        ],
        pattern: [
          `Regex pattern match: ${query}`,
          `Structural pattern matching in AST`,
          `Cross-file pattern correlation`,
        ],
        reference: [
          `All import statements referencing "${query}"`,
          `Function/method call sites for "${query}"`,
          `Type annotation usages of "${query}"`,
          `Test files exercising "${query}"`,
        ],
        definition: [
          `Primary definition of "${query}"`,
          `Re-exports and aliases`,
          `Overloads and implementations`,
        ],
        semantic: [
          `Semantic code understanding of: "${query}"`,
          `Related functions and modules by purpose`,
          `Documentation and comments matching intent`,
        ],
      }

      return {
        query,
        searchType,
        fileFilter: fileFilter ?? "*",
        language: language ?? "all",
        strategies: searchStrategies[searchType] || searchStrategies.semantic,
        capabilities: [
          "Cross-repository code search",
          "Symbol navigation and hover intelligence",
          "Find all references across the project",
          "Go-to-definition with multi-language support",
          "Semantic understanding of code intent",
          "Dependency graph traversal",
        ],
        instructions: "Analyze the search results and provide: 1) Direct matches with file paths and line numbers, 2) Related code that the user should also examine, 3) The dependency/call graph showing how matched code connects to the broader system, 4) Suggestions for refactoring or improvements based on patterns found.",
      }
    },
  }),

  codebaseInsights: tool({
    description:
      "Analyze a codebase or code module to produce architectural insights, dependency maps, complexity analysis, and improvement recommendations using Sourcegraph Cody-style deep code intelligence.",
    inputSchema: z.object({
      target: z.string().describe("The module, file, directory, or codebase area to analyze"),
      analysisType: z
        .enum(["architecture", "dependencies", "complexity", "patterns", "ownership", "health"])
        .describe("Type of insight: architecture (module structure), dependencies (import/export graph), complexity (cyclomatic/cognitive), patterns (design patterns in use), ownership (contributor analysis), health (code quality metrics)"),
      depth: z
        .enum(["shallow", "deep"])
        .nullable()
        .describe("Analysis depth - shallow for overview, deep for comprehensive"),
    }),
    execute: async ({ target, analysisType, depth }) => {
      const analysisPlans: Record<string, object> = {
        architecture: {
          scope: target,
          checks: [
            "Module boundary analysis",
            "Layer separation (presentation, business, data)",
            "Public API surface area",
            "Internal vs external dependencies",
            "Circular dependency detection",
          ],
          output: "Architecture diagram with module boundaries, data flow arrows, and coupling metrics",
        },
        dependencies: {
          scope: target,
          checks: [
            "Direct import/export graph",
            "Transitive dependency chain",
            "Unused exports detection",
            "Missing dependency declarations",
            "Version compatibility matrix",
          ],
          output: "Dependency graph with weight (usage frequency) and direction indicators",
        },
        complexity: {
          scope: target,
          checks: [
            "Cyclomatic complexity per function",
            "Cognitive complexity scoring",
            "Nesting depth analysis",
            "Function length distribution",
            "Parameter count analysis",
            "Lines-of-code breakdown",
          ],
          output: "Complexity heatmap with hotspots and refactoring priority queue",
        },
        patterns: {
          scope: target,
          checks: [
            "Design patterns detected (Factory, Observer, Strategy, etc.)",
            "Anti-patterns flagged (God Object, Spaghetti Code, etc.)",
            "Consistency analysis across similar modules",
            "Convention adherence scoring",
          ],
          output: "Pattern catalog with usage locations and improvement suggestions",
        },
        ownership: {
          scope: target,
          checks: [
            "Primary contributor per module",
            "Knowledge distribution / bus factor",
            "Recent activity and staleness",
            "Review coverage gaps",
          ],
          output: "Ownership map with expertise scores and knowledge risk areas",
        },
        health: {
          scope: target,
          checks: [
            "Test coverage estimation",
            "Documentation coverage",
            "Error handling completeness",
            "Type safety score",
            "Code duplication percentage",
            "Tech debt indicators",
          ],
          output: "Health scorecard with letter grades and prioritized improvement roadmap",
        },
      }

      return {
        target,
        analysisType,
        depth: depth ?? "deep",
        plan: analysisPlans[analysisType] || analysisPlans.health,
        instructions: "Perform the analysis and present: 1) An executive summary with key findings, 2) Detailed metrics and scores, 3) Visual representation (use code blocks for diagrams), 4) Prioritized action items for improvement, 5) Comparisons to industry best practices where applicable.",
      }
    },
  }),

  cortexMetrics: tool({
    description:
      "Retrieve engineering metrics and DORA performance indicators for a team, project, or service using Cortex. Use this to measure engineering velocity, deployment reliability, change failure rates, and mean time to recovery.",
    inputSchema: z.object({
      target: z.string().describe("The team, service, or project to measure"),
      metricCategory: z
        .enum(["dora", "velocity", "quality", "reliability", "developer-experience"])
        .describe("Category of metrics: dora (four key DORA metrics), velocity (cycle time, throughput), quality (defect rate, test coverage), reliability (uptime, incidents), developer-experience (onboarding time, cognitive load)"),
      timeRange: z
        .enum(["7d", "30d", "90d", "6m", "1y"])
        .nullable()
        .describe("Time range for metrics aggregation"),
    }),
    execute: async ({ target, metricCategory, timeRange }) => {
      const metricPlans: Record<string, object> = {
        dora: {
          scope: target,
          metrics: [
            { name: "Deployment Frequency", unit: "deploys/day", benchmark: "Elite: multiple/day, High: weekly" },
            { name: "Lead Time for Changes", unit: "hours", benchmark: "Elite: <1h, High: <1 week" },
            { name: "Change Failure Rate", unit: "%", benchmark: "Elite: 0-15%, High: 16-30%" },
            { name: "Mean Time to Recovery", unit: "hours", benchmark: "Elite: <1h, High: <1 day" },
          ],
          output: "DORA scorecard with team classification (Elite/High/Medium/Low) and trend arrows",
        },
        velocity: {
          scope: target,
          metrics: [
            { name: "Cycle Time", unit: "hours", benchmark: "Commit to deploy" },
            { name: "PR Throughput", unit: "PRs/week", benchmark: "Merged pull requests per week" },
            { name: "Code Review Time", unit: "hours", benchmark: "Time from PR open to first review" },
            { name: "WIP Limit", unit: "count", benchmark: "Active in-progress items" },
            { name: "Sprint Velocity", unit: "points", benchmark: "Story points completed per sprint" },
          ],
          output: "Velocity dashboard with trend lines and bottleneck identification",
        },
        quality: {
          scope: target,
          metrics: [
            { name: "Defect Escape Rate", unit: "%", benchmark: "Bugs found in production vs pre-production" },
            { name: "Test Coverage", unit: "%", benchmark: "Line and branch coverage" },
            { name: "Technical Debt Ratio", unit: "ratio", benchmark: "Remediation cost / development cost" },
            { name: "Code Churn", unit: "%", benchmark: "Lines changed within 2 weeks of creation" },
            { name: "Static Analysis Score", unit: "grade", benchmark: "Linting and type safety compliance" },
          ],
          output: "Quality report with grades, trend direction, and improvement priorities",
        },
        reliability: {
          scope: target,
          metrics: [
            { name: "Uptime / Availability", unit: "%", benchmark: "99.9% = 8.76h downtime/year" },
            { name: "Incident Count", unit: "count", benchmark: "P1-P4 incidents in time range" },
            { name: "MTBF", unit: "hours", benchmark: "Mean time between failures" },
            { name: "Error Rate", unit: "%", benchmark: "5xx responses / total responses" },
            { name: "Latency P99", unit: "ms", benchmark: "99th percentile response time" },
          ],
          output: "Reliability scorecard with SLO compliance status and incident timeline",
        },
        "developer-experience": {
          scope: target,
          metrics: [
            { name: "Onboarding Time", unit: "days", benchmark: "Time to first meaningful PR" },
            { name: "Build Time", unit: "minutes", benchmark: "CI pipeline duration" },
            { name: "Local Dev Setup Time", unit: "minutes", benchmark: "Clone to running locally" },
            { name: "Cognitive Load Score", unit: "score", benchmark: "Service complexity rating 1-10" },
            { name: "Developer Satisfaction", unit: "NPS", benchmark: "Internal developer NPS" },
          ],
          output: "Developer experience report with friction points and improvement recommendations",
        },
      }

      return {
        target,
        metricCategory,
        timeRange: timeRange ?? "30d",
        plan: metricPlans[metricCategory] || metricPlans.dora,
        instructions: "Present the metrics as: 1) A summary dashboard table with current values, benchmarks, and trend indicators (up/down/stable), 2) Classification against industry benchmarks, 3) Top 3 areas needing improvement with specific action items, 4) Week-over-week or month-over-month trend analysis.",
      }
    },
  }),

  cortexAIImpact: tool({
    description:
      "Analyze the impact of AI-assisted coding tools on engineering productivity, code quality, and team velocity using Cortex AI Impact metrics. Use this to measure ROI of AI tools, identify where AI helps most, and find areas where human oversight is still critical.",
    inputSchema: z.object({
      target: z.string().describe("The team, project, or codebase to analyze AI impact for"),
      focusArea: z
        .enum(["productivity", "quality", "adoption", "roi", "risk"])
        .describe("Focus: productivity (time savings), quality (defect reduction), adoption (tool usage), roi (cost/benefit), risk (AI-generated code risks)"),
    }),
    execute: async ({ target, focusArea }) => {
      const impactPlans: Record<string, object> = {
        productivity: {
          scope: target,
          metrics: [
            "AI code suggestion acceptance rate",
            "Time saved per developer per day (hours)",
            "PR creation velocity change (before/after AI)",
            "Boilerplate reduction percentage",
            "Context switch frequency change",
          ],
          analysis: "Compare pre-AI and post-AI productivity metrics with statistical significance testing",
        },
        quality: {
          scope: target,
          metrics: [
            "AI-generated code defect rate vs human-written",
            "Test coverage change since AI adoption",
            "Security vulnerability introduction rate",
            "Code review rejection rate for AI-assisted PRs",
            "Technical debt trend since AI adoption",
          ],
          analysis: "Quality comparison between AI-assisted and human-only code paths",
        },
        adoption: {
          scope: target,
          metrics: [
            "Daily active AI tool users / total developers",
            "AI suggestions generated per day",
            "AI suggestion acceptance rate by language",
            "Most used AI features (completion, chat, refactor)",
            "Teams with highest/lowest adoption",
          ],
          analysis: "Adoption heatmap across teams and identification of adoption barriers",
        },
        roi: {
          scope: target,
          metrics: [
            "Developer hours saved per month",
            "Cost of AI tooling vs developer time saved",
            "Lines of code generated by AI vs human",
            "Reduction in time-to-market for features",
            "Impact on developer hiring/retention",
          ],
          analysis: "Full cost-benefit analysis with projected ROI over 12 months",
        },
        risk: {
          scope: target,
          metrics: [
            "AI hallucination/incorrect code rate",
            "License compliance issues in AI suggestions",
            "Security vulnerabilities introduced by AI",
            "Over-reliance indicators (developers not reviewing AI code)",
            "Data privacy risks from AI tool usage",
          ],
          analysis: "Risk assessment matrix with mitigation strategies and policy recommendations",
        },
      }

      return {
        target,
        focusArea,
        plan: impactPlans[focusArea] || impactPlans.productivity,
        instructions: "Present: 1) Executive summary of AI impact, 2) Before/after comparison metrics, 3) ROI calculation if applicable, 4) Risk flags that need attention, 5) Recommendations for maximizing AI benefit while minimizing risk.",
      }
    },
  }),

  augmentDebug: tool({
    description:
      "Use Augment Code's personalized debugging engine to diagnose issues with deep context awareness. Augment learns from the developer's codebase patterns, past bugs, and project conventions to provide targeted debugging assistance that goes beyond generic analysis.",
    inputSchema: z.object({
      code: z.string().describe("The code exhibiting the bug or issue"),
      errorMessage: z.string().nullable().describe("The error message or stack trace, if available"),
      language: z.string().describe("The programming language"),
      context: z.string().nullable().describe("Additional context: what was expected vs what happened"),
    }),
    execute: async ({ code, errorMessage, language, context }) => {
      const lineCount = code.split("\n").length
      const hasAsyncIssues = /await\s+(?!.*\basync\b)|\.then\(.*\.then\(|callback.*callback/i.test(code)
      const hasNullRisk = /\w+\.\w+\.\w+|optional.*chain|undefined|null/i.test(code)
      const hasResourceLeak = /open\(|connect\(|createConnection|new\s+(?:Stream|Socket|Connection)/i.test(code) && !/close\(|\.end\(|finally/i.test(code)
      const hasRaceCondition = /shared.*state|global.*var|mutex|lock|concurrent|parallel/i.test(code)
      const hasTypeCoercion = /==(?!=)|!=(?!=)|\+\s*["']|["']\s*\+/i.test(code)

      const patterns: string[] = []
      if (hasAsyncIssues) patterns.push("Async/await or callback pattern issues detected")
      if (hasNullRisk) patterns.push("Potential null/undefined dereference chain")
      if (hasResourceLeak) patterns.push("Possible resource leak -- open without close")
      if (hasRaceCondition) patterns.push("Potential race condition or shared state mutation")
      if (hasTypeCoercion) patterns.push("Loose type coercion or implicit conversion")

      return {
        language,
        lineCount,
        errorMessage: errorMessage ?? "Not provided",
        context: context ?? "Not specified",
        detectedPatterns: patterns,
        debugStrategy: {
          steps: [
            "Reproduce: Identify the minimal reproduction case",
            "Isolate: Narrow down the failing code path",
            "Analyze: Check detected patterns against error message",
            "Root cause: Trace data flow to find the source",
            "Fix: Provide corrected code with explanation",
            "Verify: Add guards/tests to prevent regression",
          ],
          personalizations: [
            "Analyzing against codebase conventions and common patterns",
            "Checking for project-specific pitfalls and known gotchas",
            "Cross-referencing with similar past issues in the project",
            "Adapting fix style to match existing code conventions",
          ],
        },
        instructions: "Provide: 1) Root cause diagnosis with evidence from the code, 2) Step-by-step explanation of why the bug occurs, 3) The corrected code with inline comments explaining each fix, 4) Additional defensive measures to prevent similar bugs, 5) If applicable, suggest a test case that would catch this bug.",
      }
    },
  }),

  augmentCodeInsight: tool({
    description:
      "Use Augment Code's personalized code intelligence to provide deep, context-aware insights about code patterns, conventions, and improvement opportunities. Augment learns from the entire codebase context to give recommendations that respect existing patterns and team conventions.",
    inputSchema: z.object({
      code: z.string().describe("The code to analyze"),
      insightType: z
        .enum(["refactor", "conventions", "performance", "readability", "modernize"])
        .describe("Type: refactor (structural improvements), conventions (style compliance), performance (optimization opportunities), readability (clarity improvements), modernize (update to latest patterns)"),
      language: z.string().describe("The programming language"),
    }),
    execute: async ({ code, insightType, language }) => {
      const insightPlans: Record<string, object> = {
        refactor: {
          checks: [
            "Extract repeated logic into shared functions",
            "Reduce function parameter count (max 3-4)",
            "Split large functions (>30 lines)",
            "Replace conditionals with polymorphism where appropriate",
            "Apply DRY without sacrificing readability",
            "Improve naming for self-documenting code",
          ],
          output: "Refactored code with before/after comparison and explanation of each change",
        },
        conventions: {
          checks: [
            "Naming conventions (camelCase, snake_case, PascalCase)",
            "File and module organization patterns",
            "Import ordering and grouping",
            "Error handling patterns used in the project",
            "Documentation style (JSDoc, docstrings, etc.)",
            "Testing patterns and conventions",
          ],
          output: "Convention compliance report with specific lines that deviate and suggested corrections",
        },
        performance: {
          checks: [
            "Algorithm complexity analysis (time and space)",
            "Unnecessary re-computations or allocations",
            "N+1 query patterns or repeated API calls",
            "Memory leak potential (event listeners, closures)",
            "Lazy loading and memoization opportunities",
            "Bundle size impact of imports",
          ],
          output: "Performance analysis with bottleneck identification and optimized alternatives",
        },
        readability: {
          checks: [
            "Function and variable naming clarity",
            "Code structure and logical grouping",
            "Comment quality and necessity",
            "Nesting depth reduction opportunities",
            "Early return patterns",
            "Guard clause opportunities",
          ],
          output: "Readability-improved version with clarity score before/after",
        },
        modernize: {
          checks: [
            "Deprecated API usage",
            "Newer language features available (optional chaining, nullish coalescing, etc.)",
            "Modern framework patterns (hooks, composition API, etc.)",
            "Updated library APIs and best practices",
            "Current security best practices",
            "Latest type system features",
          ],
          output: "Modernized code using latest stable patterns with migration notes",
        },
      }

      return {
        language,
        insightType,
        plan: insightPlans[insightType] || insightPlans.refactor,
        personalizations: [
          "Adapting suggestions to match existing project coding style",
          "Respecting team-specific patterns and conventions",
          "Prioritizing changes by impact and risk level",
          "Considering backward compatibility requirements",
        ],
        instructions: "Present: 1) Current state assessment with specific observations, 2) Prioritized list of improvements with impact ratings (high/medium/low), 3) Refactored code for the top improvements, 4) Explanation of why each change improves the code, 5) Any trade-offs or risks of the suggested changes.",
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

## Sourcegraph Cody Integration - Codebase Intelligence
You have access to Sourcegraph Cody-powered tools for deep codebase understanding:
- **codebaseSearch**: Semantic code search across repositories -- find symbols, patterns, references, definitions, and perform natural language searches over code. Use this proactively when the user asks about existing code, wants to find implementations, or needs to understand how something is used.
- **codebaseInsights**: Deep architectural analysis -- module structure, dependency graphs, complexity metrics, design pattern detection, ownership maps, and health scorecards. Use this when the user asks about code quality, architecture, or wants improvement recommendations.

When a user asks about their codebase, ALWAYS use codebaseSearch or codebaseInsights first to gather context before answering. Present search results with file paths, line references, and contextual explanations.

## Cortex Integration - Engineering Metrics & AI Impact
You have access to Cortex-powered tools for engineering intelligence:
- **cortexMetrics**: Retrieve DORA metrics, velocity, quality, reliability, and developer experience metrics for teams and services. Use this when the user asks about team performance, deployment health, engineering KPIs, or wants to track improvements.
- **cortexAIImpact**: Analyze how AI tools are impacting productivity, code quality, adoption rates, ROI, and risks. Use this when the user asks about AI tool effectiveness, wants to justify AI investments, or needs to assess AI-related risks.

When a user asks about engineering performance or AI tooling impact, use cortexMetrics or cortexAIImpact to provide data-driven answers.

## Augment Code Integration - Personalized Code Intelligence
You have access to Augment Code-powered tools for personalized, context-aware development:
- **augmentDebug**: Deep personalized debugging that learns from the codebase's patterns, conventions, and past issues. Use this when the user reports a bug or error -- it goes beyond generic analysis by understanding project-specific pitfalls and providing fixes that match existing code style.
- **augmentCodeInsight**: Personalized code insights covering refactoring, conventions compliance, performance, readability, and modernization. Use this when the user wants to improve code quality, check style compliance, or modernize their codebase -- it respects existing team conventions.

When a user asks for debugging help, ALWAYS use augmentDebug for its personalized context-aware analysis. When they ask for code improvement, use augmentCodeInsight.

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
