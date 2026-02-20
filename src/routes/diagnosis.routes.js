import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { diagnose , getHistory } from "../controllers/diagnosis.controller.js";

const router = express.Router();

router.post("/",protect , diagnose);
router.get("/history", protect, getHistory);

export default router;
