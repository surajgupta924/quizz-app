# CodingClave Development LLP — Online Examination System

A production-oriented MERN platform for secure, role-based online examinations. It includes one-time administrator onboarding, passwordless OTP login, exam/question management, individualized question and option ordering, a guarded fullscreen exam room, automatic scoring, analytics, leaderboards, and PDF/Excel exports.

## Architecture

```text
online-examination-system/
├── client/                     React + Vite SPA
│   └── src/
│       ├── components/         Reusable UI and route guards
│       ├── context/            Theme state
│       ├── hooks/              Exam integrity guard
│       ├── layouts/            Auth and dashboard shells
│       ├── pages/              Admin, student, auth pages
│       ├── redux/              Session state
│       └── services/           Axios client and interceptors
└── backend/                    Express REST API
    └── src/
        ├── config/             Database connection
        ├── controllers/        Request/business orchestration
        ├── middlewares/        Auth, errors, uploads, validation
        ├── models/             Mongoose schemas
        ├── routes/             Versioned REST routes
        ├── utils/              OTP, JWT, errors
        └── validators/         Express-validator rules
```

## Data model

- `users`: admins and students, separated with an indexed `role`. Email and mobile are globally unique. Passwords use bcrypt with cost 12.
- `exams`: schedule, marking rules, state, instructions, and unique public code.
- `questions`: exam-scoped options, protected correct answers, marks and difficulty.
- `results`: one attempt per student/exam, randomized ordering, answers, warnings and computed result.
- `otps`: HMAC-hashed, five-minute TTL records with a five-attempt ceiling.
- `notifications`: recipient-scoped messages and read status.
- `activitylogs`: auditable actor/action/resource records.

Using one `users` collection avoids duplicated authentication logic while retaining strict role-based isolation.

## Local setup

Requirements: Node.js 20+, npm 10+, and MongoDB Atlas (or MongoDB 7 locally).

```bash
cp backend/.env.example backend/.env
cp client/.env.example client/.env
npm run install:all
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:5000`.

For local OTP testing, keep `EXPOSE_OTP=true`. The API returns the code only outside production. Configure the `SMTP_*` variables for Nodemailer. Registration, login, and password-reset OTPs for both admins and students are delivered by email; mobile numbers are contact information only.

## Environment variables

Backend variables are documented in `backend/.env.example`. Use independent 32+ byte random values for `JWT_SECRET` and `OTP_PEPPER`. Set `CLIENT_URL` to the exact Vercel origin; comma-separated origins are supported.

Frontend:

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | Render API URL ending in `/api/v1` |
| `VITE_APP_NAME` | Display name |

Never commit `.env` files.

## REST API

All protected routes accept an HttpOnly cookie or `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register/request-otp` | Public | Begin verified registration |
| POST | `/api/v1/auth/register` | Public | Create admin/student account |
| POST | `/api/v1/auth/login/request-otp` | Public | Send role-specific login OTP |
| POST | `/api/v1/auth/login/verify-otp` | Public | Verify and issue JWT |
| POST | `/api/v1/auth/password/forgot` | Public | Request password reset OTP |
| POST | `/api/v1/auth/password/reset` | Public | Verify OTP and reset password |
| GET | `/api/v1/auth/me` | Signed in | Current session |
| PATCH | `/api/v1/auth/profile` | Signed in | Update profile |
| PATCH | `/api/v1/auth/password` | Signed in | Change password |
| GET/POST | `/api/v1/exams` | Role scoped | List/create exams |
| GET/PATCH/DELETE | `/api/v1/exams/:id` | Role scoped | Exam operations |
| POST | `/api/v1/exams/:id/deploy` | Admin | Publish and return unique URL |
| POST | `/api/v1/exams/:id/close` | Admin | Close an exam |
| GET/POST | `/api/v1/exams/:examId/questions` | Admin | Question bank |
| PATCH/DELETE | `/api/v1/exams/questions/:id` | Admin | Change a question |
| POST | `/api/v1/exams/attempts/start/:code` | Student | Start/resume randomized attempt |
| POST | `/api/v1/exams/attempts/:id/warning` | Student | Record integrity warning |
| POST | `/api/v1/exams/attempts/:id/submit` | Student | Idempotent scoring/submission |
| GET | `/api/v1/results/mine` | Student | Exam history |
| GET | `/api/v1/results/:id` | Owner/Admin | Result detail |
| GET | `/api/v1/results/leaderboard/:examId` | Signed in | Ranked results |
| GET | `/api/v1/admin/dashboard` | Admin | Analytics summary |
| GET | `/api/v1/admin/students` | Admin | Search/paginate students |
| GET | `/api/v1/admin/results` | Admin | Filter/paginate results |

## Production deployment

### MongoDB Atlas

1. Create an M10+ production cluster, a least-privilege database user, and appropriate network access.
2. Put the `mongodb+srv` URI in Render as `MONGODB_URI`.
3. Enable backups, alerts, and query performance monitoring.

### Render API

1. Create a Blueprint using `backend/render.yaml`, or a Node web service rooted at `backend`.
2. Build command: `npm ci`; start command: `npm start`; health path: `/api/health`.
3. Add all backend variables. Set `NODE_ENV=production`, `EXPOSE_OTP=false`, and `CLIENT_URL=https://your-app.vercel.app`.
4. Configure Nodemailer SMTP credentials. Use Cloudinary/S3 instead of ephemeral local uploads for production images.

### Vercel client

1. Import the repository and set root directory to `client`.
2. Build command: `npm run build`; output directory: `dist`.
3. Set `VITE_API_URL=https://your-api.onrender.com/api/v1`.
4. `vercel.json` provides SPA history fallback.

## Security notes

Helmet, strict CORS, rate limits, request size limits, Mongo operator sanitization, schema validation, role guards, HttpOnly secure cookies, OTP hashing/TTL, and centralized errors are enabled. Browser anti-cheating is deterrence—not absolute prevention. High-stakes deployments should add server heartbeats, proctoring consent, device fingerprint policy, Redis-backed OTP/rate limiting, CSRF tokens for cookie-only clients, durable object storage, queue-backed email, structured logs, and automated integration tests.

The client locally checkpoints answers during connectivity interruptions. A browser cannot reliably submit after it has been force-closed; production-grade crash recovery requires a periodic server-side answer sync endpoint and is intentionally distinguished from misleading `beforeunload` claims.

## License

Private project. Add your organization’s license before redistribution.
