require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const app = express();
app.use(cors());
app.use(express.json());

// Temporary RAM storage for upload handling
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini 2.5
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- 1. UPLOAD ROUTE (The "Brain" Loader) ---
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file provided" });
        
        console.log(`📤 Uploading ${req.file.originalname} to Gemini Cloud...`);

        // Write buffer to temp file so Google can read it
        const tempFilePath = path.join(os.tmpdir(), req.file.originalname);
        fs.writeFileSync(tempFilePath, req.file.buffer);

        // Upload to Google
        const uploadResponse = await fileManager.uploadFile(tempFilePath, {
            mimeType: req.file.mimetype,
            displayName: req.file.originalname,
        });

        console.log(`✅ Upload Complete! URI: ${uploadResponse.file.uri}`);
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        res.json({ 
            success: true, 
            fileUri: uploadResponse.file.uri, 
            mimeType: uploadResponse.file.mimeType 
        });

    } catch (error) {
        console.error("❌ Upload Failed:", error);
        res.status(500).json({ error: "Upload failed." });
    }
});

// --- 2. ACTION ROUTE (The Logic Core) ---
app.post('/ai-action', async (req, res) => {
    try {
        const { text, action, fileUri, mimeType } = req.body;
        
        console.log(`🧠 Processing: ${action} | Mode: ${fileUri ? 'FILE' : 'TEXT'}`);

        let instruction = "";
        // Flag to control if we add generic HTML rules (True by default)
        let appendGeneralFormatting = true; 

        switch (action) {
            case 'summarize':
                instruction = "You are an expert summarizer. Create a clear, concise summary. Do NOT provide intro text. Output ONLY the summary.";
                break;

            case 'quiz':
                instruction = `You are a teacher. Create a multiple-choice quiz (15 questions). 
                Return a strict JSON Object (no markdown).
                Structure:
                {
                    "message_success": "A funny, encouraging pun related to the topic for a high score.",
                    "message_failure": "A funny, roast-style encouraging pun related to the topic for a low score.",
                    "questions": [
                        {"question": "...", "options": ["A)...", "B)..."], "answer": "...", "why_is_it_correct": "..."}
                    ]
                }`;
                appendGeneralFormatting = false; 
                break;

            case 'notes':
                // THE NUCLEAR PROMPT (Your requested fix)
                instruction = `You are an expert student tutor. Create 'Smart Revision Notes' using strict HTML5 formatting.
                - Use <h3> for main headings.
                - Use <ul> and <li> for bullet points (Do not use dashes or plain text indentation).
                - Use <strong> for key terms.
                - Do NOT use Markdown.
                - Do NOT include <html>, <head>, or <body> tags. Just return the content <div>.`;
                appendGeneralFormatting = false; // We use specific rules above
                break;

            case 'qa-short':
                instruction = "Create 10-15 Short Answer Questions. Question followed strictly by 1-2 sentence Answer. No conversational filler.";
                break;

            case 'qa-long':
                instruction = "Create 3 Deep-Dive Essay Questions with detailed model answers. No intro/outro.";
                break;

            case 'questions-only':
                instruction = "Create 10 Practice Questions. No answers. No filler.";
                break;

            default:
                instruction = "Assist with this content.";
        }

        // --- BUILD PROMPT ---
        let promptParts = [];
        
        // A. Add File (If exists - Stateful Mode)
        if (fileUri) {
            promptParts.push({
                fileData: { mimeType: mimeType, fileUri: fileUri }
            });
        }

        // B. Add Formatting Rules (Conditional)
        const formattingRules = `\n\nFORMATTING: Use HTML tags (<strong>, <em>, <ul>, <li>). Do not use Markdown syntax.`;
        if (appendGeneralFormatting) instruction += formattingRules;
        
        promptParts.push({ text: instruction });

        // C. Add User Text (Stateless Mode OR Context Chat)
        if (text) promptParts.push({ text: `\nUSER INPUT: "${text}"` });

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        let output = response.text();
        
        // Cleanup
        output = output.replace(/```json/g, '').replace(/```html/g, '').replace(/```/g, '');

        res.json({ result: output });

    } catch (error) {
        console.error("❌ Generation Failed:", error.message);
        res.status(500).json({ error: "AI Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});