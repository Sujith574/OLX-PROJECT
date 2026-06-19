# 🔍 FindIt – Campus Lost & Found Portal

> A production-ready, full-stack MERN application for campus lost and found management. Built as a B.Tech CSE major project with real-world standards.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)

---

## ✨ Features

### For Users
- 🔐 **JWT Authentication** — Register, Login, protected routes
- 📦 **Post Lost & Found Items** — Upload photos via Cloudinary
- 🔍 **Smart Search** — Full-text search + filters (category, type, status, location)
- 📋 **Claim System** — Submit claims with proof of ownership
- 📱 **QR Verification** — QR codes for verified claim handovers
- 💬 **Internal Messaging** — Chat with item owners/finders
- 🟢 **WhatsApp Integration** — Direct WhatsApp contact link
- 🔔 **Real-time Notifications** — Socket.io powered live alerts
- 📊 **Personal Dashboard** — Manage posts, claims, and profile

### For Admins
- 📈 **Analytics Dashboard** — Charts for monthly listings, category breakdown
- 👥 **User Management** — View, search, ban/unban users
- 📝 **Listing Moderation** — Remove fake/inappropriate posts
- 🏷️ **Category Management** — Create, edit, delete categories
- 🚩 **Report System** — Review and action user reports
- ⚖️ **Claims Overview** — Monitor all platform claims

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State Management | Zustand, TanStack Query |
| Animations | Framer Motion |
| Forms | React Hook Form |
| Icons | React Icons |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcrypt |
| Images | Cloudinary |
| Real-time | Socket.io |
| Email | Nodemailer |
| QR Codes | qrcode |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd "OLX PROJECT"

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/findit
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend  
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

### 4. Create Admin User

After registering normally, update the user's role in MongoDB:
```javascript
db.users.updateOne({ email: "admin@email.com" }, { $set: { role: "admin" } })
```

---

## 📁 Project Structure

```
OLX PROJECT/
├── server/                   # Express.js Backend
│   ├── config/               # DB, Cloudinary config
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, upload, rate limiting
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── services/             # Email, QR code services
│   ├── utils/                # Helpers, seed scripts
│   └── server.js             # App entry point
│
└── client/                   # React + Vite Frontend
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── hooks/            # Custom React hooks
    │   ├── layouts/          # Page layout wrappers
    │   ├── pages/            # Route page components
    │   │   └── admin/        # Admin panel pages
    │   ├── router/           # React Router setup
    │   ├── services/         # API service functions
    │   ├── store/            # Zustand state stores
    │   └── utils/            # Client utilities
    └── tailwind.config.js
```

---

## 📡 API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/profile | Get profile | 🔒 |
| PUT | /api/auth/profile | Update profile | 🔒 |
| GET | /api/items | List items (with filters) | Public |
| GET | /api/items/featured | Featured items for home | Public |
| GET | /api/items/:id | Item details | Public |
| POST | /api/items | Create item | 🔒 |
| PUT | /api/items/:id | Update item | 🔒 Owner |
| DELETE | /api/items/:id | Delete item | 🔒 Owner |
| POST | /api/claims | Submit claim | 🔒 |
| GET | /api/claims/my | My claims | 🔒 |
| GET | /api/claims/received | Received claims | 🔒 |
| PUT | /api/claims/:id | Approve/Reject claim | 🔒 Owner |
| GET | /api/categories | List categories | Public |
| POST | /api/categories | Create category | 🔒 Admin |
| POST | /api/reports | Submit report | 🔒 |
| GET | /api/admin/analytics | Dashboard data | 🔒 Admin |
| GET | /api/admin/users | All users | 🔒 Admin |
| PUT | /api/admin/users/:id/ban | Ban/Unban user | 🔒 Admin |
| POST | /api/messages/conversation | Start conversation | 🔒 |
| GET | /api/messages/:id | Get messages | 🔒 |
| POST | /api/messages/:id | Send message | 🔒 |

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# In client/
npm run build
# Deploy the dist/ folder to Vercel
# Set environment variables in Vercel dashboard
```

### Backend → Google Cloud (Cloud Run / App Engine)

Refer to [gcp_deployment_guide.md](file:///.agents/gcp_deployment_guide.md) for full instructions.

#### Deploying with Google Cloud Run (Recommended)
1. Navigate to the `/server` directory and create a `Dockerfile`.
2. Build and deploy container using:
   ```bash
   gcloud run deploy findit-backend --source . --region us-central1 --allow-unauthenticated
   ```
3. Set your environment variables (database connection strings, Cloudinary configs) in Google Secret Manager or directly in the Cloud Run service console.

---

## 🎓 For B.Tech Project Evaluation

### Key Technical Highlights
- **8 Mongoose Models** with proper indexing and validation
- **JWT Authentication** with bcrypt password hashing
- **Real-time notifications** via Socket.io
- **Image optimization** via Cloudinary transformations
- **Rate limiting, Helmet, XSS protection**
- **Pagination, full-text search**, complex aggregations
- **QR code generation** for claim verification
- **Email notifications** via Nodemailer
- **Role-based access control** (User/Admin)
- **Responsive UI** (Mobile/Tablet/Desktop)

### Resume Description
> "Developed FindIt, a full-stack campus Lost & Found portal using MERN stack. Features include JWT authentication, real-time notifications via Socket.io, Cloudinary image storage, QR-based claim verification, role-based admin dashboard with Recharts analytics, and internal messaging system. Deployed on Vercel + Render with MongoDB Atlas."

---

## 📜 License

ISC © 2024 FindIt Campus Portal
