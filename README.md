# ✈️ TravelNest — Travel Booking & Payment Platform

<p align="center">
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot&logoColor=white&style=flat-square" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square" />
  <img alt="Razorpay" src="https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white&style=flat-square" />
  <img alt="JWT" src="https://img.shields.io/badge/JWT-jjwt-000000?logo=jsonwebtokens&logoColor=white&style=flat-square" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
</p>

A full-stack **travel booking platform** with a real-world, industry-style booking lifecycle — built with **Spring Boot 3 + Spring Security (JWT)** on the backend and **React 18 + Tailwind CSS** on the frontend, with **Razorpay** payment integration, automated PDF document generation, and live QR-code ticket verification.

> 🔧 Payments run in **Razorpay Test Mode** — no real money is involved. This mirrors how real companies build and demo payment integrations in staging environments.

---

## ✨ Features

- 🔐 **JWT Authentication** — role-based access (`USER` / `ADMIN`), stateless, BCrypt-hashed passwords
- 🏝️ **Package Browsing & Booking** — search, filter, and book curated travel packages
- 💳 **Razorpay Payment Integration**
  - Server-side order amount calculation — price can **never** be tampered with from the client
  - Dual signature verification (client callback **+** server-side re-verification before a booking is ever saved)
  - Real refunds via the Razorpay Refunds API (not just a status label)
