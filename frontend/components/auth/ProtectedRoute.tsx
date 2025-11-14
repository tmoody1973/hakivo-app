'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({
  children,
  requireOnboarding = true
}: {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated - redirect to landing page
        router.push('/');
      } else if (requireOnboarding && !user.onboardingCompleted) {
        // Authenticated but onboarding not completed - redirect to onboarding
        router.push('/onboarding');
      }
    }
  }, [user, loading, router, requireOnboarding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireOnboarding && !user.onboardingCompleted) {
    return null;
  }

  return <>{children}</>;
}
