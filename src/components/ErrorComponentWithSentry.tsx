import { useEffect } from "react";
import { ErrorComponent } from "@tanstack/react-router";
import * as Sentry from "@sentry/tanstackstart-react";

export const ErrorComponentWithSentry = ({ error }: { error: any }) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, []);
  return <ErrorComponent error={error} />;
};
