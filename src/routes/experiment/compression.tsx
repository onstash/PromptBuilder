import { createFileRoute } from "@tanstack/react-router";
import { CompressionExperimentPage } from "@/components/experiment/CompressionExperiment";
// import { parseSearch } from "@/router";
import { compressionExperimentSchema } from "@/utils/experiment/compression";

export const Route = createFileRoute("/experiment/compression")({
  component: CompressionExperimentPage,
  validateSearch: (search: Record<string, unknown>) => {
    // if (search.data) {
    //   const parsed = parseSearch(search.data as string);
    //   const result = compressionExperimentSchema.optional().safeParse(parsed);
    //   console.log("validateSearch [/experiment/compression]", search, result);
    //   if (result.success) {
    //     return result.data;
    //   }
    // }
    return {};
  },
});
