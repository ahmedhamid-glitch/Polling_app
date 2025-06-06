"use client";

import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";

export default function LoginForm({
  setShowSignupPage,
}: {
  setShowSignupPage: (showSignupPage: boolean) => void;
}) {
  const router = useRouter();
  const { login }: any = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setEmailError(!isValidEmail(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = formData;
    const valid = isValidEmail(email);
    setEmailError(!valid);

    if (!valid || password.trim() === "") return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, action: "login" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Login failed:", errorData.message);
        return;
      }

      const { user, token } = await res.json();
      console.log("Login successful:2", user, token);

      login({ user, token });
      // const res = await fetch("/api/auth", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password, action: "login" }),
      // });
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 400,
          width: "100%",
          backgroundColor: "#fff",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" color="#8431F3" fontWeight="bold">
            Login
          </Typography>
          <Typography variant="subtitle1">Login Account</Typography>
        </Box>

        <TextField
          name="email"
          fullWidth
          label="Email Address"
          variant="outlined"
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          error={emailError}
          helperText={emailError ? "Enter a valid email address" : ""}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />

        <TextField
          name="password"
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Button
            component={Link}
            href="/forgot-password"
            sx={{
              fontSize: "0.875rem",
              color: "#8431F3",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textTransform: "none",
              padding: 0,
              minWidth: "auto", // removes extra width
            }}
          >
            Forgot Password?
          </Button>

          <Button
            onClick={() => setShowSignupPage(true)}
            sx={{
              fontSize: "0.875rem",
              color: "#8431F3",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textTransform: "none",
              padding: 0,
            }}
          >
            I don&apos;t have an account
          </Button>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#8431F3",
            ":hover": { backgroundColor: "#8431F3" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Login"
          )}
        </Button>
      </Box>
    </Box>
  );
}
