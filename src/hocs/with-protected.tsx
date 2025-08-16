'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function withProtected<T>(WrappedComponent: React.ComponentType<T>) {
  return function WithProtectedWrapper(props: React.PropsWithChildren<T>) {
    const { user, loading } = {user: null, loading: false}
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