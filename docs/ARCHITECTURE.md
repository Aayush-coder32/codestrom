# Architecture

The React/Vite client owns presentation and keeps the short-lived access token in memory. The Express API owns authentication, authorization, model calls, uploads, and persistence. MongoDB stores users, refresh-token hashes, conversations, messages, and document metadata.

Chat uses a newline-delimited SSE protocol:

- `message_start`: `{ conversationId }`
- `content_delta`: `{ delta }`
- `message_complete`: `{ content }`
- `error`: `{ error }`

The browser aborts the fetch when the stop button is pressed. The API observes the disconnected request and aborts the OpenAI request. All conversation and document queries include the authenticated owner id.

The current upload adapter stores extracted bytes in MongoDB metadata for local development. Before production, replace `storageKey` with an S3-compatible private object store and add PDF parsing/chunk embeddings (the API boundary is intentionally isolated in `document.routes.ts`).
