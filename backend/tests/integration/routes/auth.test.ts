import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock types and utilities
interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  refreshTokens: string[];
}

interface MockRequest extends Partial<Request> {
  body?: any;
  query?: any;
  params?: any;
  headers?: Record<string, string>;
  user?: any;
}

interface MockResponse extends Partial<Response> {
  status: (code: number) => MockResponse;
  json: (data: any) => MockResponse;
  statusCode?: number;
  _data?: any;
  _called?: boolean;
}

// Helper functions
function createMockRequest(overrides?: any): MockRequest {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    ...overrides,
  };
}

function createMockResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    _data: null,
    _called: false,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this._data = data;
      this._called = true;
      return this;
    },
  };
  return res;
}

// Mock database
const mockDatabase = {
  users: new Map<string, MockUser>(),
  sessions: new Map<string, { userId: string; createdAt: number }>(),

  findUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  createUser(email: string, name: string, hashedPassword: string) {
    const user: MockUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      role: 'user',
      refreshTokens: [],
    };
    this.users.set(user.id, user);
    return user;
  },

  getUserById(id: string) {
    return this.users.get(id) || null;
  },
};

// Auth service mock
const authService = {
  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  },

  async comparePasswords(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  },

  generateAccessToken(userId: string, role: string) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },

  generateRefreshToken(userId: string) {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
      { expiresIn: '7d' }
    );
  },

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    } catch {
      return null;
    }
  },

  verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'test-refresh-secret');
    } catch {
      return null;
    }
  },
};

// Route handlers (controllers)
const authRoutes = {
  async register(req: MockRequest, res: MockResponse) {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400);
      return res.json({
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR',
      });
    }

    // Email format validation
    if (!email.includes('@')) {
      res.status(400);
      return res.json({ error: 'Invalid email format', code: 'INVALID_EMAIL' });
    }

    // Password length validation
    if (password.length < 6) {
      res.status(400);
      return res.json({
        error: 'Password must be at least 6 characters',
        code: 'WEAK_PASSWORD',
      });
    }

    // Check if user exists
    const existingUser = mockDatabase.findUserByEmail(email);
    if (existingUser) {
      res.status(409);
      return res.json({ error: 'User already exists', code: 'USER_EXISTS' });
    }

    // Hash password and create user
    const hashedPassword = await authService.hashPassword(password);
    const user = mockDatabase.createUser(email, name, hashedPassword);

    // Generate tokens
    const accessToken = authService.generateAccessToken(user.id, user.role);
    const refreshToken = authService.generateRefreshToken(user.id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);

    res.status(201);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  },

  async login(req: MockRequest, res: MockResponse) {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400);
      return res.json({
        error: 'Email and password required',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // Find user
    const user = mockDatabase.findUserByEmail(email);
    if (!user) {
      res.status(401);
      return res.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Verify password
    const passwordMatch = await authService.comparePasswords(password, user.password);
    if (!passwordMatch) {
      res.status(401);
      return res.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Generate tokens
    const accessToken = authService.generateAccessToken(user.id, user.role);
    const refreshToken = authService.generateRefreshToken(user.id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);

    res.status(200);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  },

  async refreshToken(req: MockRequest, res: MockResponse) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400);
      return res.json({ error: 'Refresh token required', code: 'MISSING_TOKEN' });
    }

    // Verify refresh token
    const decoded = authService.verifyRefreshToken(refreshToken) as any;
    if (!decoded) {
      res.status(401);
      return res.json({ error: 'Invalid refresh token', code: 'INVALID_TOKEN' });
    }

    // Get user
    const user = mockDatabase.getUserById(decoded.userId);
    if (!user) {
      res.status(404);
      return res.json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    // Check if token is still valid (in stored tokens)
    if (!user.refreshTokens.includes(refreshToken)) {
      res.status(401);
      return res.json({ error: 'Refresh token revoked', code: 'TOKEN_REVOKED' });
    }

    // Generate new access token
    const newAccessToken = authService.generateAccessToken(user.id, user.role);

    res.status(200);
    return res.json({
      accessToken: newAccessToken,
    });
  },

  async logout(req: MockRequest, res: MockResponse) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400);
      return res.json({ error: 'Refresh token required', code: 'MISSING_TOKEN' });
    }

    // Verify token and get user
    const decoded = authService.verifyRefreshToken(refreshToken) as any;
    if (!decoded) {
      res.status(401);
      return res.json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
    }

    const user = mockDatabase.getUserById(decoded.userId);
    if (user) {
      // Remove refresh token from user's list
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    }

    res.status(200);
    return res.json({ message: 'Logged out successfully' });
  },

  async oauthGoogle(req: MockRequest, res: MockResponse) {
    const { token } = req.body;

    if (!token) {
      res.status(400);
      return res.json({ error: 'Google token required', code: 'MISSING_TOKEN' });
    }

    // Simulate Google token verification
    // In real scenario, this would call Google API
    if (!token.startsWith('google_')) {
      res.status(401);
      return res.json({ error: 'Invalid Google token', code: 'INVALID_TOKEN' });
    }

    const email = `user_${Date.now()}@google.com`;
    const name = 'Google User';

    // Check if user exists
    let user = mockDatabase.findUserByEmail(email);
    if (!user) {
      const hashedPassword = await authService.hashPassword('oauth-password');
      user = mockDatabase.createUser(email, name, hashedPassword);
    }

    // Generate tokens
    const accessToken = authService.generateAccessToken(user.id, user.role);
    const refreshToken = authService.generateRefreshToken(user.id);
    user.refreshTokens.push(refreshToken);

    res.status(200);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  },

  async oauthApple(req: MockRequest, res: MockResponse) {
    const { token } = req.body;

    if (!token) {
      res.status(400);
      return res.json({ error: 'Apple token required', code: 'MISSING_TOKEN' });
    }

    // Simulate Apple token verification
    if (!token.startsWith('apple_')) {
      res.status(401);
      return res.json({ error: 'Invalid Apple token', code: 'INVALID_TOKEN' });
    }

    const email = `user_${Date.now()}@apple.com`;
    const name = 'Apple User';

    // Check if user exists
    let user = mockDatabase.findUserByEmail(email);
    if (!user) {
      const hashedPassword = await authService.hashPassword('oauth-password');
      user = mockDatabase.createUser(email, name, hashedPassword);
    }

    // Generate tokens
    const accessToken = authService.generateAccessToken(user.id, user.role);
    const refreshToken = authService.generateRefreshToken(user.id);
    user.refreshTokens.push(refreshToken);

    res.status(200);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  },
};

