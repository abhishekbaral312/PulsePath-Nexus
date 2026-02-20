import Diagnosis from "../models/Diagnosis.js";
import { runDiagnosis } from "../services/ai.services.js";

export const diagnose = async (req, res) => {
  try {
    const { symptoms } = req.body;

    // Validate input
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        message: "Symptoms must be a non-empty array"
      });
    }

    // Call FastAPI
    const aiResult = await runDiagnosis(symptoms);

    // OPTIONAL: save with user
    const record = await Diagnosis.create({
  userId: req.user.id,
  symptoms,
  result: aiResult
});


    return res.status(200).json(record);

  } catch (err) {
    console.error("Diagnosis error:", err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        message: "AI error",
        detail: err.response.data
      });
    }

    return res.status(500).json({
      message: "AI service unavailable"
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const records = await Diagnosis.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

