"use client";

import { ErrorScreen } from "@/components/common/error-screen";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorScreen
      title="Orion hit an unexpected state"
      message="Refresh the route or retry the action. Your local data boundary remains unchanged."
      onRetry={reset}
    />
  );
}
