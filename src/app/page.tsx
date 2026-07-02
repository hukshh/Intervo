import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { Section } from "@/components/shared/Section"
import { Logo } from "@/components/shared/Logo"
import { Button, buttonVariants } from "@/components/ui/button"
import { ROUTES } from "@/lib/utils/routes"
import { cn } from "@/lib/utils/cn"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground select-none">
      {/* Navigation Header */}
      <header className="border-b border-border/40 py-4 bg-background">
        <Container maxSize="xl" className="flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.login}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Log in
            </Link>
            <Link
              href={ROUTES.signup}
              className={buttonVariants({ size: "sm" })}
            >
              Sign up
            </Link>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center py-20 sm:py-32">
        <Container maxSize="md">
          <div className="text-center space-y-8">
            {/* Minimal Badge */}
            <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground font-medium">
              Introducing Intervo
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-semibold font-outfit tracking-tight leading-[1.1] text-foreground">
                Master your interviews through voice-first AI.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Realistic, adaptive mock interviews designed to challenge vague answers, assess critical core competencies, and provide actionable feedback.
              </p>
            </div>

            {/* Non-functional CTA redirecting to dashboard */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={ROUTES.dashboard}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-6 rounded-md font-medium text-sm group inline-flex items-center justify-center"
                )}
              >
                Start Interview Session
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-6 rounded-md border-border/60 font-medium text-sm">
                Learn how it works
              </Button>
            </div>
          </div>
        </Container>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/5">
        <Container maxSize="xl" className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Intervo. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:underline">Terms</Link>
            <Link href="#" className="hover:underline">Privacy</Link>
            <Link href="#" className="hover:underline">Contact</Link>
          </div>
        </Container>
      </footer>
    </div>
  )
}
