# 🎯 Testing Strategy - SIN Base de Datos
## Qué Testear Localmente Sin Conexión a Backend

**Estado Actual**: 180 tests pasando ✅ | 26 fallos (requieren BD) ❌  
**Coverage**: 8.99% → Target: 70%+

---

## 📊 MATRIZ: Unit vs Integration vs E2E

```
┌─────────────────────────────────────────────────────────────────┐
│                     TESTING LAYERS (NO DB)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔴 E2E WORKFLOWS (API Chains)                                 │
│  ├─ Auth flow: Register → Verify → Login → Refresh token      │
│  ├─ Payment flow: Consult → Create intent → Confirm → Email   │
│  └─ Admin flow: Login → Manage users → View analytics         │
│                                                                 │
│  🟠 INTEGRATION TESTS (Mock Services)                          │
│  ├─ Email service (mock Resend API)                           │
│  ├─ OpenAI service (mock OpenAI API)                          │
│  ├─ Stripe service (mock Stripe API)                          │
│  └─ Database operations (mock Prisma)                         │
│                                                                 │
│  🟡 API ROUTE TESTS (Mock Express Middleware)                  │
│  ├─ Auth routes with JWT generation                           │
│  ├─ Payment routes with Stripe integration                    │
│  ├─ Admin routes with RBAC authorization                      │
│  └─ Middleware: validation, error handling, auth              │
│                                                                 │
│  🟢 UNIT TESTS (Pure Functions) ✅ 180/206 PASSING            │
│  ├─ Business logic (pricing, categorization, lawyers)         │
│  ├─ Validation (email, phone, name, dates)                    │
│  ├─ Utilities (string, array, number operations)              │
│  ├─ Error handling (custom error classes)                     │
│  └─ Security (JWT, password hashing, crypto)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ PHASE 1: UNIT TESTS (Already 80% Complete - 180/206 passing)

### Existing Tests (180 passing) ✅

| File | Tests | Status | Coverage |
|------|-------|--------|----------|
| `utilities.test.ts` | 31 | ✅ DONE | Email, phone, string, array utilities |
| `business.test.ts` | 39 | ✅ DONE | Pricing, categorization, lawyer selection |
| `validation.test.ts` | 43 | ✅ DONE | User data validation, sanitization |
| `validators.test.ts` | 31 | ✅ DONE | Zod schema validation |
| `authService.test.ts` | 17 | ✅ DONE | JWT, password hashing |
| `auth.api.test.ts` | 19 | ✅ DONE | Basic auth API tests |

### Remaining Unit Tests (6h needed)

#### 1️⃣ `middleware/validation.test.ts` (4h)
```typescript
// Test the Zod validation middleware
- Valid schema passes through
- Invalid schema returns formatted errors
- Multiple field errors collected
- Custom error messages preserved
- Type coercion works (string → number)
```

#### 2️⃣ `middleware/rateLimit.test.ts` (2h)
```typescript
// Test rate limiting logic (pure function)
- Counting requests per IP
- Resetting after time window
- Exceeding limit returns 429
- Different limits for different endpoints
```

#### 3️⃣ `schemas/payment.schemas.test.ts` (2h)
```typescript
// Test payment validation schemas
- Valid payment amount (1-99999.99 EUR)
- Invalid amounts rejected (0, negative, NaN)
- Currency validation (EUR, USD, GBP)
- Consultation category validation
- Custom error messages for each field
```

#### 4️⃣ `schemas/faq.schemas.test.ts` (2h)
```typescript
// Test FAQ search schemas
- Question length validation (min 10, max 500 chars)
- Category validation (Civil, Penal, Laboral, etc)
- Category normalization
- Keyword extraction
```

#### 5️⃣ `utils/errors.test.ts` (2h)
```typescript
// Test custom error classes
- ValidationError with field information
- AuthenticationError with specific messages
- AuthorizationError (RBAC)
- PaymentError with transaction details
- Error serialization for API responses
```

#### 6️⃣ `utils/logger.test.ts` (2h)
```typescript
// Test logging (mock Winston)
- Log levels (info, warn, error, debug)
- Structured logging with metadata
- Sensitive data masking
- Log format validation
```

#### 7️⃣ `utils/faqDatabase.test.ts` (2h)
```typescript
// Test FAQ search and matching logic
- Search by question keywords
- Categorize question text
- Find best matches
- Relevance scoring
- Cache efficiency
```

#### 8️⃣ `security/jwt.test.ts` (2h)
```typescript
// Test JWT operations (pure logic)
- Create JWT with payload
- Verify JWT signature
- Extract payload from token
- Handle expired tokens
- Handle invalid signatures
- Refresh token generation
```

#### 9️⃣ `security/crypto.test.ts` (1h)
```typescript
// Test encryption/hashing (pure logic)
- Hash password
- Verify password against hash
- Encrypt sensitive data
- Decrypt data
- Random token generation
```

**Total Unit Tests After**: ~240 tests passing ✅

---

## 🎯 PHASE 2: INTEGRATION TESTS (Mock Services - 20h)

### Architecture Pattern
```typescript
// ❌ DON'T: Import real services from src/
import { emailService } from '../src/services/emailService'

