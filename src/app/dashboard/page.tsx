"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Play, Calendar, Award, Clock, ChevronRight, Speech } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import { AppShell } from "@/components/shared/AppShell"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { ROUTES } from "@/lib/utils/routes"
import { toast } from "sonner"

import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

// Formatter utilities for clean UI labels
const formatInterviewType = (type: string) => {
  switch (type) {
    case "BEHAVIORAL":
      return "Behavioral Interview"
    case "TECHNICAL":
      return "Technical Interview"
    case "SYSTEM_DESIGN":
      return "System Design Interview"
    case "HR":
      return "HR Interview"
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

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export default function DashboardPage() {
  const router = useRouter()
  const [interviewType, setInterviewType] = React.useState<"BEHAVIORAL" | "TECHNICAL" | "SYSTEM_DESIGN" | "HR">("BEHAVIORAL")
  const [experienceLevel, setExperienceLevel] = React.useState<"JUNIOR" | "MID" | "SENIOR">("MID")
  
  const [sessions, setSessions] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isStarting, setIsStarting] = React.useState(false)

  // Fetch session history dynamically on mount
  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(ROUTES.api.interview.listOrCreate)
        if (res.ok) {
          const data = await res.json()
          setSessions(data.sessions || [])
        }
      } catch (err) {
        console.error("Failed to load sessions:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const handleStartInterview = async () => {
    setIsStarting(true)
    try {
      const response = await fetch(ROUTES.api.interview.listOrCreate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType,
          experienceLevel,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to start interview session")
      }

      router.push(ROUTES.interview(data.sessionId))
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to launch session", {
        description: err.message || "Please try again later.",
      })
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Interview Dashboard"
        description="Select configuration, launch our voice assistant, and review deep analytics on your core communication competencies."
      />

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Side: Configuration Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-semibold font-outfit">New Interview Session</CardTitle>
              <CardDescription>
                Configure the AI interviewer parameters before beginning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Interview Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Interview Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="BEHAVIORAL">Behavioral</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="SYSTEM_DESIGN">System Design</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              {/* Experience Level Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid</option>
                  <option value="SENIOR">Senior</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button onClick={handleStartInterview} disabled={isStarting} className="w-full gap-2">
                <Play className="h-4 w-4 fill-current" />
                {isStarting ? "Launching..." : "Begin Voice Session"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Previous Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold font-outfit">Interview History</h2>
            <p className="text-xs text-muted-foreground">
              Review transcripts, feedback scores, and performance scorecards from your previous practices.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground">Loading session logs...</p>
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              title="No interviews completed yet"
              description="Your completed sessions and detailed reports will appear here. Start your first session to begin practicing."
              icon={Speech}
              action={
                <Button variant="outline" size="sm" onClick={handleStartInterview} disabled={isStarting}>
                  Start First Session
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="border-border/60 hover:border-border transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground font-outfit">
                          {formatInterviewType(session.interviewType)}
                        </h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold border-border/60">
                          {formatExperienceLevel(session.experienceLevel)}
                        </Badge>
                        <Badge
                          variant={session.status === "COMPLETED" ? "default" : "secondary"}
                          className="text-[10px] uppercase font-semibold"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(session.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {session.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(session.duration)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-border/40">
                      <Link
                        href={ROUTES.interview(session.id)}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-1 border-border/60 inline-flex items-center"
                        )}
                      >
                        {session.status === "COMPLETED" ? "View Report" : "Resume Session"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
