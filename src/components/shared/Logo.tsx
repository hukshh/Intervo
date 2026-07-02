import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean
  size?: "sm" | "md" | "lg"
}

const iconSizes = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

const textSizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
}

export function Logo({
  iconOnly = false,
  size = "md",
  className,
  ...props
}: LogoProps) {
  return (
    <div
      className={cn("flex items-center gap-2 font-outfit select-none", className)}
      {...props}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-foreground text-background font-bold tracking-tighter shrink-0",
          iconSizes[size]
        )}
      >
        {/* Simple minimal double voice waves icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="h-3.5 w-3.5"
        >
          <line x1="6" y1="9" x2="6" y2="15" />
          <line x1="10" y1="6" x2="10" y2="18" />
          <line x1="14" y1="8" x2="14" y2="16" />
          <line x1="18" y1="10" x2="18" y2="14" />
        </svg>
      </div>
      {!iconOnly && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            textSizes[size]
          )}
        >
          Intervo
        </span>
      )}
    </div>
  )
}
