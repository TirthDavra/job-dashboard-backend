import type { Request, Response } from "express";
import { hashPassword, comparePassword } from "../common/utils/hash";
import { generateToken } from "../common/utils/jwt";
import User, { type UserRole } from "../model/user.model";

interface RegisterBody {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

interface LoginBody {
    email: string;
    password: string;
}

export const register = async (
    req: Request<unknown, unknown, RegisterBody>,
    res: Response
) => {
    const { name, email, password, role } = req.body;
    console.log(name, email, password, role);
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (
    req: Request<unknown, unknown, LoginBody>,
    res: Response
) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const valid = await comparePassword(password, user.password);
        if (!valid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });
        return res.status(200).json({
            message: "Login successful", token, user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};
