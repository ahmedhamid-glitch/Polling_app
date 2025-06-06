import React from "react";
import { Paper, Typography, Button } from "@mui/material";

interface UserInfoPopupProps {
  inputEmail: string;
  setInputEmail: React.Dispatch<React.SetStateAction<string>>;
  inputUserName: string;
  setInputUserName: React.Dispatch<React.SetStateAction<string>>;
  saveUserInfo: () => void;
  onClose: () => void;
}

export default function UserInfoPopup({
  inputEmail,
  setInputEmail,
  inputUserName,
  setInputUserName,
  saveUserInfo,
  onClose,
}: UserInfoPopupProps) {
  return (
    <Paper
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        p: 4,
        zIndex: 9999,
        width: 300,
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: 2,
      }}
      elevation={6}
    >
      <Typography variant="h6" mb={2}>
        Enter your details to vote
      </Typography>
      <input
        type="email"
        placeholder="Email"
        value={inputEmail}
        onChange={(e) => setInputEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 12, padding: 8 }}
      />
      <input
        type="text"
        placeholder="Username"
        value={inputUserName}
        onChange={(e) => setInputUserName(e.target.value)}
        style={{ width: "100%", marginBottom: 12, padding: 8 }}
      />
      <Button variant="contained" fullWidth onClick={saveUserInfo} sx={{ mb: 1 }}>
        Save
      </Button>
      <Button variant="outlined" fullWidth onClick={onClose}>
        Cancel
      </Button>
    </Paper>
  );
}
