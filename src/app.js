import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import diagnosisRoutes from "./routes/diagnosis.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";




const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use(errorHandler);
export default app;