// ✅ DO: Create mock services or test in isolation
import { describe, it, expect, vi } from 'vitest'

// Mock the Resend API
const mockResend = {
  emails: {
    send: vi.fn().mockResolvedValue({
      data: { id: 'email-123' },
      error: null
    })
  }
}
```

### 1️⃣ Email Service Tests (8h)

#### `services/emailService.mock.test.ts`
```typescript
describe('Email Service (Mock Resend)', () => {
  // Test email formatting
  - HTML email rendering (payment confirmation, welcome, etc)
  - Attachment handling
  - Template variable substitution
  - Special characters encoding
  - Multi-language support (Spanish)

  // Test email metadata
  - From address validation
  - To address normalization
  - Subject line formatting
  - Reply-to headers

  // Test error handling
  - Resend API timeouts
  - Invalid email addresses
  - Retry logic
  - Fallback mechanisms
})
```

#### `services/emailTemplates.test.ts` (4h)
```typescript
describe('Email Templates (Pure Functions)', () => {
  // Test payment confirmation template
  - Format EUR amount correctly
  - Include order ID, date, items
  - Calculate total with tax
  - Generate confirmation link
  - Add lawyer contact info

  // Test welcome email template
  - Personalization with user name
  - Account activation link
  - Legal notices
  - Unsubscribe link

  // Test consultation summary
  - Question recap
  - Assigned lawyer info
  - Next steps
  - Contact information

  // Test invoice template
  - Itemized charges
  - Tax breakdown (21% IVA)
  - Payment method
  - Legal terms
})
```

### 2️⃣ OpenAI Service Tests (6h)

#### `services/openaiService.mock.test.ts`
```typescript
describe('OpenAI Service (Mock API)', () => {
  // Mock OpenAI API responses
  - Question categorization (returns category)
  - FAQ matching (returns relevance score)
  - Response generation (returns text)
  - Token counting
  - Error handling (rate limits, timeouts)

  // Test categorization logic
  - Detect legal category from question
  - Multi-category questions
  - Non-legal questions
  - Spam/abuse detection

  // Test relevance scoring
  - FAQ match relevance (0-100)
  - Keyword matching
  - Semantic similarity
  - Caching matches
})
```

### 3️⃣ Admin Service Tests (6h)

#### `services/adminService.mock.test.ts`
```typescript
describe('Admin Service (Mock Data)', () => {
  // Mock user data operations
  - Get all users (with pagination)
  - Filter users (by role, status)
  - Search users (by email, name)
  - Update user role
  - Delete user
  - Get user by ID

  // Mock payment operations
  - Get payment history
  - Filter payments (by status, date range)
  - Calculate payment statistics
  - Generate refunds
  - Export payment data

  // Mock analytics
  - User count by role
  - Revenue by category
  - Revenue by date (trends)
  - Average response time
  - Top questions

  // Test RBAC logic
  - Admin can do everything
  - Lawyer can only view own consultations
  - User can only view own data
  - Access denied errors
})
```

**Total Integration Tests**: ~50 tests ✅

---

## 🚀 PHASE 3: API ROUTE TESTS (Mock Express - 28h)

### Setup Pattern
```typescript
import request from 'supertest'
import express, { Express } from 'express'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create test app WITHOUT database connection
const app = express()
app.use(express.json())

// Use routes with mocked services
import { setupAuthRoutes } from '../src/routes/auth'
setupAuthRoutes(app, {
  userService: mockUserService,
  authService: mockAuthService,
  emailService: mockEmailService,
})

