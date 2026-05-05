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
  const [file, setFile] = useState(null);

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
  // 🔥 DELETE ARTICLE
const handleDelete = async (articleId) => {
  if (!user) return;

  try {
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleId)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    // update UI
    setArticles((prev) =>
      prev.filter((a) => a.id !== articleId)
    );

  } catch (err) {
    console.error(err);
  }
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
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error) setNotifications(data);
};
  useEffect(() => {
    if (user) {
      fetchArticles();
      fetchTopArticles();
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (id) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    console.log(error);
  } else {
    fetchNotifications(); // refresh UI
  }
};
const deleteNotification = async (id) => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(error);
  } else {
    fetchNotifications(); // refresh UI
  }
};

  // ➕ CREATE ARTICLE
 const createArticle = async () => {
  if (!title || !content) {
    alert("Title and content required");
    return;
  }

  if (!user) {
    alert("User not loaded");
    return;
  }

  let fileUrl = null;
  let fileType = null;

  // 🔥 Upload file if exists
  if (file) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("articles") // bucket name
      .upload(fileName, file);

    if (uploadError) {
      console.log("UPLOAD ERROR:", uploadError);
      alert("Upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("articles")
      .getPublicUrl(fileName);

    fileUrl = data.publicUrl;
    fileType = file.type;
  }

  // 🔥 Insert article
  const { error: insertError } = await supabase
    .from("articles")
    .insert([
      {
        title,
        content,
        user_id: user.id,
        likes: 0,
        file_url: fileUrl,
        file_type: fileType,
      },
    ]);

  if (insertError) {
    console.log("INSERT ERROR:", insertError);
    alert("Insert failed");
    return;
  }

  // ✅ Reset
  setTitle("");
  setContent("");
  setFile(null);

  fetchArticles();
};

  // ❤️ LIKE
 const handleLike = async (articleId) => {
  const { data: existing } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("id", existing.id);
  } else {
    await supabase
      .from("likes")
      .insert({
        user_id: user.id,
        article_id: articleId,
      });
    // 🔔 Optional notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      message: "Someone liked an article ❤️",
    });
  }

  fetchArticles();
  fetchTopArticles();
};
  const handleShare = async (article) => {
  const url = `${window.location.origin}/article/${article.id}`;
  try {
    // Native share (mobile, Chrome, etc.)
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.content?.slice(0, 100),
        url,
      });
    } else {
      // fallback: copy link
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  } catch (err) {
    console.log(err);
  }
};


  // 🚪 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-950 text-white flex">

    {/* SIDEBAR */}
    <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col justify-between">

      <div>
        <h1 className="text-2xl font-bold mb-8 tracking-tight">
          ✨ MyApp
        </h1>

        {/* PROFILE */}
        <div className="bg-white/10 p-4 rounded-xl mb-6 border border-white/10">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="font-semibold text-sm break-all">
            {user?.email}
          </p>
        </div>

        {/* NAV */}
        <nav className="space-y-2 text-sm">
          <div className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg">
            Dashboard
          </div>
          <div className="hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer">
            Articles
          </div>
          <div className="hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer">
            Notifications
          </div>
        </nav>
      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 p-2 rounded-lg text-sm transition"
      >
        Logout
      </button>
    </aside>

    {/* MAIN */}
    <main className="flex-1 p-8 max-w-5xl mx-auto w-full">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
      </div>

      {/* CREATE ARTICLE */}
      <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 mb-8 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-blue-300">
          Create Article
        </h3>

        <input
          className="w-full p-3 mb-3 rounded-lg bg-white/10 border border-white/10 focus:border-blue-400 outline-none transition"
          placeholder="Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-3 rounded-lg bg-white/10 border border-white/10 focus:border-blue-400 outline-none transition"
          placeholder="Write something..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
  type="file"
  onChange={(e) => setFile(e.target.files[0])}
  className="mt-2"
/>

        <button
          onClick={createArticle}
          className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg transition font-medium"
        >
          Publish
        </button>
      </div>

      {/* NOTIFICATIONS */}
      <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 mb-8 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-blue-300">
          🔔 Notifications
        </h3>

        {notifications.length === 0 && (
          <p className="text-gray-400 text-sm">
            No notifications yet
          </p>
        )}

        <div className="space-y-2">
          {notifications.map((n) => (
  <div
    key={n.id}
    className={`p-4 rounded-xl mb-2 flex justify-between items-center
    ${n.is_read ? "bg-gray-700" : "bg-blue-600/20 border border-blue-400"}`}
  >
    <div>
      <p className="text-sm">{n.message}</p>
    </div>

    <div className="flex gap-2">
      {!n.is_read && (
        <button
          onClick={() => markAsRead(n.id)}
          className="text-green-400 hover:text-green-300 text-xs"
        >
          Mark Read
        </button>
      )}

      <button
        onClick={() => deleteNotification(n.id)}
        className="text-red-400 hover:text-red-300 text-xs"
      >
        Delete
      </button>
    </div>
  </div>
))}
        </div>
      </div>

      {/* ARTICLES */}
      <div className="space-y-6">
        {articles.map((a) => (
          <div
            key={a.id}
            className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg hover:border-blue-400/30 transition"
          >
            <h3 className="text-xl font-semibold mb-1">
              {a.title}
            </h3>

            <p className="text-gray-300 mb-4">
              {a.content}
            </p>
            {a.file_url && (
  <>
    {a.file_type?.startsWith("image") ? (
      <img
        src={a.file_url}
        alt="article"
        className="mt-3 rounded-xl max-h-60 object-cover"
      />
    ) : (
      <a
        href={a.file_url}
        target="_blank"
        className="text-blue-400 underline block mt-2"
      >
        View File
      </a>
    )}
  </>
)}

            {/* ACTIONS */}
            <div className="flex items-center gap-4 text-sm">

              <button
                onClick={() => handleLike(a.id)}
                className="text-pink-400 hover:text-pink-300 transition"
              >
                ❤️ {a.likes || 0}
              </button>
              {a.user_id === user.id && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition duration-200 shadow-md"
                >
                  Delete
                </button>
              )}
              <button
  onClick={() => handleShare(a)}
  className="text-blue-400 hover:text-blue-300 ml-2"
          >
  Share
</button>

              <span className="text-gray-500">
                Comments below
              </span>
            </div>

            {/* COMMENTS */}
            <div className="mt-4 border-t border-white/10 pt-4">
              <Comments
                articleId={a.id}
                user={user}
                article={a}
              />
            </div>
          </div>
        ))}
      </div>

    </main>
  </div>
);
}