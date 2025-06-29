"use client"

import React, {useContext, useState} from "react";
import {User} from "@firebase/auth";

const AuthContext = React.createContext<{ user: User | null; setUser: (user: User | null) => void }>({
  user: null,
  setUser: () => {}
});

export function AuthProvider({children}: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{user, setUser}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context;
}