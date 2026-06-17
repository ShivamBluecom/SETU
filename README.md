# SETU — Bluecom Group Sales CRM

A B2B sales CRM for Bluecom Group built with Next.js 14, Prisma (Azure SQL), and NextAuth (Azure AD).

---

## Prerequisites

- Node.js 18+
- Access to an Azure SQL database
- An Azure AD (Microsoft Entra ID) app registration with redirect URI set

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd setu
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|----------|-------------|
| `AZURE_AD_CLIENT_ID` | App registration client ID from Azure portal |
| `AZURE_AD_CLIENT_SECRET` | Client secret from Azure portal |
| `AZURE_AD_TENANT_ID` | Your Azure AD tenant ID |
| `DATABASE_URL` | Azure SQL connection string (see format below) |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `AUTH_TRUST_HOST` | Set to `true` |

**Azure SQL connection string format:**
```
sqlserver://HOST.database.windows.net:1433;database=DB_NAME;user=USER@HOST;password=PASS;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30
```

### 3. Azure AD App Registration

1. Go to Azure Portal → Azure Active Directory → App registrations → New registration
2. Set redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`
3. Add a client secret under "Certificates & secrets"
4. Copy the client ID, tenant ID, and secret into `.env.local`

### 4. Generate Prisma client

```bash
npm run db:generate
```

### 5. Run migrations

```bash
npm run db:migrate
```

This creates all tables in your Azure SQL database.

### 6. Seed the database

```bash
npm run db:seed
```

Creates a default Territory ("All India"), Business Unit ("Direct Sales"), ADMIN user, and demo Company.

**After seeding:** Sign in with `vishnu.sharma@bluecomgroup.in` via Azure AD — the account is pre-seeded as ADMIN.

---

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the Azure AD login page.

---

## Database management

```bash
npm run db:studio    # Open Prisma Studio (visual DB editor)
npm run db:migrate   # Run pending migrations
npm run db:generate  # Regenerate Prisma client after schema changes
```

---

## Role system

| Role | Access |
|------|--------|
| `ISR` | Sees only opportunities they created |
| `ACCOUNT_MANAGER` | Sees opportunities they created or own |
| `BU_MANAGER` | Sees all opportunities in their BU |
| `BU_HEAD` | Sees all BU opportunities; can assign owners; gets Won/Lost notifications |
| `TERRITORY_MANAGER` | Sees all opportunities in their territory; gets Won/Lost notifications |
| `ADMIN` | Full access; manages users, BUs, territories |

Role assignment is done by an ADMIN in `/admin → Users tab`.

---

## BU Assignment flows

- **Flow A (BU has a BU Head):** BU Head manually assigns `bu_owner_id` from the opportunity drawer.
- **Flow B (BU has no BU Head):** On opportunity creation, the system auto-assigns the single BU Manager of that BU as owner.

---

## Production deployment

1. Set `NEXTAUTH_URL` to your production URL
2. Add the production redirect URI to your Azure AD app registration:
   `https://your-domain.com/api/auth/callback/azure-ad`
3. Run `npm run build` then `npm run start`
4. Or deploy to Azure App Service / Vercel with environment variables configured

---

## Tech stack

- **Next.js 14** — App Router, Server Components, Server Actions
- **Prisma** — ORM with SQL Server (Azure SQL) adapter
- **NextAuth v5** — Azure AD OAuth with JWT sessions
- **Tailwind CSS v3** — Utility-first styling
- **@dnd-kit** — Drag-and-drop for Kanban board
- **@radix-ui** — Accessible UI primitives (Dialog, Tabs, Select, Tooltip)
- **Zod** — Runtime validation for API routes
