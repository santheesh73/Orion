import { Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function LoadingScreen({ label = "Loading Orion" }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-xl bg-foreground text-background shadow-soft">
          <Sparkles className="size-6" />
        </div>
        <Spinner />
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
