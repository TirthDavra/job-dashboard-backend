import mongoose, { Schema, Document } from "mongoose";

export const APPLICATION_STATUSES = [
    "applied",
    "shortlisted",
    "interviewed",
    "rejected",
    "hired",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface IApplication extends Document {
    candidateId: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
    status: ApplicationStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>(
    {
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        status: {
            type: String,
            enum: APPLICATION_STATUSES,
            default: "applied",
        },
    },
    { timestamps: true }
);

ApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

export default mongoose.model<IApplication>("Application", ApplicationSchema);
