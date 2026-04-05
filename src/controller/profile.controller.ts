import type { Response } from "express";
import type { AuthRequest } from "../common/middleware/auth.middleware";
import User from "../model/user.model";
import type { z } from "zod";
import type { updateCandidateProfileSchema } from "../validations/profile.validation";

type UpdateBody = z.infer<typeof updateCandidateProfileSchema>;

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!.id)
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCandidateProfile = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { skills, experience } = req.body as UpdateBody;
        const cleanSkills = skills
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        const user = await User.findByIdAndUpdate(
            req.user!.id,
            { $set: { skills: cleanSkills, experience } },
            { new: true }
        )
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile saved",
            user,
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};
