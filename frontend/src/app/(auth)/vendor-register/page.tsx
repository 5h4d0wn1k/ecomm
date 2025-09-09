'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/stores/auth-store'
import apiClient from '@/lib/api/client'
import type { ApiResponse, LoginResponse } from '@/lib/types'

const vendorRegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().min(1, 'Business name is required'),
  businessDescription: z.string().min(10, 'Business description must be at least 10 characters'),
  businessAddress: z.string().min(1, 'Business address is required'),
  businessPhone: z.string().optional(),
  taxId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type VendorRegisterForm = z.infer<typeof vendorRegisterSchema>

export default function VendorRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorRegisterForm>({
    resolver: zodResolver(vendorRegisterSchema),
  })

  const onSubmit = async (data: VendorRegisterForm) => {
    setIsLoading(true)
    setError('')

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data
      console.log('Vendor register data being sent:', registerData) // Debug log to validate what's sent
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/vendor-register', registerData)
      if (!response.data?.data) {
        throw new Error('Invalid response format')
      }
      const { user, token, refreshToken } = response.data.data

      login(user, token, refreshToken)

      // Redirect to vendor dashboard
      router.push('/vendor/dashboard')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed. Please try again.'
        : 'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register as a Vendor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              register as a customer
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  {...register('firstName')}
                  className="mt-1"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  {...register('lastName')}
                  className="mt-1"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business name
              </label>
              <Input
                id="businessName"
                type="text"
                {...register('businessName')}
                className="mt-1"
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
                Business description
              </label>
              <Textarea
                id="businessDescription"
                {...register('businessDescription')}
                className="mt-1"
                rows={3}
              />
              {errors.businessDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.businessDescription.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                Business address
              </label>
              <Textarea
                id="businessAddress"
                {...register('businessAddress')}
                className="mt-1"
                rows={2}
              />
              {errors.businessAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.businessAddress.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
                Business phone (optional)
              </label>
              <Input
                id="businessPhone"
                type="tel"
                autoComplete="tel"
                {...register('businessPhone')}
                className="mt-1"
              />
              {errors.businessPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.businessPhone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                Tax ID (optional)
              </label>
              <Input
                id="taxId"
                type="text"
                {...register('taxId')}
                className="mt-1"
              />
              {errors.taxId && (
                <p className="mt-1 text-sm text-red-600">{errors.taxId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating vendor account...
                </>
              ) : (
                'Register as Vendor'
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}