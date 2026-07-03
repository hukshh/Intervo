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

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (data: SignupFormValues) => {
    setError(null)
    try {
      const response = await fetch(ROUTES.api.auth.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.error || "Failed to create account")
      }

      toast.success("Welcome to Intervo!", {
        description: "Your account has been created successfully.",
      })
      router.push(ROUTES.dashboard)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.")
      toast.error("Registration failed", {
        description: err.message || "Please check your details and try again.",
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
              Create an account
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign up to practice voice-based mock interviews with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 mb-4 text-xs font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} method="POST" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                  Sign up
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="text-sm text-center text-muted-foreground w-full">
              Already have an account?{" "}
              <Link href={ROUTES.login} className="text-foreground hover:underline font-medium">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
