# BridgeKos - SaaS Boarding House Management Platform

A comprehensive platform for managing boarding houses (kos/kost) with features for owners, tenants, and administrators.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 22+ with TypeScript
- **Framework**: Express 5
- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma ORM
- **Auth**: JWT + Refresh Tokens, Argon2 password hashing
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Vitest + Supertest
- **Package Manager**: pnpm

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI)
- **State**: TanStack Query + Zustand
- **Routing**: React Router 7
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Package Manager**: pnpm

## 📦 Project Structure

```
Bridgekos v2/
├── bridgekos-backend/     # Backend API
│   ├── prisma/           # Database schema & migrations
│   ├── src/
│   │   ├── modules/      # Feature modules (auth, boarding_houses, bookings, etc.)
│   │   ├── middleware/   # Express middleware
│   │   ├── config/       # Configuration
│   │   └── utils/        # Utilities
│   └── test/             # Integration tests
└── bridgekos-frontend/    # Frontend Application
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Page components
    │   ├── hooks/        # Custom React hooks
    │   ├── services/     # API services
    │   ├── store/        # State management
    │   └── routes/       # Routing configuration
    └── public/
```

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 22
- pnpm >= 11.20.0

### Installation

```bash
# Install dependencies for both projects
cd bridgekos-backend && pnpm install
cd ../bridgekos-frontend && pnpm install
```

### Development

**Backend:**
```bash
cd bridgekos-backend
cp .env.example .env
# Edit .env with your configuration
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

**Frontend:**
```bash
cd bridgekos-frontend
cp .env.example .env
# Edit .env with your configuration
pnpm dev
```

### Environment Variables

**Backend (.env):**
```
DATABASE_URL="file:./dev.db"          # SQLite for dev
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000/api/v1
```

## 📋 Features

### For Tenants
- Browse & search boarding houses
- View details, photos, facilities, reviews
- Book rooms with date selection
- Payment integration (QRIS, Bank Transfer, E-Wallet)
- Wishlist/Favorites
- Booking history & status tracking
- Notifications

### For Owners
- Dashboard with analytics
- Manage boarding houses (CRUD)
- Room management with pricing & availability
- Booking management (confirm/reject)
- Payment tracking
- Subscription plans (Free, Starter, Business, Premium)
- Review replies

### For Admins
- User management
- Boarding house moderation
- Subscription oversight
- Reports & analytics

## 🔧 Available Scripts

### Backend
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run tests |
| `pnpm prisma:studio` | Open Prisma Studio |

### Frontend
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run tests |

## 🗄️ Database Schema

Key models:
- **User** - Authentication & roles (OWNER, TENANT, ADMIN)
- **Owner** - Business profile, verification, subscriptions
- **Tenant** - Profile, preferences
- **BoardingHouse** - Property details, location, facilities
- **Room** - Individual rooms with pricing & availability
- **Booking** - Reservations with status workflow
- **Payment** - Transactions with multiple methods
- **Subscription** - SaaS plans for owners
- **Review** - Ratings & comments
- **Favorite** - Wishlist functionality
- **Notification** - Multi-channel notifications

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For questions or issues, please open a GitHub issue.