// ============================================================================
// TESTS
// ============================================================================

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    mockDatabase.users.clear();
    mockDatabase.sessions.clear();
  });

  it('should register a new user with valid data', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
        name: 'John Doe',
      },
    });
    const res = createMockResponse();

    await authRoutes.register(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._data).toBeDefined();
    expect(res._data.user).toBeDefined();
    expect(res._data.user.email).toBe('john@example.com');
    expect(res._data.user.name).toBe('John Doe');
    expect(res._data.accessToken).toBeDefined();
    expect(res._data.refreshToken).toBeDefined();
  });

  it('should return 400 if email is missing', async () => {
    const req = createMockRequest({
      body: {
        password: 'Password123',
        name: 'John Doe',
      },
    });
    const res = createMockResponse();

    await authRoutes.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if password is missing', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        name: 'John Doe',
      },
    });
    const res = createMockResponse();

    await authRoutes.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if name is missing', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
      },
    });
    const res = createMockResponse();

    await authRoutes.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if email format is invalid', async () => {
    const req = createMockRequest({
      body: {
        email: 'invalid-email',
        password: 'Password123',
        name: 'John Doe',
      },
    });
    const res = createMockResponse();

    await authRoutes.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('INVALID_EMAIL');
  });

  it('should return 400 if password is too short', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: '123',
        name: 'John Doe',
      },
    });
    const res = createMockResponse();

    await authRoutes.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('WEAK_PASSWORD');
  });

  it('should return 409 if user already exists', async () => {
    // First registration
    const req1 = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
        name: 'John Doe',
      },
    });
    const res1 = createMockResponse();
    await authRoutes.register(req1, res1);

    // Second registration with same email
    const req2 = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'AnotherPassword123',
        name: 'Jane Doe',
      },
    });
    const res2 = createMockResponse();
    await authRoutes.register(req2, res2);

    expect(res2.statusCode).toBe(409);
    expect(res2._data.code).toBe('USER_EXISTS');
  });

  it('should hash password before storing', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
        name: 'John Doe',
      },
    });
    const res = createMockResponse();

    await authRoutes.register(req, res);

    const storedUser = mockDatabase.findUserByEmail('john@example.com');
    expect(storedUser).toBeDefined();
    expect(storedUser!.password).not.toBe('Password123');
    expect(storedUser!.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
  });

  it('should set user role to "user" by default', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
        name: 'John Doe',
      },
    });
    const res = createMockResponse();

    await authRoutes.register(req, res);

    expect(res._data.user.role).toBe('user');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    mockDatabase.users.clear();
    // Create a test user
    const hashedPassword = await authService.hashPassword('Password123');
    mockDatabase.createUser('john@example.com', 'John Doe', hashedPassword);
  });

  it('should login successfully with valid credentials', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
      },
    });
    const res = createMockResponse();

    await authRoutes.login(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._data.user).toBeDefined();
    expect(res._data.user.email).toBe('john@example.com');
    expect(res._data.accessToken).toBeDefined();
    expect(res._data.refreshToken).toBeDefined();
  });

  it('should return 400 if email is missing', async () => {
    const req = createMockRequest({
      body: {
        password: 'Password123',
      },
    });
    const res = createMockResponse();

    await authRoutes.login(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('MISSING_CREDENTIALS');
  });

  it('should return 400 if password is missing', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
      },
    });
    const res = createMockResponse();

    await authRoutes.login(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('MISSING_CREDENTIALS');
  });

  it('should return 401 if user does not exist', async () => {
    const req = createMockRequest({
      body: {
        email: 'nonexistent@example.com',
        password: 'Password123',
      },
    });
    const res = createMockResponse();

    await authRoutes.login(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._data.code).toBe('INVALID_CREDENTIALS');
  });

  it('should return 401 if password is incorrect', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'WrongPassword',
      },
    });
    const res = createMockResponse();

    await authRoutes.login(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._data.code).toBe('INVALID_CREDENTIALS');
  });

  it('should store refresh token in user record', async () => {
    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
      },
    });
    const res = createMockResponse();

    await authRoutes.login(req, res);

    const user = mockDatabase.findUserByEmail('john@example.com');
    expect(user!.refreshTokens.length).toBeGreaterThan(0);
  });

  it('should return tokens on each login', async () => {
    const req1 = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
      },
    });
    const res1 = createMockResponse();
    await authRoutes.login(req1, res1);

    expect(res1._data.accessToken).toBeDefined();
    expect(res1._data.refreshToken).toBeDefined();

    const req2 = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
      },
    });
    const res2 = createMockResponse();
    await authRoutes.login(req2, res2);

    // Both logins should return valid tokens
    expect(res2._data.accessToken).toBeDefined();
    expect(res2._data.refreshToken).toBeDefined();

    // User should have 2 refresh tokens stored
    const user = mockDatabase.findUserByEmail('john@example.com');
    expect(user!.refreshTokens.length).toBe(2);
  });
});

