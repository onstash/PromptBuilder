import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getOrCreateSessionId } from "@/utils/session";

import { useTrackMixpanel } from "@/utils/analytics/MixpanelProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const roleSuggestionSchema = z.object({
  roleTitle: z
    .string()
    .min(2, "Role title must be at least 2 characters")
    .max(50, "Role title too long"),
  description: z
    .string()
    .min(10, "Please provide a bit more context (min 10 chars)")
    .max(500, "Description too long"),
});

type RoleSuggestionValues = z.infer<typeof roleSuggestionSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function SuggestRoleDialog() {
  const [open, setOpen] = useState(false);
  const trackEvent = useTrackMixpanel();
  const submitRoleSuggestion = useMutation(api.feature_requests.submitRoleSuggestion);

  const form = useForm({
    defaultValues: {
      roleTitle: "",
      description: "",
    } as RoleSuggestionValues,
    validators: {
      onChange: ({ value }) => {
        const result = roleSuggestionSchema.safeParse(value);
        if (!result.success) {
          // Flatten Zod errors into a Record<string, string> map?
          // Tanstack Form expects errors to be returned or strictly typed.
          // Simplest manual approach for a small form: return form-level error or let field-level handle it?
          // Actually, `validators` at root level returns form errors.
          // For field errors, we usually use `validators` on `form.Field`.
          // But to replace `validatorAdapter`, we just remove it and use manual field validation.
          return undefined;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      // Validate again to ensure valid submission
      const result = roleSuggestionSchema.safeParse(value);
      if (!result.success) {
        toast.error("Please ensure all fields are valid.");
        return;
      }

      // Submit to Convex
      await submitRoleSuggestion({
        sessionId: getOrCreateSessionId(),
        roleTitle: value.roleTitle,
        description: value.description,
      });

      // Track event
      trackEvent("role_suggestion_submitted", {
        role_title: value.roleTitle,
        description: value.description,
        timestamp: new Date().toISOString(),
      });

      // Show success message
      toast.success("Suggestion received! We'll look into adding this role.");

      // Close dialog
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors group">
          <div className="flex items-center gap-3">
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Suggest Role</span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suggest a Role</DialogTitle>
          <DialogDescription>
            Don't see your role? Suggest it here and we'll add tailored examples for it.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 py-4"
        >
          {/* Role Title Field */}
          <form.Field
            name="roleTitle"
            children={(field) => (
              <div className="grid gap-2">
                <Label
                  htmlFor="roleTitle"
                  className={field.state.meta.errors.length ? "text-destructive" : ""}
                >
                  Role Title
                </Label>
                <Input
                  id="roleTitle"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Data Scientist, HR Manager"
                  className={
                    field.state.meta.errors.length
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          {/* Description Field */}
          <form.Field
            name="description"
            children={(field) => (
              <div className="grid gap-2">
                <Label
                  htmlFor="description"
                  className={field.state.meta.errors.length ? "text-destructive" : ""}
                >
                  Description & Context
                </Label>
                <Textarea
                  id="description"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="What key tasks does this role perform? Any specific constraints?"
                  rows={4}
                  className={
                    field.state.meta.errors.length
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
