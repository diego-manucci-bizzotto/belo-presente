'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function withProtected<T>(WrappedComponent: React.ComponentType<T>) {
  return function WithProtectedWrapper(props: React.PropsWithChildren<T>) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading || !user) return null;

    return <WrappedComponent {...props} />;
  }
}