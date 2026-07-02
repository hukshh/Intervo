import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  padding?: "none" | "sm" | "md" | "lg" | "xl"
}

const paddings = {
  none: "py-0",
  sm: "py-6 sm:py-8",
  md: "py-10 sm:py-16",
  lg: "py-16 sm:py-24",
  xl: "py-24 sm:py-32",
}

export function Section({
  className,
  as: Component = "section",
  padding = "md",
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(paddings[padding], className)}
      {...props}
    />
  )
}
