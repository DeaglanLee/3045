import { GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({});

async function sendMessageToGemini(message) {
    try {
        const response = await gemini.models.generateContent({
            model: "gemini-1.5-pro",
            prompt: {
                text: message,
            },
        });
        return { status: 200, response: response.text };
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return { status: 500, response: null };
    }
}

export { sendMessageToGemini };