# Pulse API - High-Performance Social Media Backend 🚀

Pulse is a robust, production-ready RESTful API built with **Node.js**, **Express**, and **TypeScript**. It powers a social microblogging experience with features like threads, real-time-ish notifications, role-based access control, and background job processing.

---

## 🏗️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v20+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [LibSQL](https://github.com/tursodatabase/libsql) (SQLite compatible)
- **Cache/Queue**: [Redis](https://redis.io/) + [BullMQ](https://docs.bullmq.io/)
- **Auth**: JWT (Access + Refresh Tokens)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: [Winston](https://github.com/winstonjs/winston)

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Redis**: Required for background workers (email/notifications) and rate limiting.
- **SQLite/LibSQL**: Local development uses `local.db`.

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:asraf3101aa/Pulse-API.git
   cd pulse-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and fill in the following:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database
   DATABASE_URL="file:local.db"

   # Redis
   REDIS_URL="redis://localhost:6379"

   # JWT
   JWT_ACCESS_TOKEN_SECRET="your_access_secret"
   JWT_REFRESH_TOKEN_SECRET="your_refresh_secret"
   JWT_ACCESS_TOKEN_LIFETIME_IN_MINUTES=30
   JWT_REFRESH_TOKEN_LIFETIME_IN_DAYS=30
   JWT_ISSUER="pulse"
   JWT_AUDIENCE="pulse"

   # SMTP (Email)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your_email@gmail.com"
   SMTP_PASS="your_app_password"
   FROM_EMAIL="Pulse <noreply@pulse.com>"

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Initialization**:
   ```bash
   # Generate migration files
   npm run db:generate

   # Push changes to database
   npm run db:push

   # (Optional) Seed the database with dummy data
   npm run db:seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Run the server with hot-reloading (Nodemon) |
| `npm run start` | Run the compiled production server |
| `npm run build` | Build the project to `dist/` |
| `npm run db:generate`| Generate SQL migration files from schema |
| `npm run db:push` | Sync local schema directly to the database |
| `npm run db:seed` | Seed database with users and threads |
| `npm run db:studio` | Open Drizzle Studio to browse your data |

---

## 📡 API Endpoints Documentation

> Replace `http://localhost:3000` with your actual server URL.
> For endpoints requiring authentication, pass the header: `Authorization: Bearer {{ACCESS_TOKEN}}`

### 🔐 Authentication

#### 1. User Registration
`POST /auth/register`
```bash
curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
           "username": "johndoe",
           "email": "john@example.com",
           "password": "Password123",
           "name": "John Doe",
           "bio": "Hello world!"
         }'
```

#### 2. User Login
`POST /auth/login`
```bash
curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
           "identifier": "johndoe",
           "password": "Password123"
         }'
```

#### 3. Refresh Tokens
`POST /auth/refresh-tokens`
```bash
curl -X POST http://localhost:3000/auth/refresh-tokens \
     -H "Content-Type: application/json" \
     -d '{ "refreshToken": "{{REFRESH_TOKEN}}" }'
```

#### 4. Verify Email
`GET /auth/verify-email`
```bash
curl http://localhost:3000/auth/verify-email?token={{VERIFICATION_TOKEN}}
```

#### 5. Resend Verification Email
`POST /auth/resend-verification-email`
```bash
curl -X POST http://localhost:3000/auth/resend-verification-email \
     -H "Content-Type: application/json" \
     -d '{ "email": "john@example.com" }'
```

---

### 👤 User Profile

#### 6. Get Profile by ID
`GET /users/:userId/profile`
```bash
curl -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     http://localhost:3000/users/1/profile
```

#### 7. Update Own Profile
`PATCH /users/profile`
```bash
curl -X PATCH http://localhost:3000/users/profile \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     -H "Content-Type: application/json" \
     -d '{ "bio": "New bio content", "name": "Updated Name" }'
```

---

### 📝 Threads

#### 8. Create Thread (Email must be verified)
`POST /threads`
```bash
curl -X POST http://localhost:3000/threads \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     -H "Content-Type: application/json" \
     -d '{ "content": "What is on your mind?", "imagePaths": ["url1", "url2"] }'
```

#### 9. Get Feed (Paginated)
`GET /threads`
```bash
curl -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     "http://localhost:3000/threads?page=1&limit=10"
```

#### 10. Get User Threads
`GET /threads/user/:userId`
```bash
curl -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     "http://localhost:3000/threads/user/1?page=1&limit=10"
```

#### 11. Get Single Thread
`GET /threads/:id`
```bash
curl -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     http://localhost:3000/threads/1
```

#### 12. Update Thread
`PATCH /threads/:id`
```bash
curl -X PATCH http://localhost:3000/threads/1 \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     -H "Content-Type: application/json" \
     -d '{ "content": "Updating my thoughts..." }'
```

#### 13. Delete Thread (Soft Delete)
`DELETE /threads/:id`
```bash
curl -X DELETE http://localhost:3000/threads/1 \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}"
```

---

### 💬 Comments

#### 14. Create Comment
`POST /threads/:id/comments`
```bash
curl -X POST http://localhost:3000/threads/1/comments \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     -H "Content-Type: application/json" \
     -d '{ "content": "Nice post!" }'
```

#### 15. Get Paginated Comments
`GET /threads/:id/comments`
```bash
curl -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     "http://localhost:3000/threads/1/comments?page=1&limit=10"
```

#### 16. Update Comment
`PATCH /threads/:id/comments/:commentId`
```bash
curl -X PATCH http://localhost:3000/threads/1/comments/1 \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     -H "Content-Type: application/json" \
     -d '{ "content": "Corrected comment" }'
```

#### 17. Delete Comment
`DELETE /threads/:id/comments/:commentId`
```bash
curl -X DELETE http://localhost:3000/threads/1/comments/1 \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}"
```

---

### ❤️ Social Actions (Likes & Subs)

#### 18. Like Thread
`POST /threads/:id/like`
```bash
curl -X POST http://localhost:3000/threads/1/like \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}"
```

#### 19. Unlike Thread
`DELETE /threads/:id/like`
```bash
curl -X DELETE http://localhost:3000/threads/1/like \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}"
```

#### 20. Subscribe to Thread
`POST /threads/:id/subscribe`
```bash
curl -X POST http://localhost:3000/threads/1/subscribe \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}"
```

#### 21. Unsubscribe from Thread
`DELETE /threads/:id/subscribe`
```bash
curl -X DELETE http://localhost:3000/threads/1/subscribe \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}"
```

---

### 🔔 Notifications

#### 22. Get Notifications
`GET /notifications`
```bash
curl -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     http://localhost:3000/notifications
```

#### 23. Mark Notification as Read
`PATCH /notifications/:id/read`
```bash
curl -X PATCH http://localhost:3000/notifications/1/read \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}"
```

#### 24. Get Notification Preferences
`GET /notifications/preferences`
```bash
curl -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     http://localhost:3000/notifications/preferences
```

#### 25. Update Notification Preferences
`PATCH /notifications/preferences`
```bash
curl -X PATCH http://localhost:3000/notifications/preferences \
     -H "Authorization: Bearer {{ACCESS_TOKEN}}" \
     -H "Content-Type: application/json" \
     -d '{ "emailEnabled": false, "inAppEnabled": true }'
```

---

## 📂 Project Structure

```
src/
├── config/         # App configuration & RBAC definitions
├── controllers/    # API Request handlers
├── db/             # Drizzle schema, migrations & DB client
├── middlewares/    # Auth, Validation, Rate Limiter
├── models/         # TypeScript interfaces/types
├── queues/         # BullMQ queue definitions
├── routes/         # Express route definitions
├── scripts/        # Seeding and maintenance scripts
├── services/       # Business logic (DB interactions)
├── utils/          # Standardized response/error helpers
├── validations/    # Zod validation schemas
├── workers/        # BullMQ background job consumers
└── app.ts          # Express application setup
```

---
