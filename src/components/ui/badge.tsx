import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900/90 text-white ring-1 ring-white/20 hover:bg-zinc-900/80",
        secondary:
          "bg-zinc-800 text-white ring-1 ring-white/20 hover:bg-zinc-800/90",
        destructive:
          "bg-red-500/90 text-white ring-1 ring-red-500/20 hover:bg-red-500/80",
        outline:
          "bg-slate-600 text-white ring-1 ring-white/20 hover:bg-slate-800/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 