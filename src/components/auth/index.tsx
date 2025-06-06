"use client";

import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import SignUpComp from "./signup";
import LoginComp from "./login";

const LoginForm = () => {
  const [showSignupPage, setShowSignupPage] = useState(false);

  useEffect(() => {
    if (showSignupPage) {
      setShowSignupPage(true);
    } else {
      setShowSignupPage(false);
    }
  }, [showSignupPage]);

  return (
    <div>
      {showSignupPage ? (
        <SignUpComp setShowSignupPage={setShowSignupPage} />
      ) : (
        <LoginComp setShowSignupPage={setShowSignupPage} />
      )}
    </div>
  );
};

export default LoginForm;
