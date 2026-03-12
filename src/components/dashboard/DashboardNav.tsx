'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'

type DashboardNavProps = {
  userEmail: string
}

export function DashboardNav({ userEmail }: DashboardNavProps) {
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
          TaskFlow
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userEmail}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isPending}
          >
            {isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </div>
    </nav>
  )
}
