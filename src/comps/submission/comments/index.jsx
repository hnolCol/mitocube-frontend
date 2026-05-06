import { useState } from "react";
import { Button, TextArea, NonIdealState } from "@blueprintjs/core";
import { useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router";
import { api } from "@/api";
import { Comment } from "./Comment";
import { Loading } from "../../core/base/states/Loading";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    comments.forEach((c) => { map[c.tag] = { ...c, responses: [] }; });
    comments.forEach((c) => {
        if (c.response_to && map[c.response_to]) {
            map[c.response_to].responses.push(map[c.tag]);
        } else {
            roots.push(map[c.tag]);
        }
    });
    return roots;
}

export function SubmissionCommentCount({ submission_tag }) {
    const navigate = useNavigate();
    const { data: comments, isLoading } = api.submissions.comments.useGetSubmissionComments(
        { tag: submission_tag },
        { enabled: !!submission_tag, staleTime: 60000 }
    );

    return (
        <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/submissions/${submission_tag}/comments`)}
            className="submission-metric-view"
        >
            <div>
                <h4>Comments</h4>
                {isLoading ? <Loading /> : <span>{comments?.length || 0}</span>}
            </div>
        </motion.button>
    );
}

export function SubmissionComments() {
    const { submission_tag } = useOutletContext();
    const [content, setContent] = useState("");
    const queryClient = useQueryClient();

    const { data: comments, isSuccess } = api.submissions.comments.useGetSubmissionComments({
        tag: submission_tag,
    });

    const { mutate: postComment, isLoading: isPosting } = api.submissions.comments.usePostComment({
        onSuccess: () => {
            setContent("");
            queryClient.invalidateQueries({ queryKey: ["submission_comments", submission_tag] });
        },
    });

    const handlePost = () => {
        if (!content.trim()) return;
        postComment({ tag: submission_tag, content: content.trim(), tags: [] });
    };

    const handleReply = (replyContent, parentTag) => {
        postComment({ tag: submission_tag, content: replyContent, tags: [], response_to: parentTag });
    };

    const tree = isSuccess ? buildCommentTree(comments) : [];

    return (
        <div style={{ height: "85vh", display: "flex", flexDirection: "column" }}>
            <h2 style={{ padding: "1rem 1rem 0" }}>Comments</h2>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "0 1rem 1rem" }}>
                {isSuccess && tree.length === 0 && (
                    <NonIdealState icon="comment" title="No comments yet" />
                )}
                {tree.map((comment) => (
                    <Comment key={comment.tag} comment={comment} onReply={handleReply} />
                ))}
            </div>
    
            <div style={{ borderTop: "1px solid #e0e0e0", padding: "12px 1rem", display: "flex", gap: "8px", alignItems: "flex-end" }}>
                <TextArea
                    fill
                    placeholder="Write a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={1}
                    style={{ resize: "none", fontSize: 14 }}
                />
                <Button
                    intent="primary"
                    icon="send-message"
                    onClick={handlePost}
                    disabled={!content.trim() || isPosting}
                    loading={isPosting}
                />
            </div>
        </div>
    );
}