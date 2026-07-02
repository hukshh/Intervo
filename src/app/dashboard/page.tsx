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

// Static mock sessions to demonstrate a premium user experience
const mockSessions = [
  {
    id: "session-1",
    role: "Senior Software Engineer",
    date: "June 28, 2026",
    duration: "18m 42s",
    overallScore: 84,
    stageReached: "Closing",
    difficulty: "Hard",
  },
  {
    id: "session-2",
    role: "System Design & Architecture",
    date: "June 30, 2026",
    duration: "14m 10s",
    overallScore: 91,
    stageReached: "Reflection",
    difficulty: "Medium",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [difficulty, setDifficulty] = React.useState<"Easy" | "Medium" | "Hard">("Medium")
  const [role, setRole] = React.useState("Senior Software Engineer")

  const handleStartInterview = () => {
    // Generate a temporary mock session UUID and navigate to it
    const mockSessionId = Math.random().toString(36).substring(2, 15)
    router.push(ROUTES.interview(mockSessionId))
  }

  return (
    <AppShell>
      <PageHeader
        title="Interview Dashboard"
        description="Configure difficulty, launch our voice assistant, and review deep analytics on your core communication competencies."
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
              {/* Role Setting */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Role / Topic
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Senior Software Engineer">Senior Software Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="General Behavioral (STAR)">General Behavioral (STAR)</option>
                </select>
              </div>

              {/* Difficulty Setting */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Easy", "Medium", "Hard"] as const).map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={difficulty === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficulty(level)}
                      className="w-full text-xs h-8 border-border/60"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button onClick={handleStartInterview} className="w-full gap-2">
                <Play className="h-4 w-4 fill-current" />
                Begin Voice Session
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

          {mockSessions.length === 0 ? (
            <EmptyState
              title="No interviews completed yet"
              description="Your completed sessions and detailed reports will appear here. Start your first session to begin practicing."
              icon={Speech}
              action={
                <Button variant="outline" size="sm" onClick={handleStartInterview}>
                  Start First Session
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4">
              {mockSessions.map((session) => (
                <Card key={session.id} className="border-border/60 hover:border-border transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground font-outfit">{session.role}</h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold border-border/60">
                          {session.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {session.duration}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-border/40">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold font-outfit tracking-tight">{session.overallScore}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                      <Link
                        href={ROUTES.feedback(session.id)}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-1 border-border/60 inline-flex items-center"
                        )}
                      >
                        View Report
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
