import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Cookies from "js-cookie"; // Install via: npm install js-cookie

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 🚀 Save the token in a cookie so backend's checkAuth can read it
      Cookies.set("token", token, { expires: 7 }); 
      
      // Redirect to home - checkAuth will now succeed because the cookie exists
      window.location.href = "/"; 
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">Authenticating...</div>
    </div>
  );
};

export default LoginSuccess;