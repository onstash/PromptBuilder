/**
 * Role-based step examples for the prompt wizard
 *
 * This file contains role-specific suggestions that appear in the wizard's
 * StepExamples component. When a user enters a role that matches one of these,
 * they see tailored suggestions instead of the generic defaults.
 *
 * Fallback: If no role match, uses default step-examples.json
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type RoleKey =
  | "entrepreneur"
  | "frontend_engineer"
  | "backend_engineer"
  | "product_manager"
  | "ux_researcher"
  | "ui_designer"
  | "ux_designer"
  | "qa_engineer"
  | "audit_manager";

export interface StepExamplesConfig {
  label: string;
  items: string[];
  type?: "chips" | "text";
}

export interface RoleStepExamples {
  displayName: string;
  keywords: string[]; // Used for fuzzy matching user input
  steps: {
    task_intent?: StepExamplesConfig;
    context?: StepExamplesConfig;
    constraints?: StepExamplesConfig;
    disallowed_content?: StepExamplesConfig;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_STEP_EXAMPLES: Record<RoleKey, RoleStepExamples> = {
  // ─────────────────────────────────────────────────────────────────────────
  // ENTREPRENEUR
  // ─────────────────────────────────────────────────────────────────────────
  entrepreneur: {
    displayName: "Entrepreneur",
    keywords: [
      "entrepreneur",
      "founder",
      "startup",
      "ceo",
      "business owner",
      "co-founder",
      "solopreneur",
      "indie hacker",
    ],
    steps: {
      task_intent: {
        label: "Entrepreneur tasks",
        items: [
          "Write a compelling pitch deck narrative for seed funding",
          "Draft a cold email to a VC partner at Sequoia",
          "Generate 10 product name ideas for my SaaS",
          "Create a competitive analysis framework",
          "Write customer interview questions to validate my idea",
          "Draft a product launch announcement for LinkedIn",
        ],
      },
      context: {
        label: "Include business context like",
        items: [
          "Your startup stage (idea/MVP/growth)",
          "Target market and customer segment",
          "Current traction (users, revenue, growth)",
          "Funding status and goals",
          "Your unique value proposition",
        ],
      },
      constraints: {
        label: "Business constraints",
        items: [
          "Focus on ROI and business outcomes",
          "Use data-driven language with metrics",
          "Be concise - busy investors have limited time",
          "Include a clear call-to-action",
          "Avoid buzzwords, focus on substance",
        ],
      },
      disallowed_content: {
        label: "Avoid in business communication",
        items: [
          "Don't make unsubstantiated claims",
          "Avoid vague projections without data",
          "Don't sound desperate or pushy",
          "Avoid jargon that obscures meaning",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FRONTEND ENGINEER
  // ─────────────────────────────────────────────────────────────────────────
  frontend_engineer: {
    displayName: "Senior Principal Engineer (Frontend)",
    keywords: [
      "frontend",
      "front-end",
      "front end",
      "react",
      "vue",
      "angular",
      "typescript",
      "javascript",
      "ui engineer",
      "web developer",
      "staff engineer",
      "principal engineer",
    ],
    steps: {
      task_intent: {
        label: "Frontend engineering tasks",
        items: [
          "Design a scalable component architecture for a design system",
          "Write constructive code review feedback for a PR",
          "Create a performance optimization plan for Core Web Vitals",
          "Draft an accessibility audit checklist for WCAG 2.1 AA",
          "Write a migration strategy from Class to Hooks",
          "Create a technical RFC for state management approach",
        ],
      },
      context: {
        label: "Include technical context like",
        items: [
          "Tech stack (React/Vue/Angular, TS version)",
          "Team size and experience levels",
          "Legacy code constraints or dependencies",
          "Performance budgets and requirements",
          "Browser/device support requirements",
        ],
      },
      constraints: {
        label: "Engineering constraints",
        items: [
          "Follow React/Vue best practices and patterns",
          "Ensure accessibility (a11y) compliance",
          "Optimize for Core Web Vitals (LCP, CLS, INP)",
          "Include TypeScript types and interfaces",
          "Consider bundle size and tree-shaking",
        ],
      },
      disallowed_content: {
        label: "Avoid in technical docs",
        items: [
          "Don't suggest deprecated APIs or patterns",
          "Avoid vendor-specific solutions without alternatives",
          "Don't ignore browser compatibility concerns",
          "Avoid premature optimization suggestions",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BACKEND ENGINEER
  // ─────────────────────────────────────────────────────────────────────────
  backend_engineer: {
    displayName: "Senior Principal Engineer (Backend)",
    keywords: [
      "backend",
      "back-end",
      "back end",
      "server",
      "api",
      "database",
      "distributed systems",
      "microservices",
      "platform engineer",
      "infrastructure",
      "devops",
      "sre",
    ],
    steps: {
      task_intent: {
        label: "Backend engineering tasks",
        items: [
          "Design a REST API schema for a user management service",
          "Create a database schema optimization plan",
          "Write a system architecture proposal for 10x scale",
          "Draft a security review checklist for the API layer",
          "Create an incident postmortem template",
          "Design a caching strategy to reduce database load",
        ],
      },
      context: {
        label: "Include infrastructure context like",
        items: [
          "Current scale (requests/sec, data volume)",
          "Tech stack (language, framework, database)",
          "Cloud provider and services used",
          "SLA requirements and uptime targets",
          "Team structure and on-call rotation",
        ],
      },
      constraints: {
        label: "Infrastructure constraints",
        items: [
          "Design for horizontal scalability",
          "Include error handling and retry logic",
          "Consider idempotency for critical operations",
          "Follow security best practices (OWASP)",
          "Include monitoring and observability hooks",
        ],
      },
      disallowed_content: {
        label: "Avoid in system design",
        items: [
          "Don't ignore failure modes and edge cases",
          "Avoid single points of failure",
          "Don't skip security considerations",
          "Avoid premature microservice decomposition",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCT MANAGER
  // ─────────────────────────────────────────────────────────────────────────
  product_manager: {
    displayName: "Product Manager",
    keywords: [
      "product manager",
      "pm",
      "product owner",
      "product lead",
      "product director",
      "apm",
      "associate product manager",
      "group pm",
    ],
    steps: {
      task_intent: {
        label: "Product management tasks",
        items: [
          "Write a PRD for a new feature launch",
          "Create user stories with acceptance criteria",
          "Build a feature prioritization matrix using RICE",
          "Draft a stakeholder update email for executives",
          "Create a competitive analysis document",
          "Define OKRs for the next quarter",
        ],
      },
      context: {
        label: "Include product context like",
        items: [
          "Product stage (0→1, growth, mature)",
          "Target user persona and segment",
          "Current metrics and success criteria",
          "Stakeholder landscape and dependencies",
          "Competitive positioning",
        ],
      },
      constraints: {
        label: "Product constraints",
        items: [
          "Focus on measurable outcomes and metrics",
          "Use clear, jargon-free language",
          "Include success criteria and KPIs",
          "Consider technical feasibility constraints",
          "Align with company strategy and OKRs",
        ],
      },
      disallowed_content: {
        label: "Avoid in product docs",
        items: [
          "Don't use vague or unmeasurable goals",
          "Avoid solution-first thinking without problem context",
          "Don't skip user research or validation",
          "Avoid scope creep without clear rationale",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UX RESEARCHER
  // ─────────────────────────────────────────────────────────────────────────
  ux_researcher: {
    displayName: "UX Researcher",
    keywords: [
      "ux researcher",
      "user researcher",
      "research",
      "usability",
      "user research",
      "research ops",
      "qualitative",
      "quantitative",
    ],
    steps: {
      task_intent: {
        label: "Research tasks",
        items: [
          "Create a research plan for a new feature discovery",
          "Write a moderated interview script",
          "Design survey questions for NPS follow-up",
          "Synthesize findings from 10 user interviews",
          "Create a persona based on research data",
          "Map the end-to-end customer journey",
        ],
      },
      context: {
        label: "Include research context like",
        items: [
          "Research methodology (qual/quant/mixed)",
          "Participant criteria and sample size",
          "Research questions and hypotheses",
          "Timeline and resource constraints",
          "Stakeholder needs and decisions to inform",
        ],
      },
      constraints: {
        label: "Research quality constraints",
        items: [
          "Use unbiased, non-leading questions",
          "Ensure reproducibility of methods",
          "Include participant consent and ethics",
          "Separate observations from interpretations",
          "Triangulate findings with multiple sources",
        ],
      },
      disallowed_content: {
        label: "Avoid in research",
        items: [
          "Don't use leading or biased questions",
          "Avoid confirmation bias in synthesis",
          "Don't overgeneralize from small samples",
          "Avoid mixing opinion with evidence",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UI DESIGNER
  // ─────────────────────────────────────────────────────────────────────────
  ui_designer: {
    displayName: "UI Designer",
    keywords: [
      "ui designer",
      "visual designer",
      "ui/ux",
      "graphic designer",
      "design system",
      "figma",
      "sketch",
      "visual design",
    ],
    steps: {
      task_intent: {
        label: "UI design tasks",
        items: [
          "Document a design system component specification",
          "Write design token definitions (colors, spacing)",
          "Create a design critique request for feedback",
          "Analyze color contrast ratios for accessibility",
          "Describe micro-interaction patterns for a button",
          "Write developer handoff notes for a component",
        ],
      },
      context: {
        label: "Include design context like",
        items: [
          "Brand guidelines and visual identity",
          "Platform constraints (web, iOS, Android)",
          "Design system maturity and components",
          "Accessibility requirements (WCAG level)",
          "Target devices and screen sizes",
        ],
      },
      constraints: {
        label: "Design constraints",
        items: [
          "Ensure WCAG 2.1 AA color contrast (4.5:1)",
          "Maintain consistency with design system",
          "Design for responsive breakpoints",
          "Include hover, focus, and active states",
          "Consider dark mode variants",
        ],
      },
      disallowed_content: {
        label: "Avoid in design specs",
        items: [
          "Don't use arbitrary values (use tokens)",
          "Avoid inaccessible color combinations",
          "Don't skip interaction states",
          "Avoid platform-inconsistent patterns",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UX DESIGNER
  // ─────────────────────────────────────────────────────────────────────────
  ux_designer: {
    displayName: "UX Designer",
    keywords: [
      "ux designer",
      "experience designer",
      "interaction designer",
      "product designer",
      "ux/ui",
      "user experience",
    ],
    steps: {
      task_intent: {
        label: "UX design tasks",
        items: [
          "Document a user flow for checkout process",
          "Write wireframe annotations for a landing page",
          "Evaluate a design using Nielsen's 10 heuristics",
          "Create an A/B test hypothesis for a feature",
          "Define information architecture for a dashboard",
          "Write design rationale for a UX decision",
        ],
      },
      context: {
        label: "Include UX context like",
        items: [
          "User research insights and personas",
          "Current pain points and friction areas",
          "Business goals and success metrics",
          "Technical constraints and limitations",
          "Competitive landscape and benchmarks",
        ],
      },
      constraints: {
        label: "UX constraints",
        items: [
          "Design for user mental models",
          "Minimize cognitive load and friction",
          "Follow progressive disclosure principles",
          "Ensure clear feedback and affordances",
          "Consider error prevention and recovery",
        ],
      },
      disallowed_content: {
        label: "Avoid in UX work",
        items: [
          "Don't design without user context",
          "Avoid dark patterns or manipulative UX",
          "Don't ignore accessibility needs",
          "Avoid assumptions without validation",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // QA ENGINEER
  // ─────────────────────────────────────────────────────────────────────────
  qa_engineer: {
    displayName: "Senior Principal Quality Assurance",
    keywords: [
      "qa",
      "quality assurance",
      "tester",
      "test engineer",
      "sdet",
      "automation",
      "testing",
      "quality engineer",
    ],
    steps: {
      task_intent: {
        label: "QA tasks",
        items: [
          "Create a comprehensive test plan for a feature",
          "Generate test cases for edge cases and boundaries",
          "Write a clear, reproducible bug report",
          "Design a regression test strategy",
          "Create API test scenarios for an endpoint",
          "Define performance testing requirements",
        ],
      },
      context: {
        label: "Include testing context like",
        items: [
          "Feature requirements and acceptance criteria",
          "Risk areas and critical user paths",
          "Test environment and data requirements",
          "Automation framework and coverage",
          "Release timeline and testing windows",
        ],
      },
      constraints: {
        label: "Testing constraints",
        items: [
          "Tests must be reproducible and deterministic",
          "Include preconditions and expected results",
          "Cover positive, negative, and edge cases",
          "Prioritize based on risk and impact",
          "Include clear pass/fail criteria",
        ],
      },
      disallowed_content: {
        label: "Avoid in test documentation",
        items: [
          "Don't write ambiguous test steps",
          "Avoid environment-dependent tests",
          "Don't skip expected results",
          "Avoid test cases that can't be automated",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT MANAGER
  // ─────────────────────────────────────────────────────────────────────────
  audit_manager: {
    displayName: "Senior Audit Manager (Internal)",
    keywords: [
      "audit",
      "auditor",
      "internal audit",
      "compliance",
      "risk",
      "sox",
      "controls",
      "assurance",
      "governance",
    ],
    steps: {
      task_intent: {
        label: "Audit tasks",
        items: [
          "Develop an audit plan for IT general controls",
          "Create a risk assessment matrix for a process",
          "Draft a compliance checklist for SOX 404",
          "Write audit findings with recommendations",
          "Design control testing procedures",
          "Draft a management response for findings",
        ],
      },
      context: {
        label: "Include audit context like",
        items: [
          "Audit scope and objectives",
          "Regulatory requirements (SOX, GDPR, ISO)",
          "Control framework (COSO, COBIT)",
          "Prior audit findings and status",
          "Risk appetite and materiality thresholds",
        ],
      },
      constraints: {
        label: "Audit constraints",
        items: [
          "Base findings on evidence and documentation",
          "Use clear severity/priority classifications",
          "Include root cause analysis",
          "Provide actionable recommendations",
          "Reference applicable standards and regulations",
        ],
      },
      disallowed_content: {
        label: "Avoid in audit work",
        items: [
          "Don't include subjective opinions without evidence",
          "Avoid vague or unmeasurable recommendations",
          "Don't skip management response requirements",
          "Avoid scope creep without approval",
        ],
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ROLE DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect which role category a user's role input matches
 * Uses fuzzy keyword matching (case-insensitive, partial match)
 *
 * @param userRole - The role entered by the user (ai_role field)
 * @returns The matched RoleKey or null if no match
 */
