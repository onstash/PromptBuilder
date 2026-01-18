import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrCreateSessionId } from "@/utils/session";
import { type AnalysisResult, analyzePrompt } from "@/functions/analyze-prompt"; // Define types properly if exporting
import type { PromptWizardData } from "@/utils/prompt-wizard/schema";

interface AnalysisPanelProps {
  wizardData: PromptWizardData;
}

export function AnalysisPanel({ wizardData }: AnalysisPanelProps) {
  const analyzeFn = useServerFn(analyzePrompt);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const sessionId = getOrCreateSessionId();
      const data = await analyzeFn({ data: { promptData: wizardData, sessionId } });
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  if (!result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI Prompt Analysis
          </CardTitle>
          <CardDescription>
            Get expert feedback on your prompt structure and quality.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full"
            variant="outline"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Prompt"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const scoreColor =
    result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-yellow-600" : "text-red-600";
  const scoreBg =
    result.score >= 80 ? "bg-green-600" : result.score >= 60 ? "bg-yellow-600" : "bg-red-600";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Analysis Results
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResult(null)}
            className="text-muted-foreground"
          >
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="flex-1">
            <div className="flex justify-between mb-1 text-sm font-medium">
              <span>Quality Score</span>
              <span className={scoreColor}>{result.score}/100</span>
            </div>
            <Progress value={result.score} className="h-2" indicatorClassName={scoreBg} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
          </TabsList>

          <TabsContent value="strengths" className="space-y-4 pt-4">
            {result.strengths.map((str, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm text-foreground">{str}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="weaknesses" className="space-y-4 pt-4">
            {result.weaknesses.map((wk, i) => (
              <div key={i} className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <p className="text-sm text-foreground">{wk}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4 pt-4">
            {result.suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No suggestions found! Your prompt looks great.
              </p>
            ) : (
              result.suggestions.map((suggestion, i) => (
                <div key={i} className="rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">
                      {suggestion.field.replace("_", " ")}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{suggestion.issue}</span>
                  </div>
                  <div className="flex items-start gap-3 mt-3">
                    <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{suggestion.recommendation}</p>
                      {suggestion.example_fix && (
                        <div className="text-xs bg-muted p-2 rounded border font-mono">
                          {suggestion.example_fix}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      {result.improved_version && (
        <CardFooter className="flex-col items-start border-t pt-4 bg-muted/10">
          <p className="text-sm font-medium mb-2">Improved Version Idea:</p>
          <div className="text-xs bg-muted p-3 rounded-md w-full whitespace-pre-wrap font-mono relative group">
            {result.improved_version}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => navigator.clipboard.writeText(result.improved_version || "")}
            >
              Copy
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
