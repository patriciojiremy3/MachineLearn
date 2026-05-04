"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup success!");
      router.push("/dashboard");
    }
  };

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
      
      {/* CARD */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl w-[350px]">
        
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Welcome Back
        </h1>

        {/* INPUTS */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-5 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BUTTONS */}
        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg font-semibold mb-3"
        >
          Login
        </button>

        <button
          onClick={signUp}
          className="w-full bg-green-500 hover:bg-green-600 transition p-3 rounded-lg font-semibold"
        >
          Create Account
        </button>

        {/* FOOTER */}
        <p className="text-gray-400 text-sm text-center mt-4">
          Machine Learning Hub
        </p>
      </div>
    </div>
  );
}