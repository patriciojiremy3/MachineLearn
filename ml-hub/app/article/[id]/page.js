"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function ArticlePage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [article, setArticle] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  // 🔐 GET USER
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };
    getUser();
  }, []);

  // 📄 FETCH ARTICLE
  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      setArticle(data);
    };

    fetchArticle();
  }, [id]);

  // ❤️ FETCH LIKES + CHECK IF USER LIKED
  const fetchLikes = async () => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("article_id", id);

    setLikes(count || 0);

    if (user) {
      const { data } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("article_id", id)
        .maybeSingle();

      setLiked(!!data);
    }
  };

  useEffect(() => {
    if (id && user) fetchLikes();
  }, [id, user]);

  // ❤️ TOGGLE LIKE
  const handleLike = async () => {
    if (!user) return;

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("article_id", id);
    } else {
      await supabase.from("likes").insert([
        {
          user_id: user.id,
          article_id: id,
        },
      ]);
    }

    fetchLikes();
  };

  // 💬 FETCH COMMENTS
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  useEffect(() => {
    if (id) fetchComments();
  }, [id]);

  // 💬 ADD COMMENT
  const addComment = async () => {
    if (!text.trim()) return;

    await supabase.from("comments").insert([
      {
        article_id: id,
        user_id: user.id,
        content: text,
      },
    ]);

    setText("");
    fetchComments();
  };

  if (!article) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white p-6 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">

        {/* 📝 ARTICLE */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
          <p className="text-gray-300 mb-4">{article.content}</p>

          {/* ❤️ LIKE */}
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-lg transition ${
              liked ? "bg-pink-500" : "bg-gray-700"
            }`}
          >
            ❤️ {likes}
          </button>
        </div>

        {/* 💬 COMMENTS */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>

          {/* INPUT */}
          <div className="flex gap-2 mb-4">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-2 rounded-lg bg-white/20 outline-none"
            />
            <button
              onClick={addComment}
              className="bg-blue-500 px-4 rounded-lg"
            >
              Post
            </button>
          </div>

          {/* LIST */}
          <div className="space-y-2">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-white/10 p-3 rounded-lg text-sm"
              >
                {c.content}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}