"use client";

import LivePollPage from "@/components/livePollPage";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LivePollPage />
    </Suspense>
  );
};

export default page;
