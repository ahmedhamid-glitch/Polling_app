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

// Types
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

interface AuthAllPolls {
  id: number;
  options: string[];
  title: string;
  userEmail: string;
}

interface AuthContextType extends AuthState {
  login: (userData: { token: string } & User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setAllPolls: Dispatch<SetStateAction<AuthAllPolls[]>>;
  allPolls: AuthAllPolls[];
}

// Context
export const AuthContext = createContext<AuthContextType | null>(null);

// Utility
const safeParse = <T = any,>(value: string): T | null => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [allPolls, setAllPolls] = useState<AuthAllPolls[]>([]);
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isInitialized: false,
    loadingDomains: false,
  });

  const login = ({ token, ...user }: { token: string } & User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user.user));

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

  const checkToken = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isInitialized: true,
      }));
      return;
    }

    const parsedUser = safeParse<User>(userString);
    if (!parsedUser) {
      logout();
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parsedUser.email,
          action: "checkUserByEmail",
          verifyToken: token,
        }),
      });

      if (!response.ok) {
        console.warn("User not found in database. Logging out.");
        logout();
        window.location.reload();
        return;
      }

      const decoded: any = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        logout();
        return;
      }

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: parsedUser,
        isInitialized: true,
      }));
    } catch (err) {
      console.error("Token decode error:", err);
      logout();
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated) return;

    const fetchAllPoll = async () => {
      const storedUser = localStorage.getItem("user");
      const user = safeParse<User>(storedUser || "");
      if (!user) return;

      try {
        const res = await fetch(`/api/live_poll?email=${user.email}`);

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Poll get failed:", {
            status: res.status,
            statusText: res.statusText,
            error: errorData.error,
            details: errorData.details,
          });
          return;
        }

        const data = await res.json();

        if (!data.data?.allPolls?.length) return;

        const pollsWithParsedOptions = data.data.allPolls.map((poll: any) => ({
          ...poll,
          options: safeParse(poll.options) || poll.options,
        }));

        setAllPolls(pollsWithParsedOptions);
        localStorage.setItem(
          "allPolls",
          JSON.stringify(pollsWithParsedOptions)
        );
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    fetchAllPoll();
  }, [state.isAuthenticated]);

  const authContextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    setAllPolls,
    allPolls,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
