require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/ai-action', async (req, res) => {
    const { text, action } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    console.log(`🧠 Gemini Processing Action: ${action}...`);

    let instruction = "";

    switch (action) {
        case 'summarize':
            instruction = "You are an expert summarizer. Create a clear, concise summary of the provided text. Capture the main ideas and key details without losing the core meaning. Do NOT provide any introductory text like 'Here is a summary'. Output ONLY the summary.";
            break;

        case 'quiz':
            instruction = `You are a teacher. Create a multiple-choice quiz with at least 15 questions based on the text. 
            Return the result strictly as a JSON Array of objects. 
            Do NOT use Markdown formatting (no \`\`\`json blocks). Return raw JSON only.
            
            Structure each object exactly like this:
            [
              {
                "question": "The question text here?",
                "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
                "answer": "The correct answer text"
              },
              ...
            ]`;
            break;

        case 'qa-short':
            instruction = "Create between 10 to 15 Short Answer Questions based on the text. If the text is very long, aim for 15. If the text is shorter, create as many valid questions as possible (minimum 10). Provide the Question, followed immediately by a 1-2 sentence Answer. Do NOT provide any conversational filler. Output ONLY the questions and answers.";
            break;

        case 'qa-long':
            instruction = "Create 3 Deep-Dive Essay Questions. For each, provide a detailed paragraph-length model answer explaining the concept fully. Do NOT provide intro/outro text. Output ONLY the content.";
            break;

        case 'questions-only':
            instruction = "Create 10 Practice Questions based on the text to test the student. Do NOT provide the answers. Just the questions. Do NOT include any conversational text.";
            break;

        case 'notes':
            instruction = "Create 'Smart Revision Notes'. Use bullet points, bold key terms, list important dates/formulas, and structure it for quick memorization. Output ONLY the notes.";
            break;

        case 'explain':
            instruction = "You are a tutor. Explain the core concepts of this text in simple terms (ELI5 style). Use analogies if possible to make it easy to understand. Keep it direct and avoid filler text.";
            break;

        default:
            instruction = "Summarize this text. Output ONLY the summary.";
    }

    // Content generation
    try {
        const formattingRules = `
        
        FORMATTING RULES:
        - You MUST use HTML tags for formatting.
        - Use <strong> for bold.
        - Use <em> for italics.
        - Use <br> for line breaks.
        - Use <ul> and <li> for lists.
        - Do NOT use Markdown syntax.
        - IMPORTANT: Output compact HTML.`// Do NOT use double <br><br> tags between paragraphs. Do not add \n newlines.
        ;
        
        const prompt = `${instruction}${formattingRules}\n\nHere is the text to analyze:\n"${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let output = response.text();
        
        output = output.replace(/```json/g, '').replace(/```/g, ''); //accidental markdown removal

        console.log("✅ Gemini Success!");
        res.json({ result: output });

    } catch (error) {
        console.error("❌ Gemini Error:", error.message);
        res.status(500).json({ error: "AI Generation failed. Check server logs." });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 Server running on http://localhost:3000");
});