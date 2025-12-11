import { useState, useCallback } from "react";

function generatePromptString<T extends Record<string, unknown>>(value: T): string {
  const entries = Object.entries(value)
    .filter(([_, val]) => {
      if (typeof val === "string") return val.length > 0;
      if (typeof val === "boolean") return val === true;
      return false;
    })
    .map(([key, val]) => `<${key}>\n\t${val}\n</${key}>`);

  return entries.join("\n");
}

export function usePromptGenerated<T extends Record<string, unknown>>({
  initialValues,
}: {
  initialValues: T;
}) {
  const [promptGenerated, setPromptGenerated] = useState(() => {
    const value = generatePromptString(initialValues);
    return {
      value,
      updatedAt: Date.now(),
    };
  });

  const generatePrompt = useCallback((values: T) => {
    const value = generatePromptString(values);
    setPromptGenerated({ value, updatedAt: Date.now() });
  }, []);

  return [promptGenerated, generatePrompt] as const;
}
