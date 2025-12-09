import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "@/hooks/prompt-builder-form-context";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { isFieldFilled } from "@/utils/forms/isFieldFilled";
import { ErrorMessages } from "./ErrorMessages";

export function PromptTextArea({
  label,
  description,
  placeholder,
}: {
  label: string;
  description?: string;
  placeholder?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-semibold">
        {label}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Textarea
        id={label}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={`min-h-[100px] border-2 resize-y transition-colors ${
          isFieldFilled(field.state.value)
            ? "border-[#38AC5F] bg-[#38AC5F]/5"
            : "border-border"
        }`}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
