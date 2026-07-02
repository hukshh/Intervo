import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
  maxSize?: "sm" | "md" | "lg" | "xl" | "full"
}

const maxSizes = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
}

export function Container({
  className,
  as: Component = "div",
  maxSize = "xl",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        maxSizes[maxSize],
        className
      )}
      {...props}
    />
  )
}
