import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0.5 active:shadow-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-b from-primary to-primary/85 text-primary-foreground shadow-[3px_3px_8px_rgba(16,185,129,0.22),-1px_-1px_4px_rgba(255,255,255,0.35),inset_1px_1px_2px_rgba(255,255,255,0.2)] hover:brightness-105 active:shadow-[1px_1px_3px_rgba(16,185,129,0.2)]",
        outline:
          "border-border bg-card text-foreground shadow-[3px_3px_8px_rgba(16,185,129,0.06),-2px_-2px_6px_rgba(255,255,255,0.7)] hover:bg-muted active:shadow-[1px_1px_3px_rgba(16,185,129,0.05)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[2px_2px_6px_rgba(0,0,0,0.04)] hover:brightness-97",
        ghost:
          "hover:bg-muted hover:text-foreground",
        destructive:
          "bg-linear-to-b from-destructive to-destructive/85 text-white shadow-[3px_3px_8px_rgba(220,38,38,0.22),inset_1px_1px_2px_rgba(255,255,255,0.15)] hover:brightness-105",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-5",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
