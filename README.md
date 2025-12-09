# PromptBuilder 🚀

An easy-to-use web app to build and manage AI prompts. PromptBuilder provides an intuitive interface for creating, testing, and optimizing prompts for various AI models.

## 🌟 Features

- **Intuitive Prompt Builder**: Drag-and-drop interface for building complex prompts
- **Real-time Preview**: See your prompt changes instantly
- **Template Library**: Pre-built templates to get you started
- **Export & Share**: Export prompts in multiple formats
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Routing**: TanStack Router v1
- **Form Management**: TanStack Form
- **Styling**: Tailwind CSS 4 with Radix UI components
- **Build Tool**: Vite 7
- **Language**: TypeScript 5
- **Testing**: Vitest
- **UI Components**: Shadcn/ui (Radix UI based)
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (or your preferred Node version)
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📝 Available Scripts

- `pnpm dev` - Start the development server on port 3000
- `pnpm build` - Build for production
- `pnpm serve` - Preview the production build locally
- `pnpm test` - Run tests with Vitest

## 🏗️ Project Structure

```
src/
├── components/      # React components
├── routes/          # File-based router configuration
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── utils/           # Helper functions
├── data/            # Static data and constants
├── styles.css       # Global styles
├── router.tsx       # Router configuration
└── env.ts           # Environment variables configuration
```

## 🎨 Styling

This project uses **Tailwind CSS 4** for styling with **Radix UI** for accessible, unstyled component primitives. Custom components are built using Shadcn/ui patterns.

### Adding UI Components

Add new Shadcn components easily:

```bash
pnpx shadcn@latest add button
pnpx shadcn@latest add input
```

## 🧪 Testing

Tests are written with Vitest. Run the test suite:

```bash
pnpm test
```

## 🌐 Routing

This project uses **TanStack Router** with file-based routing. Routes are organized in the `src/routes` directory.

### Adding a New Route

Create a new file in `src/routes`:

```tsx
// src/routes/my-new-route.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-new-route")({
  component: () => <div>My New Route</div>,
});
```

TanStack Router will automatically generate type-safe routes!

### Navigation

Use the `Link` component for client-side navigation:

```tsx
import { Link } from "@tanstack/react-router";

export function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}
```

Learn more: [TanStack Router Documentation](https://tanstack.com/router)

## 📋 Form Handling

This project uses **TanStack Form** for type-safe, performant form state management.

```tsx
import { useForm } from "@tanstack/react-form";

function MyForm() {
  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async (values) => {
      // Handle form submission
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
    </form>
  );
}
```

Learn more: [TanStack Form Documentation](https://tanstack.com/form)

## 🔐 Environment Variables

Environment variables are configured in `src/env.ts` with type safety using T3 Env.

```ts
import { env } from "@/env";

// Use environment variables with type safety
console.log(env.VITE_APP_TITLE);
```

## 🚢 Building for Production

```bash
pnpm build
```

This creates an optimized production build in the `dist/` directory.

Preview the build locally:

```bash
pnpm serve
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Learn More

- [React Documentation](https://react.dev)
- [TanStack Documentation](https://tanstack.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

---

**Built with ❤️ using modern web technologies**
