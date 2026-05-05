"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) alert(error.message);
      else router.push("/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (error) alert(error.message);
      else {
        alert("Account created! Check your email.");
        setIsLogin(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400">

      <div className="w-full max-w-md p-8 rounded-2xl 
        bg-white/10 backdrop-blur-xl border border-white/20 
        shadow-[0_0_40px_rgba(0,150,255,0.4)] text-white">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <p className="text-center text-sm text-blue-100 mb-6">
          {isLogin ? "Login to your account" : "Sign up to get started"}
        </p>

        {/* Inputs */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg 
          bg-white/20 border border-white/30 
          placeholder-blue-100 text-white
          focus:outline-none focus:ring-2 focus:ring-blue-300"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-lg 
          bg-white/20 border border-white/30 
          placeholder-blue-100 text-white
          focus:outline-none focus:ring-2 focus:ring-blue-300"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Button */}
        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold
          bg-blue-400 hover:bg-blue-500 transition
          shadow-md hover:shadow-blue-300/50"
        >
          {loading
            ? "Loading..."
            : isLogin
            ? "Login"
            : "Sign Up"}
        </button>

        {/* Toggle */}
        <p className="text-sm text-center mt-6 text-blue-100">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold cursor-pointer hover:underline text-white"
          >
            {isLogin ? "Sign up" : "Login"}
          </span>
        </p>

        {/* Footer */}
        <p className="text-xs text-center mt-4 text-blue-200">
          Machine Learning Hub
        </p>
      </div>
    </div>
  );
}
