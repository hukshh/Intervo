"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  Award, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  BookOpen
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AppShell } from "@/components/shared/AppShell"
import { PageHeader } from "@/components/shared/PageHeader"
import { ROUTES } from "@/lib/utils/routes"

// Mock data representing a detailed evaluation report
const mockReport = {
  overallScore: 86,
  summary: "The candidate demonstrated strong domain competence and structured communication. They followed the STAR framework for most of the engineering challenges but provided slightly vague descriptions when discussing conflict resolution. Leadership attributes and adaptability metrics were solid throughout the progression.",
  difficulty: "Hard",
  duration: "18m 42s",
  scores: {
    communication: 88,
    confidence: 85,
    starScore: 80,
    problemSolving: 92,
    leadership: 84,
    adaptability: 87,
  },
  strengths: [
    {
      title: "Strong STAR Framework Alignment",
      description: "When describing the cloud migration project, you clearly separated the Situation, Task, Action, and Result, mentioning exact performance improvements (40% cost reduction).",
    },
    {
      title: "Excellent Technical Problem Solving",
      description: "You walked through recursive optimization algorithms and data flow decisions with precise detail and logical consistency.",
    },
  ],
  weaknesses: [
    {
      title: "Vague Conflict Resolution Details",
      description: "When asked about managing team disagreements, your response did not outline the exact actions taken to resolve the dispute, focusing too much on general team philosophies.",
    },
  ],
  improvements: [
    "Quantify your soft skills: In conflict resolution, detail the exact conversation and consensus-building steps.",
    "Refine task boundaries: Be explicit about your individual contributions vs. the collective team achievements.",
  ],
  timeline: [
    {
      role: "interviewer",
      stage: "Introduction",
      text: "Hello! I am your interviewer today. I'd love to start by learning a little bit about you. Could you please introduce yourself and tell me about your background?",
    },
    {
      role: "candidate",
      stage: "Introduction",
      text: "Sure! I am a senior full stack engineer with over six years of experience building SaaS products. I specialize in React, Node.js, and cloud orchestration systems, and have previously led teams to deploy scalable API systems.",
      eval: {
        isVague: false,
        starFollowed: true,
        scoreEffect: "+5 Confidence",
      },
    },
    {
      role: "interviewer",
      stage: "Background",
      text: "That sounds impressive. Can you share an instance where your architectural choices directly affected a project's timeline or outcome?",
    },
    {
      role: "candidate",
      stage: "Background",
      text: "We migrated a legacy data storage system to AWS DynamoDB. The challenge was maintaining uptime. I mapped the schema changes and set up dual-write pipelines. As a result, we finished the migration two weeks ahead of schedule and saw database response times decrease by 30%.",
      eval: {
        isVague: false,
        starFollowed: true,
        scoreEffect: "+10 Problem Solving",
      },
    },
  ],
}

export default function FeedbackPage() {
  const params = useParams()
  const sessionId = params?.sessionId as string

  return (
    <AppShell>
      <PageHeader
        title="Interview Feedback Report"
        description="Comprehensive evaluation scorecard analyzing communication style, STAR framework structure, and competency evidence."
        action={
          <Link
            href={ROUTES.dashboard}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1 border-border/60 inline-flex items-center"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        }
      />

      <div className="space-y-8 pb-12">
        {/* Top Hero Section: Overall Score and Summary */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/60 flex flex-col justify-between md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold font-outfit text-muted-foreground uppercase tracking-wider">
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="h-28 w-28 rounded-full border-4 border-foreground flex items-center justify-center">
                <span className="text-4xl font-bold font-outfit tracking-tighter">
                  {mockReport.overallScore}
                </span>
                <span className="text-sm text-muted-foreground ml-0.5">/100</span>
              </div>
              <Badge variant="secondary" className="mt-4 px-3 py-0.5 border-border/40 rounded-full font-medium">
                Difficulty: {mockReport.difficulty}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-border/60 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold font-outfit">Executive Summary</CardTitle>
              <CardDescription>Overall breakdown of candidate competency and delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {mockReport.summary}
              </p>
              <div className="flex gap-6 border-t border-border/40 pt-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">Duration:</span> {mockReport.duration}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Questions Answered:</span> 4
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competencies Score Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold font-outfit">Competency Scorecards</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Communication Style", value: mockReport.scores.communication, icon: MessageSquare },
              { label: "Confidence & Delivery", value: mockReport.scores.confidence, icon: TrendingUp },
              { label: "STAR Structure Score", value: mockReport.scores.starScore, icon: Award },
              { label: "Problem Solving", value: mockReport.scores.problemSolving, icon: CheckCircle2 },
              { label: "Leadership & Impact", value: mockReport.scores.leadership, icon: HelpCircle },
              { label: "Adaptability & Growth", value: mockReport.scores.adaptability, icon: BookOpen },
            ].map((card, i) => (
              <Card key={i} className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-outfit">{card.value}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                  <Progress value={card.value} className="h-1.5" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Details & Timeline Tab Area */}
        <Tabs defaultValue="strengths" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/40 border border-border/40 p-1 h-10 rounded-lg">
            <TabsTrigger value="strengths" className="text-xs font-medium font-outfit py-1.5 rounded-md">
              Strengths & Weaknesses
            </TabsTrigger>
            <TabsTrigger value="improvements" className="text-xs font-medium font-outfit py-1.5 rounded-md">
              Improvements
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs font-medium font-outfit py-1.5 rounded-md">
              Transcript & Analysis
            </TabsTrigger>
          </TabsList>

          {/* Strengths & Weaknesses */}
          <TabsContent value="strengths" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base font-semibold font-outfit flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockReport.strengths.map((str, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm font-semibold text-foreground font-outfit">{str.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{str.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base font-semibold font-outfit flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    Areas of Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockReport.weaknesses.map((weak, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm font-semibold text-foreground font-outfit">{weak.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{weak.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Actionable Improvements */}
          <TabsContent value="improvements" className="mt-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold font-outfit">Actionable Next Steps</CardTitle>
                <CardDescription>Specific techniques to level up your interview outcomes.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {mockReport.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/60 text-xs font-semibold text-foreground font-outfit mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{imp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversation Timeline & Transcript */}
          <TabsContent value="timeline" className="mt-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold font-outfit">Conversation Transcript</CardTitle>
                <CardDescription>Review the exact transcript and turn-by-turn evaluations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockReport.timeline.map((turn, idx) => (
                  <div key={idx} className="space-y-2 border-b border-border/40 pb-5 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {turn.role === "interviewer" ? "AI Interviewer" : "You (Candidate)"}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider border-border/40">
                        {turn.stage}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">
                      {turn.text}
                    </p>
                    {turn.eval && (
                      <div className="flex items-center gap-4 pt-1 text-xs font-medium text-emerald-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          STAR Framework Followed
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span>{turn.eval.scoreEffect}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
