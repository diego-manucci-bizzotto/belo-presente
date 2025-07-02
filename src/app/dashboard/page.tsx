"use client"
import ProtectedRoute from '@/components/route/protected-route';
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {logout} from "@/lib/firebase/auth";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Button onClick={async () => {
          await logout();
          router.push('/login');
        }}>Sair</Button>
      </div>
    </ProtectedRoute>
  );
}