// Test like normal
describe('Auth Routes', () => {
  it('should register user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      })
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('userId')
  })
})
```

### 1️⃣ Auth Routes (12h)

#### `POST /api/auth/register`
- ✅ Valid input → Create user, return JWT
- ✅ Duplicate email → 409 Conflict
- ✅ Invalid password → 400 Bad Request
- ✅ Missing fields → 400 Bad Request
- ✅ Mock email verification token
- ✅ Hash password (mock bcrypt)

#### `POST /api/auth/login`
- ✅ Valid credentials → Return JWT + refresh token
- ✅ Invalid email → 401 Unauthorized
- ✅ Wrong password → 401 Unauthorized
- ✅ Not verified → 403 Forbidden
- ✅ Account locked → 429 Too Many Requests
- ✅ Audit logging

#### `POST /api/auth/refresh-token`
- ✅ Valid refresh token → New JWT
- ✅ Expired refresh token → 401 Unauthorized
- ✅ Invalid signature → 401 Unauthorized
- ✅ Token rotation (invalidate old token)

#### `POST /api/auth/logout`
- ✅ Invalidate refresh token
- ✅ Clear session
- ✅ Return success

#### `POST /api/auth/oauth/google`
- ✅ Mock Google OAuth flow
- ✅ Create/update user from Google data
- ✅ Return JWT

#### `POST /api/auth/oauth/apple`
- ✅ Mock Apple OAuth flow
- ✅ Create/update user from Apple data
- ✅ Return JWT

### 2️⃣ Payment Routes (10h)

#### `POST /api/payments/create-payment-intent`
- ✅ Valid consultation → Create payment intent (mock Stripe)
- ✅ Amount validation (1-99999.99 EUR)
- ✅ Category validation
- ✅ Return client secret for Stripe.js
- ✅ Store pending payment (mock DB)

#### `POST /api/payments/confirm-payment`
- ✅ Valid payment → Mark as succeeded
- ✅ Send confirmation email (mock)
- ✅ Create consultation record (mock)
- ✅ Assign lawyer (mock)
- ✅ Invalid intent → 400 Bad Request

#### `POST /api/payments/refund`
- ✅ Full refund (100%)
- ✅ Partial refund
- ✅ Already refunded → Error
- ✅ Send refund email (mock)

#### `GET /api/payments/:id`
- ✅ Authorized user → Return payment details
- ✅ Unauthorized → 403 Forbidden
- ✅ Not found → 404 Not Found

### 3️⃣ Admin Routes (10h)

#### User Management
- `GET /api/admin/users` - List with pagination
- `GET /api/admin/users/:id` - Get one user
- `PUT /api/admin/users/:id/role` - Update role
- `DELETE /api/admin/users/:id` - Soft delete
- `GET /api/admin/users/search` - Search by email/name
- `POST /api/admin/users/:id/lock` - Lock account

#### Payment Management
- `GET /api/admin/payments` - List payments
- `GET /api/admin/payments/stats` - Statistics
- `POST /api/admin/payments/:id/refund` - Process refund
- `GET /api/admin/payments/export` - Export CSV (mock)

#### Analytics
- `GET /api/admin/analytics/summary` - Overview stats
- `GET /api/admin/analytics/users/breakdown` - Users by role
- `GET /api/admin/analytics/payments/breakdown` - Revenue by category
- `GET /api/admin/analytics/revenue/trend` - Revenue over time

#### RBAC Authorization
- ✅ Admin can do everything
- ✅ Lawyer cannot access user list
- ✅ User cannot access admin endpoints
- ✅ Test permission escalation protection
- ✅ Test audit logging

### 4️⃣ Middleware Routes (6h)

#### `middleware/auth.test.ts`
- ✅ Valid JWT → Attach user to request
- ✅ Invalid JWT → 401 Unauthorized
- ✅ Expired JWT → 401 Unauthorized
- ✅ Missing token → 401 Unauthorized
- ✅ Malformed token → 401 Unauthorized

#### `middleware/authorization.test.ts` (RBAC)
- ✅ Admin can access admin routes
- ✅ Non-admin cannot access admin routes
- ✅ User can only access own data
- ✅ Lawyer can access own consultations
- ✅ Test role hierarchy

#### `middleware/errorHandler.test.ts`
- ✅ Validation errors → 400 with field errors
- ✅ Authentication errors → 401 with message
- ✅ Authorization errors → 403 with message
- ✅ Not found errors → 404
- ✅ Server errors → 500 with generic message
- ✅ Error logging

**Total Route Tests**: ~80 tests ✅

---

## 🔄 PHASE 4: E2E WORKFLOWS (API Chains - 20h)

### Pattern: Chain multiple API calls
```typescript
describe('E2E: Complete User Journey', () => {
  it('register → login → create consultation → payment → confirmation', async () => {
    // 1. Register
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(userData)
    expect(registerRes.status).toBe(201)
    const { jwt, userId } = registerRes.body

    // 2. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
    expect(loginRes.status).toBe(200)

    // 3. Create consultation (authenticated)
    const consultRes = await request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ question, category })
    expect(consultRes.status).toBe(201)

    // 4. Create payment intent
    const paymentRes = await request(app)
      .post('/api/payments/create-payment-intent')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ consultationId, amount: 5000 })
    expect(paymentRes.status).toBe(200)

    // 5. Confirm payment
    const confirmRes = await request(app)
      .post('/api/payments/confirm-payment')
      .send({ intentId: paymentRes.body.intentId })
    expect(confirmRes.status).toBe(200)

    // Verify email was sent (mock)
    expect(mockEmailService.sendPaymentConfirmation).toHaveBeenCalled()
  })
})
```

### 1️⃣ Auth Workflow (6h)
- [ ] Register flow
  - Register → Verify email → Login ✅
  - OAuth Google flow ✅
  - Password reset flow ✅
  - Email verification resend ✅
  
- [ ] Token management
  - Access token expiration ✅
  - Refresh token rotation ✅
  - Logout invalidation ✅

### 2️⃣ Payment Workflow (8h)
- [ ] Complete payment flow
  - Create consultation ✅
  - Get FAQ match (auto-response) ✅
  - Create payment intent ✅
  - Confirm payment ✅
  - Send confirmation email ✅
  - Create consultation record ✅
  - Assign lawyer ✅

- [ ] Error scenarios
  - Declined card ✅
  - Insufficient funds ✅
  - Invalid amount ✅
  - Currency mismatch ✅

- [ ] Refund flow
  - Initiate refund ✅
  - Verify refund status ✅
  - Send refund email ✅

### 3️⃣ Admin Workflow (6h)
- [ ] Admin user flow
  - Admin login ✅
  - List users with filters ✅
  - Search users ✅
  - Update user role ✅
  - Verify RBAC applied ✅

- [ ] Admin payment flow
  - View all payments ✅
  - Filter by status/date ✅
  - Calculate statistics ✅
  - Process refund ✅

- [ ] Analytics flow
  - Generate summary ✅
  - View user breakdown ✅
  - View revenue trends ✅
  - Export data ✅

**Total E2E Tests**: ~30 tests ✅

---

## 📊 Coverage Calculation

### Current State
```
Total Tests: 206
Passing: 180 ✅
Failing: 26 ❌ (require database)
Coverage: 8.99% (from placeholder tests)
```

### After Unit Tests Completion
```
Unit Tests: ~240
Integration Tests: ~50
Route Tests: ~80
E2E Tests: ~30
─────────────
TOTAL: ~400 tests
Expected Coverage: 45-50% ✅
```

### After Phase 5 (With Database Tests)
```
All tests: ~450+
Including: Integration tests against real DB
Expected Coverage: 70%+ ✅
```

---

## 🛠️ Tools & Setup

```bash
# Install testing utilities
npm install -D \
  @testing-library/jest-dom \
  vi-fetch \
  supertest \
  @types/supertest \
  nock \
  @vitest/coverage-v8

