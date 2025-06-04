"use client";

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth";

export default function Home() {
  const auth = useContext(AuthContext);
  if (!auth || !auth.isInitialized) {
    return <div>Loading...</div>; // Or a spinner
  }

  console.log("🚀 ~ Home ~ state:", auth);

  return (
    <div>
      {!auth?.isInitialized || !auth?.isAuthenticated ? (
        <LoginForm />
      ) : (
        "Welcome"
      )}
    </div>
  );
}