export function detectRole(userRole: string): RoleKey | null {
  if (!userRole || userRole.trim().length === 0) {
    return null;
  }

  const normalizedInput = userRole.toLowerCase().trim();

  // Check each role's keywords
  for (const [roleKey, roleConfig] of Object.entries(ROLE_STEP_EXAMPLES)) {
    for (const keyword of roleConfig.keywords) {
      // Fuzzy match: check if keyword is contained in input OR input contains keyword
      if (
        normalizedInput.includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(normalizedInput)
      ) {
        return roleKey as RoleKey;
      }
    }
  }

  return null;
}

/**
 * Get step examples for a specific role and field
 * Falls back to null if no role-specific examples exist
 *
 * @param role - The detected role key
 * @param field - The step field (task_intent, context, etc.)
 * @returns StepExamplesConfig or null
 */
export function getRoleStepExamples(
  role: RoleKey | null,
  field: keyof RoleStepExamples["steps"]
): StepExamplesConfig | null {
  if (!role) return null;

  const roleConfig = ROLE_STEP_EXAMPLES[role];
  if (!roleConfig) return null;

  return roleConfig.steps[field] || null;
}

/**
 * Get the display name for a role
 */
export function getRoleDisplayName(role: RoleKey | null): string | null {
  if (!role) return null;
  return ROLE_STEP_EXAMPLES[role]?.displayName || null;
}
