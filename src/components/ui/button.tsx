import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-b from-primary to-primary/80 text-primary-foreground shadow-[0_4px_14px_rgba(249,115,22,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 hover:shadow-[0_6px_20px_rgba(249,115,22,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] active:shadow-[0_1px_4px_rgba(249,115,22,0.3)]",
        outline:
          "border-border bg-card text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:border-primary/50 hover:text-primary active:shadow-[0_1px_3px_rgba(0,0,0,0.15)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:brightness-110",
        ghost:
          "hover:bg-muted hover:text-foreground",
        destructive:
          "bg-linear-to-b from-destructive to-destructive/80 text-white shadow-[0_4px_14px_rgba(239,68,68,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:brightness-110",
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
