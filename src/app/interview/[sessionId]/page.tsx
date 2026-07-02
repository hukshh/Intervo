"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Mic, MicOff, PhoneOff, AlertCircle, ArrowLeft, Volume2, Info, CheckCircle2 } from "lucide-react"
import Vapi from "@vapi-ai/web"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Container } from "@/components/shared/Container"
import { ROUTES } from "@/lib/utils/routes"
import { cn } from "@/lib/utils/cn"
import { toast } from "sonner"
import { SessionStatus } from "@prisma/client"

type ConnectionState = "disconnected" | "connecting" | "listening" | "speaking" | "finished"

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

  // Vapi Voice States
  const vapiRef = React.useRef<Vapi | null>(null)
  const [connectionState, setConnectionState] = React.useState<ConnectionState>("disconnected")
  const [isMuted, setIsMuted] = React.useState(false)
  const [duration, setDuration] = React.useState(0)

  // Fetch session details on mount
  const fetchSession = React.useCallback(async () => {
    if (!sessionId) return
    try {
      const response = await fetch(ROUTES.api.interview.detail(sessionId))
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to load session details")
      }
      setSession(data.session)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An error occurred while loading this session.")
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  React.useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // Timer effect for elapsed interview seconds
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (connectionState === "listening" || connectionState === "speaking") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [connectionState])

  // Initialize Vapi client and bind transport events
  React.useEffect(() => {
    const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "placeholder-vapi-public-key"
    const client = new Vapi(vapiPublicKey)
    vapiRef.current = client

    // Call Start event
    client.on("call-start", async () => {
      setConnectionState("listening")
      toast.success("Voice channel connected", {
        description: "Your mock interview has officially begun.",
      })
      // Update session status to ACTIVE in database
      try {
        await fetch(ROUTES.api.interview.detail(sessionId), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: SessionStatus.ACTIVE }),
        })
        fetchSession()
      } catch (err) {
        console.error("Failed to update status to ACTIVE:", err)
      }
    })

    // Call End event
    client.on("call-end", () => {
      setConnectionState("finished")
      toast.info("Interview disconnected", {
        description: "Your practice session is completed.",
      })
    })

    // Speech events
    client.on("speech-start", () => {
      setConnectionState("speaking")
    })

    client.on("speech-end", () => {
      setConnectionState("listening")
    })

    // Transcription and assistant pipeline integration
    client.on("message", async (message: any) => {
      // 1. Process and persist only FINAL USER transcripts
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        message.role === "user"
      ) {
        const transcriptText = message.transcript
        if (!transcriptText || transcriptText.trim() === "") return

        try {
          const chatResponse = await fetch(`/api/interview/${sessionId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "USER",
              content: transcriptText,
            }),
          })

          if (chatResponse.ok) {
            const data = await chatResponse.json()
            // 2. Play placeholder assistant response through the WebRTC transport
            if (data.content && vapiRef.current) {
              vapiRef.current.say(data.content)
            }
            fetchSession()
          }
        } catch (err) {
          console.error("Failed to persist conversation message:", err)
        }
      }
    })

    // Error handling
    client.on("error", async (err) => {
      console.error("Vapi client error:", err)
      setConnectionState("disconnected")
      toast.error("Voice connection error", {
        description: err.message || "Failed to communicate with Vapi server.",
      })

      // Mark session as ABANDONED in the database
      try {
        await fetch(ROUTES.api.interview.detail(sessionId), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: SessionStatus.ABANDONED }),
        })
        fetchSession()
      } catch (dbErr) {
        console.error("Failed to mark session as ABANDONED:", dbErr)
      }
    })

    // Cleanup resources on unmount
    return () => {
      client.stop()
    }
  }, [sessionId, fetchSession])

  const handleStartCall = () => {
    if (!vapiRef.current) return

    const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    if (!vapiPublicKey) {
      toast.error("Vapi Configuration Missing", {
        description: "Please set NEXT_PUBLIC_VAPI_PUBLIC_KEY in your environment configuration.",
      })
      return
    }

    setConnectionState("connecting")

    // Initialize using custom assistant configuration routing LLM back to Intervo Backend
    vapiRef.current.start({
      model: {
        provider: "custom-llm",
        url: `${window.location.origin}/api/interview/${sessionId}/chat`,
        model: "custom",
      },
      voice: {
        provider: "playht",
        voiceId: "s3://voice-cloning-zero-shot/d9ff78bc-e0df-47cd-ad18-5415111ee8d7/original/manifest.json",
      },
      firstMessage: "Hello! Preparing your interview session. Please begin when you are ready.",
    } as any)
  }

  const handleEndCall = async () => {
    if (vapiRef.current) {
      vapiRef.current.stop()
    }
    setConnectionState("finished")

    // Update status to COMPLETED and save total duration
    try {
      await fetch(ROUTES.api.interview.detail(sessionId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: SessionStatus.COMPLETED,
          duration,
        }),
      })
      fetchSession()
    } catch (err) {
      console.error("Failed to complete session status update:", err)
    }
  }

  const toggleMute = () => {
    if (!vapiRef.current) return
    const nextMute = !isMuted
    vapiRef.current.setMuted(nextMute)
    setIsMuted(nextMute)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

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
              
              {/* Voice Calibration & Active Connection States */}
              <div className="h-40 w-full flex items-center justify-center relative">
                {connectionState === "disconnected" && (
                  <div className="text-center text-sm text-muted-foreground flex flex-col items-center gap-2 p-6 border border-dashed border-border/60 rounded-xl bg-muted/10 w-full max-w-md">
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center border border-border/40 mb-2">
                      <MicOff className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <span className="font-semibold text-foreground">Voice Assistant Offline</span>
                    <span className="text-xs text-muted-foreground text-center leading-relaxed">
                      Voice connection will be initialized in the next implementation phase.
                    </span>
                  </div>
                )}

                {connectionState === "connecting" && (
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner size="lg" />
                    <span className="text-sm text-muted-foreground animate-pulse font-medium">
                      Establishing audio transport...
                    </span>
                  </div>
                )}

                {(connectionState === "listening" || connectionState === "speaking") && (
                  <div className="flex flex-col items-center justify-center w-full space-y-4">
                    {/* Visual Pulse Waves */}
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-muted/40 border border-border/40 relative">
                      <Volume2 className="h-8 w-8 text-foreground" />
                      {connectionState === "speaking" && (
                        <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/5 animate-ping opacity-75" />
                      )}
                    </div>
                    
                    <div className="text-center">
                      <span className="text-2xl font-mono font-medium tracking-wider">
                        {formatDuration(duration)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          connectionState === "listening" ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
                        )} />
                        {connectionState === "listening" ? "Candidate Speaking (Listening)" : "Interviewer Speaking (Speaking)"}
                      </p>
                    </div>
                  </div>
                )}

                {connectionState === "finished" && (
                  <div className="text-center text-sm text-muted-foreground flex flex-col items-center gap-2 p-6 border border-dashed border-emerald-500/20 rounded-xl bg-emerald-500/5 w-full max-w-md">
                    <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-2">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-foreground text-emerald-500">Interview Finished</span>
                    <span className="text-xs text-muted-foreground text-center leading-relaxed">
                      Your conversation history has been securely persisted in the database.
                    </span>
                  </div>
                )}
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
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Message Count</span>
                  <p className="font-medium text-foreground">{session.messageCount ?? 0} messages</p>
                </div>
              </div>

              {/* Guidelines Panel */}
              <div className="w-full bg-muted/20 border border-border/40 rounded-lg p-4 flex gap-3 text-xs text-muted-foreground leading-relaxed">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground font-outfit">Microphone & Connection Status</p>
                  <p>Speak clearly. When you stop speaking, the system transcribes your voice and persists the conversation. Toggle mute or click End Interview when finished.</p>
                </div>
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 w-full pt-4">
                {connectionState === "disconnected" && (
                  <Button onClick={handleStartCall} size="lg" className="w-full max-w-xs h-12">
                    Start Voice Call
                  </Button>
                )}

                {connectionState === "connecting" && (
                  <Button disabled size="lg" className="w-full max-w-xs h-12">
                    Connecting...
                  </Button>
                )}

                {(connectionState === "listening" || connectionState === "speaking") && (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={toggleMute}
                      className={cn(
                        "h-12 w-12 p-0 rounded-full border-border/60",
                        isMuted && "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                      )}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleEndCall}
                      className="h-12 px-6 rounded-full font-medium"
                    >
                      <PhoneOff className="mr-2 h-4 w-4" />
                      End Interview
                    </Button>
                  </>
                )}

                {connectionState === "finished" && (
                  <Link
                    href={ROUTES.dashboard}
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "w-full max-w-xs h-12 flex items-center justify-center font-semibold"
                    )}
                  >
                    Return to Dashboard
                  </Link>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
