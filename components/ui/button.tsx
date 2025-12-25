import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * components/ui/button.tsx
 * Updated with high-fidelity "imprinted" UI logic.
 * Switched to Powder Blue accents and a tactile "pressed-into-paper" aesthetic.
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96]",
  {
    variants: {
      variant: {
        // Main action button - Charcoal with soft elevation
        default:
          "bg-charcoal text-paper shadow-sm hover:bg-ink transition-colors",
        // The "Pressed into Paper" aesthetic
        imprinted:
          "bg-paper border border-black/[0.03] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.07)] text-charcoal hover:text-ink hover:bg-white transition-all",
        // Powder Blue Accent - Used for active states and primary highlights
        accent:
          "bg-[#A5C3D1] text-white shadow-sm hover:bg-[#94B2C0] transition-colors font-bold tracking-tight",
        // Subdued variant with light imprinting
        secondary:
          "bg-pencil/5 text-charcoal hover:bg-pencil/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]",
        // Outlined version for secondary actions
        outline:
          "border border-pencil/20 bg-transparent text-charcoal hover:bg-pencil/5 hover:text-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        ghost: "hover:bg-pencil/5 hover:text-ink text-pencil transition-colors",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-xl",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-[1.2rem] px-10 text-base",
        icon: "h-10 w-10 rounded-full",
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
