"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commentText, setCommentText] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    getUser();
    fetchArticles();
  }, []);

  // 🔐 GET USER
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  // 📄 FETCH ARTICLES + LIKE COUNT
  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*, likes(count)");

    setArticles(data || []);
  };

  // ➕ CREATE ARTICLE
  const createArticle = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (!data?.user) {
    alert("You are not logged in!");
    return;
  }

  await supabase.from("articles").insert({
    title,
    content,
    user_id: data.user.id,
  });

  setTitle("");
  setContent("");
  fetchArticles();
};

  // ❤️ LIKE ARTICLE
  const likeArticle = async (articleId) => {
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("likes").insert({
      user_id: userData.user.id,
      article_id: articleId,
    });

    if (error) alert("Already liked!");

    fetchArticles();
  };

  // 💬 FETCH COMMENTS
  const fetchComments = async (articleId) => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at");

    setComments((prev) => ({ ...prev, [articleId]: data || [] }));
  };

  // 💬 ADD COMMENT / REPLY
  const addComment = async (articleId, parentId = null) => {
    const { data: userData } = await supabase.auth.getUser();

    await supabase.from("comments").insert({
      content: commentText[articleId],
      user_id: userData.user.id,
      article_id: articleId,
      parent_id: parentId,
    });

    setCommentText((prev) => ({ ...prev, [articleId]: "" }));
    fetchComments(articleId);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={logout} className="text-red-400">Logout</button>
      </div>

      {/* PROFILE */}
      <div className="mb-6 bg-white/10 p-4 rounded-xl">
        <p className="text-gray-400">Logged in as:</p>
        <p>{user?.email}</p>
      </div>

      {/* CREATE ARTICLE */}
      <div className="mb-6 bg-white/10 p-4 rounded-xl">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 text-black rounded"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mb-2 p-2 text-black rounded"
        />
        <button
          onClick={createArticle}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Post Article
        </button>
      </div>

      {/* ARTICLES */}
      {articles.map((a) => (
        <div key={a.id} className="bg-white/10 p-5 rounded-xl mb-6">

          <h2 className="text-xl font-bold">{a.title}</h2>
          <p className="text-gray-300 mt-2">{a.content}</p>

          {/* LIKE */}
          <button
            onClick={() => likeArticle(a.id)}
            className="mt-3 text-blue-400"
          >
            ❤️ {a.likes?.[0]?.count || 0}
          </button>

          {/* LOAD COMMENTS */}
          <button
            onClick={() => fetchComments(a.id)}
            className="ml-4 text-sm text-gray-400"
          >
            Load Comments
          </button>

          {/* COMMENT INPUT */}
          <div className="mt-4">
            <input
              placeholder="Write comment..."
              value={commentText[a.id] || ""}
              onChange={(e) =>
                setCommentText((prev) => ({
                  ...prev,
                  [a.id]: e.target.value,
                }))
              }
              className="w-full p-2 text-black rounded"
            />

            <button
              onClick={() => addComment(a.id)}
              className="bg-green-500 px-3 py-1 mt-2 rounded"
            >
              Comment
            </button>
          </div>

          {/* COMMENTS */}
          <div className="mt-4">
            {(comments[a.id] || []).map((c) => (
              <div key={c.id} className="ml-2 border-l pl-2 mt-2">

                <p>{c.content}</p>

                {/* REPLY */}
                <button
                  onClick={() => addComment(a.id, c.id)}
                  className="text-sm text-blue-400"
                >
                  Reply
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}