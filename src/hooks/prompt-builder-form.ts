import { createFormHook } from "@tanstack/react-form";

import {
  PromptTextField,
  PromptTextArea,
  PromptSelect,
} from "@/components/prompt-builder/form-fields";
import { fieldContext, formContext } from "./prompt-builder-form-context";

const formHook = createFormHook({
  fieldComponents: {
    PromptTextField,
    PromptTextArea,
    PromptSelect,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export const usePromptBuilderForm = formHook.useAppForm;
