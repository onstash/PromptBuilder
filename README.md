# Prompt Builder AI 🚀

A wizard-based web app for building, analyzing, and sharing structured AI prompts.

## 🎯 Why & What Problems it Solves

Building effective AI prompts is challenging—users often forget key context, struggle with structure, or can't easily share their prompts. This tool solves these problems by:

- **Guided Structure**: 7-step wizard ensures comprehensive, well-formed prompts based on expert patterns.
- **AI Analysis**: Real-time feedback on your prompt's quality using detailed heuristics (powered by Gemini).
- **Persistent Sharing**: Create permanent, SEO-friendly URLs (`/prompts/act-as-expert...`) backed by a database.
- **Instant Preview**: Real-time formatted output shows exactly what the AI will receive.
- **Community Feedback**: Users can suggest new roles directly, driving the platform's evolution.

## 🏗️ Architecture

```mermaid
graph TB
    A[Landing Page] --> B[Prompt Wizard]
    B --> C[Local State + Form]
    B --> D[AI Analysis (Server Fn)]
    D --> E[Gemini Flash 2.5]
    B --> F[Finish & Save]
    F --> G[Convex DB]
    G --> H[Persistent URL /prompts/$slug]
    I[Legacy Share Link /share?d=...] --> J[Smart Migration Loader]
    J --> G
    J --> H

    style B fill:#a78bfa
    style G fill:#34d399,color:white
    style D fill:#fbbf24
```

**Flow**:

1.  **Create**: User fills the wizard; changes auto-saved to localStorage.
2.  **Analyze**: AI evaluates prompt quality and suggests improvements.
3.  **Share**: Clicking "Share" saves the prompt to Convex and generates a unique, permanent slug.
4.  **Migrate**: Old client-side links (`/share`) automatically upgrading to persistent records on visit.

**Key Design Decisions**:

- **Full Stack**: TanStack Start + Convex for seamless server/client integration.
- **Server Functions**: Heavy lifting (AI analysis, migration) runs on the server.
- **Type Safety**: End-to-end type safety with TypeScript, TanStack Router, and Convex.

## 🛠️ Tech Stack

| Layer         | Technology                    | Purpose                             |
| ------------- | ----------------------------- | ----------------------------------- |
| **Framework** | React 19 + TanStack Start     | Full-stack React framework          |
| **Database**  | Convex                        | Real-time database & backend        |
| **AI**        | Vercel AI SDK + Google Gemini | Prompt analysis & feedback          |
| **Routing**   | TanStack Router               | File-based, type-safe routing       |
| **Styling**   | Tailwind CSS 4 + Radix UI     | Neobrutalist design system          |
| **Ref**       | LZ-String                     | Legacy client-side data compression |

## 🚀 Quick Start

1.  **Install dependencies**:

    ```bash
    pnpm install
    ```

2.  **Environment Setup**:
    Create a `.env` file:

    ```env
    # Convex
    VITE_CONVEX_URL="your_convex_url"

    # Analytics
    VITE_PUBLIC_MIXPANEL_PROJECT_TOKEN="your_mixpanel_token"

    # AI Analysis (Optional)
    GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_key"
    ENABLE_PROMPT_ANALYSIS="true"
    ```

3.  **Start Development**:
    ```bash
    pnpm convex dev  # Start backend
    pnpm dev         # Start frontend
    ```

## 📁 Project Structure

```
src/
├── routes/              # TanStack Router file-routes
│   ├── wizard.tsx       # Main editor
│   ├── prompts/         # Persistent prompt pages
│   └── share.tsx        # Migration route
├── functions/           # Server functions (AI, migration)
├── components/          # Reusable UI components
├── utils/               # Helpers (compression, schema, env)
└── convex/              # Backend schema & mutations
```

## 📄 License

MIT

---

**Built with modern web technologies** ⚡
