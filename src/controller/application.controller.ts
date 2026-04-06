import type { Response } from "express";
import mongoose from "mongoose";
import type { AuthRequest } from "../common/middleware/auth.middleware";
import Job from "../model/job.model";
import Application from "../model/application.model";
import type { z } from "zod";
import {
    applyJobSchema,
    updateApplicationStatusSchema,
} from "../validations/application.validation";

type ApplyBody = z.infer<typeof applyJobSchema>;
type UpdateStatusBody = z.infer<typeof updateApplicationStatusSchema>;

/** Express 5 types params as string | string[] */
function routeParam(v: string | string[] | undefined): string {
    if (v == null) return "";
    return Array.isArray(v) ? (v[0] ?? "") : v;
}

export const applyToJob = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.body as ApplyBody;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid job id" });
        }

        const job = await Job.findById(jobId).lean();
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        if (!job.isOpen) {
            return res
                .status(400)
                .json({ message: "This job is no longer open" });
        }

        try {
            await Application.create({
                candidateId: req.user!.id,
                jobId,
                status: "applied",
            });
        } catch (err: unknown) {
            const code =
                err && typeof err === "object" && "code" in err
                    ? (err as { code: number }).code
                    : null;
            if (code === 11000) {
                return res
                    .status(400)
                    .json({ message: "You already applied to this job" });
            }
            throw err;
        }

        return res.status(201).json({ message: "Application submitted" });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyAppliedJobIds = async (req: AuthRequest, res: Response) => {
    try {
        const rows = await Application.find({ candidateId: req.user!.id })
            .select("jobId")
            .lean();

        const jobIds = rows.map((r) => String(r.jobId));

        return res.status(200).json({ jobIds });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyApplicationsDetail = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const raw = await Application.find({ candidateId: req.user!.id })
            .populate("jobId", "title location jobType isOpen deadline")
            .sort({ createdAt: -1 })
            .lean();

        const applications = raw.map((doc) => {
            const d = doc as typeof doc & { createdAt?: Date };
            const jobDoc = doc.jobId as
                | {
                      _id: unknown;
                      title?: string;
                      location?: string;
                      jobType?: string;
                      isOpen?: boolean;
                      deadline?: Date;
                  }
                | null;

            const job =
                jobDoc && typeof jobDoc === "object" && "_id" in jobDoc
                    ? {
                          _id: String(jobDoc._id),
                          title: jobDoc.title ?? "Job",
                          location: jobDoc.location ?? "",
                          jobType: jobDoc.jobType ?? "",
                          isOpen: Boolean(jobDoc.isOpen),
                          deadline: jobDoc.deadline,
                      }
                    : null;

            return {
                _id: String(doc._id),
                status: doc.status ?? "applied",
                createdAt: d.createdAt,
                job,
            };
        });

        return res.status(200).json({ applications });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getApplicationsForJob = async (req: AuthRequest, res: Response) => {
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

        const raw = await Application.find({ jobId })
            .populate("candidateId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        const applications = raw.map((doc) => ({
            ...doc,
            status: doc.status ?? "applied",
        }));

        return res.status(200).json({ applications });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateApplicationStatus = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const id = routeParam(req.params.id);
        const { status } = req.body as UpdateStatusBody;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid application id" });
        }

        const application = await Application.findById(id).lean();
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const job = await Job.findById(application.jobId).lean();
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        if (String(job.recruiterId) !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updated = await Application.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        )
            .populate("candidateId", "name email")
            .lean();

        return res.status(200).json({
            message: "Status updated",
            application: updated,
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};
