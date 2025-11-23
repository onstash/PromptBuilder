import { PromptBuilderAdvanced } from '@/components/prompt-builder/advanced'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/prompt-builder/advanced')({
  component: PromptBuilderAdvanced,
})
