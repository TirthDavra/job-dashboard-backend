import type { Request, Response } from "express";
import type { AuthRequest } from "../common/middleware/auth.middleware";
import Job from "../model/job.model";
import type { z } from "zod";
import { createJobSchema } from "../validations/job.validation";

type CreateJobBody = z.infer<typeof createJobSchema>;

function pagingFromQuery(query: Request["query"]) {
    const pageRaw = Number.parseInt(String(query.page ?? "1"), 10);
    const limitRaw = Number.parseInt(String(query.limit ?? "10"), 10);

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit =
        Number.isFinite(limitRaw) && limitRaw > 0
            ? Math.min(limitRaw, 100)
            : 10;

    return { page, limit, skip: (page - 1) * limit };
}

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        const {
            title,
            description,
            skills,
            salaryMin,
            salaryMax,
            jobType,
            location,
            deadline,
        } = req.body as CreateJobBody;

        const job = await Job.create({
            recruiterId: req.user!.id,
            title,
            description,
            skills: skills ?? [],
            salaryMin,
            salaryMax,
            jobType,
            location,
            deadline,
        });

        return res.status(201).json({
            message: "Job created successfully",
            job,
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllJobs = async (req: Request, res: Response) => {
    try {
        const { page, limit, skip } = pagingFromQuery(req.query);

        const [jobs, total] = await Promise.all([
            Job.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Job.countDocuments({}),
        ]);

        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        return res.status(200).json({
            jobs,
            page,
            limit,
            total,
            totalPages,
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getRecruiterJobs = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit, skip } = pagingFromQuery(req.query);
        const filter = { recruiterId: req.user!.id };

        const [jobs, total] = await Promise.all([
            Job.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Job.countDocuments(filter),
        ]);

        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        return res.status(200).json({
            jobs,
            page,
            limit,
            total,
            totalPages,
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};
