import { z } from "zod";

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),

    assignedTo: z.coerce.number().optional(),

    dueDate: z.string().optional(),
  }),
});
