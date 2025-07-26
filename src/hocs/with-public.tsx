'use client';
import { useRouter } from 'next/navigation';
import React, {PropsWithChildren, useEffect} from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function withPublic<T>(WrappedComponent: React.ComponentType<T>) {
  return function WithPublicWrapper(props: PropsWithChildren<T>) {
    const { user, loading } = useAuth();
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