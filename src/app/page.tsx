// app/page.tsx
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, BarChart3, User } from "lucide-react";
import AuthGate from "@/components/AuthGate";
import { AuthContext } from "@/contexts/AuthContext";

export default function page() {
  const { allPolls, setAllPolls }: any = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleCreatePoll = async () => {
    setLoading(true);

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.email) {
      alert("User not logged in.");
      setLoading(false);
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedOptions = options.map((opt) => opt.trim());
    const validOptions = trimmedOptions.filter((opt) => opt !== "");

    if (!trimmedTitle) {
      alert("Poll title is required.");
      setLoading(false);
      return;
    }

    if (validOptions.length < 2) {
      alert("Please enter at least two valid options.");
      setLoading(false);
      return;
    }

    const lowerCaseOptions = validOptions.map((opt) => opt.toLowerCase());
    const uniqueOptions = new Set(lowerCaseOptions);

    if (uniqueOptions.size !== lowerCaseOptions.length) {
      alert("Options must be unique. Duplicate options found.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/live_poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          options: validOptions,
          userEmail: user.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Poll creation failed:", errorData.message);
        alert("Poll creation failed: " + errorData.message);
        setLoading(false);
        return;
      }

      const newPoll = await res.json();
      setAllPolls((prev: any) => [...prev, newPoll.data]);

      // Additional vote API call
      try {
        const res = await fetch(`/api/votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.userName,
            vote: "undefined",
            pollId: newPoll.data.pollIdVoteData,
          }),
        });

        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
          } catch {
            errorData = "No error details";
          }
          console.error("Vote failed:", errorData?.message ?? errorData);
        }
      } catch (error) {
        console.error("Error casting vote:", error);
      }
      setTitle("");
      setOptions(["", ""]);
      // Reload the page here to reset the form and state fully
      // window.location.reload();
    } catch (error) {
      console.error("Poll creation error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAllPoll = async () => {
    try {
      window.location.href = "/all_polls";
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 font-semibold text-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Create Your Poll
            </div>
            {allPolls.length > 0 && (
              <button
                onClick={handleAllPoll}
                className="cursor-pointer bg-white text-blue-600 hover:bg-blue-100 px-4 py-1 rounded-md text-sm font-medium transition"
              >
                Show All Polls
              </button>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Poll Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's your question?"
              />
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-red-500 p-2 hover:bg-red-50 border rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addOption}
                className="w-full border-2 border-dashed border-gray-300 py-2 rounded-md text-sm text-gray-600 hover:bg-blue-50"
                disabled={options.length >= 6}
              >
                <div className="cursor-pointer flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Option
                </div>
              </button>
            </div>

            <button
              onClick={handleCreatePoll}
              className="cursor-pointer w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating Poll..." : "Create Poll"}
            </button>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
