'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/ClerkAuthContext';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  // Get redirect URL from search params or localStorage
  const getRedirectUrl = () => {
    const urlRedirect = searchParams.get('redirect_url');
    if (urlRedirect) return urlRedirect;
    
    if (typeof window !== 'undefined') {
      const savedPath = localStorage.getItem('redirectAfterAuth');
      if (savedPath && savedPath !== '/') {
        return savedPath;
      }
    }
    
    return '/';
  };
  
  const redirectUrl = getRedirectUrl();

  // If user is already signed in, redirect them
  useEffect(() => {
    if (user) {
      // Clear saved redirect path
      if (typeof window !== 'undefined') {
        localStorage.removeItem('redirectAfterAuth');
      }
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <a href="/sign-up" className="font-medium text-brand hover:text-brand/80">
              create a new account
            </a>
          </p>
        </div>
        <div className="mt-8">
          <SignIn 
            path="/sign-in" 
            routing="path" 
            signUpUrl="/sign-up"
            redirectUrl={redirectUrl}
            appearance={{
              elements: {
                card: 'shadow-lg rounded-2xl border-0',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 rounded-lg py-3',
                socialButtonsBlockButtonText: 'text-gray-700 font-medium',
                socialButtonsBlockButtonArrow: 'text-gray-500',
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-500 text-sm',
                formFieldInput: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg',
                footerActionText: 'text-gray-600',
                footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-medium transition-colors',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
