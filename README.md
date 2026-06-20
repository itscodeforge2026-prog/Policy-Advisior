# PolicySphere Advisors SaaS Platform

**PolicySphere Advisors** is a complete, production-ready SaaS-quality insurance advisory web platform built for independent insurance advisors (specifically highlighting the real licensing and portfolios of **Dimple Shah** and **Bharat Shah**).

This platform acts as an educational and tools portal, enabling visitors to compare insurance categories, calculate actuarial premiums, perform personal financial needs assessments, book slots, and upload KYC files.

---

## 🏛️ System Architecture

The platform follows a modern, decoupled monorepo architecture:

```text
                                 ┌──────────────────────┐
                                 │      Web Browser     │
                                 │   (React 19 Client)  │
                                 └──────────┬───────────┘
                                            │
                                            │ REST APIs / HTTPS
                                            ▼
┌────────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│       Gemini AI        │◄─────►│    Express Server    │◄──────►  PostgreSQL Database │
│  (Assistant & Reports) │       │   (TypeScript API)   │       │     (Prisma ORM)     │
└────────────────────────┘       └──────────┬───────────┘       └──────────────────────┘
                                            │
                                            ▼
                                 ┌──────────────────────┐
                                 │  Nodemailer Service  │
                                 │ (SMTP Confirmations) │
                                 └──────────────────────┘
```

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Recharts, Framer Motion, Axios, React Router, React Hook Form, React Query.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL (Prisma ORM), falling back to a local SQLite (`dev.db`) file for local development.
- **Authentication**: Stateful JWT sessions with silent refresh token rotations in HTTP-Only cookies.
- **AI Engine**: Gemini API endpoints to compute insurance gap reports and write marketing templates.

---

## 📂 Project Structure

```text
/
├── shared/                  # Common TypeScript interfaces & Zod validation schemas
├── backend/                 # Node.js + Express REST API Server
│   ├── prisma/              # SQLite/PostgreSQL schemas and seed engines
│   └── src/                 # REST controllers, routes, and services
└── frontend/                # React 19 SPA client
    ├── src/                 # Dashboards, public sections, and helpers
    └── index.html           # Main entrance
```

---

## 🛠️ Environment Variables Configuration

Create a `.env` file in the `backend/` directory based on the following template:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/policysphere_db?schema=public"
JWT_SECRET="your_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
GEMINI_API_KEY="your_google_gemini_api_key"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USER="your_smtp_user"
EMAIL_PASS="your_smtp_pass"
EMAIL_FROM="no-reply@policysphereadvisors.com"
```

---

## ⚙️ Local Installation & Running Guide

### Prerequisites
- Node.js (v20+)
- npm (v10+)

### Setup Steps

1. **Install workspace dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database Models (SQLite dev.db)**:
   ```bash
   npm run build --workspace=shared
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

3. **Run Services Locally**:
   - Run backend API (port 5000):
     ```bash
     npm run dev:backend
     ```
   - Run frontend client (port 5173):
     ```bash
     npm run dev:frontend
     ```

---

## 🛢️ Database Model ER Diagram

Our normalized database schema is mapped in Prisma as follows:

```text
  ┌──────────────┐         ┌───────────────────┐         ┌───────────────────────┐
  │     User     │◄───────┬│   RefreshToken    │         │   InsuranceCategory   │
  │ (Admin/Adv)  │        │└───────────────────┘         └───────────────────────┘
  └──────┬───────┘        │
         │1               │1..*
         │                │
         │1               ▼
  ┌──────▼───────┐         ┌───────────────────┐         ┌───────────────────────┐
  │CustomerProfile│◄───────│    Document       │         │       FAQ / Blog      │
  │ (Details)    │        │ (PAN/Aadhaar safe)│         └───────────────────────┘
  └──────┬───────┘        └───────────────────┘
         │
         ├───────────────►┌───────────────────┐
         │1..*            │    Appointment    │
         │                │ (Pending/Approved)│
         │                └───────────────────┘
         ├───────────────►┌───────────────────┐
         │1..*            │NeedsAnalysisReport│
         │                │  (AI suggestions) │
         │                └───────────────────┘
         └───────────────►┌───────────────────┐
                          │PremiumCalculation │
                          │ (History log)     │
                          └───────────────────┘
```

---

## 📡 REST API Documentation

### Auth Module (`/api/auth`)
- `POST /register` - Creates a new user profile (`CUSTOMER` role by default).
- `POST /login` - Validates credentials. Sets `refresh_token` in cookie and returns `accessToken`.
- `POST /refresh` - Rotates refresh tokens to return new access token.
- `POST /logout` - Invalidates current user sessions.
- `GET /me` - Returns active session details.

### Premium Calculator (`/api/calculator`)
- `POST /calculate` - Computes premiums based on actuarial algorithms and logs results.
- `GET /history` - Retreives current customer calculation log.

### AI Assistant Module (`/api/ai`)
- `POST /chat` - Interactive assistant chatbot (handles context retention).
- `POST /quiz-report` - Runs needs calculations and generates report.

### CRM & Consultations (`/api/appointments` & `/api/crm`)
- `POST /appointments/book` - Schedules meetings (provisions new CRM leads automatically).
- `GET /crm/leads` - List leads (Advisor/Admin only).
- `PUT /crm/leads/:id` - Updates lead pipeline status.

---

## 🚀 Cloud Deployment Pipeline

### Frontend (Vercel)
1. Link your repository to Vercel.
2. Set build directory to `frontend/`.
3. Build command: `npm run build`.
4. Configure environment variables mapping API endpoints to the backend URL.

### Backend (Railway)
1. Deploy `backend/` workspace to Railway.
2. Set Start Command: `node dist/index.js`.
3. Add environment variables (JWT secrets, SMTP configs).

### Database (Neon PostgreSQL)
1. Provision a Serverless Neon PostgreSQL database.
2. Copy the connection string and paste it into Railway's `DATABASE_URL` env variable.
3. Apply migrations in production: `npx prisma migrate deploy`.
