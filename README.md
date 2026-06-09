# Nivarak — Elder Care Platform Backend API

> Phase 1 MVP | Modular Monolith | Node.js + TypeScript + Hono + Drizzle ORM

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (Docker)
docker run -d --name nivarak-db \
  -e POSTGRES_USER=nivarak \
  -e POSTGRES_PASSWORD=nivarak_dev \
  -e POSTGRES_DB=nivarak_db \
  -p 5432:5432 \
  postgres:16

# 3. Push schema to database
npm run db:push

# 4. Start development server
npm run dev
```

Server runs at `http://localhost:3000`

## Project Structure

```
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
│   ├── documents/    # Upload/download with signed URL pattern
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

Base URL: `/api/v1`

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/request-otp` | Send OTP to phone |
| POST | `/auth/verify-otp` | Verify OTP, get tokens |
| POST | `/auth/login` | Phone + password login |
| POST | `/auth/register` | Create account |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/invite` | Invite new user (Admin) |

### Patients, Visits, Vitals, Scores, Tasks, Alerts, Documents, Dashboard, Notifications, Audit
→ See full API spec in the architecture document.

## Architecture Highlights

- **Modular Monolith**: 12 modules with clear boundaries, ready for extraction
- **Event-Driven**: Domain events propagate across modules (audit, alerts, notifications)
- **Three-Tier Auth**: JWT → RBAC middleware → Postgres RLS (planned)
- **ABAC**: Patient-link enforcement for caregivers/patients
- **Scoring Engine**: 25-parameter aging score with 8 weighted domains
- **Alert Pipeline**: `vital.recorded → threshold check → alert.created → notification dispatched`

## Dev Mode Features

- **OTP Dev Mode**: OTPs logged to console (no SMS sent)
- **Local File Storage**: Documents stored in `./uploads/` (S3-ready)
- **WhatsApp/SMS Stubs**: Notifications logged, not sent
- **Pretty Logging**: Colored, human-readable logs in dev

## Database

PostgreSQL 16+ required. Schema managed by Drizzle ORM.

```bash
npm run db:push     # Push schema to DB
npm run db:studio   # Open Drizzle Studio (visual DB browser)
npm run db:generate # Generate SQL migrations
```
