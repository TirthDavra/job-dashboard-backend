import { hashPassword } from "../common/utils/hash";
import User from "../model/user.model";

const ADMIN_SEED = {
    name: process.env.SEED_ADMIN_NAME ?? "Admin",
    email: (process.env.SEED_ADMIN_EMAIL ?? "admin@admin.com").toLowerCase(),
    password: process.env.SEED_ADMIN_PASSWORD ?? "admin123",
};


export async function ensureAdminUser(): Promise<void> {
    const adminExists = await User.exists({ role: "admin" });
    if (adminExists) {
        return;
    }

    const hashedPassword = await hashPassword(ADMIN_SEED.password);
    await User.create({
        name: ADMIN_SEED.name,
        email: ADMIN_SEED.email,
        password: hashedPassword,
        role: "admin",
    });

}
