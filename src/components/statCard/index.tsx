import React from "react";
import { Paper, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        textAlign: "center",
        minWidth: 120,
        flexGrow: 1,
        bgcolor: `${color}.50`,
      }}
    >
      <Typography variant="h4" sx={{ color }} fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}
