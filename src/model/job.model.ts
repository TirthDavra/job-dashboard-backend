import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
    recruiterId: mongoose.Types.ObjectId;

    title: string;
    description: string;
    skills: string[];

    salaryMin: number;
    salaryMax: number;

    jobType: "full-time" | "part-time" | "contract";
    location: string;

    deadline: Date;

    isOpen: boolean;
}

const JobSchema = new Schema<IJob>(
    {
        recruiterId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        skills: {
            type: [String],
            default: [],
        },

        salaryMin: Number,
        salaryMax: Number,

        jobType: {
            type: String,
            enum: ["full-time", "part-time", "contract"],
            required: true,
        },

        location: {
            type: String,
            required: true,
        },

        deadline: {
            type: Date,
        },

        isOpen: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// 🔥 important for search later
JobSchema.index({ title: "text", skills: "text" });

export default mongoose.model<IJob>("Job", JobSchema);