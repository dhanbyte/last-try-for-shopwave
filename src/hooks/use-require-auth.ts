'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/ClerkAuthContext';
import { toast } from '@/hooks/use-toast';

export const useRequireAuth = (redirectPath = '/sign-in') => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = (action: string = 'perform this action') => {
    if (loading) return false;
    
    if (!user) {
      // Save current path before redirecting to login
      if (typeof window !== 'undefined') {
        const excludePaths = ['/sign-in', '/sign-up', '/register', '/admin'];
        const shouldSave = !excludePaths.some(path => pathname.startsWith(path));
        
        if (shouldSave) {
          localStorage.setItem('redirectAfterAuth', pathname + window.location.search);
        }
      }
      
      toast({
        title: 'Authentication Required',
        description: `Please sign in to ${action}.`,
        variant: 'default',
      });
      router.push(redirectPath);
      return false;
    }
    
    return true;
  };

  return { requireAuth, user, loading };
};
