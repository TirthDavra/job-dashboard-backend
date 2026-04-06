import type { Response } from "express";
import type { AuthRequest } from "../common/middleware/auth.middleware";
import User from "../model/user.model";
import Job from "../model/job.model";
import Application from "../model/application.model";

const RECENT_USERS_LIMIT = 8;

export const getAdminDashboard = async (_req: AuthRequest, res: Response) => {
    try {
        const [
            totalUsers,
            recruiterCount,
            candidateCount,
            adminCount,
            totalJobs,
            openJobs,
            totalApplications,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "recruiter" }),
            User.countDocuments({ role: "candidate" }),
            User.countDocuments({ role: "admin" }),
            Job.countDocuments(),
            Job.countDocuments({ isOpen: true }),
            Application.countDocuments(),
        ]);

        const recentUsersRaw = await User.find()
            .select("name email role createdAt")
            .sort({ createdAt: -1 })
            .limit(RECENT_USERS_LIMIT)
            .lean();

        const recentUsers = recentUsersRaw.map((u) => {
            const row = u as {
                _id: unknown;
                name?: string;
                email?: string;
                role?: string;
                createdAt?: Date;
            };
            return {
                id: String(row._id),
                name: row.name ?? "",
                email: row.email ?? "",
                role: row.role ?? "",
                createdAt:
                    row.createdAt instanceof Date
                        ? row.createdAt.toISOString()
                        : "",
            };
        });

        return res.status(200).json({
            totalUsers,
            recruiterCount,
            candidateCount,
            adminCount,
            totalJobs,
            openJobs,
            closedJobs: totalJobs - openJobs,
            totalApplications,
            recentUsers,
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};
