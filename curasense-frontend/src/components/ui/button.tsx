import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - solid brand with vibrant glow
        default:
          "bg-[hsl(var(--brand-primary))] text-white shadow-lg shadow-[hsl(var(--brand-primary)/0.35)] hover:shadow-xl hover:shadow-[hsl(var(--brand-primary)/0.45)] hover:bg-[hsl(var(--brand-primary-light))] hover:translate-y-[-1px]",
        // Gradient - premium multi-color gradient
        gradient:
          "bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[hsl(168_70%_42%)] to-[hsl(var(--brand-secondary))] text-white shadow-lg shadow-[hsl(var(--brand-primary)/0.3)] hover:shadow-xl hover:shadow-[hsl(var(--brand-secondary)/0.35)] hover:brightness-110 hover:translate-y-[-1px]",
        // Destructive - vibrant error with glow
        destructive:
          "bg-[hsl(var(--color-error))] text-white shadow-md shadow-[hsl(var(--color-error)/0.35)] hover:bg-[hsl(var(--color-error-vibrant))] hover:shadow-lg hover:shadow-[hsl(var(--color-error)/0.45)]",
        // Success variant - vibrant green
        success:
          "bg-[hsl(var(--color-success))] text-white shadow-md shadow-[hsl(var(--color-success)/0.35)] hover:bg-[hsl(var(--color-success-vibrant))] hover:shadow-lg hover:shadow-[hsl(var(--color-success)/0.45)]",
        // Warning variant - vibrant amber
        warning:
          "bg-[hsl(var(--color-warning))] text-[hsl(var(--neutral-900))] shadow-md shadow-[hsl(var(--color-warning)/0.35)] hover:bg-[hsl(var(--color-warning-vibrant))] hover:shadow-lg hover:shadow-[hsl(var(--color-warning)/0.45)]",
        // Info variant - vibrant blue
        info:
          "bg-[hsl(var(--color-info))] text-white shadow-md shadow-[hsl(var(--color-info)/0.35)] hover:bg-[hsl(var(--color-info-vibrant))] hover:shadow-lg hover:shadow-[hsl(var(--color-info)/0.45)]",
        // Outline - subtle border with gradient hover
        outline:
          "border-2 border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--brand-primary)/0.5)] hover:text-[hsl(var(--brand-primary))]",
        // Secondary - muted with subtle color
        secondary:
          "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--brand-primary)/0.1)] hover:text-[hsl(var(--brand-primary))]",
        // Ghost - minimal styling with color pop
        ghost:
          "hover:bg-[hsl(var(--brand-primary)/0.1)] hover:text-[hsl(var(--brand-primary))]",
        // Link style - with gradient underline effect
        link: 
          "text-[hsl(var(--brand-primary))] underline-offset-4 hover:underline hover:text-[hsl(var(--brand-primary-light))]",
        // Glass - frosted glass with color tint
        glass:
          "bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/30 text-[hsl(var(--foreground))] hover:bg-white/25 dark:hover:bg-white/15 hover:border-[hsl(var(--brand-primary)/0.3)]",
        // Glow - special button with animated glow
        glow:
          "bg-[hsl(var(--brand-primary))] text-white shadow-[0_0_20px_hsl(var(--brand-primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--brand-primary)/0.6)] hover:bg-[hsl(var(--brand-primary-light))]",
      },
      size: {
        default: "h-10 px-5 py-2",
        xs: "h-7 rounded-lg px-2.5 text-xs",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
