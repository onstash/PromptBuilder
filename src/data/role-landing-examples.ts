import type { PromptWizardData } from "@/utils/prompt-wizard/schema";
import { compressPrompt } from "@/utils/prompt-wizard/url-compression";
import {
  Briefcase,
  Code,
  Database,
  LayoutDashboard,
  Search,
  Palette,
  Users,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROLE_STEP_EXAMPLES, type RoleKey } from "./role-step-examples";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RoleLandingExample {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  role: RoleKey;
  data: PromptWizardData;
  d: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE ICON MAPPING
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_ICONS: Record<RoleKey, LucideIcon> = {
  entrepreneur: Briefcase,
  frontend_engineer: Code,
  backend_engineer: Database,
  product_manager: LayoutDashboard,
  ux_researcher: Search,
  ui_designer: Palette,
  ux_designer: Users,
  qa_engineer: ShieldCheck,
  audit_manager: FileCheck,
};

export const ROLE_COLORS: Record<RoleKey, string> = {
  entrepreneur: "bg-primary",
  frontend_engineer: "bg-accent",
  backend_engineer: "bg-secondary",
  product_manager: "bg-primary",
  ux_researcher: "bg-accent",
  ui_designer: "bg-secondary",
  ux_designer: "bg-primary",
  qa_engineer: "bg-accent",
  audit_manager: "bg-secondary",
};

// ═══════════════════════════════════════════════════════════════════════════
// ROLE-BASED LANDING EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_LANDING_EXAMPLES_CORE: Omit<RoleLandingExample, "d">[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // ENTREPRENEUR
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "entrepreneur-pitch-deck",
    title: "Pitch Deck Narrative",
    description: "Create compelling story for seed funding",
    icon: ROLE_ICONS.entrepreneur,
    color: ROLE_COLORS.entrepreneur,
    role: "entrepreneur",
    data: {
      ai_role: "Entrepreneur with 10 years experience in SaaS fundraising",
      task_intent: "Write a compelling pitch deck narrative for seed funding",
      context:
        "Pre-seed SaaS startup, $50k ARR, 500 users, applying to YC. Target: $500k seed round.",
      examples: "",
      constraints:
        "Focus on ROI and business outcomes. Use data-driven language with metrics. Be concise - busy investors have limited time.",
      disallowed_content: "Avoid unsubstantiated claims or vague projections without data.",
      output_format: "bullet-list",
      reasoning_depth: "moderate",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FRONTEND ENGINEER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "frontend-component-arch",
    title: "Component Architecture",
    description: "Design scalable component structure",
    icon: ROLE_ICONS.frontend_engineer,
    color: ROLE_COLORS.frontend_engineer,
    role: "frontend_engineer",
    data: {
      ai_role: "Senior Principal Frontend Engineer with expertise in React and design systems",
      task_intent: "Design a scalable component architecture for a design system",
      context:
        "React 18, TypeScript 5, building component library for 50+ engineers. Need compound components pattern.",
      examples: "",
      constraints:
        "Follow React best practices. Ensure accessibility compliance. Optimize for Core Web Vitals. Include TypeScript types.",
      disallowed_content: "Don't suggest deprecated APIs or patterns.",
      output_format: "numbered-list",
      reasoning_depth: "thorough",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BACKEND ENGINEER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "backend-api-design",
    title: "API Design Review",
    description: "Evaluate REST/GraphQL schema",
    icon: ROLE_ICONS.backend_engineer,
    color: ROLE_COLORS.backend_engineer,
    role: "backend_engineer",
    data: {
      ai_role: "Senior Principal Backend Engineer specializing in distributed systems",
      task_intent: "Design a REST API schema for a user management service",
      context:
        "Node.js, PostgreSQL, handling 10k req/sec. Need to support OAuth, RBAC, and multi-tenancy.",
      examples: "",
      constraints:
        "Design for horizontal scalability. Include error handling and retry logic. Follow security best practices (OWASP).",
      disallowed_content: "Avoid single points of failure or ignoring security considerations.",
      output_format: "mixed",
      reasoning_depth: "thorough",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCT MANAGER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "pm-prd",
    title: "PRD Template",
    description: "Product requirements document",
    icon: ROLE_ICONS.product_manager,
    color: ROLE_COLORS.product_manager,
    role: "product_manager",
    data: {
      ai_role: "Senior Product Manager with 8 years experience in B2B SaaS",
      task_intent: "Write a PRD for a new feature launch",
      context:
        "Adding real-time collaboration to our SaaS product. Target: enterprise customers, 5k MAU impact.",
      examples: "",
      constraints:
        "Focus on measurable outcomes and metrics. Use clear, jargon-free language. Include success criteria and KPIs.",
      disallowed_content: "Don't use vague or unmeasurable goals.",
      output_format: "mixed",
      reasoning_depth: "moderate",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UX RESEARCHER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "ux-research-plan",
    title: "Research Plan",
    description: "Study design and methodology",
    icon: ROLE_ICONS.ux_researcher,
    color: ROLE_COLORS.ux_researcher,
    role: "ux_researcher",
    data: {
      ai_role: "Senior UX Researcher specializing in qualitative and quantitative methods",
      task_intent: "Create a research plan for a new feature discovery",
      context:
        "B2C mobile app, 100k users. Need to validate redesign hypothesis. Timeline: 3 weeks, 15 participants.",
      examples: "",
      constraints:
        "Use unbiased, non-leading questions. Ensure reproducibility of methods. Separate observations from interpretations.",
      disallowed_content: "Don't use leading or biased questions.",
      output_format: "mixed",
      reasoning_depth: "moderate",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UI DESIGNER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "ui-design-system",
    title: "Design System Docs",
    description: "Component documentation",
    icon: ROLE_ICONS.ui_designer,
    color: ROLE_COLORS.ui_designer,
    role: "ui_designer",
    data: {
      ai_role: "Senior UI Designer with expertise in design systems and accessibility",
      task_intent: "Document a design system component specification",
      context:
        "Building button component. Need to cover all states (hover, focus, active, disabled) and variants.",
      examples: "",
      constraints:
        "Ensure WCAG 2.1 AA color contrast (4.5:1). Maintain consistency with design system. Include hover, focus, and active states.",
      disallowed_content:
        "Don't use arbitrary values (use tokens). Avoid inaccessible color combinations.",
      output_format: "mixed",
      reasoning_depth: "thorough",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UX DESIGNER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "ux-user-flow",
    title: "User Flow",
    description: "Task completion mapping",
    icon: ROLE_ICONS.ux_designer,
    color: ROLE_COLORS.ux_designer,
    role: "ux_designer",
    data: {
      ai_role: "Senior UX Designer specializing in interaction design",
      task_intent: "Document a user flow for checkout process",
      context: "E-commerce site, optimize for mobile-first. Current drop-off: 65% at payment step.",
      examples: "",
      constraints:
        "Design for user mental models. Minimize cognitive load and friction. Ensure clear feedback and affordances.",
      disallowed_content:
        "Don't design without user context. Avoid dark patterns or manipulative UX.",
      output_format: "numbered-list",
      reasoning_depth: "moderate",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // QA ENGINEER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "qa-test-plan",
    title: "Test Plan",
    description: "Comprehensive testing strategy",
    icon: ROLE_ICONS.qa_engineer,
    color: ROLE_COLORS.qa_engineer,
    role: "qa_engineer",
    data: {
      ai_role: "Senior Principal Quality Assurance Engineer with automation expertise",
      task_intent: "Create a comprehensive test plan for a feature",
      context:
        "Payment processing feature, critical path. Need functional, integration, and security tests.",
      examples: "",
      constraints:
        "Tests must be reproducible and deterministic. Cover positive, negative, and edge cases. Prioritize based on risk and impact.",
      disallowed_content: "Don't write ambiguous test steps. Avoid environment-dependent tests.",
      output_format: "mixed",
      reasoning_depth: "thorough",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT MANAGER
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "audit-plan",
    title: "Audit Plan",
    description: "Engagement planning document",
    icon: ROLE_ICONS.audit_manager,
    color: ROLE_COLORS.audit_manager,
    role: "audit_manager",
    data: {
      ai_role: "Senior Audit Manager (Internal) with expertise in SOX compliance",
      task_intent: "Develop an audit plan for IT general controls",
      context:
        "Public company, SOX 404 compliance. Scope: access controls, change management, backup procedures.",
      examples: "",
      constraints:
        "Base findings on evidence and documentation. Use clear severity classifications. Provide actionable recommendations.",
      disallowed_content: "Don't include subjective opinions without evidence.",
      output_format: "mixed",
      reasoning_depth: "thorough",
      self_check: true,
      step: 1,
      updatedAt: Date.now(),
      finishedAt: -1,
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPRESS AND EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const ROLE_LANDING_EXAMPLES: RoleLandingExample[] = ROLE_LANDING_EXAMPLES_CORE.map(
  (example) => ({
    ...example,
    d: compressPrompt(example.data),
  })
);
