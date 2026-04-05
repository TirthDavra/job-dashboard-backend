import { z } from "zod";

export const createJobSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(10),

    skills: z.array(z.string()).optional(),

    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),

    jobType: z.enum(["full-time", "part-time", "contract"]),

    location: z.string().min(1),

    deadline: z.coerce.date().optional(),
});