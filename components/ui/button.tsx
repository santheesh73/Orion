import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-button transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 active:scale-[0.99]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-hover active:scale-[0.99]",
        accent: "bg-accent text-accent-foreground shadow-soft hover:bg-accent/90 active:scale-[0.99]",
        ghost: "bg-transparent hover:bg-hover active:scale-[0.99]",
        outline: "border border-border bg-transparent hover:bg-hover active:scale-[0.99]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.99]",
        glass: "glass text-foreground hover:bg-surface-elevated/80 active:scale-[0.99]"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-5 text-sm",
        icon: "size-10 px-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});

Button.displayName = "Button";
