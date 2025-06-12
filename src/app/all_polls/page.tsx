"use client";

import { AuthContext } from "@/contexts/AuthContext";
import React, { useContext, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItemText,
  Box,
  ListItem,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { DeleteOutline } from "@mui/icons-material";

const Page = () => {
  const router = useRouter();
  const { allPolls, setAllPolls }: any = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleLivePoll = (pollId: number) => {
    router.push(`/live_poll?pollId=${pollId}`);
  };

  const handleDeletePoll = async (pollId: number) => {
    try {
      const res = await fetch("/api/live_poll", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        console.error("Poll deletion failed:", responseData.message);
        alert("Poll deletion failed: " + responseData.message);
        setLoading(false);
        return;
      }

      // Remove the deleted poll from state
      setAllPolls((prev: any) => {
        const updatedPolls = prev.filter((poll: any) => poll.id !== pollId);

        // Save to localStorage
        localStorage.setItem("allPolls", JSON.stringify(updatedPolls));

        return updatedPolls;
      });
    } catch (error) {
      console.error("Poll deletion error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGate>
      <Container
        maxWidth="md"
        sx={{ py: 6, bgcolor: "#f9fafb", minHeight: "100vh" }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          Polls List
        </Typography>

        {allPolls.length === 0 ? (
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mt: 8, fontSize: "1.2rem" }}
          >
            No polls available.
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={4}>
            {allPolls.map((poll: any) => (
              <Paper
                key={poll.id}
                onClick={() => handleLivePoll(poll.id)}
                elevation={3}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: "10px !important",
                  p: 3,
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                {/* Delete Icon */}
                <IconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    handleDeletePoll(poll.id); // your delete function
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1,
                  }}
                >
                  <DeleteOutline />
                </IconButton>
                {/* Title */}
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {poll.title}
                </Typography>

                <List>
                  {poll?.options?.map((option: string, index: number) => (
                    <ListItem
                      key={index} // just index for guaranteed unique key
                      component="div"
                      sx={{
                        px: 0,
                        "&:hover .MuiListItemText-primary": {
                          color: "primary.main",
                        },
                      }}
                    >
                      <ListItemText primary={`${index + 1}. ${option}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </AuthGate>
  );
};

export default Page;
