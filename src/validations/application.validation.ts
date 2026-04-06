import { z } from "zod";

export const applyJobSchema = z.object({
    jobId: z.string().min(1, "Job id is required"),
});

export const updateApplicationStatusSchema = z.object({
    status: z.enum([
        "applied",
        "shortlisted",
        "interviewed",
        "rejected",
        "hired",
    ]),
});
