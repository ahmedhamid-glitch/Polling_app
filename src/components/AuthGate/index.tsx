"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);

  if (!auth || !auth.isInitialized) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
}
