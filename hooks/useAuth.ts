import { useUser } from '@/contexts/UserContext';
import { GoogleAuthService } from '@/services/googleAuth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useAuth = () => {
  const { user, isLoggedIn, isLoading, login, logout, updateUser } = useUser();
  const router = useRouter();

  const signInWithGoogle = useCallback(async () => {
    try {
      await GoogleAuthService.signIn();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await GoogleAuthService.signOut();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force logout even if there's an error
      logout();
      router.push('/');
    }
  }, [logout, router]);

  const handleGoogleCallback = useCallback(async (code: string) => {
    try {
      const googleUser = await GoogleAuthService.handleCallback(code);
      
      // Convert to our user format
      const userData = {
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        image: googleUser.image,
        provider: googleUser.provider,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      login(userData);
      return userData;
    } catch (error) {
      console.error('Google callback error:', error);
      throw error;
    }
  }, [login]);

  const refreshUserData = useCallback(async () => {
    try {
      const googleUser = await GoogleAuthService.getCurrentUser();
      if (googleUser && user) {
        updateUser({
          name: googleUser.name,
          email: googleUser.email,
          image: googleUser.image,
          lastLogin: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [user, updateUser]);

  return {
    user,
    isLoggedIn,
    isLoading,
    signInWithGoogle,
    signOut,
    handleGoogleCallback,
    refreshUserData,
    updateUser,
  };
};
