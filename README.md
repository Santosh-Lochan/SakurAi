# 🌸 SakurAi – Learning, Simplified

**SakurAi** is a full-stack AI educational suite designed to transform static study materials into interactive revision tools. Built for students, it uses the **Gemini 2.5 Flash** model to generate quizzes, summaries, and structured notes from text or uploaded documents.

---

## Features

### Smart Revision Notes

Generates **“Nuclear” revision notes** using strict HTML5 formatting (`headings`, `lists`, and bold terms) so content renders instantly in the browser without Markdown conversion.

### Interactive MCQ Quizzes

Creates **15-question multiple-choice quizzes** with:

* Instant grading
* Answer explanations
* Personality-driven puns

### Multimodal File Support

Drag-and-drop uploads for:

* PDFs
* Images
* Text files

All processed using Gemini’s cloud file system.

### Cinematic UI

Dual theme modes:

* **Sakura Mode (Light)**
* **Yozakura Mode (Dark)**

Includes smooth opacity transitions and CSS variable-based styling.

### Session Persistence

Stores the uploaded file’s **URI** in `localStorage`, allowing users to switch between study modes without re-uploading documents.

---

## Tech Stack

| Layer          | Technology                                                              |
| -------------- | ----------------------------------------------------------------------- |
| **Frontend**   | HTML5, CSS3 (Custom Variables & Transitions), Vanilla JavaScript (ES6+) |
| **Backend**    | Node.js (v18+) with Express.js                                          |
| **AI Engine**  | Google Gemini API (`gemini-2.5-flash`)                                  |
| **Middleware** | Multer (RAM-based file buffering)                                       |
| **Deployment** | Render.com (Backend), Static Hosting (Frontend)                         |

---

## Technical Architecture & Design Decisions

### 1. Decoupled Workflow

| Component            | Responsibility                                    |
| -------------------- | ------------------------------------------------- |
| **Client (Browser)** | UI logic, theme switching, instant quiz grading   |
| **Server (Backend)** | API security, file handling, Gemini communication |

This separation improves security, performance, and scalability.

---

### 2. Stateful File Handling (URI System)

Instead of re-uploading files for each request:

1. Files are uploaded once to Google AI’s File Manager
2. The server returns a **URI (Unique Resource Identifier)**
3. The frontend stores this URI in memory
4. Future requests (quiz, notes, summary) reuse the URI

This makes SakurAi significantly faster and more efficient.

---

### 3. The “Nuclear Prompt” Strategy

To eliminate Markdown conversion overhead:

* Notes are generated as **strict HTML** (`<h3>`, `<ul>`, `<li>`)
* Quizzes are generated as a **structured JSON object**

The frontend renders HTML notes directly and dynamically builds the quiz interface from JSON.

---

## Getting Started

### Prerequisites

* Node.js **v18 or higher**
* A **Gemini API Key** from Google AI Studio

---

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/sakurai.git
cd sakurai
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_key_here
PORT=3000
```

Start the server:

```bash
npm start
```

---

## Project Milestones (January 2026)

| Date      | Milestone                                         |
| --------- | ------------------------------------------------- |
| Jan 19    | Initial commit and project foundation             |
| Jan 23    | UI overhaul and quiz logic integration            |
| Jan 24    | Multer integration and cloud file upload system   |
| Jan 25–26 | Production deployment and theme system refinement |

---

## Author

**Santosh Lochan** ---
Built with the vision of making revision faster, smarter, and more interactive.

---

If you want next, I can help you add screenshots, API documentation, or a license section.
