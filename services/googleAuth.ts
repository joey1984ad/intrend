// Google OAuth service for handling authentication

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'google';
}

export class GoogleAuthService {
  private static readonly CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  private static readonly REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback';

  static async signIn(): Promise<void> {
    if (!this.CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  }

  static async handleCallback(code: string): Promise<GoogleUser> {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const { access_token, user } = await tokenResponse.json();

      // Store the access token
      localStorage.setItem('intrend_token', access_token);

      // Return user data
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.picture,
        provider: 'google' as const,
      };
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      const token = localStorage.getItem('intrend_token');
      if (!token) return null;

      const response = await fetch('/api/auth/google/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const user = await response.json();
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.picture,
        provider: 'google' as const,
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Clear invalid token
      localStorage.removeItem('intrend_token');
      return null;
    }
  }

  static async signOut(): Promise<void> {
    try {
      const token = localStorage.getItem('intrend_token');
      if (token) {
        // Revoke token on Google's servers
        await fetch('/api/auth/google/revoke', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('intrend_token');
      localStorage.removeItem('intrend_user');
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('intrend_token');
  }
}
