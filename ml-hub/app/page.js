"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center 
    bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">

      <div className="text-center max-w-xl px-6">

        <h1 className="text-5xl font-bold mb-4">
          Machine Learning Hub
        </h1>

        <p className="text-lg text-blue-100 mb-8">
          Explore, learn, and build amazing ML projects.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="px-8 py-3 rounded-xl text-lg font-semibold
          bg-white text-blue-700 hover:bg-blue-100 transition
          shadow-lg"
        >
          🚀 Let's Get Started
        </button>

      </div>
    </div>
  );
}