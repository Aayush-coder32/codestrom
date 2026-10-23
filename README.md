# Nexus AI

Nexus AI is a production-oriented ChatGPT-style assistant built as a TypeScript monorepo. The browser talks to an Express API; secrets, model calls, authentication, and persistence remain server-side.

## Stack

- React, Vite, TypeScript, React Router, TanStack Query
- Express, Mongoose, Zod, bcryptjs, JWT, SSE
- OpenAI Responses API (configurable model)
- Vitest, React Testing Library, Supertest

## Local setup

1. Install Node.js 20 or newer and MongoDB (local or Atlas).
2. Run `npm install` at the repository root.
3. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`.
4. Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `OPENAI_API_KEY`.
5. Run `npm run dev`.

The client runs on `http://localhost:5173` and the API on `http://localhost:5000`.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API.md](docs/API.md), and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
