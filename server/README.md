# Nivarak — Elder Care Platform Backend API

> Phase 1 MVP | Modular Monolith | Node.js + TypeScript + Hono + Drizzle ORM

## Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://nivarak:nivarak_dev@localhost:5432/nivarak_db

COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
COGNITO_CLIENT_ID=your_cognito_app_client_id
AWS_REGION=ap-south-1

PORT=3000
NODE_ENV=development
OTP_DEV_MODE=true
```

Alternatively, copy the example file:

```bash
cp .env.example .env
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

**Linux / macOS / Git Bash:**
```bash
cp .env.example .env
```

**PowerShell:**
```powershell
Copy-Item .env.example .env
```

### 3. Start PostgreSQL (Docker)

```bash
docker run -d --name nivarak-db \
  -e POSTGRES_USER=nivarak \
  -e POSTGRES_PASSWORD=nivarak_dev \
  -e POSTGRES_DB=nivarak_db \
  -p 5432:5432 \
  postgres:16
```

### 4. Push schema to database

```bash
npm run db:push
```

### 5. Start development server

```bash
npm run dev
```

Server will be running at `http://localhost:3000`

---

## Troubleshooting

### PostgreSQL port conflict

If PostgreSQL is already running locally on port 5432:

```bash
# Linux/macOS
sudo lsof -i :5432

# Windows
netstat -ano | findstr :5432
```

**Solutions:**
- Stop your local PostgreSQL service, or
- Map Docker to another port and update `DATABASE_URL`

---

## Project Structure

```bash
src/
├── config/           # Environment and app configuration
├── db/
│   ├── schema/       # Drizzle ORM schema (all 13+ tables)
│   ├── connection.ts # Database connection manager
│   └── seed.ts       # Role seeding (6 roles with permissions)
├── middleware/
│   ├── auth.ts       # JWT validation, RBAC, ABAC middleware
│   ├── error-handler.ts
│   └── request-logger.ts
├── modules/
│   ├── auth/         # OTP, login, JWT, sessions, invites
│   ├── patients/     # Patient CRUD, caregiver linking, consent
│   ├── visits/       # Visit lifecycle (draft → completed → locked)
│   ├── vitals/       # Vitals recording, thresholds, trending
│   ├── scoring/      # 25-param aging score engine, risk bands
│   ├── tasks/        # Task lifecycle, assignment, escalation
│   ├── alerts/       # Auto-alert from events, acknowledgement
│   ├── documents/    # Upload/download with signed URLs
│   ├── notifications/ # Dispatcher with channel adapters
│   ├── dashboard/    # Role-specific aggregate dashboards
│   └── audit/        # Immutable audit log from all events
├── shared/
│   ├── errors.ts     # Typed error hierarchy
│   ├── event-bus.ts  # In-process domain event bus
│   ├── logger.ts     # Structured JSON logging (pino)
│   └── response.ts   # Standard API response envelope
├── app.ts            # Hono app — mounts all modules
└── server.ts         # HTTP server entry point
```

## API Endpoints

**Base URL:** `/api/v1`

### Authentication

| Method | Endpoint              | Purpose                          |
|--------|-----------------------|----------------------------------|
| POST   | `/auth/request-otp`   | Send OTP to phone                |
| POST   | `/auth/verify-otp`    | Verify OTP and receive tokens    |
| POST   | `/auth/login`         | Phone + password login           |
| POST   | `/auth/register`      | Create new account               |
| POST   | `/auth/refresh`       | Refresh access token             |
| POST   | `/auth/logout`        | Invalidate session               |
| POST   | `/auth/invite`        | Invite new user (Admin only)     |

> **Other modules** (Patients, Visits, Vitals, Scoring, Tasks, Alerts, Documents, Dashboard, Notifications, Audit) — See full API spec in the architecture document.

## Architecture Highlights

- **Modular Monolith**: 12 clearly bounded modules, ready for future extraction
- **Event-Driven**: Domain events power audit, alerts & notifications
- **Multi-layer Auth**: JWT + RBAC middleware + planned Postgres RLS
- **ABAC Enforcement**: Patient-caregiver relationship checks
- **Scoring Engine**: 25-parameter aging score across 8 weighted domains
- **Alert Pipeline**: `vital.recorded → threshold check → alert.created → notification dispatched`

## Dev Mode Features

- **OTP Dev Mode**: OTPs logged to console (no SMS needed)
- **Local File Storage**: Documents saved to `./uploads/` (S3 ready)
- **Notification Stubs**: WhatsApp/SMS logged instead of sent
- **Pretty Logging**: Colored, human-readable logs in development

## Database Management

```bash
npm run db:push      # Apply schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migrations
```
