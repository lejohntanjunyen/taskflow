import Link from 'next/link'

type ProjectStats = {
  todo: number
  in_progress: number
  done: number
}

type ProjectCardProps = {
  id: string
  name: string
  description: string | null
  createdAt: string
  stats: ProjectStats
}

// Pure SVG donut — no chart library needed
function DonutChart({ stats }: { stats: ProjectStats }) {
  const total = stats.todo + stats.in_progress + stats.done
  if (total === 0) {
    return (
      <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor"
          strokeWidth="4" className="text-muted/60" />
      </svg>
    )
  }

  const r = 14
  const circ = 2 * Math.PI * r

  // Segments: done (primary), in_progress (amber), todo (muted)
  const donePct = stats.done / total
  const inProgressPct = stats.in_progress / total

  const doneLen = donePct * circ
  const inProgressLen = inProgressPct * circ
  const todoLen = circ - doneLen - inProgressLen

  const doneOffset = 0
  const inProgressOffset = doneLen
  const todoOffset = doneLen + inProgressLen

  return (
    <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90" aria-hidden="true">
      {/* Track */}
      <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor"
        strokeWidth="4" className="text-muted/40" />
      {/* Todo */}
      {todoLen > 0 && (
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor"
          strokeWidth="4" className="text-slate-300"
          strokeDasharray={`${todoLen} ${circ - todoLen}`}
          strokeDashoffset={-todoOffset} strokeLinecap="butt" />
      )}
      {/* In progress */}
      {inProgressLen > 0 && (
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor"
          strokeWidth="4" className="text-amber-400"
          strokeDasharray={`${inProgressLen} ${circ - inProgressLen}`}
          strokeDashoffset={-inProgressOffset} strokeLinecap="butt" />
      )}
      {/* Done */}
      {doneLen > 0 && (
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor"
          strokeWidth="4" className="text-primary"
          strokeDasharray={`${doneLen} ${circ - doneLen}`}
          strokeDashoffset={-doneOffset} strokeLinecap="butt" />
      )}
      {/* Center text — rotate back */}
      <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
        className="rotate-90" transform="rotate(90 18 18)"
        style={{ fontSize: '7px', fontWeight: 600, fill: 'currentColor' }}>
        {total === 0 ? '—' : `${Math.round((stats.done / total) * 100)}%`}
      </text>
    </svg>
  )
}

function StatPill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <span className="tabular-nums">{count}</span>
      <span className="text-muted-foreground font-normal">{label}</span>
    </span>
  )
}

export function ProjectCard({ id, name, description, stats }: ProjectCardProps) {
  const total = stats.todo + stats.in_progress + stats.done

  return (
    <Link href={`/dashboard/projects/${id}`} className="group block">
      <div className="relative bg-card border border-border rounded-xl p-5 h-full flex flex-col gap-4 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">

        {/* Top: name + donut */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Project initial avatar */}
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold mb-3">
              {name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-semibold text-foreground text-base leading-snug truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <div className="shrink-0 text-foreground">
            <DonutChart stats={stats} />
          </div>
        </div>

        {/* Bottom: stat pills */}
        <div className="flex items-center gap-3 pt-1 border-t border-border/60">
          {total === 0 ? (
            <span className="text-xs text-muted-foreground">No tasks yet</span>
          ) : (
            <>
              <StatPill count={stats.done} label="done" color="text-primary" />
              <StatPill count={stats.in_progress} label="in progress" color="text-amber-600" />
              <StatPill count={stats.todo} label="todo" color="text-slate-500" />
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