# Run tests
npm test                          # All tests
npm test -- --ui                  # UI dashboard
npm run test:coverage             # Coverage report
npm test -- --watch              # Watch mode

# Coverage report
npm run test:coverage -- --reporter=html
# Open: coverage/index.html
```

---

## ✅ Acceptance Criteria

- [ ] All 240+ unit tests passing ✅
- [ ] All 50+ integration tests passing ✅
- [ ] All 80+ route tests passing ✅
- [ ] All 30+ E2E tests passing ✅
- [ ] Coverage ≥ 70% ✅
- [ ] Zero console errors ✅
- [ ] Zero TypeScript errors ✅
- [ ] All tests run in < 10 seconds ✅

---

## 📅 Timeline

| Phase | Tests | Hours | Status |
|-------|-------|-------|--------|
| 1. Unit | 240 | 6h | ⏳ 80% Complete |
| 2. Integration | 50 | 20h | 📋 To Start |
| 3. Routes | 80 | 28h | 📋 To Start |
| 4. E2E | 30 | 20h | 📋 To Start |
| 5. Coverage | - | 2h | 📋 To Start |
| **TOTAL** | **~400** | **76h** | **🚀** |

**Estimated Time to 70% Coverage**: 2-3 weeks (40h per week)

---

## 🎯 Next Action

**Immediately after restoring tests**:
1. Create `middleware/validation.test.ts` ← START HERE
2. Create `services/emailService.mock.test.ts`
3. Create first route test: `routes/auth.test.ts`

**This approach ensures**:
- ✅ No database dependency
- ✅ Tests run instantly (local)
- ✅ Can be committed to git
- ✅ CI/CD friendly
- ✅ Scalable to integration tests later

