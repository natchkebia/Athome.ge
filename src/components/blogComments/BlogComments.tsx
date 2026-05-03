"use client";

import { useState } from "react";
import styles from "./BlogComments.module.scss";

type CommentItem = {
  id: number;
  name: string;
  date: string;
  text: string;
  likes: number;
  avatar?: string;
  replies?: CommentItem[];
};

const initialComments: CommentItem[] = [
  {
    id: 1,
    name: "დათო",
    date: "2 მაისი, 2022",
    text: "ძალიან საინტერესო სტატიაა.",
    likes: 3,
    avatar: "/images/avatar.png",
    replies: [],
  },
  {
    id: 2,
    name: "გიორგი",
    date: "25 ივნისი, 2022",
    text: "კარგად არის ახსნილი.",
    likes: 3,
    replies: [],
  },
  {
    id: 3,
    name: "Barbare Bula",
    date: "25 ივნისი, 2022",
    text: "მადლობა ინფორმაციისთვის.",
    likes: 3,
    replies: [],
  },
  {
    id: 4,
    name: "თემო",
    date: "2 მაისი, 2022",
    text: "COOL",
    likes: 3,
    replies: [],
  },
];

export default function BlogComments() {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [showMainForm, setShowMainForm] = useState(false);
  const [mainText, setMainText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const addMainComment = () => {
    if (!mainText.trim()) return;

    const newComment: CommentItem = {
      id: Date.now(),
      name: "მომხმარებელი",
      date: "ახლახანს",
      text: mainText,
      likes: 0,
      replies: [],
    };

    setComments([newComment, ...comments]);
    setMainText("");
    setShowMainForm(false);
  };

  const addReply = (commentId: number) => {
    if (!replyText.trim()) return;

    const newReply: CommentItem = {
      id: Date.now(),
      name: "მომხმარებელი",
      date: "ახლახანს",
      text: replyText,
      likes: 0,
      replies: [],
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          : comment,
      ),
    );

    setReplyText("");
    setReplyTo(null);
  };

  return (
    <section className={styles.commentsSection}>
      <h2>კომენტარი</h2>

      <div className={styles.commentsBox}>
        <div className={styles.commentsTop}>
          <span>17 კომენტარი</span>

          <button onClick={() => setShowMainForm(!showMainForm)}>
            კომენტარი
          </button>
        </div>

        {showMainForm && (
          <div className={styles.commentForm}>
            <textarea
              placeholder="ტექსტი..."
              value={mainText}
              onChange={(e) => setMainText(e.target.value)}
            />

            <button onClick={addMainComment}>გამოქვეყნება</button>
          </div>
        )}

        <div className={styles.commentsList}>
          {comments.map((comment) => (
            <div className={styles.commentBlock} key={comment.id}>
              <div className={styles.comment}>
                <div className={styles.avatar}>
                  {comment.avatar ? (
                    <img src={comment.avatar} alt={comment.name} />
                  ) : (
                    comment.name.charAt(0)
                  )}
                </div>

                <div className={styles.commentContent}>
                  <div className={styles.commentMeta}>
                    <strong>{comment.name}</strong>
                    <span>{comment.date}</span>
                  </div>

                  <p>{comment.text}</p>

                  <div className={styles.commentActions}>
                    <span>👍 {comment.likes}</span>
                    <button onClick={() => setReplyTo(comment.id)}>
                      პასუხი
                    </button>
                  </div>

                  {replyTo === comment.id && (
                    <div className={styles.replyForm}>
                      <textarea
                        placeholder="დაწერე პასუხი..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />

                      <div>
                        <button onClick={() => addReply(comment.id)}>
                          გამოქვეყნება
                        </button>

                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => {
                            setReplyTo(null);
                            setReplyText("");
                          }}
                        >
                          გაუქმება
                        </button>
                      </div>
                    </div>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className={styles.replies}>
                      {comment.replies.map((reply) => (
                        <div className={styles.comment} key={reply.id}>
                          <div className={styles.avatar}>
                            {reply.name.charAt(0)}
                          </div>

                          <div className={styles.commentContent}>
                            <div className={styles.commentMeta}>
                              <strong>{reply.name}</strong>
                              <span>{reply.date}</span>
                            </div>

                            <p>{reply.text}</p>

                            <div className={styles.commentActions}>
                              <span>👍 {reply.likes}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
