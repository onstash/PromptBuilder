# Prompt Builder AI 🚀

A modern web app for building structured AI prompts with a wizard-based interface. Create professional prompts with guided steps, shareable URLs, and instant preview.

## ✨ Features

- **Wizard Interface**: Step-by-step prompt building with 10 configurable sections
- **URL Compression**: Share prompts via compressed URLs (TypeScript Playground-style)
- **Real-time Preview**: See formatted prompt output instantly
- **Local Storage**: Auto-save progress while editing
- **Share Links**: Generate shareable `/share?d=<compressed>` URLs
- **Responsive Design**: Neobrutalist UI with Tailwind CSS 4

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript 5
- **Routing**: TanStack Router v1 (file-based)
- **Forms**: TanStack Form + Zod validation
- **Styling**: Tailwind CSS 4 + Radix UI
- **Compression**: LZ-String (URL-safe)
- **Build**: Vite 7
- **Package Manager**: pnpm

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev

# Type check + unused code detection
pnpm lint
```

## 📝 Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm serve` - Preview production build
- `pnpm test` - Run Vitest tests
- `pnpm lint:types` - TypeScript type checking
- `pnpm lint:unused` - Knip unused code detection
- `pnpm lint` - Run both linters

## 🏗️ Project Structure

```
src/
├── components/
│   ├── prompt-wizard/       # Wizard steps & preview
│   ├── landing/             # Landing page components
│   └── ui/                  # Shadcn/ui components
├── routes/
│   ├── wizard.tsx           # Main wizard route
│   ├── share.tsx            # Shared prompt viewer
│   └── demo/                # Demo routes
├── utils/
│   └── prompt-wizard/       # Compression, schema, validation
└── hooks/                   # Custom React hooks
```

## 🎯 Key Routes

- `/` - Landing page
- `/wizard` - Prompt wizard builder
- `/share?d=<compressed>` - View shared prompts

## 🔧 Wizard Features

### 10-Step Configuration

1. **Task Intent** - Main objective (required, min 10 chars)
2. **Context** - Background information
3. **Constraints** - Limitations and requirements
4. **Audience** - Target audience selection
5. **Output Format** - Response structure (paragraph, list, table, etc.)
6. **Role** - AI persona/expertise
7. **Tone** - Communication style
8. **Reasoning Depth** - Brief, moderate, or thorough
9. **Self-Check** - Verification step toggle
10. **Disallowed Content** - Content to avoid

### URL Compression

- Uses LZ-String for TypeScript Playground-style compression
- Only non-default values included in URL
- Safe for browser URL length limits (~2000 chars)

### State Management

- Local React state for editing
- Debounced localStorage persistence
- Share URL generated only on "Finish"
- Clean URLs during editing (no query params)

## 🎨 UI Components

Built with Shadcn/ui (Radix UI primitives):

- Button, Input, Label, Select, Slider, Switch
- Accordion, Card
- Neobrutalist design with bold borders and shadows

## 🧪 Code Quality

- **TypeScript**: Strict mode enabled
- **Knip**: Detects unused files, exports, dependencies
- **Vitest**: Unit testing framework
- **ESLint**: Code linting (via TanStack)

## 📦 Dependencies

### Core

- `react` `react-dom` - UI framework
- `@tanstack/react-router` - Type-safe routing
- `@tanstack/react-form` - Form state management
- `lz-string` - URL compression
- `zod` - Schema validation

### UI

- `tailwindcss` `@tailwindcss/vite` - Styling
- `@radix-ui/*` - Accessible primitives
- `lucide-react` - Icons
- `motion` - Animations
- `sonner` - Toast notifications

### Dev Tools

- `vite` - Build tool
- `typescript` - Type checking
- `vitest` - Testing
- `knip` - Unused code detection

## 🔐 Environment Variables

Configure in `src/env.ts` using `@t3-oss/env-core`:

```ts
import { env } from "@/env";
console.log(env.VITE_APP_TITLE);
```

## 🚢 Production Build

```bash
pnpm build    # Creates dist/
pnpm serve    # Preview locally
```

## 📄 License

MIT

---

**Built with modern web technologies** ⚡
