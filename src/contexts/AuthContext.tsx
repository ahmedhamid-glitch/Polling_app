"use client";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { jwtDecode } from "jwt-decode";

// ---------------------------
// Type Definitions
// ---------------------------
interface User {
  email: string;
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isInitialized: boolean;
  loadingDomains: boolean;
}

interface AuthContextType extends AuthState {
  login: (userData: { token: string } & User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setState: Dispatch<SetStateAction<AuthState>>;
}

// ---------------------------
// Create Context
// ---------------------------
export const AuthContext = createContext<AuthContextType | null>(null);

// ---------------------------
// Provider Component
// ---------------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isInitialized: false,
    loadingDomains: false,
  });

  const login = ({ token, ...user }: { token: string } & User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user,
    }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null,
    }));
  };

  const updateUser = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setState((prev) => ({
      ...prev,
      user,
    }));
  };

  const checkToken = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const decoded: any = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          logout();
          return;
        }

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: JSON.parse(user),
          isInitialized: true,
        }));
      } catch (err) {
        console.error("Token decode error:", err);
        logout();
      }
    } else {
      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isInitialized: true,
      }));
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const authContextValue: AuthContextType = {
    ...state,
    login,
    logout,
    setState,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
