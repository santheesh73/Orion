import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  onPageChange
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft />
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <Button variant="outline" size="icon" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        <ChevronRight />
      </Button>
    </nav>
  );
}
