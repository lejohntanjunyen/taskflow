import { getTokenHistory } from '@/app/actions/task-executions'
import { getSettings } from '@/app/actions/user-settings'
import type { TaskExecution } from '@/types/database'

function sumTokens(executions: TaskExecution[]): number {
  return executions.reduce((acc, e) => acc + (e.total_tokens ?? 0), 0)
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export async function TokenBudgetWidget() {
  const [historyResult, settingsResult] = await Promise.all([
    getTokenHistory(1), // today only
    getSettings(),
  ])

  // If either call fails (e.g. first login, no settings row yet), render a graceful fallback
  if (!historyResult.success || !settingsResult.success) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Token budget unavailable
      </div>
    )
  }

  const todayTotal = sumTokens(historyResult.data)
  const budget = settingsResult.data.daily_token_budget
  const pct = Math.min(100, Math.round((todayTotal / budget) * 100))

  const barColor =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Daily Token Usage</h3>
        <span className="text-xs text-muted-foreground">
          {formatNumber(todayTotal)} / {formatNumber(budget)}
        </span>
      </div>

      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {pct}% of daily budget used &mdash; {historyResult.data.length} execution
        {historyResult.data.length !== 1 ? 's' : ''} today
      </p>
    </div>
  )
}
