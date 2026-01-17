// src/pages/Signup.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { registerUser } from "../authslice"; // ensure correct path

// 👇 Define the Zod schema for form validation (backend expects emailId)
const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"), // <-- FIXED
  password: z.string().min(8, "Password is too weak"),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility initially false hai means password hidden
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth); // <-- added error

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redirect to homepage if already authenticated
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    console.log("SIGNUP - sending payload:", data);
    dispatch(registerUser(data)); // Send form data to Redux thunk
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

      {/* 👇 The onSubmit handler is attached to the form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-black/80 p-8 rounded-2xl shadow-xl border border-neutral-700/40 mt-24 space-y-4"
      >
        {/* First Name Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-neutral-200">Name</span>
          </label>

          <input
            type="text"
            placeholder="John"
            className={`w-full px-4 py-2 rounded-lg bg-neutral-900 text-white placeholder-neutral-400 border border-neutral-700 
            focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-600 
            ${errors.firstName ? "border-error" : ""}`}
            {...register("firstName")}
            autoComplete="name"
          />
          {errors.firstName && (
            <p className="text-error text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-neutral-200">Email</span>
          </label>

          <input
            type="email"
            placeholder="manojp@gmail.com"
            className={`w-full px-4 py-2 rounded-lg bg-neutral-900 text-white placeholder-neutral-400 
            border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-0 
            focus:ring-blue-600 ${errors.emailId ? "border-error" : ""}`}
            {...register("emailId")} // <-- FIXED
            autoComplete="email"
          />
          {errors.emailId && (
            <p className="text-error text-sm mt-1">{errors.emailId.message}</p>
          )}
        </div>

        {/* Password Field with Toggle */}
        <div className="form-control relative">
          <label className="label">
            <span className="label-text text-neutral-200">Password</span>
          </label>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            className={`w-full px-4 py-2 rounded-lg bg-neutral-900 text-white placeholder-neutral-400 
            border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-0 
            focus:ring-blue-600 pr-10 ${errors.password ? "border-error" : ""}`}
            {...register("password")}
            autoComplete="new-password"
          />

          <button
            type="button"
            className="absolute right-3 top-11 transform -translate-y-1/2 text-neutral-300 hover:text-white"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>

          {errors.password && (
            <p className="text-error text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* 🔥 SHOW BACKEND ERROR HERE */}
        {error && (
          <p className="text-error text-center text-sm mt-2">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <div className="form-control mt-8 flex justify-center">
          <button
            type="submit"
            className={`btn btn-primary ${loading ? "loading" : ""}`}
            disabled={loading} // Disable button when loading jb tk request complete na ho jaye tb tk sign up button disabled rahega 
            //kyunki multiple requests na bheje user
          >
            {loading ? "Signing Up..." : "Sign Up"} 
          </button>
        </div>

        {/* Login Redirect */}
        <div className="text-center mt-6">
          <span className="text-sm">
            Already have an account?{" "}
            <NavLink to="/login" className="link link-primary">
              Login
            </NavLink>
          </span>
        </div>
      </form>
    </div>
  );
}

export default Signup;
