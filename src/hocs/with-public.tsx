'use client';
import { useRouter } from 'next/navigation';
import React, {PropsWithChildren, useEffect} from 'react';

export default function withPublic<T>(WrappedComponent: React.ComponentType<T>) {
  return function WithPublicWrapper(props: PropsWithChildren<T>) {
    const { user, loading } = {user: null, loading: false}; // Replace with actual user context or state management
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        router.push('/lists');
      }
    }, [user, loading, router]);

    if (loading || user) return null;

    return <WrappedComponent {...props} />;
  };
}