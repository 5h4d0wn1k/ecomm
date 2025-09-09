import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, ApiResponse } from '@/lib/types'
import apiClient from '@/lib/api/client'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  refreshTokenFn: (newToken: string) => void
  refreshAccessToken: () => Promise<string | null>
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User, token: string, refreshToken: string) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      refreshTokenFn: (newToken: string) => {
        set({ token: newToken })
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return null

        try {
          const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh', { refreshToken })
          if (!response.data?.data) {
            throw new Error('Invalid response format')
          }
          const { token } = response.data.data
          set({ token })
          return token
        } catch {
          // If refresh fails, logout
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return null
        }
      },

      isTokenExpired: () => {
        const { token } = get()
        if (!token) return true

        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const currentTime = Date.now() / 1000
          return payload.exp < currentTime
        } catch {
          return true
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user)
export const useToken = () => useAuthStore((state) => state.token)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)

// Role-based helpers
export const useIsAdmin = () => {
  const user = useUser()
  return user?.role === 'admin' || user?.role === 'super_admin'
}

export const useIsVendor = () => {
  const user = useUser()
  return user?.role === 'vendor'
}

export const useIsCustomer = () => {
  const user = useUser()
  return user?.role === 'customer'
}