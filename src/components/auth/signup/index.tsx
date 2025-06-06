"use client";

import React, { useContext, useState } from "react";
import { CircularProgress } from "@mui/material";

import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";

// api/auth email password username recoverEmail

export default function SignUpComp({
  setShowSignupPage,
}: {
  setShowSignupPage: any;
}) {
  const router = useRouter();
  const { login }: any = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
    recoverEmail: "",
  });

  const [errors, setErrors] = useState({
    email: false,
    recoverEmail: false,
  });

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Email validation
    if (name === "email" || name === "recoverEmail") {
      setErrors((prev) => ({
        ...prev,
        [name]: !isValidEmail(value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValid = isValidEmail(formData.email);
    const recoverEmailValid = isValidEmail(formData.recoverEmail);

    setErrors({
      email: !emailValid,
      recoverEmail: !recoverEmailValid,
    });

    if (!emailValid || !recoverEmailValid || formData.password.trim() === "") {
      return;
    }
    setLoading(true); // Start loading

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, action: "signup" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Sign up failed:", errorData.message);
        // Optionally show this error message to the user
        return;
      }

      const data = await response.json();
      const { user, token } = data;
      console.log("Login successful:", user, token);
      login({ user, token });
      router.push("/");
      // Redirect or show success message here
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setLoading(false); // Stop loading in all cases
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
          maxWidth: 500,
          width: "100%",
          backgroundColor: "#fff",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" color="#8431F3" fontWeight="bold">
            Sign Up
          </Typography>
          <Typography variant="subtitle1">Create your account</Typography>
        </Box>

        <TextField
          fullWidth
          label="Username"
          name="userName"
          margin="normal"
          value={formData.userName}
          onChange={handleChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />

        <TextField
          fullWidth
          label="Email Address"
          name="email"
          margin="normal"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          helperText={errors.email ? "Enter a valid email" : ""}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />

        <TextField
          fullWidth
          label="Recover Email"
          name="recoverEmail"
          margin="normal"
          type="email"
          value={formData.recoverEmail}
          onChange={handleChange}
          error={errors.recoverEmail}
          helperText={errors.recoverEmail ? "Enter a valid email" : ""}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          margin="normal"
          type={showPassword ? "text" : "password"}
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
        <Box sx={{ textAlign: "right", mt: 1 }}>
          <Button
            onClick={() => setShowSignupPage(false)}
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
            I have an account
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
            "Sign Up"
          )}
        </Button>
      </Box>
    </Box>
  );
}
