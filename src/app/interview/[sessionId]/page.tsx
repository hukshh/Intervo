"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Mic, MicOff, PhoneOff, AlertCircle, ArrowLeft, Volume2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Container } from "@/components/shared/Container"
import { ROUTES } from "@/lib/utils/routes"
import { toast } from "sonner"

type CallState = "idle" | "connecting" | "active" | "ending"

export default function InterviewPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params?.sessionId as string

  const [callState, setCallState] = React.useState<CallState>("idle")
  const [isMuted, setIsMuted] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [stage, setStage] = React.useState("Introduction")
  const [speakerState, setSpeakerState] = React.useState<"idle" | "interviewer" | "candidate">("idle")

  // Timer effect for simulated active call
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (callState === "active") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setDuration(0)
    }
    return () => clearInterval(interval)
  }, [callState])

  // Simulated stage transitions during the mockup call
  React.useEffect(() => {
    if (callState === "active") {
      const stageTimeout = setTimeout(() => {
        setStage("Background")
        setSpeakerState("interviewer")
        toast.info("Interview Stage Update", {
          description: "Moving from Introduction to Candidate Background.",
        })
      }, 15000)

      return () => clearTimeout(stageTimeout)
    }
  }, [callState])

  const handleStartCall = () => {
    setCallState("connecting")
    // Simulate Vapi connection latency
    setTimeout(() => {
      setCallState("active")
      setSpeakerState("interviewer")
      toast.success("Voice channel connected", {
        description: "The mock interview session has officially started.",
      })
    }, 2000)
  }

  const handleEndCall = () => {
    setCallState("ending")
    toast.info("Ending session...", {
      description: "Aggregating evaluations and generating your report.",
    })
    
    // Simulate backend report compilation latency
    setTimeout(() => {
      router.push(ROUTES.feedback(sessionId))
    }, 3000)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
            <Badge variant="outline" className="border-border/60">
              Session ID: {sessionId ? sessionId.substring(0, 8) : "demo"}
            </Badge>
          </div>
        </Container>
      </header>

      {/* Main Console Workspace */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="border-border/60">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <Badge variant="secondary" className="px-3 py-0.5 rounded-full text-xs font-medium">
                  Stage: {stage}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold font-outfit tracking-tight">
                AI Voice Interview Console
              </CardTitle>
              <CardDescription>
                Practice speaking clearly and using the STAR framework for behavioral responses.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 space-y-8">
              
              {/* Voice wave visualization area */}
              <div className="h-40 w-full flex items-center justify-center relative">
                {callState === "idle" && (
                  <div className="text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <Mic className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <span>Microphone and audio are calibrated.</span>
                    <span>Click below to launch the voice assistant.</span>
                  </div>
                )}

                {callState === "connecting" && (
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner size="lg" />
                    <span className="text-sm text-muted-foreground animate-pulse">
                      Establishing audio streams...
                    </span>
                  </div>
                )}

                {callState === "active" && (
                  <div className="flex flex-col items-center justify-center w-full space-y-4">
                    {/* Visual Pulse Waves */}
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-muted/40 border border-border/40 relative">
                      <Volume2 className="h-8 w-8 text-foreground" />
                      {/* Pulse Circle 1 */}
                      <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/5 animate-ping opacity-75" />
                    </div>
                    
                    <div className="text-center">
                      <span className="text-2xl font-mono font-medium tracking-wider">
                        {formatDuration(duration)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${speakerState === "candidate" ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`} />
                        {speakerState === "candidate" ? "Candidate Speaking (You)" : "Interviewer Speaking (AI)"}
                      </p>
                    </div>
                  </div>
                )}

                {callState === "ending" && (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <LoadingSpinner size="lg" />
                    <span className="text-sm text-muted-foreground font-medium font-outfit">
                      Analyzing conversation transcripts...
                    </span>
                    <span className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                      Calculating STAR metrics, confidence levels, and compiling scorecard feedback.
                    </span>
                  </div>
                )}
              </div>

              {/* Tips & Instructions Panel */}
              <div className="w-full bg-muted/20 border border-border/40 rounded-lg p-4 flex gap-3 text-xs text-muted-foreground leading-relaxed">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground font-outfit">Interview Guidelines</p>
                  <p>State your answers thoroughly. If you are vague, the AI will probe with deep follow-ups. You can mute your microphone at any time or end the call to receive your evaluation.</p>
                </div>
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 w-full pt-4">
                {callState === "idle" && (
                  <Button onClick={handleStartCall} size="lg" className="w-full max-w-xs h-12">
                    Start Voice Call
                  </Button>
                )}

                {callState === "active" && (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`h-12 w-12 p-0 rounded-full border-border/60 ${isMuted ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" : ""}`}
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

                {(callState === "connecting" || callState === "ending") && (
                  <Button disabled size="lg" className="w-full max-w-xs h-12">
                    Processing...
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
