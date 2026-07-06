import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorScreen({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <div className="grid min-h-[50vh] place-items-center p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-error/10 text-error">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="mt-5 text-heading-4">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        {onRetry ? (
          <Button className="mt-5" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
