"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else router.push("/dashboard");
  };

  const signup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Account created!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#020617] relative overflow-hidden">

      {/* 🌌 Background Glow */}
      <div className="absolute w-72 h-72 bg-blue-500 opacity-30 blur-3xl top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-purple-500 opacity-30 blur-3xl bottom-10 right-10"></div>

      {/* 💎 Glass Card */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-[340px] text-white">

        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-300 mb-6 text-sm">
          Login to your account
        </p>

        {/* ✉️ Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* 🔒 Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* 🔵 Login */}
        <button
          onClick={login}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 transition p-3 rounded-lg font-semibold shadow-lg mb-3"
        >
          Login
        </button>

        {/* 🟢 Signup */}
        <button
          onClick={signup}
          className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:opacity-90 transition p-3 rounded-lg font-semibold shadow-lg"
        >
          Create Account
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-5">
          Machine Learning Hub
        </p>
      </div>
    </div>
  );
}