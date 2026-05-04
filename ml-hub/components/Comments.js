"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CommentsSection({ articleId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [activeReply, setActiveReply] = useState(null);

  // 📥 FETCH COMMENTS
  const fetchComments = async () => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("article_id", articleId) // 🔥 IMPORTANT
    .order("created_at", { ascending: true });

  console.log("COMMENTS:", data); // 👈 DEBUG

  if (!error) setComments(data);
};

  useEffect(() => {
    fetchComments();
  }, []);

  // 💬 ADD COMMENT
  const addComment = async () => {
    if (!text.trim()) return;

    await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      content: text,
      parent_id: null,
    });

    setText("");
    fetchComments();
  };

  // ↪️ ADD REPLY
  const addReply = async (parentId) => {
    const value = replyText[parentId];
    if (!value?.trim()) return;

    await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      content: value,
      parent_id: parentId,
    });

    setReplyText((prev) => ({ ...prev, [parentId]: "" }));
    setActiveReply(null);
    fetchComments();
  };

  // 🗑️ DELETE
  const handleDeleteComment = async (commentId) => {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.log("Delete error:", error.message);
    return;
  }

  // ✅ update UI immediately
  setComments((prev) =>
    prev.filter((comment) => comment.id !== commentId)
  );
};


  // 🧠 BUILD TREE
  const mainComments = comments.filter((c) => !c.parent_id);
  const replies = (parentId) =>
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="mt-4">

      {/* ADD COMMENT */}
      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 rounded bg-white/10"
        />
        <button onClick={addComment} className="bg-blue-500 px-3 rounded">
          Post
        </button>
      </div>

      {/* COMMENTS */}
      {mainComments.map((c) => (
        <div key={c.id} className="mb-4">

          {/* MAIN COMMENT */}
          <div className="bg-white/10 p-3 rounded flex justify-between">
            <span>{c.content}</span>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setActiveReply(activeReply === c.id ? null : c.id)
                }
                className="text-blue-400 text-xs"
              >
                Reply
              </button>

              {c.user_id === user.id && (
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="text-red-400 text-xs"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* REPLY INPUT */}
          {activeReply === c.id && (
            <div className="ml-6 mt-2 flex gap-2">
              <input
                value={replyText[c.id] || ""}
                onChange={(e) =>
                  setReplyText((prev) => ({
                    ...prev,
                    [c.id]: e.target.value,
                  }))
                }
                placeholder="Write a reply..."
                className="flex-1 p-2 rounded bg-white/10"
              />
              <button
                onClick={() => addReply(c.id)}
                className="bg-green-500 px-2 rounded"
              >
                Send
              </button>
            </div>
          )}

          {/* REPLIES */}
          <div className="ml-6 mt-2 space-y-2">
            {replies(c.id).map((r) => (
              <div
                key={r.id}
                className="bg-white/5 p-2 rounded flex justify-between"
              >
                <span>{r.content}</span>

                {r.user_id === user.id && (
                  <button
                    onClick={() => handleDeleteComment(r.id)}
                    className="text-red-400 text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}