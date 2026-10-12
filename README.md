# DARV Real Estate & Construction 🏢🌴
> Premium Real Estate & Construction Marketplace Platform (Trivandrum, Kerala)  
> Full-Stack Architecture: **React JS + Vite + Tailwind CSS** (Frontend) + **Node.js / Express** (Backend API) + **PostgreSQL** (pgAdmin compatible)

---

## 🌟 Overview & Key Features

### 1. Client Brand Identity & Architecture
- **DARV Branding**: Custom DARV Real Estate & Construction emblem, luxury Navy & Gold theme, official contact routing, and certified RERA credentials.
- **Trivandrum Focus**: Tailored for prime Kerala locations including Kowdiar, Sasthamangalam, Kazhakkoottam (Technopark Phase 1, 2 & 3), Pattom, Vellayambalam, and Akkulam.

### 2. Customer Web Application
- **Discovery & Search**: Filter by Property Category (Apartment, Luxury Villa, Independent House, Plot / Land, Commercial), Buy/Rent mode, price range, bedrooms, and localities.
- **Property Details Showcase**: High-resolution gallery, comprehensive specs (built-up area, land area in cents, floor info, facing direction, furnishing status), amenities checklist, and interactive inquiry forms.
- **Direct Agent Routing**: 1-click WhatsApp redirection, telephone calling, and inquiry email dispatch directly linked to advisor Saranya Soman.
- **Customer Trust & Feedback**: Verified customer reviews with trust score badge, rating distribution, and official advisor reply badges.
- **Customer Authentication & CRM**: Fast sign-in/sign-up aligned with the brand design, saved favorites, and tracking for submitted inquiries.

### 3. Agent Portal & Management CRM (`/admin`)
- **Single-Client Portal**: Dedicated management console for primary agent / agency owner (`saranyasoman31@gmail.com`).
- **Property Listing Management**: Full CRUD support (Add, Edit, View, Publish/Unpublish, Archive) with multi-image support and amenities selection.
- **Customer Inquiry CRM**: Real-time leads dashboard with status pipeline (`New`, `Contacted`, `Follow-up`, `Closed`), internal notes, and email push notifications.
- **Feedback & Reputation Management**: Review customer feedback, reply publicly to reviews, and track customer satisfaction scores.
- **Agent Profile**: Customization of logo, bio, operating areas, official phone, WhatsApp, email, and office address.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (v12+ running on port 5432 with pgAdmin)

### 1. Database Setup
1. Create a database named `realestate_db` in PostgreSQL.
2. Configure credentials in `backend/.env` (see `backend/.env.example`).
3. Run migrations and database seeding:
```bash
cd backend
npm run db:migrate
npm run db:seed
node src/database/seed_demo_properties.js
```

### 2. Start the Backend API
```bash
cd backend
npm run dev
```
- Server URL: `http://localhost:5000`
- API Health Check: `http://localhost:5000/status`
- Swagger Documentation: `http://localhost:5000/api-docs`

### 3. Start the Frontend Application
```bash
cd frontend
npm run dev
```
- Application URL: `http://localhost:5173`

---

## 🔑 Default Agent Login Credentials

| Role | Username / Email | Password | Access Route |
| :--- | :--- | :--- | :--- |
| **Primary Agent (DARV)** | `saranyasoman31@gmail.com` | `123456` | `/admin` or `/auth/login` |

---

## 📁 Project Structure

```
real-estate-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js connection pool)
│   │   ├── database/ (schema.sql, seed.js, migrations, seed_demo_properties.js)
│   │   ├── middleware/ (auth.js, upload.js, errorHandler.js)
│   │   ├── modules/ (auth, properties, agents, enquiries, feedback, masterData)
│   │   └── server.js (Express application, REST routes)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── images/ (DARV logos, transparent icons, banners)
│   ├── src/
│   │   ├── components/ (Navbar, Footer, PropertyCard, Modals, TrustScore)
│   │   ├── context/ (AuthContext)
│   │   ├── modules/ (home, properties, agent, customer, auth)
│   │   ├── routes/ (AppRoutes)
│   │   └── services/ (api.js Axios client)
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
├── .gitignore
└── README.md
```
