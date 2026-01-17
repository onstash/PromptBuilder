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
  id?: string;
  title?: string;
  description?: string;
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
  entrepreneur: {
    displayName: "Entrepreneur",
    keywords: [
      "entrepreneur",
      "founder",
      "startup",
      "business owner",
      "solopreneur",
      "indie hacker",
    ],
    steps: {
      task_intent: {
        label: "Entrepreneurial tasks",
        items: [
          "Define a clear problem–solution narrative for a new venture",
          "Create a simple business model and revenue hypothesis",
          "Draft customer discovery interview questions",
          "Outline a go-to-market strategy for early adopters",
        ],
      },
      context: {
        label: "Include venture context like",
        items: [
          "Stage of the business (idea, MVP, early traction)",
          "Target customer segment and core pain points",
          "Available resources (time, capital, team)",
          "Primary success metric for the next 90 days",
        ],
      },
      constraints: {
        label: "Entrepreneurial constraints",
        items: [
          "Assume limited resources and high uncertainty",
          "Prioritize learning speed over perfection",
          "Focus on customer value, not features",
          "State assumptions explicitly",
        ],
      },
      disallowed_content: {
        label: "Avoid in entrepreneurial outputs",
        items: [
          "Unvalidated market size claims",
          "Buzzwords without operational meaning",
          "Long-term projections presented as certainty",
        ],
      },
    },
  },
  frontend_engineer: {
    displayName: "Frontend Engineer",
    keywords: ["frontend", "react", "vue", "angular", "typescript", "ui engineer"],
    steps: {
      task_intent: {
        label: "Frontend tasks",
        items: [
          "Design a reusable component API",
          "Refactor a UI for better performance and readability",
          "Audit accessibility issues in an existing interface",
          "Write a frontend-focused technical design note",
        ],
      },
      context: {
        label: "Include frontend context like",
        items: [
          "Framework and version",
          "Design system or UI library used",
          "Supported browsers and devices",
          "Performance or accessibility requirements",
        ],
      },
      constraints: {
        label: "Frontend constraints",
        items: [
          "Follow established framework conventions",
          "Ensure accessibility by default",
          "Optimize for maintainability",
          "Avoid unnecessary abstractions",
        ],
      },
      disallowed_content: {
        label: "Avoid in frontend work",
        items: [
          "Deprecated APIs or patterns",
          "Hard-coded visual values instead of tokens",
          "Ignoring keyboard and screen-reader users",
        ],
      },
    },
  },
  backend_engineer: {
    displayName: "Backend Engineer",
    keywords: ["backend", "api", "server", "database", "distributed systems"],
    steps: {
      task_intent: {
        label: "Backend tasks",
        items: [
          "Design an API contract for a new service",
          "Model data schemas with scalability in mind",
          "Propose an error-handling and retry strategy",
          "Document a backend service architecture",
        ],
      },
      context: {
        label: "Include backend context like",
        items: [
          "Expected traffic and data volume",
          "Language, framework, and database",
          "Security and compliance requirements",
          "Deployment and infrastructure model",
        ],
      },
      constraints: {
        label: "Backend constraints",
        items: [
          "Design for failure and recovery",
          "Ensure data consistency and integrity",
          "Follow security best practices",
          "Keep interfaces explicit and versioned",
        ],
      },
      disallowed_content: {
        label: "Avoid in backend design",
        items: [
          "Single points of failure",
          "Implicit contracts or undocumented behavior",
          "Ignoring observability and monitoring",
        ],
      },
    },
  },
  product_manager: {
    displayName: "Product Manager",
    keywords: ["product manager", "pm", "product owner"],
    steps: {
      task_intent: {
        label: "Product tasks",
        items: [
          "Define a problem statement and success metrics",
          "Write a concise PRD",
          "Prioritize features based on impact and effort",
          "Align stakeholders around a product decision",
        ],
      },
      context: {
        label: "Include product context like",
        items: [
          "User persona and core job-to-be-done",
          "Business objectives",
          "Current product maturity",
          "Known technical constraints",
        ],
      },
      constraints: {
        label: "Product constraints",
        items: [
          "Problem-first, not solution-first",
          "Measurable outcomes only",
          "Clear assumptions and risks",
          "Alignment with company strategy",
        ],
      },
      disallowed_content: {
        label: "Avoid in product artifacts",
        items: ["Vague goals", "Unprioritized feature lists", "Ignoring user evidence"],
      },
    },
  },
  ux_researcher: {
    displayName: "UX Researcher",
    keywords: ["ux researcher", "user research", "usability"],
    steps: {
      task_intent: {
        label: "Research tasks",
        items: [
          "Design a qualitative interview study",
          "Synthesize research findings into insights",
          "Create personas grounded in data",
          "Evaluate usability issues from testing",
        ],
      },
      context: {
        label: "Include research context like",
        items: [
          "Research goals and hypotheses",
          "Participant profile",
          "Methodology used",
          "Decisions the research should inform",
        ],
      },
      constraints: {
        label: "Research constraints",
        items: [
          "Avoid leading questions",
          "Separate observation from interpretation",
          "Acknowledge sample limitations",
          "Ensure ethical considerations",
        ],
      },
      disallowed_content: {
        label: "Avoid in research outputs",
        items: ["Overgeneralization", "Confirmation bias", "Mixing opinion with evidence"],
      },
    },
  },
  ui_designer: {
    displayName: "UI Designer",
    keywords: ["ui designer", "visual designer", "design system"],
    steps: {
      task_intent: {
        label: "UI design tasks",
        items: [
          "Specify visual styles for a component",
          "Document design tokens",
          "Review UI for visual consistency",
          "Prepare developer handoff notes",
        ],
      },
      context: {
        label: "Include UI context like",
        items: [
          "Brand guidelines",
          "Platform and screen sizes",
          "Existing design system",
          "Accessibility requirements",
        ],
      },
      constraints: {
        label: "UI constraints",
        items: [
          "Consistency over novelty",
          "Accessible color contrast",
          "Responsive behavior defined",
          "Clear interaction states",
        ],
      },
      disallowed_content: {
        label: "Avoid in UI specs",
        items: ["Arbitrary visual values", "Missing states", "Inaccessible color usage"],
      },
    },
  },
  ux_designer: {
    displayName: "UX Designer",
    keywords: ["ux designer", "interaction designer", "product designer"],
    steps: {
      task_intent: {
        label: "UX design tasks",
        items: [
          "Create end-to-end user flows",
          "Define information architecture",
          "Evaluate usability against heuristics",
          "Explain rationale behind UX decisions",
        ],
      },
      context: {
        label: "Include UX context like",
        items: [
          "User needs and pain points",
          "Business goals",
          "Technical constraints",
          "Research insights",
        ],
      },
      constraints: {
        label: "UX constraints",
        items: [
          "Minimize cognitive load",
          "Match user mental models",
          "Prevent and recover from errors",
          "Provide clear feedback",
        ],
      },
      disallowed_content: {
        label: "Avoid in UX work",
        items: ["Dark patterns", "Assumptions without validation", "Ignoring accessibility"],
      },
    },
  },
  qa_engineer: {
    displayName: "QA Engineer",
    keywords: ["qa", "tester", "quality assurance"],
    steps: {
      task_intent: {
        label: "QA tasks",
        items: [
          "Write test cases for a new feature",
          "Design regression test coverage",
          "Create a reproducible bug report",
          "Assess risk areas before release",
        ],
      },
      context: {
        label: "Include QA context like",
        items: [
          "Requirements and acceptance criteria",
          "Critical user paths",
          "Test environment",
          "Release timeline",
        ],
      },
      constraints: {
        label: "QA constraints",
        items: [
          "Tests must be deterministic",
          "Clear expected results",
          "Risk-based prioritization",
          "Automation where feasible",
        ],
      },
      disallowed_content: {
        label: "Avoid in QA artifacts",
        items: [
          "Ambiguous steps",
          "Missing expected outcomes",
          "Environment-dependent assumptions",
        ],
      },
    },
  },
  audit_manager: {
    displayName: "Audit Manager",
    keywords: ["audit", "internal audit", "compliance", "risk management"],
    steps: {
      task_intent: {
        label: "Audit tasks",
        items: [
          "Define audit scope and objectives",
          "Perform risk assessment for a process",
          "Document audit findings",
          "Recommend control improvements",
        ],
      },
      context: {
        label: "Include audit context like",
        items: [
          "Applicable regulations or standards",
          "Process and system scope",
          "Prior audit results",
          "Risk appetite",
        ],
      },
      constraints: {
        label: "Audit constraints",
        items: [
          "Evidence-based conclusions",
          "Clear severity classification",
          "Actionable recommendations",
          "Traceability to standards",
        ],
      },
      disallowed_content: {
        label: "Avoid in audit outputs",
        items: [
          "Subjective opinions without evidence",
          "Vague recommendations",
          "Unapproved scope expansion",
        ],
      },
    },
  },
};

