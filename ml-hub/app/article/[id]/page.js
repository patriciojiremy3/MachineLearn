"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ArticlePage({ params }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) console.log(error);
      setArticle(data);
    };

    fetchArticle();
  }, [params.id]);

  if (!article) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-6">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg p-6 rounded-xl">
        <h1 className="text-2xl font-bold">{article.title}</h1>
        <p className="mt-4 text-gray-200">{article.content}</p>
      </div>
    </div>
  );
}