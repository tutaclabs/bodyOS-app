# BodyOS Backend

## Local setup

1) Create `.env` from `.env.example` and set `DATABASE_URL` + `JWT_SECRET`.
   - If you don't have Postgres locally, run: `docker compose up -d` (from `backend/`) and use the default `DATABASE_URL` in `.env.example`.
2) Install deps:
   - `cd backend`
   - `npm install`
3) Run migrations + generate Prisma client:
   - `npm run prisma:migrate:dev`
4) Start:
   - `npm run dev`

API runs on `PORT` (default `3001`).

## Render deploy (single service + single DB)

- Create a Render **PostgreSQL** instance and copy its `DATABASE_URL`.
- Create a Render **Web Service** from this repo and set:
  - `Root Directory`: `backend`
  - `Build Command`: `npm install && npm run build && npm run prisma:generate && npm run prisma:migrate:deploy`
  - `Start Command`: `npm run start`
  - Env vars:
    - `DATABASE_URL`
    - `JWT_SECRET`
    - `CORS_ORIGINS` (your web domain + your Expo origins)
    - `AI_ENABLED` (`true|false`)
    - `OPENAI_API_KEY` (if AI is enabled)
    - `OPENAI_MODEL` (optional)

## Endpoints

- `GET /health`
- `POST /auth/register` `{ email, password }`
- `POST /auth/login` `{ email, password }`
- `POST /auth/refresh` `{ refreshToken }`
- `POST /auth/logout` `{ refreshToken }`
- `GET /me` (Bearer access token)
- `GET /state` (Bearer access token)
- `PUT /state/protocols` `{ protocols }`
- `PUT /state/wellness-metrics` `{ wellnessMetrics }`
- `PUT /state/nutrition-floors` `{ nutritionFloors }`
- `PUT /state/chat-history` `{ chatHistory }`
- `POST /ai/bodyos-chat` `{ message, language, history }` (Bearer access token, requires `AI_ENABLED=true`)
- `POST /ai/research` `{ question }` (requires `AI_ENABLED=true`)
- `POST /ai/insights` `{ protocols, nutritionFloors }` (requires `AI_ENABLED=true`)
- `POST /ai/safety` `{ protocols }` (requires `AI_ENABLED=true`)
- `POST /ai/protocol-parser` `{ text }` (requires `AI_ENABLED=true`)
