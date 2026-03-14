'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment, deleteComment } from '@/app/actions/comments'
import type { Comment } from '@/types/database'

type CommentSectionProps = {
  taskId: string
  comments: Comment[]
  currentUserId: string
}

export function CommentSection({ taskId, comments, currentUserId }: CommentSectionProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createComment(formData)
    })
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteComment(commentId)
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Comments</h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-md border bg-muted/30 p-3 space-y-1">
              <p className="text-sm">{comment.body}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
                {comment.user_id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDelete(comment.id)}
                    className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={handleSubmit} className="space-y-2">
        <input type="hidden" name="taskId" value={taskId} />
        <Textarea
          name="body"
          placeholder="Add a comment..."
          rows={2}
          disabled={isPending}
          required
        />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    </div>
  )
}
