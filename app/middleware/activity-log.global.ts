export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client-side to avoid duplicate logging if SSR is used
  // Or run on server-side once.
  if (process.server) return

  const { $axios } = useNuxtApp()
  const { user } = useAuth()

  // Only log if user is logged in
  if (user.value) {
    try {
        // We can send a lightweight log request
        // For simplicity, we just log "ACCESS" action
        await $axios.post('/api/activity-logs/log-access', {
            module: to.name?.toString() || to.path,
            description: `Mengakses halaman: ${to.fullPath}`
        })
    } catch (e) {
        // Silently fail to not block navigation
    }
  }
})
