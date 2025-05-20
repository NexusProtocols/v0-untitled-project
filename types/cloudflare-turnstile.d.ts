interface Window {
  turnstile?: {
    render: (
      container: string | HTMLElement,
      options: {
        sitekey: string
        theme?: "light" | "dark" | "auto"
        callback?: (token: string) => void
        "expired-callback"?: () => void
        "error-callback"?: (error: any) => void
        tabindex?: number
        action?: string
        cData?: string
        language?: string
      },
    ) => string
    reset: (widgetId?: string) => void
    getResponse: (widgetId?: string) => string
    remove: (widgetId?: string) => void
  }
}
