import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "recruiter" | "candidate";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;

    skills?: string[];
    experience?: number;
    resumeUrl?: string;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["admin", "recruiter", "candidate"],
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        // Candidate fields
        skills: [String],
        experience: Number,
        resumeUrl: String,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>("User", UserSchema);