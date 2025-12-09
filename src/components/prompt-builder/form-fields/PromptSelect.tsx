import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "@/hooks/prompt-builder-form-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { isFieldFilled } from "@/utils/forms/isFieldFilled";
import { ErrorMessages } from "./ErrorMessages";

export function PromptSelect({
  label,
  values,
  placeholder,
  description,
}: {
  label: string;
  values: Array<{ label: string; value: string }>;
  placeholder?: string;
  description?: string;
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
      <Select
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        <SelectTrigger
          id={label}
          className={`border-2 transition-colors ${
            isFieldFilled(field.state.value)
              ? "border-[#38AC5F] bg-[#38AC5F]/5"
              : "border-border"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (
            <SelectItem key={value.value} value={value.value}>
              {value.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
