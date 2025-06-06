"use client";

import { AuthContext } from "@/contexts/AuthContext";
import React, { useContext } from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItemText,
  Box,
  ListItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";

const Page = () => {
  const router = useRouter();
  const { allPolls }: any = useContext(AuthContext);

  const handleLivePoll = (pollId: number) => {
    router.push(`/live_poll?pollId=${pollId}`);
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
                  cursor: "pointer",
                  borderRadius: "10px !important",
                  p: 3,
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
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
