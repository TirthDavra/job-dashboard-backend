import { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";

export const validate = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.issues,
                });
            }
            throw error;
        }
    };
};