import { z } from "zod";
import {
  createKeyMapping,
  createSearchParamsConverter,
} from "../search-params-core";

export const wizardSchema = z.object({
  step: z.number().min(1).max(5).default(1).optional(),
  persona: z.string().optional(),
  customPersona: z.string().optional(),
  task: z.string().optional(),
  context: z.string().optional(),
  format: z.string().optional(),
  customFormat: z.string().optional(),
});

export type WizardFormData = z.infer<typeof wizardSchema>;

export type WizardFormDataShortened = Partial<{
  s: number;
  p: string;
  cp: string;
  t: string;
  c: string;
  f: string;
  cf: string;
}>;

const wizardSearchParamsConverter = createSearchParamsConverter<
  WizardFormData,
  WizardFormDataShortened
>(
  createKeyMapping<WizardFormData, WizardFormDataShortened>({
    step: "s",
    persona: "p",
    customPersona: "cp",
    task: "t",
    context: "c",
    format: "f",
    customFormat: "cf",
  })
);

export const searchParamsLongToShort = wizardSearchParamsConverter.longToShort;
export const searchParamsShortToLong = wizardSearchParamsConverter.shortToLong;

export const defaultValues: WizardFormData = {
  step: 1,
  persona: "",
  customPersona: "",
  task: "",
  context: "",
  format: "",
  customFormat: "",
};
