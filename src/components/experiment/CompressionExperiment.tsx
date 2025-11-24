import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Route,
} from "@/routes/experiment/compression";
import { CompressionExperiment, compressionExperimentSchema } from "@/utils/experiment/compression";
import { isFieldFilled } from "@/utils/forms/isFieldFilled";

export function CompressionExperimentPage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const form = useForm({
    defaultValues: searchParams,
    validators: {
      onChange: compressionExperimentSchema,
    },
    onSubmit: async ({ value }) => {
      if (confirm(JSON.stringify(value))) {
        navigate({
          search: () => {
            return value;
          },
          replace: true,
        });
      } else {
        alert("searchParams not updated");
      }
    },
  });

  const renderErrors = (errors: any[]) => {
    if (!errors) return null;
    return errors
      .map((err) =>
        typeof err === "string" ? err : err.message || "Unknown error"
      )
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-4xl">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Compression Experiment
            </CardTitle>
            <CardDescription className="text-base">
              Compression Experiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              {/* Instruction Type Field */}
              <form.Field name="page">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="instruction_type"
                      className="text-sm font-semibold"
                    >
                      Page
                    </Label>
                    <Textarea
                      id="page"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`min-h-[100px] border-2 resize-y transition-colors ${
                        isFieldFilled(field.state.value)
                          ? "border-[#38AC5F] bg-[#38AC5F]/5"
                          : "border-border"
                      }`}
                      placeholder="Describe how the AI should gather context..."
                    />

                    <AnimatePresence>
                      {field.state.meta.isTouched &&
                        field.state.meta.errors && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-destructive">
                              {renderErrors(field.state.meta.errors)}
                            </p>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}
              </form.Field>

              {/* Context Gathering Field */}
              <form.Field name="sort">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="sort"
                      className="text-sm font-semibold"
                    >
                      Sort
                    </Label>
                    {/* <p className="text-sm text-muted-foreground">
                      Sort
                    </p> */}
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value as CompressionExperiment["sort"]);
                      }}
                    >
                      <SelectTrigger
                        id="sort"
                        className={`border-2 transition-colors ${
                          isFieldFilled(field.state.value)
                            ? "border-[#38AC5F] bg-[#38AC5F]/5"
                            : "border-border"
                        }`}
                      >
                        <SelectValue placeholder="Select sort type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">
                          Ascending
                        </SelectItem>
                        <SelectItem value="desc">
                          Descending
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <AnimatePresence>
                      {field.state.meta.isTouched &&
                        field.state.meta.errors && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-destructive">
                              {renderErrors(field.state.meta.errors)}
                            </p>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}
              </form.Field>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="border-2 shadow-md font-semibold cursor-pointer"
                >
                  Do Something
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
