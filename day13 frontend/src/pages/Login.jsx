import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { loginUser } from "../authslice";

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  // 🚀 Handler for Google Authentication redirect
  const handleGoogleLogin = () => {
    // This triggers the passport flow on your backend
    window.location.href = "http://localhost:3000/user/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Page Heading */}
      <div className="absolute top-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-wide drop-shadow-lg">
          CodeHuntX
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Level up your coding skills</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-black/80 p-8 rounded-2xl shadow-xl border border-neutral-700/40 mt-24 space-y-4"
      >
        {/* Email */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-neutral-200">Email</span>
          </label>
          <input
            {...register("emailId")}
            placeholder="Enter Email"
            autoComplete="email"
            className={`w-full px-4 py-2 rounded-lg bg-neutral-900 text-white placeholder-neutral-400 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-600 ${
              errors.emailId ? "border-error" : ""
            }`}
          />
          {errors.emailId && (
            <p className="text-error text-sm mt-1">{errors.emailId.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="form-control relative">
          <label className="label">
            <span className="label-text text-neutral-200">Password</span>
          </label>

          <input
            {...register("password")}
            placeholder="Enter Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className={`w-full px-4 py-2 rounded-lg bg-neutral-900 text-white placeholder-neutral-400 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-600 pr-10 ${
              errors.password ? "border-error" : ""
            }`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-11 transform -translate-y-1/2 text-neutral-300 hover:text-white"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>

          {errors.password && (
            <p className="text-error text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && <p className="text-error text-center text-sm mt-1">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white transition-transform ${
            loading ? "bg-neutral-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Divider and Google Button */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-neutral-700"></div>
          <span className="flex-shrink mx-4 text-neutral-500 text-xs uppercase">Or continue with</span>
          <div className="flex-grow border-t border-neutral-700"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-2 rounded-lg font-semibold hover:bg-neutral-200 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        {/* Signup link */}
        <div className="text-center mt-2">
          <span className="text-neutral-400 text-sm">
            Don't have an account?{" "}
            <NavLink to="/signup" className="text-blue-400 hover:underline">
              Sign Up
            </NavLink>
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login;