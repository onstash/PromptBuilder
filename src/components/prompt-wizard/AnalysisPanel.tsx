import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PromptEvaluationTransformed } from "@/functions/analyze-prompt";
import { generatePromptText } from "@/stores/wizard-store";

interface AnalysisPanelProps {
  promptAnalysisResult: PromptEvaluationTransformed;
}

export function AnalysisPanel({ promptAnalysisResult }: AnalysisPanelProps) {
  const { overallScore } = promptAnalysisResult;
  const scoreColor =
    overallScore >= 80 ? "text-green-600" : overallScore >= 60 ? "text-yellow-600" : "text-red-600";
  const scoreBg =
    overallScore >= 80 ? "bg-green-600" : overallScore >= 60 ? "bg-yellow-600" : "bg-red-600";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Analysis Results
          </CardTitle>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => setResult(null)}
            className="text-muted-foreground"
          >
            Reset
          </Button> */}
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="flex-1">
            <div className="flex justify-between mb-1 text-sm font-medium">
              <span>
                Quality Score{" "}
                <span className="text-muted-foreground">
                  ({promptAnalysisResult.overall_assessment.grade})
                </span>
              </span>
              <span className={scoreColor}>{overallScore}/100</span>
            </div>
            <Progress value={overallScore} className="h-2" indicatorClassName={scoreBg} />
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
            {promptAnalysisResult.strengths.map((str, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{str.point}</p>
                  <p className="text-xs text-muted-foreground">{str.why_it_works}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="weaknesses" className="space-y-4 pt-4">
            {promptAnalysisResult.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{issue.problem}</span>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{issue.why_it_matters}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4 pt-4">
            {promptAnalysisResult.issues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No suggestions found! Your prompt looks great.
              </p>
            ) : (
              promptAnalysisResult.issues.map((issue, i) => (
                <div key={i} className="rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="">
                      {issue.severity} Fix
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {issue.actionable_fix}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 mt-3">
                    <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{issue.why_it_matters}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      {promptAnalysisResult.improved_version && (
        <CardFooter className="flex-col items-start border-t pt-4 bg-muted/10">
          <p className="text-sm font-medium mb-2">Improved Version Idea:</p>
          <div className="text-xs bg-muted p-3 rounded-md w-full whitespace-pre-wrap font-mono relative group">
            {generatePromptText(promptAnalysisResult.improvedPromptData)}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() =>
                navigator.clipboard.writeText(promptAnalysisResult.improved_version || "")
              }
            >
              Copy
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
