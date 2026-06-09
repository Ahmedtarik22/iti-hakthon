# Bilingual Library Management UI — Nebras LMS

Full-stack bilingual library management system (Arabic/English RTL).  
Original UI design: [Figma](https://www.figma.com/design/qDuAE1pGbYHm1bksiIhuIV/Bilingual-Library-Management-UI).

## Stack

- **Frontend:** React + Vite + Tailwind
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **API:** REST `/api/v1` (see `Endpoints.md`)

## Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/nebras_lms`)

## Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Seed the database (books, members, users, sample borrows)
npm run seed

# 4. Start the API server (terminal 1)
npm run dev:backend

# 5. Start the frontend (terminal 2)
npm run dev
```

Open http://localhost:5173

## Demo login

| Email | Password | Role |
|-------|----------|------|
| `admin@nebras.sa` | `Admin@123` | Admin |
| `fatima@nebras.sa` | `Librarian@123` | Librarian |

## Project docs

- `Endpoints.md` — API specification
- `Database.md` — data model
- `Requirements.md` — functional requirements
- `project.md` — project plan
# iti-hakthon
