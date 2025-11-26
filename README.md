# AI-Powered Academic Planner

The **AI-Powered Academic Planner** is a web application designed to help students create conflict-free class schedules efficiently. It provides an intuitive interface to add courses, manage time slots, and later integrate AI to automatically generate optimized schedules.

## Overview

Users can manually add courses by specifying the course name, day of the week, start and end times, and room. The planner prevents duplicate entries for the same course and time. It displays all added courses clearly, allowing users to delete or adjust them as needed. A future AI backend will analyze available time slots and propose an optimal, non-overlapping timetable.

## Features

* Add and manage courses with day, start time, end time, and classroom.
* Prevents duplicate entries for the same day and time.
* Delete or edit existing slots.
* Organized list of all added courses.
* (Planned) AI-powered scheduling for automatic timetable optimization.
* Clean dark theme with responsive layout.

## Tech Stack

**Frontend**

* React (with TypeScript)
* Vite
* Zustand (for state management)
* Custom CSS (Dark Theme)

**Backend**

* Node.js + Express
* Prisma ORM
* SQLite (default) — compatible with MySQL or PostgreSQL

## Folder Structure

```
AI-Powered-Academic-Planner/
│
├── backend/
│   ├── prisma/                # Database schema and migrations
│   ├── src/                   # Express routes and Prisma setup
│   ├── server.ts              # Backend entry point
│
├── frontend/
│   ├── components/            # UI components (Builder, Input, Select, TimeWheel, etc.)
│   ├── pages/                 # Page components (Schedule, Builder)
│   ├── store/                 # Zustand state management
│   ├── App.tsx                # Root React component
│   ├── main.tsx               # Entry point
│   └── App.css                # Dark theme styling
│
└── README.md
```

## Setup Instructions

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

Backend runs at:
`http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
`http://localhost:5173`

## Planned Features

* AI-powered optimization (using OpenAI or a local LLM)
* Export schedules as PDF or image
* User authentication to save schedules
* Theme customization (light/dark toggle)

## Developer Notes

This project demonstrates an intelligent planner built on a modern full-stack setup. Zustand provides simple yet powerful state management. The backend and frontend are modular, allowing easy future integration of AI or database upgrades.
