"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const [name, setName] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setName(data.user.user_metadata?.name || "");
    };
    getProfile();
  }, []);

  const updateProfile = async () => {
    await supabase.auth.updateUser({
      data: { name },
    });
    alert("Profile updated!");
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl mb-4">Profile</h1>

      <input
        className="w-full p-2 rounded bg-[#1E293B]"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={updateProfile}
        className="mt-4 bg-blue-600 px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}