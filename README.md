# LeeMind

A full-stack AI-powered learning platform that transforms user-uploaded documents into interactive learning tools. Built with React, Java Spring Boot, and OpenAI's API.

## Features

- **9 AI Learning Tools** — Generate flashcards, quizzes, concept maps, study guides, key facts, infographics, slide decks, audio summaries, and narrated video presentations from any uploaded document
- **AI Chat Tutor** — Conversational AI tutor with persistent chat history for follow-up questions
- **Interactive Components** — Flip-card flashcard viewer with keyboard navigation, scored multiple-choice and short-answer quizzes, SVG-based concept map renderer, and a synchronized slide/audio video player
- **Multi-modal Output** — Combines text generation and text-to-speech via OpenAI's API to produce narrated slide presentations playable directly in the browser

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, CSS |
| Backend | Java, Spring Boot, Spring AI |
| AI | OpenAI API (chat + audio) |

## Getting Started

### Prerequisites
- Node.js
- Java 17+
- Maven
- OpenAI API key

### Environment Setup

Create a `.env` file in the `backend/` directory:
```
SPRING_AI_OPENAI_API_KEY=your_openai_api_key_here
```

### Run the Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.
