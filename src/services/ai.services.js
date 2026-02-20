import axios from "axios";

const AI_BASE_URL = "https://symptoms-api-hfa7.onrender.com";

export async function runDiagnosis(symptoms) {
  try {
    const response = await axios.post(
      `${AI_BASE_URL}/predict`,
      { symptoms },
      { timeout: 30000 } // increase timeout for cold start
    );
    return response.data;
  } catch (error) {
    console.error("FASTAPI ERROR:", error.message);

    if (error.response) {
      console.error("FASTAPI RESPONSE:", error.response.data);
    }

    throw new Error("AI service unavailable");
  }
}