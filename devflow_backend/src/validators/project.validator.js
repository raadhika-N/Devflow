const { z } = require('zod');

const createProjectSchema = z.object({
  title: z
    .string({ required_error: 'Project title is required' })
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional() // description is not required
});

const updateProjectSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional()
});

module.exports = { createProjectSchema, updateProjectSchema };