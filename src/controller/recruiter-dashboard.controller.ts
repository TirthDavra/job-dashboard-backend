import type { Response } from "express";
import type { AuthRequest } from "../common/middleware/auth.middleware";
import Job from "../model/job.model";
import Application from "../model/application.model";

const RECENT_LIMIT = 10;

export const getRecruiterDashboard = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const recruiterId = req.user!.id;

        const [activeJobsCount, myJobs] = await Promise.all([
            Job.countDocuments({ recruiterId, isOpen: true }),
            Job.find({ recruiterId }).select("_id").lean(),
        ]);

        const jobIds = myJobs.map((j) => j._id);

        if (jobIds.length === 0) {
            return res.status(200).json({
                activeJobsCount,
                totalApplicants: 0,
                recentActivity: [],
            });
        }

        const [totalApplicants, recentRaw] = await Promise.all([
            Application.countDocuments({ jobId: { $in: jobIds } }),
            Application.find({ jobId: { $in: jobIds } })
                .sort({ createdAt: -1 })
                .limit(RECENT_LIMIT)
                .populate("candidateId", "name")
                .populate("jobId", "title")
                .lean(),
        ]);

        const recentActivity = recentRaw.map((row) => {
            const cand = row.candidateId as { name?: string } | null;
            const job = row.jobId as { title?: string } | null;
            return {
                id: String(row._id),
                at:
                    row.createdAt instanceof Date
                        ? row.createdAt.toISOString()
                        : "",
                candidateName: cand?.name ?? "Candidate",
                jobTitle: job?.title ?? "Job",
            };
        });

        return res.status(200).json({
            activeJobsCount,
            totalApplicants,
            recentActivity,
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};
