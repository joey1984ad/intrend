# User Authentication Setup Guide

This guide explains how to set up and use the user authentication system with Google OAuth.

## 🚀 Quick Start

### 1. Wrap your app with UserProvider

In your `app/layout.tsx` or main layout file:

```typescript
import { UserProvider } from '@/contexts/UserContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
```

### 2. Set up environment variables

Create or update your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 3. Use the Header component

The Header component now automatically gets user data from the auth context:

```typescript
import Header from '@/components/Header';

// No need to pass user or onSignOut props anymore!
<Header
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  // ... other props
/>
```

## 🔐 How to Use

### Sign In

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // User will be redirected to Google OAuth
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <button onClick={handleLogin}>
      Sign in with Google
    </button>
  );
}
```

### Sign Out

```typescript
import { useAuth } from '@/hooks/useAuth';

function ProfilePage() {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    // User will be redirected to homepage
  };

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
}
```

### Access User Data

```typescript
import { useAuth } from '@/hooks/useAuth';

function UserProfile() {
  const { user, isLoggedIn, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isLoggedIn) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      {user?.image && (
        <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full" />
      )}
    </div>
  );
}
```

## 🏗️ API Routes Needed

You'll need to create these API routes for Google OAuth to work:

### `/api/auth/google/callback`
- Handles the OAuth callback from Google
- Exchanges authorization code for access token
- Returns user data and token

### `/api/auth/google/user`
- Gets current user info from Google using access token
- Returns user profile data

### `/api/auth/google/revoke`
- Revokes the access token on Google's servers
- Called during sign out

## 📱 Features

- ✅ **Automatic user data storage** in localStorage
- ✅ **Persistent login state** across page refreshes
- ✅ **Google OAuth integration** with proper token handling
- ✅ **Automatic profile updates** in the header
- ✅ **Secure sign out** with token revocation
- ✅ **TypeScript support** with proper interfaces
- ✅ **Error handling** and fallback mechanisms

## 🔧 Customization

### Update User Data

```typescript
const { updateUser } = useAuth();

// Update specific fields
updateUser({
  name: 'New Name',
  email: 'newemail@example.com'
});
```

### Add Custom Fields

To add custom user fields, update the `User` interface in `contexts/UserContext.tsx`:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider?: 'google' | 'facebook' | 'email';
  createdAt?: Date;
  lastLogin?: Date;
  // Add your custom fields here
  customField?: string;
  preferences?: any;
}
```

## 🚨 Troubleshooting

### User data not showing
1. Check if `UserProvider` is wrapping your app
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Ensure API routes are implemented

### Sign out not working
1. Check if the `signOut` function is being called
2. Verify localStorage is being cleared
3. Check if redirect is working properly

### OAuth redirect issues
1. Verify `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` matches your Google OAuth app settings
2. Check if the callback route is implemented
3. Ensure CORS is configured properly

## 📚 Next Steps

1. Implement the required API routes
2. Set up Google OAuth app in Google Cloud Console
3. Test the authentication flow
4. Add error handling and user feedback
5. Implement additional OAuth providers if needed
