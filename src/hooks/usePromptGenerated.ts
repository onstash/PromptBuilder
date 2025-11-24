import { useState } from "react";

function __generatePrompt<T extends Record<string,unknown>>(
  value: T,
  setStateCallback: (newValue: string) => void
) {
  const _arr = [];
  for (const [key, _value] of Object.entries(value)) {
    const _valueType = typeof _value;
    switch (_valueType) {
      case "boolean": {
        if (_value) {
          _arr.push(`${key}: \n${_value}`);
        }
        break;
      }
      case "string": {
        if ((_value as string).length) {
          _arr.push(`<${key}>\n\t${_value}\n</${key}>`);
        }
        break;
      }
    }
  }
  const promptGeneratedStr = _arr.join("\n");
  setStateCallback(promptGeneratedStr);
  // window.localStorage.setItem("promptGeneratedStr", promptGeneratedStr);
}

export function usePromptGenerated<T extends Record<string,unknown>>({
  initialValues,
}: {
  initialValues: T;
}) {
  const [promptGenerated, __setPromptGenerated] = useState(() => {
    let updatedAt = Date.now();
    let value = ``;
    let setState = (newValue: string) => {
      updatedAt = Date.now();
      value = newValue;
      console.log("[promptGenerated] setState called", { updatedAt, newValue });
    };
    __generatePrompt(initialValues, setState);
    return {
      value,
      updatedAt,
    };
  });

  const _setPromptGenerated = (newValue: string) => {
    __setPromptGenerated({ value: newValue, updatedAt: Date.now() });
  };

  const generatePrompt = (values: T) => {
    __generatePrompt(values, _setPromptGenerated);
  };

  return [promptGenerated, generatePrompt] as const;
}
