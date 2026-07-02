export const ROUTES = {
  landing: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  interview: (id: string) => `/interview/${id}`,
  feedback: (id: string) => `/feedback/${id}`,
  api: {
    auth: {
      signup: "/api/auth/signup",
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      me: "/api/auth/me",
    },
    interview: {
      listOrCreate: "/api/interview",
      detail: (id: string) => `/api/interview/${id}`,
      chatCompletions: (id: string) => `/api/interview/${id}/chat`,
      end: (id: string) => `/api/interview/${id}/end`,
    },
    feedback: (id: string) => `/api/feedback/${id}`,
  },
} as const
