import { useState } from "react";
import { Button, TextArea } from "@blueprintjs/core";
import { api } from "@/api";

export function Comment({ comment, onReply, depth = 0 }) {
    const [showReply, setShowReply] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const { data: user, isSuccess: userLoaded } = api.users.core.useGetPublicUserByTag({ tag: comment.user_tag });

    const handleReply = () => {
        if (!replyContent.trim()) return;
        onReply(replyContent.trim(), comment.tag);
        setReplyContent("");
        setShowReply(false);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const day = date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
        const time = date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        return `${day} · ${time}`;
    };

    return (
        <div style={{ marginLeft: depth > 0 ? 24 : 0, marginTop: depth > 0 ? 4 : 12 }}>
            <div style={{ borderLeft: depth > 0 ? "2px solid #d4d4d4" : "none", paddingLeft: depth > 0 ? 12 : 0 }}>
                <div style={{ background: "#f8f9fa", borderRadius: 6, padding: "10px 14px" }}>
                    
                    <div className="flex" style={{ alignItems: "baseline", gap: "8px" }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                            {userLoaded ? `${user.firstname} ${user.lastname}` : comment.user_tag}
                        </span>
                        <span style={{ fontSize: 11, color: "#8a8a8a" }}>
                            {formatDate(comment.created_at)}
                        </span>
                    </div>

                    <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4, whiteSpace: "pre-wrap" }}>
                        {comment.content}
                    </div>

                    <Button
                        minimal
                        small
                        icon="comment"
                        text="Reply"
                        onClick={() => setShowReply(!showReply)}
                        style={{ fontSize: 12, color: "#6c757d", marginTop: 2 }}
                    />

                    {showReply && (
                        <div style={{ marginTop: 8 }}>
                            <TextArea
                                fill
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                autoFocus
                                rows={2}
                                style={{ resize: "vertical", fontSize: 13 }}
                            />
                            <div className="flex" style={{ gap: "6px", marginTop: 6 }}>
                                <Button intent="primary" small text="Reply" onClick={handleReply} disabled={!replyContent.trim()} />
                                <Button small text="Cancel" onClick={() => { setShowReply(false); setReplyContent(""); }} />
                            </div>
                        </div>
                    )}
                </div>

                {comment.responses?.map((child) => (
                    <Comment key={child.tag} comment={child} onReply={onReply} depth={depth + 1} />
                ))}
            </div>
        </div>
    );
}