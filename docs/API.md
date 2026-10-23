# API

All private endpoints require `Authorization: Bearer <access token>`. Refresh tokens are rotated in an HttpOnly cookie named `nexus_refresh`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness check |
| POST | `/api/auth/register` | Create a local account |
| POST | `/api/auth/login` | Authenticate |
| POST | `/api/auth/refresh` | Rotate refresh cookie and issue access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/conversations` | List/create conversations |
| GET | `/api/conversations/:id/messages` | Load messages |
| PATCH/DELETE | `/api/conversations/:id` | Rename/delete |
| POST | `/api/chat/stream` | Persist a user message and stream an assistant response |
| GET | `/api/documents` | List owned documents |
| POST | `/api/documents/upload` | Upload a PDF (`multipart/form-data`, field `file`) |
| DELETE | `/api/documents/:id` | Delete an owned document |
