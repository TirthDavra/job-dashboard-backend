import { z } from "zod";

export const updateCandidateProfileSchema = z.object({
    skills: z.array(z.string().min(1)).default([]),
    experience: z.number().min(0).max(50),
});
