import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Slider = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      className={cn("h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-60", className)}
      {...props}
    />
  )
);

Slider.displayName = "Slider";
