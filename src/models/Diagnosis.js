import mongoose from "mongoose";

const diagnosisSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  symptoms: [String],
  result: Object
}, { timestamps: true });

export default mongoose.model("Diagnosis", diagnosisSchema);
