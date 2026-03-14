import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from '@/components/dashboard/FilterBar'

describe('FilterBar', () => {
  const mockOnFilter = vi.fn()

  const defaultProps = {
    active: 'all' as const,
    onFilter: mockOnFilter,
    counts: { all: 5, todo: 2, in_progress: 1, done: 2 },
  }

  it('renders All, Todo, In Progress, Done buttons', () => {
    render(<FilterBar {...defaultProps} />)

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /todo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /in progress/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
  })

  it('shows the count next to each label', () => {
    render(<FilterBar {...defaultProps} />)

    expect(screen.getByRole('button', { name: /all.*5/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /todo.*2/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /in progress.*1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /done.*2/i })).toBeInTheDocument()
  })

  it('calls onFilter with "all" when All button is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /all/i }))

    expect(mockOnFilter).toHaveBeenCalledWith('all')
  })

  it('calls onFilter with "todo" when Todo button is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /todo/i }))

    expect(mockOnFilter).toHaveBeenCalledWith('todo')
  })

  it('calls onFilter with "in_progress" when In Progress button is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /in progress/i }))

    expect(mockOnFilter).toHaveBeenCalledWith('in_progress')
  })

  it('calls onFilter with "done" when Done button is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterBar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /done/i }))

    expect(mockOnFilter).toHaveBeenCalledWith('done')
  })

  it('sets aria-pressed="true" on the active filter button', () => {
    render(<FilterBar {...defaultProps} active="todo" />)

    const todoButton = screen.getByRole('button', { name: /todo/i })
    const allButton = screen.getByRole('button', { name: /all/i })

    expect(todoButton).toHaveAttribute('aria-pressed', 'true')
    expect(allButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('sets aria-pressed="true" on "all" when active is "all"', () => {
    render(<FilterBar {...defaultProps} active="all" />)

    const allButton = screen.getByRole('button', { name: /all/i })
    expect(allButton).toHaveAttribute('aria-pressed', 'true')
  })
})
