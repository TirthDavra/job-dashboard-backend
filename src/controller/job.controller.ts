import type { Request, Response } from "express";
import mongoose from "mongoose";
import type { AuthRequest } from "../common/middleware/auth.middleware";
import Job from "../model/job.model";
import type { z } from "zod";
import { createJobSchema } from "../validations/job.validation";

type CreateJobBody = z.infer<typeof createJobSchema>;

function escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Open jobs only + optional search (q) and filters (jobType, location). */
function openJobFilter(query: Request["query"]) {
    const parts: Record<string, unknown>[] = [{ isOpen: true }];

    const q = String(query.q ?? "").trim();
    if (q) {
        const safe = escapeRegex(q);
        const rx = new RegExp(safe, "i");
        parts.push({
            $or: [{ title: rx }, { description: rx }, { skills: rx }],
        });
    }

    const jobType = String(query.jobType ?? "").trim();
    if (
        jobType === "full-time" ||
        jobType === "part-time" ||
        jobType === "contract"
    ) {
        parts.push({ jobType });
    }

    const location = String(query.location ?? "").trim();
    if (location) {
        parts.push({
            location: {
                $regex: escapeRegex(location),
                $options: "i",
            },
        });
    }

    if (parts.length === 1) {
        return parts[0];
    }

    return { $and: parts };
}

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
        const filter = openJobFilter(req.query);

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

/** Express 5 types params as string | string[] */
function routeParam(v: string | string[] | undefined): string {
    if (v == null) return "";
    return Array.isArray(v) ? v[0] ?? "" : v;
}

export const closeJob = async (req: AuthRequest, res: Response) => {
    try {
        const jobId = routeParam(req.params.jobId);
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid job id" });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (String(job.recruiterId) !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!job.isOpen) {
            return res.status(400).json({ message: "Job is already closed" });
        }

        job.isOpen = false;
        await job.save();

        return res.status(200).json({
            message: "Job closed successfully",
            job,
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
    try {
        const jobId = routeParam(req.params.jobId);
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid job id" });
        }

        const job = await Job.findById(jobId).lean();
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (String(job.recruiterId) !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({ message: "Job deleted successfully" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};
