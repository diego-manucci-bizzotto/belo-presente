'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function UnauthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/lists');
    }
  }, [user, loading, router]);

  if (loading || user) return null;

  return <>{children}</>;
}