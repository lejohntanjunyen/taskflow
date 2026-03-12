'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp } from '@/app/actions/auth'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      const result = mode === 'login'
        ? await signIn(formData)
        : await signUp(formData)

      if (result && !result.success) {
        setError(result.error)
      } else if (result && result.success && mode === 'signup') {
        setSuccessMessage((result.data as { message: string }).message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            placeholder={mode === 'signup' ? 'Min. 8 characters' : ''}
            disabled={isPending}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {successMessage}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? mode === 'login' ? 'Signing in...' : 'Creating account...'
          : mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  )
}
