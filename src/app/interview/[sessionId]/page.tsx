"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { MicOff, AlertCircle, ArrowLeft, Info } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Container } from "@/components/shared/Container"
import { ROUTES } from "@/lib/utils/routes"
import { cn } from "@/lib/utils/cn"

// Helpers to format enums to friendly text
const formatInterviewType = (type: string) => {
  switch (type) {
    case "BEHAVIORAL":
      return "Behavioral"
    case "TECHNICAL":
      return "Technical"
    case "SYSTEM_DESIGN":
      return "System Design"
    case "HR":
      return "HR"
    default:
      return type
  }
}

const formatExperienceLevel = (level: string) => {
  switch (level) {
    case "JUNIOR":
      return "Junior"
    case "MID":
      return "Mid"
    case "SENIOR":
      return "Senior"
    default:
      return level
  }
}

const formatStage = (stage: string) => {
  return stage.charAt(0) + stage.slice(1).toLowerCase().replace(/_/g, " ")
}

export default function InterviewPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params?.sessionId as string

  const [session, setSession] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!sessionId) return

    const fetchSession = async () => {
      try {
        const response = await fetch(ROUTES.api.interview.detail(sessionId))
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to load interview session")
        }

        setSession(data.session)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "An error occurred while loading this session.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground mt-4 font-medium animate-pulse">
          Loading session details...
        </p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Card className="border-border/60 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-xl font-bold font-outfit">Error Loading Session</CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              {error || "We could not find the requested interview session."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link
              href={ROUTES.dashboard}
              className={cn(buttonVariants({ variant: "default" }), "w-full max-w-xs")}
            >
              Return to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b border-border/40 py-4 bg-background">
        <Container maxSize="xl" className="flex items-center justify-between">
          <Link
            href={ROUTES.dashboard}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quit Practice
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/60 font-mono">
              Session ID: {session.id.substring(0, 8)}...
            </Badge>
          </div>
        </Container>
      </header>

      {/* Main Console Workspace */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="border-border/60">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center gap-2 mb-3">
                <Badge variant="secondary" className="px-3 py-0.5 rounded-full text-xs font-semibold uppercase">
                  Type: {formatInterviewType(session.interviewType)}
                </Badge>
                <Badge variant="secondary" className="px-3 py-0.5 rounded-full text-xs font-semibold uppercase">
                  Level: {formatExperienceLevel(session.experienceLevel)}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold font-outfit tracking-tight">
                Preparing Interview Session...
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your AI interview console is ready for calibration.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 space-y-8">
              
              {/* Voice Calibration / Disabled Mic Area */}
              <div className="h-40 w-full flex items-center justify-center relative">
                <div className="text-center text-sm text-muted-foreground flex flex-col items-center gap-2 p-6 border border-dashed border-border/60 rounded-xl bg-muted/10 w-full max-w-md">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center border border-border/40 mb-2">
                    <MicOff className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <span className="font-semibold text-foreground">Waiting to Connect...</span>
                  <span className="text-xs text-muted-foreground text-center leading-relaxed">
                    Voice connection will be initialized in the next implementation phase.
                  </span>
                </div>
              </div>

              {/* Session Configuration Metadata List */}
              <div className="w-full grid grid-cols-2 gap-4 border-t border-b border-border/40 py-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Stage</span>
                  <p className="font-medium text-foreground">{formatStage(session.currentStage)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
                  <p className="font-medium text-foreground">{session.status}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Session Started</span>
                  <p className="font-medium text-foreground text-xs sm:text-sm">
                    {new Date(session.startedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Interviewer AI</span>
                  <p className="font-medium text-foreground">Intervo Orchestrator v1</p>
                </div>
              </div>

              {/* Guidelines Panel */}
              <div className="w-full bg-muted/20 border border-border/40 rounded-lg p-4 flex gap-3 text-xs text-muted-foreground leading-relaxed">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground font-outfit">Next Phase Instructions</p>
                  <p>In the next phase, the microphone will request browser permissions to establish a secure real-time WebRTC audio connection to our Vapi/OpenAI orchestrator service.</p>
                </div>
              </div>

              {/* Call Controls Placeholder */}
              <div className="flex items-center justify-center gap-4 w-full pt-4">
                <Button disabled size="lg" className="w-full max-w-xs h-12">
                  Voice Assistant Offline
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
