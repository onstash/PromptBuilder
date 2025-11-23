import z from "zod";

export const compressionExperimentSchema = z.object({
  page: z.string().optional().default("1"),
  sort: z.enum(["asc", "desc"]).optional().default("asc"),
  filters: z
    .object({
      author: z.string().default("tanner"),
      min_words: z.number().default(800),
    })
    .optional()
    .default({
      author: "tanner",
      min_words: 800,
    }),
});

export type CompressionExperiment = z.infer<typeof compressionExperimentSchema>;