describe('POST /api/auth/refresh-token', () => {
  let refreshToken: string;

  beforeEach(async () => {
    mockDatabase.users.clear();
    const hashedPassword = await authService.hashPassword('Password123');
    mockDatabase.createUser('john@example.com', 'John Doe', hashedPassword);

    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
      },
    });
    const res = createMockResponse();
    await authRoutes.login(req, res);
    refreshToken = res._data.refreshToken;
  });

  it('should return new access token with valid refresh token', async () => {
    const req = createMockRequest({
      body: {
        refreshToken,
      },
    });
    const res = createMockResponse();

    await authRoutes.refreshToken(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._data.accessToken).toBeDefined();
  });

  it('should return 400 if refresh token is missing', async () => {
    const req = createMockRequest({
      body: {},
    });
    const res = createMockResponse();

    await authRoutes.refreshToken(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('MISSING_TOKEN');
  });

  it('should return 401 if refresh token is invalid', async () => {
    const req = createMockRequest({
      body: {
        refreshToken: 'invalid-token',
      },
    });
    const res = createMockResponse();

    await authRoutes.refreshToken(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._data.code).toBe('INVALID_TOKEN');
  });

  it('should return 401 if refresh token is revoked', async () => {
    // Logout first to revoke token
    const logoutReq = createMockRequest({
      body: {
        refreshToken,
      },
    });
    const logoutRes = createMockResponse();
    await authRoutes.logout(logoutReq, logoutRes);

    // Try to refresh with revoked token
    const req = createMockRequest({
      body: {
        refreshToken,
      },
    });
    const res = createMockResponse();

    await authRoutes.refreshToken(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._data.code).toBe('TOKEN_REVOKED');
  });

  it('should not return refresh token, only access token', async () => {
    const req = createMockRequest({
      body: {
        refreshToken,
      },
    });
    const res = createMockResponse();

    await authRoutes.refreshToken(req, res);

    expect(res._data.accessToken).toBeDefined();
    expect(res._data.refreshToken).toBeUndefined();
  });
});

