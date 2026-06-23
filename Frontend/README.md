# ✈️ TravelNest — Tours & Travel Booking System

Full-stack travel booking platform built with React + Spring Boot.

## Frontend Setup

\`\`\`bash
npm create vite@latest travelnest -- --template react
cd travelnest
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios zustand lucide-react
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
├── api/          → Axios instance + JWT interceptor
├── components/   → Reusable UI components
├── data/         → Dummy JSON data (Phase 1)
├── hooks/        → useAuth, usePackages, useBooking
├── layouts/      → MainLayout, AdminLayout
├── pages/        → All pages
├── routes/       → AppRoutes, ProtectedRoute, AdminRoute
├── services/     → API service functions
├── store/        → Zustand auth store
└── utils/        → Helper functions
\`\`\`

## Development Phases

- [x] Phase 1 — Frontend with dummy data ✅
- [ ] Phase 2 — Spring Boot backend
- [ ] Phase 3 — Frontend + Backend integration
- [ ] Phase 4 — JWT auth + role-based security
- [ ] Phase 5 — Razorpay payment integration
