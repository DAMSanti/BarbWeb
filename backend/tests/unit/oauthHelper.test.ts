import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'
import { exchangeGoogleCode, exchangeMicrosoftCode } from '../../src/utils/oauthHelper'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

describe('OAuth Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup environment variables
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/google/callback'
    process.env.MICROSOFT_CLIENT_ID = 'test-microsoft-client-id'
    process.env.MICROSOFT_CLIENT_SECRET = 'test-microsoft-client-secret'
    process.env.MICROSOFT_REDIRECT_URI = 'http://localhost:3000/auth/microsoft/callback'
  })

  afterEach(() => {
    vi.clearAllMocks()
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
    delete process.env.GOOGLE_REDIRECT_URI
    delete process.env.MICROSOFT_CLIENT_ID
    delete process.env.MICROSOFT_CLIENT_SECRET
    delete process.env.MICROSOFT_REDIRECT_URI
  })

  describe('exchangeGoogleCode', () => {
    it('should exchange authorization code for Google user info', async () => {
      const mockCode = 'test-auth-code'
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      }
      const mockUserInfo = {
        data: {
          email: 'user@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
          id: 'google-user-id-123',
        },
      }

      mockedAxios.post.mockResolvedValueOnce(mockTokenResponse)
      mockedAxios.get.mockResolvedValueOnce(mockUserInfo)

      const result = await exchangeGoogleCode(mockCode)

      expect(result).toEqual({
        email: 'user@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
        sub: 'google-user-id-123',
      })
    })

    it('should call Google token endpoint with correct parameters', async () => {
      const mockCode = 'test-auth-code'
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          email: 'user@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
          id: 'user-id',
        },
      })

      await exchangeGoogleCode(mockCode)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        {
          code: mockCode,
          client_id: 'test-google-client-id',
          client_secret: 'test-google-client-secret',
          redirect_uri: 'http://localhost:3000/auth/google/callback',
          grant_type: 'authorization_code',
        }
      )
    })

    it('should call Google userinfo endpoint with access token', async () => {
      const mockCode = 'test-auth-code'
      const mockAccessToken = 'test-access-token'

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: mockAccessToken },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          email: 'user@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
          id: 'user-id',
        },
      })

      await exchangeGoogleCode(mockCode)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      )
    })

    it('should throw error when Google CLIENT_ID is missing', async () => {
      delete process.env.GOOGLE_CLIENT_ID

      await expect(exchangeGoogleCode('test-code')).rejects.toThrow(
        'Missing Google OAuth credentials: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured'
      )
    })

    it('should throw error when Google CLIENT_SECRET is missing', async () => {
      delete process.env.GOOGLE_CLIENT_SECRET

      await expect(exchangeGoogleCode('test-code')).rejects.toThrow(
        'Missing Google OAuth credentials: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured'
      )
    })

    it('should throw error on token endpoint failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

      await expect(exchangeGoogleCode('test-code')).rejects.toThrow(
        'Failed to exchange Google code: Network error'
      )
    })

    it('should throw error on userinfo endpoint failure', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockRejectedValueOnce(new Error('Userinfo request failed'))

      await expect(exchangeGoogleCode('test-code')).rejects.toThrow(
        'Failed to exchange Google code: Userinfo request failed'
      )
    })

    it('should handle empty user data gracefully', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          email: 'user@example.com',
          name: undefined,
          picture: undefined,
          id: 'user-id',
        },
      })

      const result = await exchangeGoogleCode('test-code')

      expect(result.email).toBe('user@example.com')
      expect(result.name).toBeUndefined()
      expect(result.picture).toBeUndefined()
    })

    it('should use default redirect URI if not configured', async () => {
      delete process.env.GOOGLE_REDIRECT_URI

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          email: 'user@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
          id: 'user-id',
        },
      })

      await exchangeGoogleCode('test-code')

      const postCall = mockedAxios.post.mock.calls[0]
      expect(postCall[1].redirect_uri).toBe('http://localhost:3000/auth/google/callback')
    })

    it('should handle multiple OAuth exchanges sequentially', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValue({
        data: {
          email: 'user@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
          id: 'user-id',
        },
      })

      const result1 = await exchangeGoogleCode('code1')
      const result2 = await exchangeGoogleCode('code2')

      expect(result1).toEqual(result2)
      expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    })
  })

  describe('exchangeMicrosoftCode', () => {
    it('should exchange authorization code for Microsoft user info', async () => {
      const mockCode = 'test-auth-code'
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      }
      const mockUserInfo = {
        data: {
          mail: 'user@example.com',
          displayName: 'Test User',
          id: 'microsoft-user-id-123',
        },
      }

      mockedAxios.post.mockResolvedValueOnce(mockTokenResponse)
      mockedAxios.get.mockResolvedValueOnce(mockUserInfo)

      const result = await exchangeMicrosoftCode(mockCode)

      expect(result).toEqual({
        email: 'user@example.com',
        name: 'Test User',
        picture: '',
        sub: 'microsoft-user-id-123',
      })
    })

    it('should call Microsoft token endpoint with correct parameters', async () => {
      const mockCode = 'test-auth-code'
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          mail: 'user@example.com',
          displayName: 'Test User',
          id: 'user-id',
        },
      })

      await exchangeMicrosoftCode(mockCode)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        {
          code: mockCode,
          client_id: 'test-microsoft-client-id',
          client_secret: 'test-microsoft-client-secret',
          redirect_uri: 'http://localhost:3000/auth/microsoft/callback',
          grant_type: 'authorization_code',
          scope: 'openid profile email',
        }
      )
    })

    it('should call Microsoft Graph endpoint with access token', async () => {
      const mockCode = 'test-auth-code'
      const mockAccessToken = 'test-access-token'

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: mockAccessToken },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          mail: 'user@example.com',
          displayName: 'Test User',
          id: 'user-id',
        },
      })

      await exchangeMicrosoftCode(mockCode)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://graph.microsoft.com/v1.0/me',
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      )
    })

    it('should throw error when Microsoft CLIENT_ID is missing', async () => {
      delete process.env.MICROSOFT_CLIENT_ID

      await expect(exchangeMicrosoftCode('test-code')).rejects.toThrow(
        'Missing Microsoft OAuth credentials: MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET not configured'
      )
    })

    it('should throw error when Microsoft CLIENT_SECRET is missing', async () => {
      delete process.env.MICROSOFT_CLIENT_SECRET

      await expect(exchangeMicrosoftCode('test-code')).rejects.toThrow(
        'Missing Microsoft OAuth credentials: MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET not configured'
      )
    })

    it('should throw error on token endpoint failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

      await expect(exchangeMicrosoftCode('test-code')).rejects.toThrow(
        'Failed to exchange Microsoft code: Network error'
      )
    })

    it('should throw error on Graph endpoint failure', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockRejectedValueOnce(new Error('Graph API error'))

      await expect(exchangeMicrosoftCode('test-code')).rejects.toThrow(
        'Failed to exchange Microsoft code: Graph API error'
      )
    })

    it('should fallback to userPrincipalName if mail is not available', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          mail: null,
          userPrincipalName: 'user@microsoft.com',
          displayName: 'Test User',
          id: 'user-id',
        },
      })

      const result = await exchangeMicrosoftCode('test-code')

      expect(result.email).toBe('user@microsoft.com')
    })

    it('should set picture to empty string for Microsoft (requires additional handling)', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          mail: 'user@example.com',
          displayName: 'Test User',
          id: 'user-id',
        },
      })

      const result = await exchangeMicrosoftCode('test-code')

      expect(result.picture).toBe('')
    })

    it('should use default redirect URI if not configured', async () => {
      delete process.env.MICROSOFT_REDIRECT_URI

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          mail: 'user@example.com',
          displayName: 'Test User',
          id: 'user-id',
        },
      })

      await exchangeMicrosoftCode('test-code')

      const postCall = mockedAxios.post.mock.calls[0]
      expect(postCall[1].redirect_uri).toBe('http://localhost:3000/auth/microsoft/callback')
    })

    it('should handle both mail and userPrincipalName fallback', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          mail: null,
          userPrincipalName: 'fallback@microsoft.com',
          displayName: 'Test User',
          id: 'user-id',
        },
      })

      const result = await exchangeMicrosoftCode('test-code')

      expect(result.email).toBe('fallback@microsoft.com')
    })

    it('should handle empty displayName gracefully', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          mail: 'user@example.com',
          displayName: null,
          id: 'user-id',
        },
      })

      const result = await exchangeMicrosoftCode('test-code')

      expect(result.name).toBeNull()
      expect(result.email).toBe('user@example.com')
    })

    it('should handle multiple Microsoft OAuth exchanges sequentially', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'token' },
      })
      mockedAxios.get.mockResolvedValue({
        data: {
          mail: 'user@example.com',
          displayName: 'Test User',
          id: 'user-id',
        },
      })

      const result1 = await exchangeMicrosoftCode('code1')
      const result2 = await exchangeMicrosoftCode('code2')

      expect(result1).toEqual(result2)
      expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    })
  })

  describe('OAuth Interface - OAuthUserInfo', () => {
    it('should return consistent interface for both providers', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'token' },
      })

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          email: 'google@example.com',
          name: 'Google User',
          picture: 'https://example.com/google.jpg',
          id: 'google-id',
        },
      })

      const googleResult = await exchangeGoogleCode('code1')

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          mail: 'microsoft@example.com',
          displayName: 'Microsoft User',
          id: 'microsoft-id',
        },
      })

      const microsoftResult = await exchangeMicrosoftCode('code2')

      // Both should have same interface properties
      expect(googleResult).toHaveProperty('email')
      expect(googleResult).toHaveProperty('name')
      expect(googleResult).toHaveProperty('picture')
      expect(googleResult).toHaveProperty('sub')

      expect(microsoftResult).toHaveProperty('email')
      expect(microsoftResult).toHaveProperty('name')
      expect(microsoftResult).toHaveProperty('picture')
      expect(microsoftResult).toHaveProperty('sub')
    })
  })

  describe('Error Scenarios', () => {
    it('should handle malformed token response from Google', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { error: 'invalid_grant' },
      })

      await expect(exchangeGoogleCode('invalid-code')).rejects.toThrow()
    })

    it('should handle malformed token response from Microsoft', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { error: 'AADSTS65001' },
      })

      await expect(exchangeMicrosoftCode('invalid-code')).rejects.toThrow()
    })

    it('should handle timeout scenario', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('ECONNABORTED: Request timeout'))

      await expect(exchangeGoogleCode('test-code')).rejects.toThrow(
        'Failed to exchange Google code'
      )
    })

    it('should handle rate limiting from OAuth provider', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('429 Too Many Requests'))

      await expect(exchangeGoogleCode('test-code')).rejects.toThrow(
        'Failed to exchange Google code'
      )
    })
  })
})