- 🔄 **Real-World Booking State Machine**
  - `PENDING` → `CONFIRMED` (admin approval required)
  - `CANCEL_REQUESTED` → `CANCELLED_BY_USER` (policy-based refund) or reverted
  - Admin **Reject** / **Force-Cancel** → `CANCELLED_BY_ADMIN` (always full refund — not the customer's fault)
- 📄 **Two Distinct PDF Documents** (Apache PDFBox)
  - **Payment Receipt** — available immediately after payment, no QR (proof of payment only)
  - **E-Ticket** — only unlocked once a booking is `CONFIRMED`, includes a verification QR code
- 📱 **Live QR Ticket Verification**
  - QR encodes a random, unguessable token — never the booking ID
  - Scanning always does a **live** database lookup, so cancelling a booking instantly invalidates every ticket ever printed (no stale PDFs)
  - Public, no-login verification page for venue/staff use
- 🛠️ **Admin Dashboard**
  - Manage packages, users, bookings, and site settings
  - Approve / reject bookings with a reason (shown to the customer)
  - Revenue analytics
- 📲 **Fully Responsive UI** — Tailwind CSS, mobile-first tables/cards

---

## 📦 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate, PostgreSQL, Lombok, Maven |
| **Payments** | Razorpay Java SDK (orders, signature verification, refunds) |
| **Documents** | Apache PDFBox (PDF generation), ZXing (QR code generation) |
| **Auth** | JWT (jjwt) — stateless, role-based (`USER` / `ADMIN`) |
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, React Router DOM, Axios, React Hook Form, Lucide Icons |

---

## 📁 Project Structure

```
travelnest/
├── backend/
│   └── src/main/java/com/travelnest/backend/
│       ├── config/
│       │   └── SecurityConfig.java         → Spring Security, JWT filter chain, CORS
│       ├── controller/
│       │   ├── AuthController.java         → register / login
│       │   ├── PackageController.java      → browse packages (public)
│       │   ├── BookingController.java      → create booking, cancel, admin approve/reject, PDF downloads
│       │   ├── PaymentController.java      → Razorpay order creation + signature verification
│       │   ├── PublicVerifyController.java → public QR ticket verification (no auth)
│       │   ├── UserController.java         → profile, admin user management
│       │   ├── SettingController.java      → site branding / settings
│       │   └── ImageController.java        → package image uploads
│       ├── service/
│       │   ├── BookingService.java / impl/ → booking state machine + refund orchestration
│       │   └── TicketService.java          → Receipt vs E-Ticket PDF generation
│       ├── entity/
│       │   ├── User.java, Package.java, Booking.java, Refund.java, Setting.java
│       ├── repository/                     → Spring Data JPA repositories
│       ├── dto/request/, dto/response/     → request/response DTOs
│       └── security/
│           ├── JwtUtil.java                → token generation/validation
│           └── JwtAuthFilter.java          → request-level JWT auth filter
│
└── Frontend/
    └── src/
        ├── pages/
        │   ├── auth/                       → Login, Register
        │   ├── home/, packages/            → Home, Package listing & detail
        │   ├── booking/                    → Booking → Payment → Success flow
        │   ├── profile/                    → User dashboard, profile
        │   ├── admin/                      → Admin dashboard, packages, bookings, users, revenue, settings
        │   └── public/
        │       └── VerifyPage.jsx          → public QR scan result page
        ├── services/                       → Axios API call wrappers
        ├── store/                          → Zustand global state (auth, bookings, site)
        ├── routes/                         → AppRoutes, ProtectedRoute, AdminRoute
        └── components/                     → shared UI components
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ & npm 9+
- PostgreSQL 14+
- A free [Razorpay](https://razorpay.com) account (Test Mode API keys)

### 1. Database Setup

```sql
CREATE DATABASE travelnest_db;
```

### 2. Configure Backend

All sensitive config is externalized via environment variables (with safe local-dev defaults baked in) — see `backend/src/main/resources/application.properties`:

| Variable | Purpose | Local default |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection | `localhost:5432/travelnest_db` |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay Test Mode keys | sample test key included |
| `JWT_SECRET` | JWT signing secret | sample dev secret included |
| `FRONTEND_URL` | Used to build the QR verification link in E-Tickets | `http://localhost:5173` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173` |

For local development you can run it as-is (defaults work out of the box). For deployment, set real values for all of the above as environment variables on your hosting platform — **never commit real secrets to git.**

### 3. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs at: `http://localhost:8080`

### 4. Run Frontend

```bash
cd Frontend
npm install
npm run dev
```

Runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET` | `/api/packages` | Public | List travel packages |
| `POST` | `/api/payment/create-order` | User | Create Razorpay order (server-calculated amount) |
| `POST` | `/api/payment/verify` | User | Verify Razorpay payment signature |
| `POST` | `/api/bookings` | User | Create booking (requires verified payment proof) |
| `GET` | `/api/bookings/my` | User | List my bookings |
| `PUT` | `/api/bookings/{id}/cancel` | User | Request cancellation |
| `GET` | `/api/bookings/{id}/receipt` | User | Download Payment Receipt PDF |
| `GET` | `/api/bookings/{id}/ticket` | User | Download E-Ticket PDF (CONFIRMED only) |
| `GET` | `/api/public/verify/{token}` | Public | Live QR ticket verification |
| `GET` | `/api/admin/bookings` | Admin | List all bookings |
| `PUT` | `/api/admin/bookings/{id}/approve` | Admin | Approve a pending booking |
| `PUT` | `/api/admin/bookings/{id}/reject` | Admin | Reject a pending booking (+ full refund) |
| `PUT` | `/api/admin/bookings/{id}/force-cancel` | Admin | Force-cancel a confirmed booking (+ full refund) |
| `PUT` | `/api/admin/bookings/{id}/cancel-decision` | Admin | Approve/reject a user's cancellation request |

---

## 🗄️ Database Schema (core tables)

**`bookings`**

| Column | Type | Notes |
|---|---|---|
| `id` | `BIGINT` | Primary key |
| `status` | `VARCHAR` | `PENDING`, `CONFIRMED`, `CANCEL_REQUESTED`, `CANCELLED_BY_USER`, `CANCELLED_BY_ADMIN` |
| `payment_status` | `VARCHAR` | `PAID`, `REFUNDED` |
| `verification_token` | `VARCHAR` | Random UUID — embedded in the E-Ticket QR code |
| `razorpay_order_id`, `razorpay_payment_id` | `VARCHAR` | Payment audit trail |
| `admin_note` | `VARCHAR` | Reason shown to customer on rejection/cancellation |

**`refunds`** — one row per cancelled booking (kept separate from the payment record itself)

| Column | Type | Notes |
|---|---|---|
| `status` | `VARCHAR` | `NOT_ELIGIBLE`, `INITIATED`, `COMPLETED`, `FAILED` |
| `amount` | `DOUBLE` | Calculated server-side per cancellation policy |
| `reason` | `VARCHAR` | Audit trail of why the refund was issued |

---

## 🔄 Booking Lifecycle

```
Book + Pay  →  Razorpay order (server-priced)  →  Signature verified (client + server)
              →  Booking created: PENDING, Payment: PAID

Admin reviews
  ├── Approve            → CONFIRMED  → E-Ticket + QR unlock
  └── Reject (+ reason)  → CANCELLED_BY_ADMIN → full refund (auto)

User requests cancellation (from PENDING or CONFIRMED)
  → CANCEL_REQUESTED
      ├── Admin approves → CANCELLED_BY_USER → refund per 7-day policy
      └── Admin rejects  → reverts to prior status

Confirmed booking, operator-side issue
  → Admin Force-Cancel (+ reason) → CANCELLED_BY_ADMIN → full refund (auto)
```

**Cancellation Policy:** 7+ days before tour start → 100% refund · Within 7 days → no refund (admin-initiated cancellations are always fully refunded regardless of policy, since they're not the customer's fault).

---

## 🧪 Testing Payments (Test Mode)

Use Razorpay's official test credentials at checkout:

| Method | Details |
|---|---|
| Card | `4111 1111 1111 1111`, any future expiry, any CVV |
| UPI | `success@razorpay` |

---

## 👑 How to Create an Admin

Registration always assigns the `USER` role. To promote a user to `ADMIN`, run this in your database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## 📄 License

MIT © [Mohammadkaif Mulla](https://github.com/kaifmulla3335)
