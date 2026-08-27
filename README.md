# Internal Inventory Management System

A dedicated, responsive internal inventory management web application built with React, Vite, Node.js, Express, TypeScript, Prisma, and MariaDB 10.4.x.

## 1. Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Lucide React, ZXing Browser Scanner, QRCode.react.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM 7.x, JWT in HTTP-Only Cookies, bcryptjs.
- **Database**: MariaDB 10.4.x.

## 2. Setup & Installation

### Step 1: Clone and Configure Environment Variables
Copy `.env.example` in `backend/`:
\`\`\`bash
cp backend/.env.example backend/.env
\`\`\`

Verify `backend/.env`:
\`\`\`ini
DATABASE_URL="mysql://root:password@localhost:3306/inventory_system"
PORT=3000
FRONTEND_URL="http://localhost:5173"
AUTH_SECRET="your_production_secret_key"
NODE_ENV="development"
\`\`\`

### Step 2: Install Dependencies
\`\`\`bash
cd backend && npm install
cd ../frontend && npm install
cd ..
\`\`\`

### Step 3: Run Database Migrations and Seed
\`\`\`bash
cd backend
npx prisma migrate dev --name init
npm run prisma:seed
\`\`\`

Default seeded credentials:
- **Username**: `superadmin`
- **Password**: `AdminDev123!`

### Step 4: Run Development Servers
In separate terminals:
\`\`\`bash
# Backend (Port 3000)
cd backend && npm run dev

# Frontend (Port 5173)
cd frontend && npm run dev
\`\`\`

Visit `http://localhost:5173` to sign in.