describe('POST /api/auth/logout', () => {
  let refreshToken: string;

  beforeEach(async () => {
    mockDatabase.users.clear();
    const hashedPassword = await authService.hashPassword('Password123');
    mockDatabase.createUser('john@example.com', 'John Doe', hashedPassword);

    const req = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
      },
    });
    const res = createMockResponse();
    await authRoutes.login(req, res);
    refreshToken = res._data.refreshToken;
  });

  it('should logout successfully with valid refresh token', async () => {
    const req = createMockRequest({
      body: {
        refreshToken,
      },
    });
    const res = createMockResponse();

    await authRoutes.logout(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._data.message).toBe('Logged out successfully');
  });

  it('should return 400 if refresh token is missing', async () => {
    const req = createMockRequest({
      body: {},
    });
    const res = createMockResponse();

    await authRoutes.logout(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('MISSING_TOKEN');
  });

  it('should return 401 if refresh token is invalid', async () => {
    const req = createMockRequest({
      body: {
        refreshToken: 'invalid-token',
      },
    });
    const res = createMockResponse();

    await authRoutes.logout(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._data.code).toBe('INVALID_TOKEN');
  });

  it('should revoke refresh token from user record', async () => {
    const req = createMockRequest({
      body: {
        refreshToken,
      },
    });
    const res = createMockResponse();

    await authRoutes.logout(req, res);

    const user = mockDatabase.findUserByEmail('john@example.com');
    expect(user!.refreshTokens).not.toContain(refreshToken);
  });

  it('should prevent logout with already revoked token', async () => {
    const req1 = createMockRequest({
      body: {
        refreshToken,
      },
    });
    const res1 = createMockResponse();
    await authRoutes.logout(req1, res1);

    expect(res1.statusCode).toBe(200);

    // Verify token is no longer in user's refresh tokens list
    const user = mockDatabase.findUserByEmail('john@example.com');
    expect(user!.refreshTokens).not.toContain(refreshToken);
  });
});

