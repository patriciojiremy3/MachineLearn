"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Comments from "@/components/Comments";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notifications, setNotifications] = useState([]);

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

  // 📄 FETCH ARTICLES
  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: false });

    setArticles(data || []);
  };

  // 🏆 TOP 5 ARTICLES (by likes)
  const fetchTopArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("likes", { ascending: false })
      .limit(5);

    setTopArticles(data || []);
  };

  // 🔔 NOTIFICATIONS
  const fetchNotifications = async () => {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  setNotifications(data || []);
};
  useEffect(() => {
    if (user) {
      fetchArticles();
      fetchTopArticles();
      fetchNotifications();
    }
  }, [user]);

  // ➕ CREATE ARTICLE
  const createArticle = async () => {
    if (!title || !content) return;

    await supabase.from("articles").insert({
      title,
      content,
      user_id: user.id,
      likes: 0,
    });

    setTitle("");
    setContent("");
    fetchArticles();
    fetchTopArticles();
  };

  // ❤️ LIKE
  const likeArticle = async (id) => {
    await supabase.rpc("increment_likes", { row_id: id });

    await supabase.from("notifications").insert({
      user_id: user.id,
      message: "Someone liked an article ❤️",
    });

    fetchArticles();
    fetchTopArticles();
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 text-white flex">

      {/* SIDEBAR */}
      <div className="w-64 bg-white/5 backdrop-blur-md border-r border-white/10 p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">ML Hub</h2>

          {/* PROFILE */}
          <div className="bg-white/10 p-4 rounded-xl mb-6">
            <p className="text-sm text-gray-300">Logged in as</p>
            <p className="font-semibold break-all">
              {user?.email}
            </p>
          </div>

          {/* TOP ARTICLES */}
          <div>
            <h3 className="text-sm text-blue-300 mb-2">
              Top Articles
            </h3>

            <div className="space-y-2">
              {topArticles.map((a) => (
                <div
                  key={a.id}
                  className="text-sm bg-white/10 p-2 rounded-lg"
                >
                  {a.title}
                  <span className="text-pink-400 ml-2">
                    ❤️ {a.likes || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Dashboard
        </h1>

        {/* CREATE */}
        <div className="bg-white/5 p-5 rounded-2xl mb-6 border border-white/10">
          <input
            className="w-full p-3 mb-3 rounded-lg bg-white/10 border border-white/10"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full p-3 mb-3 rounded-lg bg-white/10 border border-white/10"
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button
            onClick={createArticle}
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Post
          </button>
        </div>

        {/* ARTICLES */}
        <div className="space-y-6">
          {articles.map((a) => (
            <div
              key={a.id}
              className="bg-white/5 p-5 rounded-2xl border border-white/10"
            >
              <h3 className="text-xl font-semibold">{a.title}</h3>
              <p className="text-gray-300 mb-3">{a.content}</p>

              <button
                onClick={() => likeArticle(a.id)}
                className="text-pink-400 mb-3"
              >
                ❤️ Like ({a.likes || 0})
              </button>

              <Comments articleId={a.id} user={user} />
            </div>
          ))}
        </div>

        {/* NOTIFICATIONS */}
        <div className="mt-10">
          <h2 className="text-lg text-blue-300 mb-3">
            Notifications
          </h2>

          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white/5 p-3 rounded-lg mb-2"
            >
              {n.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}