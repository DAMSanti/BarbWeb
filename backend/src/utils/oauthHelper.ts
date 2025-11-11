import axios from 'axios'

interface OAuthUserInfo {
  email: string
  name: string
  picture: string
  sub: string
}

/**
 * Exchange Google authorization code for tokens and user info
 */
export async function exchangeGoogleCode(code: string): Promise<OAuthUserInfo> {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Missing Google OAuth credentials: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured')
    }

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: googleRedirectUri,
      grant_type: 'authorization_code',
    })

    // Fetch user info from Google
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
      },
    })

    return {
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
      sub: userInfo.data.id,
    }
  } catch (error: any) {
    throw new Error(`Failed to exchange Google code: ${error.message}`)
  }
}

/**
 * Exchange Microsoft authorization code for tokens and user info
 */
export async function exchangeMicrosoftCode(code: string): Promise<OAuthUserInfo> {
  try {
    const microsoftClientId = process.env.MICROSOFT_CLIENT_ID
    const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET
    const microsoftRedirectUri = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/auth/microsoft/callback'

    if (!microsoftClientId || !microsoftClientSecret) {
      throw new Error('Missing Microsoft OAuth credentials: MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET not configured')
    }

    const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      code,
      client_id: microsoftClientId,
      client_secret: microsoftClientSecret,
      redirect_uri: microsoftRedirectUri,
      grant_type: 'authorization_code',
      scope: 'openid profile email',
    })

    const { access_token } = tokenResponse.data

    // Fetch user info from Microsoft Graph
    const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    return {
      email: userResponse.data.mail || userResponse.data.userPrincipalName,
      name: userResponse.data.displayName,
      picture: '', // Microsoft Graph photo requires additional handling
      sub: userResponse.data.id,
    }
  } catch (error: any) {
    throw new Error(`Failed to exchange Microsoft code: ${error.message}`)
  }
}