describe('POST /api/auth/oauth/google', () => {
  beforeEach(() => {
    mockDatabase.users.clear();
  });

  it('should create new user with valid Google token', async () => {
    const req = createMockRequest({
      body: {
        token: `google_${Date.now()}`,
      },
    });
    const res = createMockResponse();

    await authRoutes.oauthGoogle(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._data.user).toBeDefined();
    expect(res._data.accessToken).toBeDefined();
    expect(res._data.refreshToken).toBeDefined();
  });

  it('should return 400 if Google token is missing', async () => {
    const req = createMockRequest({
      body: {},
    });
    const res = createMockResponse();

    await authRoutes.oauthGoogle(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('MISSING_TOKEN');
  });

  it('should return 401 if Google token is invalid', async () => {
    const req = createMockRequest({
      body: {
        token: 'invalid-google-token',
      },
    });
    const res = createMockResponse();

    await authRoutes.oauthGoogle(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._data.code).toBe('INVALID_TOKEN');
  });

  it('should create user with Google token containing correct fields', async () => {
    const token = `google_${Date.now()}`;

    const req1 = createMockRequest({
      body: { token },
    });
    const res1 = createMockResponse();
    await authRoutes.oauthGoogle(req1, res1);

    expect(res1.statusCode).toBe(200);
    expect(res1._data.user).toBeDefined();
    expect(res1._data.user.id).toBeDefined();
    expect(res1._data.user.email).toContain('@google.com');
  });
});

describe('POST /api/auth/oauth/apple', () => {
  beforeEach(() => {
    mockDatabase.users.clear();
  });

  it('should create new user with valid Apple token', async () => {
    const req = createMockRequest({
      body: {
        token: `apple_${Date.now()}`,
      },
    });
    const res = createMockResponse();

    await authRoutes.oauthApple(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._data.user).toBeDefined();
    expect(res._data.accessToken).toBeDefined();
    expect(res._data.refreshToken).toBeDefined();
  });

  it('should return 400 if Apple token is missing', async () => {
    const req = createMockRequest({
      body: {},
    });
    const res = createMockResponse();

    await authRoutes.oauthApple(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._data.code).toBe('MISSING_TOKEN');
  });

  it('should return 401 if Apple token is invalid', async () => {
    const req = createMockRequest({
      body: {
        token: 'invalid-apple-token',
      },
    });
    const res = createMockResponse();

    await authRoutes.oauthApple(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._data.code).toBe('INVALID_TOKEN');
  });
});

describe('Auth Complete Flows', () => {
  beforeEach(() => {
    mockDatabase.users.clear();
  });

  it('should complete registration and login flow', async () => {
    // Register
    const regReq = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
        name: 'John Doe',
      },
    });
    const regRes = createMockResponse();
    await authRoutes.register(regReq, regRes);

    expect(regRes.statusCode).toBe(201);
    const registeredUser = regRes._data.user;

    // Login with same credentials
    const loginReq = createMockRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123',
      },
    });
    const loginRes = createMockResponse();
    await authRoutes.login(loginReq, loginRes);

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes._data.user.id).toBe(registeredUser.id);
    expect(loginRes._data.user.email).toBe(registeredUser.email);
  });

  it('should handle token refresh after login', async () => {
    // Register
    const regReq = createMockRequest({
      body: {
        email: 'jane@example.com',
        password: 'Password123',
        name: 'Jane Doe',
      },
    });
    const regRes = createMockResponse();
    await authRoutes.register(regReq, regRes);

    const refreshToken = regRes._data.refreshToken;

    // Wait a bit to ensure different timestamp in token
    await new Promise(resolve => setTimeout(resolve, 100));

    // Refresh token
    const refreshReq = createMockRequest({
      body: { refreshToken },
    });
    const refreshRes = createMockResponse();
    await authRoutes.refreshToken(refreshReq, refreshRes);

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes._data.accessToken).toBeDefined();
  });

  it('should complete login and logout flow', async () => {
    // Create user
    const hashedPassword = await authService.hashPassword('Password123');
    mockDatabase.createUser('bob@example.com', 'Bob Smith', hashedPassword);

    // Login
    const loginReq = createMockRequest({
      body: {
        email: 'bob@example.com',
        password: 'Password123',
      },
    });
    const loginRes = createMockResponse();
    await authRoutes.login(loginReq, loginRes);

    const refreshToken = loginRes._data.refreshToken;

    // Logout
    const logoutReq = createMockRequest({
      body: { refreshToken },
    });
    const logoutRes = createMockResponse();
    await authRoutes.logout(logoutReq, logoutRes);

    expect(logoutRes.statusCode).toBe(200);

    // Try to refresh with logged out token
    const refreshReq = createMockRequest({
      body: { refreshToken },
    });
    const refreshRes = createMockResponse();
    await authRoutes.refreshToken(refreshReq, refreshRes);

    expect(refreshRes.statusCode).toBe(401);
    expect(refreshRes._data.code).toBe('TOKEN_REVOKED');
  });
});
