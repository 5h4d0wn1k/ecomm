import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/lib/stores/auth-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const newToken = await useAuthStore.getState().refreshAccessToken()
          if (newToken) {
            // Retry the original request
            error.config.headers.Authorization = `Bearer ${newToken}`
            return this.client.request(error.config)
          } else {
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    return useAuthStore.getState().token
  }

  private getRefreshToken(): string | null {
    return useAuthStore.getState().refreshToken
  }

  private setToken(token: string): void {
    useAuthStore.getState().refreshTokenFn(token)
  }

  private logout(): void {
    useAuthStore.getState().logout()
  }

  // HTTP methods
  async get<T = unknown>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config)
  }

  async post<T = unknown>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config)
  }

  async put<T = unknown>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config)
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config)
  }

  async delete<T = unknown>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config)
  }
}

export const apiClient = new ApiClient()
export default apiClient