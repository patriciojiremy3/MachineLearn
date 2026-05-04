"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    setComments(data || []);
  }

  async function addComment(parent_id = null) {
    if (!text) return;

    await supabase.from("comments").insert([
      {
        post_id: postId,
        content: text,
        parent_id,
      },
    ]);

    setText("");
    fetchComments();
  }

  function renderComments(parentId = null) {
    return comments
      .filter(c => c.parent_id === parentId)
      .map(comment => (
        <div key={comment.id} style={{ marginLeft: parentId ? 20 : 0 }}>
          <p>{comment.content}</p>

          {/* Reply button FIXED */}
          <button onClick={() => addComment(comment.id)}>
            Reply
          </button>

          {renderComments(comment.id)}
        </div>
      ));
  }

  return (
    <div>
      <h3>Comments</h3>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write comment..."
      />

      <button onClick={() => addComment()}>Comment</button>

      {renderComments()}
    </div>
  );
}