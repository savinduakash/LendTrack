# LendTrack

LendTrack is a full-stack lending tracker with a React frontend and an Express/MongoDB backend.

## Project structure

- `frontend/` - React application powered by Vite
- `backend/` - Express API backed by MongoDB

## Setup

Install dependencies in both applications:

```bash
cd frontend && npm install
cd ../backend && npm install
```

Create `backend/.env` with:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the backend:

```bash
cd backend
npm start
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```