export const ROLE_STEP_EXAMPLES_v2: Record<RoleKey, RoleStepExamples[]> = {
  entrepreneur: [
    {
      id: "entrepreneur-basic",
      title: "Business Validation",
      description: "Validate a new business idea",
      displayName: "Entrepreneur",
      keywords: ["entrepreneur", "founder", "startup"],
      steps: {
        task_intent: {
          label: "Entrepreneur tasks",
          items: [
            "Validate a business idea using first-principles",
            "Design a lean go-to-market strategy",
          ],
        },
        context: {
          label: "Business context",
          items: ["Stage of startup", "Target customer and problem severity"],
        },
        constraints: {
          label: "Constraints",
          items: ["Limited capital and time", "High uncertainty"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Unvalidated assumptions", "Buzzwords without evidence"],
        },
      },
    },
    {
      id: "entrepreneur-pitch",
      title: "Pitch Deck",
      description: "Create a seed stage pitch deck",
      displayName: "Entrepreneur",
      keywords: ["entrepreneur", "founder", "startup", "fundraising"],
      steps: {
        task_intent: {
          label: "Entrepreneur tasks",
          items: [
            "Create a 10-slide pitch deck for seed investors",
            "Refine the narrative for a demo day presentation",
          ],
        },
        context: {
          label: "Business context",
          items: ["Seeking $500k-$1M seed", "Pre-revenue but with prototype"],
        },
        constraints: {
          label: "Constraints",
          items: ["Compelling storytelling", "Clear ask and use of funds"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Wall of text slides", "Unrealistic financial projections"],
        },
      },
    },
    {
      id: "entrepreneur-hiring",
      title: "Hiring Plan",
      description: "Define hiring strategy & values",
      displayName: "Entrepreneur",
      keywords: ["entrepreneur", "founder", "hiring", "team"],
      steps: {
        task_intent: {
          label: "Entrepreneur tasks",
          items: [
            "Define the first 5 key hires for the founding team",
            "Draft a culture code and core values document",
          ],
        },
        context: {
          label: "Business context",
          items: ["Scaling from founders to team", "Remote-first culture"],
        },
        constraints: {
          label: "Constraints",
          items: ["Equity vs cash compensation mix", "Cultural fit over pure skill"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Corporate HR jargon", "Generic job descriptions"],
        },
      },
    },
  ],
  frontend_engineer: [
    {
      id: "frontend-component",
      title: "Component Design",
      description: "Design a reusable UI component",
      displayName: "Frontend Engineer",
      keywords: ["frontend", "react", "typescript"],
      steps: {
        task_intent: {
          label: "Frontend tasks",
          items: ["Design a reusable UI component", "Optimize rendering performance"],
        },
        context: {
          label: "Technical context",
          items: ["Framework and version", "Browser support requirements"],
        },
        constraints: {
          label: "Constraints",
          items: ["Accessibility compliance", "Maintainability"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Deprecated APIs", "Hard-coded styles"],
        },
      },
    },
    {
      id: "frontend-perf",
      title: "Performance",
      description: "Optimize Core Web Vitals",
      displayName: "Frontend Engineer",
      keywords: ["frontend", "performance", "optimization"],
      steps: {
        task_intent: {
          label: "Frontend tasks",
          items: [
            "Optimize LCP and CLS for a marketing landing page",
            "Implement code-splitting and lazy loading",
          ],
        },
        context: {
          label: "Technical context",
          items: ["High mobile traffic", "React/Next.js stack"],
        },
        constraints: {
          label: "Constraints",
          items: ["Maintain functionality", "Don't regress SEO"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Premature optimization", "Breaking user tracking"],
        },
      },
    },
    {
      id: "frontend-a11y",
      title: "Accessibility",
      description: "Audit and fix WCAG issues",
      displayName: "Frontend Engineer",
      keywords: ["frontend", "accessibility", "a11y"],
      steps: {
        task_intent: {
          label: "Frontend tasks",
          items: [
            "Audit a complex form for WCAG 2.1 AA compliance",
            "Implement keyboard navigation support",
          ],
        },
        context: {
          label: "Technical context",
          items: ["Government or public sector requirements", "Screen reader support"],
        },
        constraints: {
          label: "Constraints",
          items: ["Semantic HTML", "ARIA only when necessary"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["div-button soup", "Positive tabindex"],
        },
      },
    },
  ],
  backend_engineer: [
    {
      id: "backend-api",
      title: "API Design",
      description: "Design a robust REST API",
      displayName: "Backend Engineer",
      keywords: ["backend", "api", "database"],
      steps: {
        task_intent: {
          label: "Backend tasks",
          items: ["Design a REST API", "Plan database schema evolution"],
        },
        context: {
          label: "System context",
          items: ["Expected load", "Data consistency needs"],
        },
        constraints: {
          label: "Constraints",
          items: ["Scalability", "Security best practices"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Single points of failure", "Undocumented behavior"],
        },
      },
    },
    {
      id: "backend-migration",
      title: "DB Migration",
      description: "Plan zero-downtime migration",
      displayName: "Backend Engineer",
      keywords: ["backend", "database", "migration", "sql"],
      steps: {
        task_intent: {
          label: "Backend tasks",
          items: [
            "Plan a zero-downtime schema migration for a large table",
            "Migrate data from legacy SQL to NoSQL store",
          ],
        },
        context: {
          label: "System context",
          items: ["Production system with active users", "Postgres 14"],
        },
        constraints: {
          label: "Constraints",
          items: ["No maintenance window", "Data integrity verification"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Table locks during peak hours", "Data loss risks"],
        },
      },
    },
    {
      id: "backend-microservices",
      title: "Microservices",
      description: "Design event-driven arch",
      displayName: "Backend Engineer",
      keywords: ["backend", "architecture", "microservices"],
      steps: {
        task_intent: {
          label: "Backend tasks",
          items: [
            "Design an event-driven architecture for order processing",
            "Define service boundaries and communication patterns",
          ],
        },
        context: {
          label: "System context",
          items: ["High decoupling needed", "Kafka/RabbitMQ"],
        },
        constraints: {
          label: "Constraints",
          items: ["Idempotency", "Eventual consistency handling"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Distributed monolith", "Tight coupling"],
        },
      },
    },
  ],
  product_manager: [
    {
      id: "pm-prd",
      title: "PRD Writing",
      description: "Create a Product Requirements Document",
      displayName: "Product Manager",
      keywords: ["product manager", "pm"],
      steps: {
        task_intent: {
          label: "Product tasks",
          items: ["Define problem statements", "Write a PRD"],
        },
        context: {
          label: "Product context",
          items: ["User persona", "Business goals"],
        },
        constraints: {
          label: "Constraints",
          items: ["Measurable outcomes", "Stakeholder alignment"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Vague success metrics", "Solution-first thinking"],
        },
      },
    },
    {
      id: "pm-launch",
      title: "Feature Launch",
      description: "Go-to-market strategy",
      displayName: "Product Manager",
      keywords: ["product manager", "go-to-market", "launch"],
      steps: {
        task_intent: {
          label: "Product tasks",
          items: [
            "Plan a GTM strategy for a major feature release",
            "Coordinate cross-functional launch activities",
          ],
        },
        context: {
          label: "Product context",
          items: ["B2B SaaS product", "Competitive market"],
        },
        constraints: {
          label: "Constraints",
          items: ["Clear value proposition", "Sales enablement"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Ignoring existing customers", "Technical jargon"],
        },
      },
    },
    {
      id: "pm-internal",
      title: "Internal Tools",
      description: "Design admin dashboard",
      displayName: "Product Manager",
      keywords: ["product manager", "internal tools", "operations"],
      steps: {
        task_intent: {
          label: "Product tasks",
          items: [
            "Design an internal admin dashboard for support agents",
            "Streamline manual operational workflows",
          ],
        },
        context: {
          label: "Product context",
          items: ["Efficiency focus", "Low training overhead"],
        },
        constraints: {
          label: "Constraints",
          items: ["High utility", "Fast data access"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Fancy UI over function", "Complex navigation"],
        },
      },
    },
  ],
  ux_researcher: [
    {
      id: "ux-research-plan",
      title: "Research Plan",
      description: "Plan user interviews and testing",
      displayName: "UX Researcher",
      keywords: ["ux research", "usability"],
      steps: {
        task_intent: {
          label: "Research tasks",
          items: ["Plan user interviews", "Synthesize qualitative insights"],
        },
        context: {
          label: "Research context",
          items: ["Research goals", "Participant profile"],
        },
        constraints: {
          label: "Constraints",
          items: ["Unbiased questioning", "Clear separation of data and interpretation"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Confirmation bias", "Overgeneralization"],
        },
      },
    },
    {
      id: "ux-usability",
      title: "Usability Test",
      description: "Moderated test script",
      displayName: "UX Researcher",
      keywords: ["ux research", "usability testing"],
      steps: {
        task_intent: {
          label: "Research tasks",
          items: [
            "Write a script for moderated usability testing",
            "Define tasks for unmoderated testing",
          ],
        },
        context: {
          label: "Research context",
          items: ["New checkout flow", "Mobile app interface"],
        },
        constraints: {
          label: "Constraints",
          items: ["Scenario-based tasks", "Think-aloud protocol"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Leading the witness", "Helping too much"],
        },
      },
    },
    {
      id: "ux-persona",
      title: "Persona Building",
      description: "Create data-driven personas",
      displayName: "UX Researcher",
      keywords: ["ux research", "personas"],
      steps: {
        task_intent: {
          label: "Research tasks",
          items: [
            "Create user personas based on interview transcripts",
            "Map user journeys and pain points",
          ],
        },
        context: {
          label: "Research context",
          items: ["Synthesizing 20+ interviews", "B2C fitness app"],
        },
        constraints: {
          label: "Constraints",
          items: ["Rooted in real behavior", "Actionable for design"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Stereotypes", "Marketing fluff"],
        },
      },
    },
  ],
  ui_designer: [
    {
      id: "ui-design-tokens",
      title: "Design Tokens",
      description: "Define visual styles and tokens",
      displayName: "UI Designer",
      keywords: ["ui designer", "visual design"],
      steps: {
        task_intent: {
          label: "UI tasks",
          items: ["Define component visuals", "Document design tokens"],
        },
        context: {
          label: "Design context",
          items: ["Brand guidelines", "Platform constraints"],
        },
        constraints: {
          label: "Constraints",
          items: ["Visual consistency", "Accessibility contrast"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Arbitrary spacing values", "Missing interaction states"],
        },
      },
    },
    {
      id: "ui-responsive",
      title: "Responsive Layout",
      description: "Design adaptive layouts",
      displayName: "UI Designer",
      keywords: ["ui designer", "responsive", "mobile"],
      steps: {
        task_intent: {
          label: "UI tasks",
          items: [
            "Design a responsive dashboard for tablet and mobile",
            "Define breakpoint behavior for grid layouts",
          ],
        },
        context: {
          label: "Design context",
          items: ["Complex data tables", "Touch vs mouse interaction"],
        },
        constraints: {
          label: "Constraints",
          items: ["Fluid typography", "Touch target sizing"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Hidden functionality on mobile", "Fixed widths"],
        },
      },
    },
    {
      id: "ui-darkmode",
      title: "Dark Mode",
      description: "Dark mode palette & guidelines",
      displayName: "UI Designer",
      keywords: ["ui designer", "dark mode", "theming"],
      steps: {
        task_intent: {
          label: "UI tasks",
          items: [
            "Create a semantic color palette for dark mode reference",
            "Audit existing components for dark mode compatibility",
          ],
        },
        context: {
          label: "Design context",
          items: ["OLED screens", "Accessibility contrast checking"],
        },
        constraints: {
          label: "Constraints",
          items: ["Reduced eye strain", "Preserve brand identity"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Pure black (#000000) backgrounds", "Saturated colors on dark"],
        },
      },
    },
  ],
  ux_designer: [
    {
      id: "ux-flows",
      title: "User Flows",
      description: "Design user flow diagrams",
      displayName: "UX Designer",
      keywords: ["ux designer", "interaction design"],
      steps: {
        task_intent: {
          label: "UX tasks",
          items: ["Design user flows", "Evaluate usability heuristics"],
        },
        context: {
          label: "UX context",
          items: ["User needs", "Business constraints"],
        },
        constraints: {
          label: "Constraints",
          items: ["Low cognitive load", "Clear feedback"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Dark patterns", "Assumptions without validation"],
        },
      },
    },
    {
      id: "ux-ia",
      title: "Info Architecture",
      description: "Structure site navigation",
      displayName: "UX Designer",
      keywords: ["ux designer", "ia", "navigation"],
      steps: {
        task_intent: {
          label: "UX tasks",
          items: [
            "Design the navigation structure for a complex e-commerce site",
            "Create a sitemap and hierarchy",
          ],
        },
        context: {
          label: "UX context",
          items: ["Large inventory", "Diverse user intent (browsing vs buying)"],
        },
        constraints: {
          label: "Constraints",
          items: ["Findability", "Scalable menu structure"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Deep nesting (>3 levels)", "Ambiguous labels"],
        },
      },
    },
    {
      id: "ux-onboarding",
      title: "Onboarding",
      description: "User activation flows",
      displayName: "UX Designer",
      keywords: ["ux designer", "onboarding", "growth"],
      steps: {
        task_intent: {
          label: "UX tasks",
          items: [
            "Design a friction-free onboarding flow for new users",
            "Plan concise tooltips for feature discovery",
          ],
        },
        context: {
          label: "UX context",
          items: ["SaaS productivity tool", "Minimizing time-to-value"],
        },
        constraints: {
          label: "Constraints",
          items: ["Progressive disclosure", "Skip option available"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Forced tutorials", "Front-loading configuration"],
        },
      },
    },
  ],
  qa_engineer: [
    {
      id: "qa-planning",
      title: "Test Planning",
      description: "Create comprehensive test plans",
      displayName: "QA Engineer",
      keywords: ["qa", "testing"],
      steps: {
        task_intent: {
          label: "QA tasks",
          items: ["Create test cases", "Write bug reports"],
        },
        context: {
          label: "Testing context",
          items: ["Acceptance criteria", "Test environment"],
        },
        constraints: {
          label: "Constraints",
          items: ["Reproducibility", "Clear expected results"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Ambiguous steps", "Missing expected outcomes"],
        },
      },
    },
    {
      id: "qa-automation",
      title: "Automation",
      description: "CI/CD test strategy",
      displayName: "QA Engineer",
      keywords: ["qa", "automation", "ci/cd"],
      steps: {
        task_intent: {
          label: "QA tasks",
          items: ["Define a test automation strategy for CI/CD", "Select tools for E2E testing"],
        },
        context: {
          label: "Testing context",
          items: ["Fast feedback loop", "Flaky test prevention"],
        },
        constraints: {
          label: "Constraints",
          items: ["Maintainable code", "Parallel execution"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Brittle selectors", "Testing implementation details"],
        },
      },
    },
    {
      id: "qa-security",
      title: "Security Testing",
      description: "Vulnerability scanning",
      displayName: "QA Engineer",
      keywords: ["qa", "security", "pentest"],
      steps: {
        task_intent: {
          label: "QA tasks",
          items: [
            "Create test cases for common security vulnerabilities (OWASP)",
            "Perform input validation testing",
          ],
        },
        context: {
          label: "Testing context",
          items: ["Public facing API", "Sensitive user data"],
        },
        constraints: {
          label: "Constraints",
          items: ["Authorization checks", "SQL injection prevention"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Testing in production", "Storing credentials in logs"],
        },
      },
    },
  ],
  audit_manager: [
    {
      id: "audit-risk",
      title: "Risk Assessment",
      description: "Perform audit risk assessment",
      displayName: "Audit Manager",
      keywords: ["audit", "compliance", "risk"],
      steps: {
        task_intent: {
          label: "Audit tasks",
          items: ["Perform risk assessment", "Draft audit findings"],
        },
        context: {
          label: "Audit context",
          items: ["Regulatory requirements", "Audit scope"],
        },
        constraints: {
          label: "Constraints",
          items: ["Evidence-based conclusions", "Traceability to standards"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Subjective opinions", "Unclear recommendations"],
        },
      },
    },
    {
      id: "audit-gdpr",
      title: "GDPR Compliance",
      description: "Data privacy audit",
      displayName: "Audit Manager",
      keywords: ["audit", "gdpr", "privacy"],
      steps: {
        task_intent: {
          label: "Audit tasks",
          items: [
            "Create a checklist for GDPR data privacy compliance",
            "Audit data retention policies",
          ],
        },
        context: {
          label: "Audit context",
          items: ["EU customer base", "Right to be forgotten"],
        },
        constraints: {
          label: "Constraints",
          items: ["Verify consent logs", "Data flow mapping"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Assuming compliance", "Ignoring processors"],
        },
      },
    },
    {
      id: "audit-vendor",
      title: "Vendor Audit",
      description: "Third-party risk review",
      displayName: "Audit Manager",
      keywords: ["audit", "vendor", "security"],
      steps: {
        task_intent: {
          label: "Audit tasks",
          items: ["Evaluate third-party vendor security controls", "Review SOC 2 reports"],
        },
        context: {
          label: "Audit context",
          items: ["SaaS supply chain", "Data sharing agreements"],
        },
        constraints: {
          label: "Constraints",
          items: ["Risk tiering", "Contractual obligations"],
        },
        disallowed_content: {
          label: "Avoid",
          items: ["Tick-box exercise", "Ignoring sub-processors"],
        },
      },
    },
  ],
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
  field: keyof RoleStepExamples["steps"],
  exampleId?: string
): StepExamplesConfig | null {
  if (!role) return null;

  // Try to get V2 scenarios first
  const v2Scenarios = ROLE_STEP_EXAMPLES_v2[role];

  // If specific example ID is requested, look for that exact match
  if (exampleId && v2Scenarios) {
    const specificScenario = v2Scenarios.find((s) => s.id === exampleId);
    if (specificScenario && specificScenario.steps[field]) {
      return specificScenario.steps[field]!;
    }
  }

  if (v2Scenarios && v2Scenarios.length > 0) {
    // Collect all items from all scenarios for this field
    const allItems = new Set<string>();
    let label = "";

    // 1. Add V1 items first (generic base)
    const v1Config = ROLE_STEP_EXAMPLES[role]?.steps[field];
    if (v1Config) {
      label = v1Config.label;
      v1Config.items.forEach((item) => allItems.add(item));
    }

    // 2. Add V2 scenario items
    v2Scenarios.forEach((scenario) => {
      const stepConfig = scenario.steps[field];
      if (stepConfig) {
        if (!label) label = stepConfig.label;
        stepConfig.items.forEach((item) => allItems.add(item));
      }
    });

    if (allItems.size > 0) {
      return {
        label: label || "Suggestions",
        items: Array.from(allItems),
        type: v1Config?.type,
      };
    }
  }

  // Fallback to V1 only
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
