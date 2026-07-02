"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react"
import { Logo } from "./Logo"
import { Container } from "./Container"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROUTES } from "@/lib/utils/routes"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = React.useState({
    name: "Candidate",
    email: "practice@intervo.ai",
    initials: "C",
  })

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(ROUTES.api.auth.me)
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            const names = data.user.fullName.split(" ")
            const initials = names
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)
            
            setUser({
              name: data.user.fullName,
              email: data.user.email,
              initials: initials || "C",
            })
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch(ROUTES.api.auth.logout, { method: "POST" })
      if (response.ok) {
        router.push(ROUTES.landing)
        router.refresh()
      } else {
        throw new Error("Logout request failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      router.push(ROUTES.landing)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <Container maxSize="xl">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href={ROUTES.dashboard} className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
                <Logo size="md" />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href={ROUTES.dashboard}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${
                    pathname === ROUTES.dashboard
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </nav>
            </div>

            {/* Profile actions dropdown */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="group/button inline-flex shrink-0 items-center justify-center rounded-full border border-border/40 bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground relative h-8 w-8 cursor-pointer">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="text-[11px] font-medium font-outfit bg-muted text-muted-foreground">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-foreground font-outfit leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-0">
                    <Link href={ROUTES.dashboard} className="flex w-full items-center px-2.5 py-1.5 text-sm cursor-pointer select-none">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer px-2.5 py-1.5 text-sm select-none">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col py-8">
        <Container maxSize="xl" className="flex-1 flex flex-col">
          {children}
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/5 py-6">
        <Container maxSize="xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Intervo. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:underline hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="hover:underline hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="hover:underline hover:text-foreground">
                Support
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  )
}
