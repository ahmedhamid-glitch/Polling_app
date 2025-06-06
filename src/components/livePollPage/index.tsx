"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  LinearProgress,
  Stack,
  Paper,
} from "@mui/material";
import { Users, Vote, BarChart3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import UserInfoPopup from "../userInfoPopup";
import StatCard from "../statCard";
import { useVoteStream } from "@/hooks/useVoteStream";

interface Votes {
  vote: string;
  userEmail: string;
  userName: string;
}

interface PollIdData {
  id: string;
  title: string;
  options: string[];
  userEmail: string;
  votes: Votes[];
}

export default function LivePollPage() {
  const searchParams = useSearchParams();
  const pollId = searchParams.get("pollId");
  const [pollIdData, setPollIdData] = useState<PollIdData | null>(null);
  const [loading, setLoading] = useState(true);

  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  const [user, setUser] = useState<{ email: string; userName: string } | null>(
    initialUser
  );

  // Popup states
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [inputUserName, setInputUserName] = useState("");
  const [pendingVoteOption, setPendingVoteOption] = useState<string | null>(
    null
  );

  // Use our SSE hook
  const { isConnected, error } = useVoteStream(pollId || "");

  useEffect(() => {
    if (!pollId) return;

    const fetchAllPoll = async () => {
      try {
        const res = await fetch(`/api/votes?pollId=${pollId}`);
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Poll get failed:", errorData.message);
          return;
        }

        const data = await res.json();
        const rawPoll = data.data;

        if (!rawPoll) {
          console.warn("Poll not found or empty.");
          return;
        }

        const parsedPoll = {
          ...rawPoll,
          options: rawPoll.options,
          votes: rawPoll.votes,
        };

        setPollIdData(parsedPoll);
        localStorage.setItem("pollIdData", JSON.stringify(parsedPoll));
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPoll();

    // Listen for vote updates
    const handleVoteUpdate = (event: CustomEvent) => {
      if (event.detail.pollId === pollId) {
        fetchAllPoll();
      }
    };

    window.addEventListener("voteUpdate", handleVoteUpdate as EventListener);

    return () => {
      window.removeEventListener(
        "voteUpdate",
        handleVoteUpdate as EventListener
      );
    };
  }, [pollId]);

  const currentPoll = pollIdData;
  const title = currentPoll?.title ?? "Loading...";
  const options = currentPoll?.options ?? [];
  const voteData = currentPoll?.votes ?? [];

  const userVote = voteData.find((v) => v.userEmail === user?.email);

  const votes = options.map(
    (opt) => voteData.filter((v: Votes) => v.vote === opt).length
  );
  const totalVotes = votes.reduce((sum, v) => sum + v, 0);

  const getPercentage = (count: number) =>
    totalVotes ? ((count / totalVotes) * 100).toFixed(1) : "0.0";

  const saveUserInfo = async () => {
    if (!inputEmail || !inputUserName) {
      alert("Please enter both email and username.");
      return;
    }
    const newUser = { email: inputEmail, userName: inputUserName };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    setShowUserPopup(false);

    if (pendingVoteOption && pollId) {
      try {
        const res = await fetch(`/api/votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: newUser.email,
            userName: newUser.userName,
            vote: pendingVoteOption,
            pollId,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Vote failed:", errorData.message);
        }
      } catch (error) {
        console.error("Error casting vote:", error);
      }
    }
  };

  const registerVote = async (opt: string, pollId: string) => {
    if (!user) {
      setPendingVoteOption(opt);
      setShowUserPopup(true);
      return;
    }

    try {
      const res = await fetch(`/api/votes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.userName,
          vote: opt,
          pollId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Vote failed:", errorData.message);
        return;
      }
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  const removeVote = async (pollId: string) => {
    if (!user) return;

    try {
      const res = await fetch(`/api/votes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.userName,
          vote: "undefined",
          pollId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Vote removal failed:", errorData.message);
        return;
      }
    } catch (error) {
      console.error("Error removing vote:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "green.50", p: 4 }}>
      <Container
        maxWidth="sm"
        component={Paper}
        sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}
      >
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          {loading ? "Loading poll..." : title}
        </Typography>

        {!loading && (
          <>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              mb={3}
              color="text.secondary"
            >
              <Users size={20} />
              <Typography variant="body2">{totalVotes} total votes</Typography>
              {!isConnected && (
                <Typography variant="caption" color="error">
                  (Reconnecting...)
                </Typography>
              )}
            </Stack>

            {options.map((opt, idx) => (
              <Box key={idx} mb={3}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {opt}
                  </Typography>
                  {userVote?.vote === opt && userVote?.vote !== "undefined" ? (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => pollId && removeVote(pollId)}
                    >
                      Remove Vote
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!!userVote && userVote?.vote !== "undefined"}
                      onClick={() => pollId && registerVote(opt, pollId)}
                    >
                      Vote
                    </Button>
                  )}
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Number(getPercentage(votes[idx]))}
                  sx={{ height: 10, borderRadius: 5, bgcolor: "grey.300" }}
                />
                <Typography
                  variant="caption"
                  align="right"
                  display="block"
                  color="text.secondary"
                  mt={0.5}
                >
                  {getPercentage(votes[idx])}%
                </Typography>
              </Box>
            ))}

            {totalVotes === 0 && (
              <Box textAlign="center" py={8} color="text.disabled">
                <Vote size={40} style={{ margin: "0 auto 8px" }} />
                <Typography>No votes yet. Be the first to vote!</Typography>
              </Box>
            )}

            {totalVotes > 0 && (
              <Box borderTop={1} borderColor="divider" pt={4}>
                <Typography
                  variant="h6"
                  fontWeight="semibold"
                  mb={3}
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <BarChart3 size={20} />
                  Poll Statistics
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  flexWrap="wrap"
                  justifyContent="center"
                >
                  <StatCard
                    label="Total Votes"
                    value={totalVotes}
                    color="primary"
                  />
                  <StatCard
                    label="Options"
                    value={options.length}
                    color="success.main"
                  />
                  <StatCard
                    label="Highest Votes"
                    value={Math.max(...votes)}
                    color="purple"
                  />
                  <StatCard
                    label="Active Options"
                    value={votes.filter((v) => v > 0).length}
                    color="orange"
                  />
                </Stack>
              </Box>
            )}
          </>
        )}

        {showUserPopup && (
          <UserInfoPopup
            inputEmail={inputEmail}
            setInputEmail={setInputEmail}
            inputUserName={inputUserName}
            setInputUserName={setInputUserName}
            saveUserInfo={saveUserInfo}
            onClose={() => setShowUserPopup(false)}
          />
        )}
      </Container>
    </Box>
  );
}
