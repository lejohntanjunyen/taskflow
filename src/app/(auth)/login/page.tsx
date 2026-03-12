import Link from 'next/link'
import { AuthForm } from '@/components/forms/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">TaskFlow</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>
        <AuthForm mode="login" />
        <p className="text-center text-sm text-gray-600">
          No account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
