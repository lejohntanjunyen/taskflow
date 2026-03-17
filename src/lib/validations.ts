import { z } from 'zod'

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date').nullable().optional(),
  projectId: z.string().uuid('Invalid project ID'),
})

export const updateTaskSchema = createTaskSchema.omit({ projectId: true }).partial()

export const updateTaskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']),
})

// Comment schemas
export const createCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment must be 2000 characters or less'),
  taskId: z.string().uuid('Invalid task ID'),
})

// Inferred types
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
