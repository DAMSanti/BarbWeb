# 🔐 Authentication System Setup Guide

## Overview

This project implements a **Hybrid Authentication System** with:
- ✅ JWT (JSON Web Tokens) for traditional email/password login
- ✅ OAuth2 Google authentication  
- ✅ Account linking (users can link multiple auth methods)

---

## 📋 Prerequisites

### Backend Requirements

1. **PostgreSQL 15** (Already deployed on DigitalOcean)
2. **Node.js 18+** with npm
3. **Environment Variables** (see `.env.example`)

### Frontend Requirements

1. **Node.js 18+** with npm
2. **React 18** with TypeScript
3. **Environment Variables** (see `frontend/.env.example`)

---

## 🔧 Local Setup

### Step 1: Backend Configuration

#### 1.1 Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `jsonwebtoken` - JWT token generation and verification
- `bcryptjs` - Password hashing
- `@prisma/client` - Database ORM
- `passport` & `passport-google-oauth20` - OAuth2 support

#### 1.2 Create `.env` file

Copy `.env.example` to `.env` and fill in:

```bash
# Copy template
cp .env.example .env

# Edit .env with your values
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-chars-long

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Optional: GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Gemini AI
GEMINI_API_KEY=xxx

# App Config
PORT=3000
NODE_ENV=development
```

#### 1.3 Setup Database

```bash
# Run migrations
npm run db:push

# Seed with FAQ data
npm run db:seed

# Generate Prisma client
npm run db:generate
```

#### 1.4 Start Backend

```bash
npm run dev
```

Server should run on `http://localhost:3000`

---

### Step 2: Frontend Configuration

#### 2.1 Install Dependencies

```bash
cd frontend
npm install
```

#### 2.2 Create `.env.local` file

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Google OAuth (same as backend)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

#### 2.3 Start Frontend Dev Server

```bash
npm run dev
```

Frontend should run on `http://localhost:5173`

---

## 🌐 Google OAuth Setup

### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
5. Choose "Web application"
6. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (local dev)
   - `https://your-domain.com/auth/google/callback` (production)
7. Copy `Client ID` and `Client Secret`

### Local Testing

For local testing, you can use:

```env
# .env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# frontend/.env.local  
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## 🧪 Testing Authentication

### 1. Test Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "cuid123...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2. Test Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

### 3. Test Refresh Token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

### 4. Test Protected Endpoint

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## 🚀 Production Deployment (DigitalOcean)

### Step 1: Build Application

```bash
# Frontend
cd frontend
npm run build

# Backend  
cd ../backend
npm run build
```

### Step 2: Add Environment Variables to DigitalOcean

1. Go to DigitalOcean App Platform → Your App → Settings → Environment Variables
2. Add all required variables:

```
# Authentication
JWT_SECRET=<generate-random-secure-string>
JWT_REFRESH_SECRET=<generate-random-secure-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Database
DATABASE_URL=postgresql://barbwebdb:password@host:port/barbwebdb

# Gemini
GEMINI_API_KEY=<your-api-key>

# Stripe (if enabled)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# App Config
PORT=3000
NODE_ENV=production
```

### Step 3: Configure Frontend Environment Variables

Add to your build environment or `frontend/.env.production`:

```
VITE_API_URL=https://your-app-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Step 4: Update OAuth Callback URLs

In Google Cloud Console, add your production domain:
- `https://your-domain.com/auth/google/callback`

### Step 5: Trigger Redeploy

1. Go to DigitalOcean App Platform
2. Click "Redeploy"
3. Wait for build to complete
4. Verify endpoints are working

---

## 🔐 Security Best Practices

### JWT Security

- ✅ JWT Secret: Use strong, random 32+ character strings
- ✅ Token Expiration: Access tokens expire in 15 minutes
- ✅ Refresh Tokens: Expire in 7 days, stored in database
- ✅ Token Storage: Stored in localStorage (frontend)
- ✅ HTTPS Only: Always use HTTPS in production

### Password Security

- ✅ Minimum 8 characters
- ✅ Bcrypt hashing with 10 salt rounds
- ✅ Never store plain text passwords
- ✅ Validate password strength

### OAuth Security

- ✅ PKCE flow support (for OAuth)
- ✅ State parameter verification
- ✅ Redirect URI validation
- ✅ No credentials in URLs

### API Security

- ✅ CORS enabled for frontend domain only
- ✅ Rate limiting on auth endpoints (TODO)
- ✅ Input validation with Zod (TODO)
- ✅ SQL injection prevention (Prisma)

---

## 📊 Database Schema

### User Model

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  role            String    @default("user")
  
  // Auth fields
  passwordHash    String?   // NULL if OAuth only
  emailVerified   Boolean   @default(false)
  emailVerifiedAt DateTime?
  refreshTokens   String[]  @default([])
  
  lastLogin       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  payments        Payment[]
  customAgents    CustomAgent[]
  oauthAccounts   OAuthAccount[]
}

model OAuthAccount {
  id                String   @id @default(cuid())
  userId            String
  provider          String   // "google", "github", etc
  providerAccountId String   
  email             String?
  name              String?
  picture           String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}
```

---

## 🧩 API Endpoints

### Authentication Endpoints

```
POST   /auth/register           # Register new user
POST   /auth/login              # Login with email/password
POST   /auth/refresh            # Refresh access token
POST   /auth/logout             # Logout user
GET    /auth/me                 # Get current user (requires auth)
GET    /auth/verify-token       # Verify token validity

POST   /auth/oauth/google       # Google OAuth login/register
POST   /auth/oauth/github       # GitHub OAuth login/register
POST   /auth/link-oauth         # Link OAuth to existing account
```

### Request/Response Examples

**Register:**
```
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Full Name"
}

Response:
{
  "user": { id, email, name, role },
  "tokens": { accessToken, refreshToken }
}
```

**Login:**
```
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "user": { id, email, name, role },
  "tokens": { accessToken, refreshToken }
}
```

---

## 🐛 Troubleshooting

### Issue: "Database not connected"

**Solution:**
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Run `npm run db:push` to sync schema

### Issue: "Google OAuth not configured"

**Solution:**
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Check Google Cloud Console credentials are correct
- Add http://localhost:3000 to authorized origins

### Issue: "Token invalid or expired"

**Solution:**
- Generate new token with login
- Check JWT_SECRET matches between auth service and verification
- Verify token hasn't expired (15 min access token)

### Issue: "CORS error on login"

**Solution:**
- Check CORS headers are configured in backend
- Verify frontend URL is whitelisted
- Check Authorization header is being sent

---

## 🎯 Next Steps

After authentication is working:

1. **Email Verification** - Implement email verification on signup
2. **Password Reset** - Add forgot password flow
3. **Two-Factor Auth** - Add 2FA support
4. **Social Linking** - Allow linking multiple OAuth accounts
5. **Admin Panel** - Create admin user management interface

---

## 📚 References

- [JWT.io](https://jwt.io/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Last Updated**: November 11, 2025
**Version**: 1.0.0
