'use client'

import Link from 'next/link'
import { useTransition } from 'react'
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

  // Show only the part before @ as the display name
  const displayName = userEmail.split('@')[0]

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M4 5.5h12M4 10h8M4 14.5h10"
                stroke="white"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
            TaskFlow
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary uppercase">
                {displayName.charAt(0)}
              </span>
            </div>
            <span className="hidden sm:block text-sm text-muted-foreground">
              {userEmail}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </nav>
  )
}
