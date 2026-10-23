# Deployment

## Render

Create a Node web service from the repository with root directory `server`, build command `npm install --workspace server && npm run build --workspace server`, and start command `npm start --workspace server`. Set every variable in `server/.env.example`, use independent random JWT secrets, and set `FRONTEND_ORIGIN` to the deployed Vercel URL.

## Vercel

Import the repository, set the root directory to `client`, and set `VITE_API_BASE_URL` to the Render API URL including `/api`. Configure the Render CORS origin to the exact Vercel origin.

## MongoDB Atlas

Create a dedicated application user, restrict network access to the backend, and use the SRV connection string as `MONGODB_URI`. Back up the database and do not expose its credentials to Vite.
