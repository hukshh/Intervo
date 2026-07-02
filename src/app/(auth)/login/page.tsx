"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Logo } from "@/components/shared/Logo"
import { ROUTES } from "@/lib/utils/routes"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)
    try {
      const response = await fetch(ROUTES.api.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.error || "Invalid email or password")
      }

      toast.success("Welcome back!", {
        description: "Signed in successfully.",
      })
      router.push(ROUTES.dashboard)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.")
      toast.error("Sign in failed", {
        description: err.message || "Please check your credentials and try again.",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Back Button */}
      <Link
        href={ROUTES.landing}
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <Card className="border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight font-outfit text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your credentials to access your interview dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 mb-4 text-xs font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                  Log in
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="text-sm text-center text-muted-foreground w-full">
              Don&apos;t have an account?{" "}
              <Link href={ROUTES.signup} className="text-foreground hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
