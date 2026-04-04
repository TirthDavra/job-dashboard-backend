import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import { ensureAdminUser } from "./seed/ensureAdminUser";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

//auth routes
app.use("/api/auth", authRoutes);

async function bootstrap() {
  await connectDB();
  await ensureAdminUser();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

