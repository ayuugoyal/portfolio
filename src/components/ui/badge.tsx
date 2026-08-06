import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "rounded-full border-transparent bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground hover:bg-primary/85",
        secondary:
          "rounded-full border-transparent bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "rounded-full border-transparent bg-destructive px-2.5 py-0.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/80",
        outline: "rounded-full px-2.5 py-0.5 text-xs font-medium text-foreground",
        /** mono tech chip — the default for anything listing a tool */
        chip: "rounded-md border-transparent bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-normal lowercase tracking-tight text-muted-foreground hover:text-foreground",
        /** quiet outlined pill for links */
        link: "gap-1.5 rounded-full border-border px-2.5 py-1 font-mono text-[10px] lowercase tracking-tight text-muted-foreground hover:border-foreground/30 hover:bg-secondary hover:text-foreground",
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
